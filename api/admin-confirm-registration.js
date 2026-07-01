import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { assignInviteCode, creditReferralReward } from './_lib/inviteCode.js'
import { buildWelcomeEmail } from './_lib/emails.js'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Autenticazione: solo un admin con sessione Supabase Auth valida può confermare
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Non autenticato' })

  const { data: userData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !userData?.user) {
    return res.status(401).json({ error: 'Sessione non valida' })
  }

  const { registrationId } = req.body
  if (!registrationId) return res.status(400).json({ error: 'registrationId mancante' })

  try {
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*, tickets(name, price)')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      return res.status(404).json({ error: 'Registrazione non trovata' })
    }

    // Idempotenza: se già completata, non rifare invio email / rimborsi
    if (registration.payment_status === 'completed') {
      return res.status(200).json({
        success: true,
        alreadyCompleted: true,
        registration: { id: registration.id, invite_code: registration.invite_code },
      })
    }

    const discountAmount = Number(registration.discount_amount || 0)
    const paidAmount = Math.max(0, Number(registration.tickets?.price || 0) - discountAmount)

    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        payment_status: 'completed',
        paid_amount: paidAmount,
        paid_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    if (updateError) {
      console.error('Errore aggiornamento registrazione:', updateError)
      return res.status(500).json({ error: 'Errore aggiornamento registrazione' })
    }

    // Assegna il codice presentazione personale al nuovo iscritto
    const inviteCode = await assignInviteCode(supabase, registrationId)

    // Accredita il rimborso al proprietario del codice usato, se presente e sotto il tetto dei 100€
    if (registration.referral_code_used) {
      const { data: owner } = await supabase
        .from('registrations')
        .select('id')
        .eq('invite_code', registration.referral_code_used)
        .eq('payment_status', 'completed')
        .maybeSingle()
      if (owner) {
        await creditReferralReward(supabase, {
          code: registration.referral_code_used,
          ownerRegistrationId: owner.id,
          redeemedRegistrationId: registrationId,
        })
      }
    }

    // Email di benvenuto (con il codice presentazione personale)
    try {
      const { subject, html } = buildWelcomeEmail({
        firstName: registration.first_name,
        lastName: registration.last_name,
        email: registration.email,
        leagueEmail: registration.league_email,
        ticketName: registration.tickets?.name || '',
        amount: paidAmount,
        discountAmount,
        inviteCode,
      })
      await transporter.sendMail({
        from: `"FantaElite Serie A" <${process.env.GMAIL_USER}>`,
        to: registration.email,
        subject,
        html,
      })
      console.log('✅ Email di benvenuto (conferma manuale) inviata a:', registration.email)
    } catch (emailError) {
      console.error('⚠️ Errore invio email (ma conferma OK):', emailError)
    }

    return res.status(200).json({
      success: true,
      registration: { id: registrationId, paid_amount: paidAmount, invite_code: inviteCode },
    })
  } catch (error) {
    console.error('Errore admin-confirm-registration:', error)
    return res.status(500).json({ error: error.message })
  }
}
