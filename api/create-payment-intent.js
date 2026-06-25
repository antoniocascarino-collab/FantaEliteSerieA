import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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

export default async function handler(req, res) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { registrationId } = req.body

    if (!registrationId) {
      return res.status(400).json({ error: 'registrationId mancante' })
    }

    // Prezzo REALE recuperato dal database — non viene mai usato il valore inviato dal client
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id, payment_status, tickets(name, price)')
      .eq('id', registrationId)
      .single()

    if (regError || !registration || !registration.tickets) {
      return res.status(404).json({ error: 'Registrazione non trovata' })
    }

    if (registration.payment_status !== 'pending') {
      return res.status(400).json({ error: 'Registrazione non valida per il pagamento' })
    }

    const realAmount = Number(registration.tickets.price)
    const ticketName = registration.tickets.name

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(realAmount * 100), // prezzo calcolato lato server
      currency: 'eur',
      metadata: {
        ticketName,
        registrationId,
      },
      description: `FantaElite — ${ticketName}`,
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: err.message })
  }
  }
