import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { paymentIntentId, registrationId, amount } = req.body

    // Verifica il pagamento su Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Pagamento non completato' })
    }

    // Aggiorna Supabase con service role (bypassa RLS)
    const { error } = await supabase
      .from('registrations')
      .update({
        payment_status: 'completed',
        payment_ref: paymentIntentId,
        payment_amount: amount,
      })
      .eq('id', registrationId)

    if (error) throw error
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Confirm payment error:', err)
    res.status(500).json({ error: err.message })
  }
}
