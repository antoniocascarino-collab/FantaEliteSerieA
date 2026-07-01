import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import Stripe from 'stripe'
import { assignInviteCode, creditReferralReward } from './_lib/inviteCode.js'
import { buildWelcomeEmail } from './_lib/emails.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://fanta-elite-serie-a.vercel.app').split(',')

function setCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

export default async function handler(req, res) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientIp = getClientIp(req)
  const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
    p_key: `confirm:${clientIp}`,
    p_max_requests: 10,
    p_window_seconds: 600,
  })
  if (rateLimitError) {
    console.error('Errore rate limit:', rateLimitError)
  } else if (!allowed) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra qualche minuto.' })
  }

  const { paymentIntentId, registrationId, ticketId, firstName, lastName, email, leagueEmail, phone, privacyAcceptedAt } = req.body

  if (!paymentIntentId || !registrationId || !ticketId || !firstName || !lastName || !email || !leagueEmail || !phone || !privacyAcceptedAt) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Verifica il PaymentIntent con Stripe (fonte di verità per l'importo)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' })
    }

    // 2. Verifica che il pagamento sia stato creato per QUESTA registrazione e QUESTO ticket
    if (paymentIntent.metadata?.registrationId !== registrationId) {
      return res.status(400).json({ error: 'Payment/registration mismatch' })
    }
    if (paymentIntent.metadata?.ticketId !== ticketId) {
      return res.status(400).json({ error: 'Payment/ticket mismatch' })
    }

    // 3. Idempotenza: se questa registrazione esiste già (doppio click/retry), non duplicare
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, email, league_email, invite_code')
      .eq('id', registrationId)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({
        success: true,
        registration: { id: existing.id, email: existing.email, league_email: existing.league_email, invite_code: existing.invite_code },
      })
    }

    // 4. Importo reale verificato da Stripe — non quello inviato dal client
    const realAmount = paymentIntent.amount / 100
    const discountAmount = Number(paymentIntent.metadata?.discountAmount || 0)
    const referralCodeUsed = paymentIntent.metadata?.referralCodeUsed || null

    // 5. Crea la registrazione SOLO ora che il pagamento è confermato
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert({
        id: registrationId,
        first_name: firstName,
        last_name: lastName,
        email,
        league_email: leagueEmail,
        phone,
        ticket_id: ticketId,
        privacy_accepted_at: privacyAcceptedAt,
        payment_status: 'completed',
        payment_intent_id: paymentIntentId,
        payment_method: 'stripe',
        paid_amount: realAmount,
        paid_at: new Date().toISOString(),
        discount_amount: discountAmount,
        referral_code_used: referralCodeUsed,
      })
      .select('*, tickets(*)')
      .single()

    if (insertError) {
      console.error('Errore inserimento database:', insertError)
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'Questa email ha già acquistato questo ticket.' })
      }
      return res.status(500).json({ error: 'Database insert failed' })
    }

    // 6. Assegna il codice presentazione personale al nuovo iscritto
    const inviteCode = await assignInviteCode(supabase, registration.id)

    // 7. Se ha usato un codice invito, accredita il rimborso al proprietario (se sotto il tetto dei 100€)
    if (referralCodeUsed) {
      const { data: owner } = await supabase
        .from('registrations')
        .select('id')
        .eq('invite_code', referralCodeUsed)
        .eq('payment_status', 'completed')
        .maybeSingle()
      if (owner) {
        await creditReferralReward(supabase, {
          code: referralCodeUsed,
          ownerRegistrationId: owner.id,
          redeemedRegistrationId: registration.id,
        })
      }
    }

    // 8. Invia email di benvenuto via Gmail
    try {
      const { subject, html } = buildWelcomeEmail({
        firstName: registration.first_name,
        lastName: registration.last_name,
        email: registration.email,
        leagueEmail: registration.league_email,
        ticketName: registration.tickets.name,
        amount: realAmount,
        discountAmount,
        inviteCode,
      })
      await transporter.sendMail({
        from: `"FantaElite Serie A" <${process.env.GMAIL_USER}>`,
        to: registration.email,
        subject,
        html,
      })
      console.log('✅ Email di benvenuto inviata a:', registration.email)
    } catch (emailError) {
      console.error('⚠️ Errore invio email (ma pagamento OK):', emailError)
    }

    return res.status(200).json({
      success: true,
      registration: {
        id: registration.id,
        email: registration.email,
        league_email: registration.league_email,
        invite_code: inviteCode,
      },
    })

  } catch (error) {
    console.error('Errore confirm-payment:', error)
    return res.status(500).json({ error: error.message })
  }
}
