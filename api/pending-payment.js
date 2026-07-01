import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { revalidateInviteCode } from './_lib/inviteCode.js'

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

// ─── Dati bonifico bancario ───────────────────────────────────────────────────
const BANCA = {
  beneficiario: 'Antonio Cascarino',
  iban: process.env.IBAN_BONIFICO || 'IT00 X000 0000 0000 0000 0000 000',
  banca: process.env.BANCA_NOME || 'Banca Esempio',
}

function discountRow(discountAmount) {
  if (!discountAmount || Number(discountAmount) <= 0) return ''
  return `<tr>
    <td style="padding:8px 0;color:#8a8a9a;font-size:13px;border-top:1px solid #2a2a3e;">Sconto codice invito:</td>
    <td style="padding:8px 0;color:#6ee7b7;font-size:14px;font-weight:700;border-top:1px solid #2a2a3e;">-€${Number(discountAmount).toFixed(2)}</td>
  </tr>`
}

// ─── HTML email PayPal ────────────────────────────────────────────────────────
function buildPayPalEmail({ firstName, lastName, email, ticketName, amount, discountAmount }) {
  const causale = `Quota ticket FantaLega ${email}`
  return {
    subject: '⏳ Iscrizione FantaElite Serie A — Completa il pagamento PayPal',
    html: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#08090d 0%,#1a1a2e 100%);padding:40px 40px 30px;text-align:center;">
            <div style="font-family:'Georgia',serif;font-size:28px;font-weight:700;letter-spacing:4px;color:#f0b429;text-transform:uppercase;">
              FantaElite
            </div>
            <div style="color:#8a8a9a;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">
              Serie A
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.6;">
              Ciao <strong>${firstName} ${lastName}</strong>,
            </p>
            <p style="margin:0 0 25px;color:#333;font-size:16px;line-height:1.6;">
              La tua iscrizione è stata registrata! Per completarla, devi effettuare il pagamento tramite <strong>PayPal</strong>.
            </p>

            <!-- Riepilogo -->
            <table role="presentation" style="width:100%;border-collapse:collapse;background:#f9f9f9;border-left:4px solid #f0b429;border-radius:8px;margin:0 0 25px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 12px;color:#08090d;font-size:14px;font-weight:700;">📋 RIEPILOGO ISCRIZIONE</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Ticket:</td>
                    <td style="padding:5px 0;color:#08090d;font-size:14px;font-weight:600;text-align:right;">${ticketName}</td>
                  </tr>
                  ${discountAmount > 0 ? `<tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Sconto codice invito:</td>
                    <td style="padding:5px 0;color:#6ee7b7;font-size:14px;font-weight:700;text-align:right;">-€${Number(discountAmount).toFixed(2)}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Importo:</td>
                    <td style="padding:5px 0;color:#f0b429;font-size:16px;font-weight:700;text-align:right;">€${Number(amount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Causale:</td>
                    <td style="padding:5px 0;color:#08090d;font-size:13px;font-weight:600;text-align:right;">${causale}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Istruzioni PayPal -->
            <div style="background:#fff8e7;border-radius:8px;padding:20px;margin:0 0 25px;">
              <p style="margin:0 0 15px;color:#08090d;font-size:16px;font-weight:700;">💙 Come pagare con PayPal:</p>
              <ol style="margin:0;padding-left:20px;color:#333;font-size:14px;line-height:2;">
                <li>Accedi al tuo account PayPal</li>
                <li>Seleziona <strong>Invia denaro</strong> → <strong>A persone o aziende</strong></li>
                <li>Invia <strong>€${Number(amount).toFixed(2)}</strong> a: <span style="color:#0070ba;font-weight:700;">${process.env.PAYPAL_EMAIL || 'fantaeliteseriea@gmail.com'}</span></li>
                <li>Nella causale scrivi esattamente: <strong style="color:#f0b429;">${causale}</strong></li>
                <li>Scegli <strong>Beni e servizi</strong> come tipo di pagamento</li>
              </ol>
            </div>

            <!-- Avviso -->
            <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:0 0 25px;">
              <p style="margin:0;color:#856404;font-size:13px;line-height:1.6;">
                ⚠️ <strong>Importante:</strong> la tua iscrizione sarà confermata entro <strong>24-48 ore</strong> dalla ricezione del pagamento. Riceverai un'email di conferma con il tuo codice presentazione personale.
              </p>
            </div>

            <p style="margin:0 0 5px;color:#666;font-size:14px;line-height:1.6;">Per assistenza: <a href="mailto:fantaeliteseriea@gmail.com" style="color:#f0b429;text-decoration:none;font-weight:600;">fantaeliteseriea@gmail.com</a></p>
            <p style="margin:20px 0 0;color:#08090d;font-size:14px;font-weight:600;">Il Team FantaElite 🏆</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:25px;text-align:center;border-top:1px solid #e0e0e0;">
            <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} FantaElite Serie A · La lega d'élite più competitiva d'Italia</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

// ─── HTML email Bonifico ──────────────────────────────────────────────────────
function buildBonificoEmail({ firstName, lastName, email, ticketName, amount, discountAmount }) {
  const causale = `Quota ticket FantaLega ${email}`
  return {
    subject: '⏳ Iscrizione FantaElite Serie A — Coordinate bancarie per il bonifico',
    html: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#08090d 0%,#1a1a2e 100%);padding:40px 40px 30px;text-align:center;">
            <div style="font-family:'Georgia',serif;font-size:28px;font-weight:700;letter-spacing:4px;color:#f0b429;text-transform:uppercase;">
              FantaElite
            </div>
            <div style="color:#8a8a9a;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">
              Serie A
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.6;">
              Ciao <strong>${firstName} ${lastName}</strong>,
            </p>
            <p style="margin:0 0 25px;color:#333;font-size:16px;line-height:1.6;">
              La tua iscrizione è stata registrata! Ecco le coordinate per effettuare il <strong>bonifico bancario</strong>.
            </p>

            <!-- Riepilogo -->
            <table role="presentation" style="width:100%;border-collapse:collapse;background:#f9f9f9;border-left:4px solid #f0b429;border-radius:8px;margin:0 0 25px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 12px;color:#08090d;font-size:14px;font-weight:700;">📋 RIEPILOGO ISCRIZIONE</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Ticket:</td>
                    <td style="padding:5px 0;color:#08090d;font-size:14px;font-weight:600;text-align:right;">${ticketName}</td>
                  </tr>
                  ${discountAmount > 0 ? `<tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Sconto codice invito:</td>
                    <td style="padding:5px 0;color:#6ee7b7;font-size:14px;font-weight:700;text-align:right;">-€${Number(discountAmount).toFixed(2)}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:5px 0;color:#666;font-size:14px;">Importo:</td>
                    <td style="padding:5px 0;color:#f0b429;font-size:16px;font-weight:700;text-align:right;">€${Number(amount).toFixed(2)}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Coordinate bancarie -->
            <div style="background:#08090d;border-radius:10px;padding:24px;margin:0 0 25px;">
              <p style="margin:0 0 16px;color:#f0b429;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">🏦 Coordinate Bancarie</p>
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#8a8a9a;font-size:13px;width:40%;">Beneficiario:</td>
                  <td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:700;">${BANCA.beneficiario}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#8a8a9a;font-size:13px;border-top:1px solid #2a2a3e;">IBAN:</td>
                  <td style="padding:8px 0;color:#f0b429;font-size:14px;font-weight:700;font-family:monospace;letter-spacing:1px;border-top:1px solid #2a2a3e;">${BANCA.iban}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#8a8a9a;font-size:13px;border-top:1px solid #2a2a3e;">Banca:</td>
                  <td style="padding:8px 0;color:#ffffff;font-size:14px;border-top:1px solid #2a2a3e;">${BANCA.banca}</td>
                </tr>
                ${discountRow(discountAmount)}
                <tr>
                  <td style="padding:8px 0;color:#8a8a9a;font-size:13px;border-top:1px solid #2a2a3e;">Importo:</td>
                  <td style="padding:8px 0;color:#f0b429;font-size:16px;font-weight:700;border-top:1px solid #2a2a3e;">€${Number(amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#8a8a9a;font-size:13px;border-top:1px solid #2a2a3e;vertical-align:top;">Causale:</td>
                  <td style="padding:8px 0;color:#6ee7b7;font-size:14px;font-weight:700;border-top:1px solid #2a2a3e;">${causale}</td>
                </tr>
              </table>
            </div>

            <!-- Avviso causale -->
            <div style="background:#d4edda;border:1px solid #28a745;border-radius:8px;padding:16px;margin:0 0 20px;">
              <p style="margin:0;color:#155724;font-size:13px;line-height:1.6;">
                ✅ <strong>Inserisci esattamente la causale indicata</strong> per permetterci di identificare il tuo pagamento automaticamente.
              </p>
            </div>

            <!-- Avviso tempi -->
            <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:0 0 25px;">
              <p style="margin:0;color:#856404;font-size:13px;line-height:1.6;">
                ⚠️ <strong>Tempi di conferma:</strong> la tua iscrizione sarà attivata entro <strong>24-48 ore</strong> dalla ricezione del bonifico (i tempi bancari possono variare). Riceverai un'email di conferma con il tuo codice presentazione personale.
              </p>
            </div>

            <p style="margin:0 0 5px;color:#666;font-size:14px;line-height:1.6;">Per assistenza: <a href="mailto:fantaeliteseriea@gmail.com" style="color:#f0b429;text-decoration:none;font-weight:600;">fantaeliteseriea@gmail.com</a></p>
            <p style="margin:20px 0 0;color:#08090d;font-size:14px;font-weight:600;">Il Team FantaElite 🏆</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:25px;text-align:center;border-top:1px solid #e0e0e0;">
            <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} FantaElite Serie A · La lega d'élite più competitiva d'Italia</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

// ─── Handler principale ───────────────────────────────────────────────────────
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
    p_key: `pending:${clientIp}`,
    p_max_requests: 5,
    p_window_seconds: 600,
  })
  if (rateLimitError) {
    console.error('Errore rate limit:', rateLimitError)
  } else if (!allowed) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra qualche minuto.' })
  }

  const { registrationId, ticketId, paymentMethod, firstName, lastName, email, leagueEmail, phone, privacyAcceptedAt, inviteCode } = req.body

  if (!registrationId || !ticketId || !paymentMethod || !firstName || !lastName || !email || !leagueEmail || !phone || !privacyAcceptedAt) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!['paypal', 'bonifico'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' })
  }

  try {
    // 0. Idempotenza: se questa registrazione esiste già (retry/doppio click), non duplicare
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('id', registrationId)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({
        success: true,
        paymentMethod,
        message: paymentMethod === 'paypal'
          ? 'Iscrizione registrata. Controlla la tua email per le istruzioni PayPal.'
          : 'Iscrizione registrata. Controlla la tua email per le coordinate bancarie.',
      })
    }

    // 1. Prezzo REALE recuperato dal database
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('name, price, active')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket || !ticket.active) {
      return res.status(404).json({ error: 'Ticket non trovato o non disponibile' })
    }

    // 1b. Codice presentazione: rivalidato SEMPRE lato server
    const codeNormalized = (inviteCode || '').trim().toUpperCase()
    const validated = codeNormalized ? await revalidateInviteCode(supabase, codeNormalized, email) : { valid: false, discount: 0 }
    const discountAmount = validated.valid ? 5 : 0

    const amount = Math.max(0, Number(ticket.price) - discountAmount)
    const ticketName = ticket.name

    // 2. Crea la registrazione (pending) SOLO ora che il metodo è stato scelto
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
        payment_method: paymentMethod,
        payment_status: 'pending',
        discount_amount: discountAmount,
        referral_code_used: validated.valid ? codeNormalized : null,
      })
      .select('*, tickets(*)')
      .single()

    if (insertError) {
      console.error('Errore inserimento DB:', insertError)
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'Questa email ha già una registrazione per questo ticket.' })
      }
      return res.status(500).json({ error: 'Database insert failed' })
    }

    // 3. Invia email con istruzioni (il codice presentazione personale e il rimborso
    //    all'invitante verranno assegnati solo alla conferma del pagamento da parte dell'admin)
    try {
      const emailData = {
        firstName: registration.first_name,
        lastName: registration.last_name,
        email: registration.email,
        ticketName: registration.tickets?.name || ticketName,
        amount,
        discountAmount,
      }

      const { subject, html } =
        paymentMethod === 'paypal'
          ? buildPayPalEmail(emailData)
          : buildBonificoEmail(emailData)

      await transporter.sendMail({
        from: `"FantaElite Serie A" <${process.env.GMAIL_USER}>`,
        to: registration.email,
        subject,
        html,
      })

      console.log(`✅ Email ${paymentMethod} inviata a: ${registration.email}`)
    } catch (emailError) {
      console.error('⚠️ Errore invio email (registrazione salvata):', emailError)
    }

    return res.status(200).json({
      success: true,
      paymentMethod,
      amount,
      discountAmount,
      message:
        paymentMethod === 'paypal'
          ? 'Iscrizione registrata. Controlla la tua email per le istruzioni PayPal.'
          : 'Iscrizione registrata. Controlla la tua email per le coordinate bancarie.',
    })
  } catch (error) {
    console.error('Errore pending-payment:', error)
    return res.status(500).json({ error: error.message })
  }
}
