import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configurazione Gmail SMTP
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

export default async function handler(req, res) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
      .select('id, email, league_email')
      .eq('id', registrationId)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({
        success: true,
        registration: { id: existing.id, email: existing.email, league_email: existing.league_email },
      })
    }

    // 4. Importo reale verificato da Stripe — non quello inviato dal client
    const realAmount = paymentIntent.amount / 100

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
        paid_amount: realAmount,
        paid_at: new Date().toISOString(),
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

    // 6. Invia email di benvenuto via Gmail
    try {
      const mailOptions = {
        from: `"FantaElite Serie A" <${process.env.GMAIL_USER}>`,
        to: registration.email,
        subject: '🏆 Benvenuto in FantaElite Serie A!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto in FantaElite</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #08090d;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header con gradiente oro -->
          <tr>
            <td style="background: linear-gradient(135deg, #f0b429 0%, #e09e10 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #08090d; font-size: 36px; letter-spacing: 3px; font-weight: 900;">
                FANTAELITE
              </h1>
              <p style="margin: 8px 0 0; color: #08090d; font-size: 14px; letter-spacing: 2px; opacity: 0.9;">
                SERIE A
              </p>
            </td>
          </tr>

          <!-- Contenuto principale -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #08090d; font-size: 28px; font-weight: 700;">
                🎉 Benvenuto in FantaElite!
              </h2>
              
              <p style="margin: 0 0 15px; color: #333; font-size: 16px; line-height: 1.6;">
                Ciao <strong>${registration.first_name} ${registration.last_name}</strong>,
              </p>
              
              <p style="margin: 0 0 25px; color: #333; font-size: 16px; line-height: 1.6;">
                Il tuo pagamento è stato confermato con successo! Sei ufficialmente iscritto alla lega più competitiva d'Italia. 🏆
              </p>

              <!-- Box dettagli pagamento -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; border-left: 4px solid #f0b429; border-radius: 8px; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #08090d; font-size: 14px; font-weight: 700;">
                      📋 DETTAGLI ISCRIZIONE
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Ticket:</td>
                        <td style="padding: 5px 0; color: #08090d; font-size: 14px; font-weight: 600; text-align: right;">
                          ${registration.tickets.name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Importo:</td>
                        <td style="padding: 5px 0; color: #f0b429; font-size: 16px; font-weight: 700; text-align: right;">
                         €${Number(realAmount).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Email contatto:</td>
                        <td style="padding: 5px 0; color: #08090d; font-size: 14px; text-align: right;">
                          ${registration.email}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Email LegheFC:</td>
                        <td style="padding: 5px 0; color: #08090d; font-size: 14px; font-weight: 600; text-align: right;">
                          ${registration.league_email}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Data pagamento:</td>
                        <td style="padding: 5px 0; color: #08090d; font-size: 14px; text-align: right;">
                          ${new Date().toLocaleDateString('it-IT')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Prossimi passi -->
              <div style="background-color: #fff8e7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 15px; color: #08090d; font-size: 16px; font-weight: 700;">
                  📧 Prossimi passi:
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">
                    Riceverai l'<strong>invito alla lega LegheFC</strong> all'indirizzo:<br>
                    <span style="color: #f0b429; font-weight: 600;">${registration.league_email}</span>
                  </li>
                  <li style="margin-bottom: 8px;">
                    Controlla le <strong>classifiche settimanali</strong> pubblicate sul sito
                  </li>
                  <li>
                    Segui il nostro <strong>Instagram</strong> per news e aggiornamenti in tempo reale
                  </li>
                </ol>
              </div>

              <!-- CTA Instagram -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://instagram.com/fantaeliteseriea" style="display: inline-block; background: linear-gradient(135deg, #f09433, #dc2743, #bc1888); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                      📸 Seguici su Instagram
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Buona fortuna per la stagione! 🍀
              </p>

              <p style="margin: 10px 0 0; color: #08090d; font-size: 14px; font-weight: 600;">
                Il Team FantaElite
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #666; font-size: 13px;">
                Hai domande? Contattaci
              </p>
              <p style="margin: 0 0 15px;">
                <a href="mailto:fantaeliteseriea@gmail.com" style="color: #f0b429; text-decoration: none; font-weight: 600;">
                  fantaeliteseriea@gmail.com
                </a>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} FantaElite Serie A<br>
                La lega d'élite più competitiva d'Italia
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }

      await transporter.sendMail(mailOptions)
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
      }
    })

  } catch (error) {
    console.error('Errore confirm-payment:', error)
    return res.status(500).json({ error: error.message })
  }
}
