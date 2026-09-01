import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { buildWelcomeEmail } from './_lib/emails.js'
import { checkTicketCapacity } from './_lib/capacity.js'

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

// ─── Endpoint per iscrizioni a ticket GRATUITI ────────────────────────────
// Nessun metodo di pagamento coinvolto: la registrazione viene creata e
// marcata subito come 'completed' con importo 0. Il ticket deve avere
// price = 0 e active = true. Il numero massimo di partecipanti (se
// impostato) viene sempre rispettato.
export default async function handler(req, res) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientIp = getClientIp(req)
  const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
    p_key: `free:${clientIp}`,
    p_max_requests: 10,
    p_window_seconds: 600,
  })
  if (rateLimitError) {
    console.error('Errore rate limit:', rateLimitError)
  } else if (!allowed) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra qualche minuto.' })
  }

  const { registrationId, ticketId, firstName, lastName, email, leagueEmail, phone, privacyAcceptedAt } = req.body

  if (!registrationId || !ticketId || !firstName || !lastName || !email || !leagueEmail || !phone || !privacyAcceptedAt) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 0. Idempotenza: se questa registrazione esiste già (retry/doppio click), non duplicare
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, email, league_email')
      .eq('id', registrationId)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({
        success: true,
        registration: { id: existing.id, email: existing.email, league_email: existing.league_email },
      })
    }

    // 1. Il ticket deve esistere, essere attivo ed essere effettivamente gratuito
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, name, price, active, max_participants')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket || !ticket.active) {
      return res.status(404).json({ error: 'Ticket non trovato o non disponibile' })
    }
    if (Number(ticket.price) !== 0) {
      return res.status(400).json({ error: 'Questo ticket non è gratuito' })
    }

    // 2. Verifica il numero massimo di partecipanti per questo ticket
    const capacity = await checkTicketCapacity(supabase, ticket)
    if (!capacity.available) {
      return res.status(409).json({ error: 'Ticket esaurito. Scegli un altro ticket.' })
    }

    // 3. Email già usata per questo ticket?
    const { data: alreadyRegistered } = await supabase
      .rpc('check_existing_registration', { p_email: email, p_ticket_id: ticketId })
    if (alreadyRegistered) {
      return res.status(409).json({ error: 'Questa email ha già una registrazione per questo ticket.' })
    }

    // 4. Crea la registrazione, già confermata (nessun pagamento da attendere)
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
        payment_method: 'free',
        paid_amount: 0,
        paid_at: new Date().toISOString(),
        discount_amount: 0,
        referral_code_used: null,
      })
      .select('*, tickets(*)')
      .single()

    if (insertError) {
      console.error('Errore inserimento database:', insertError)
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'Questa email ha già una registrazione per questo ticket.' })
      }
      return res.status(500).json({ error: 'Database insert failed' })
    }

    // 5. Email di benvenuto
    try {
      const { subject, html } = buildWelcomeEmail({
        firstName: registration.first_name,
        lastName: registration.last_name,
        email: registration.email,
        leagueEmail: registration.league_email,
        ticketName: registration.tickets?.name || ticket.name,
        amount: 0,
        discountAmount: 0,
        inviteCode: null,
      })
      await transporter.sendMail({
        from: `"FantaElite Serie A" <${process.env.GMAIL_USER}>`,
        to: registration.email,
        subject,
        html,
      })
      console.log('✅ Email di benvenuto (ticket gratuito) inviata a:', registration.email)
    } catch (emailError) {
      console.error('⚠️ Errore invio email (ma iscrizione OK):', emailError)
    }

    return res.status(200).json({
      success: true,
      registration: {
        id: registration.id,
        email: registration.email,
        league_email: registration.league_email,
      },
    })
  } catch (error) {
    console.error('Errore confirm-free:', error)
    return res.status(500).json({ error: error.message })
  }
}
