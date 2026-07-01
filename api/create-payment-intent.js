import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { revalidateInviteCode } from './_lib/inviteCode.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const clientIp = getClientIp(req)
  const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
    p_key: `intent:${clientIp}`,
    p_max_requests: 10,
    p_window_seconds: 600,
  })
  if (rateLimitError) {
    console.error('Errore rate limit:', rateLimitError)
  } else if (!allowed) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra qualche minuto.' })
  }

  try {
    const { registrationId, ticketId, email, inviteCode } = req.body

    if (!registrationId || !ticketId) {
      return res.status(400).json({ error: 'Dati mancanti' })
    }

    // Prezzo REALE recuperato dal database — non viene mai usato un valore inviato dal client
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('name, price, active')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket || !ticket.active) {
      return res.status(404).json({ error: 'Ticket non trovato o non disponibile' })
    }

    // Codice presentazione: rivalidato SEMPRE lato server, mai fidandosi del client
    const codeNormalized = (inviteCode || '').trim().toUpperCase()
    const validated = codeNormalized ? await revalidateInviteCode(supabase, codeNormalized, email) : { valid: false, discount: 0 }
    const discountAmount = validated.valid ? 5 : 0

    const realAmount = Math.max(0, Number(ticket.price) - discountAmount)
    const ticketName = ticket.name

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(realAmount * 100), // prezzo calcolato lato server, già scontato
      currency: 'eur',
      metadata: {
        ticketName,
        registrationId,
        ticketId,
        referralCodeUsed: validated.valid ? codeNormalized : '',
        discountAmount: String(discountAmount),
      },
      description: `FantaElite — ${ticketName}`,
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret, amount: realAmount, discountAmount })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: err.message })
  }
}
