// api/send-support-email.js
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configurazione Gmail SMTP (uguale a confirm-payment.js)
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
    p_key: `support:${clientIp}`,
    p_max_requests: 5,
    p_window_seconds: 600,
  })
  if (rateLimitError) {
    console.error('Errore rate limit:', rateLimitError)
  } else if (!allowed) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra qualche minuto.' })
  }

  try {
    const { type, name, email, league_email, message } = req.body

    // Validazione
    if (!type || !name || !email || !message) {
      return res.status(400).json({ error: 'Tutti i campi obbligatori devono essere compilati' })
    }

    // 1. Salva la richiesta in Supabase
    const { data: supportRequest, error: dbError } = await supabase
      .from('support_requests')
      .insert({
        type,
        name,
        email,
        league_email: league_email || null,
        message,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Errore salvataggio database:', dbError)
      return res.status(500).json({ error: 'Errore durante il salvataggio della richiesta' })
    }

    // Mappa i tipi di richiesta per visualizzazione migliore
    const typeLabels = {
      rettifica_email: 'Rettifica email LegheFC',
      info_generali: 'Informazioni generali',
      pagamento: 'Problema con il pagamento',
      regolamento: 'Chiarimenti sul regolamento',
      altro: 'Altro',
    }

    const typeLabel = typeLabels[type] || type

    // 2. Invia email di notifica all'ADMIN (fantaeliteseriea@gmail.com)
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f0b429 0%, #c8952a 100%); color: #08090d; padding: 25px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; letter-spacing: 0.1em; font-weight: 900; }
    .header p { margin: 5px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 30px; }
    .badge { display: inline-block; background: #f0b429; color: #08090d; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 20px; }
    .info-box { background: #f9f9f9; border-left: 4px solid #f0b429; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; font-weight: 600; }
    .info-value { font-size: 15px; color: #08090d; font-weight: 500; }
    .message-box { background: white; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
    .timestamp { color: #999; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 FANTAELITE SERIE A</h1>
      <p>NUOVA RICHIESTA DI SUPPORTO</p>
    </div>
    
    <div class="content">
      <span class="badge">📨 NUOVO MESSAGGIO</span>
      
      <div class="info-box">
        <div class="info-label">Tipo di richiesta</div>
        <div class="info-value">${typeLabel}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Da</div>
        <div class="info-value">${name}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Email di contatto</div>
        <div class="info-value"><a href="mailto:${email}" style="color: #f0b429; text-decoration: none;">${email}</a></div>
      </div>
      
      ${league_email ? `
      <div class="info-box">
        <div class="info-label">Email LegheFC (rettifica richiesta)</div>
        <div class="info-value" style="color: #f0b429; font-weight: 600;">${league_email}</div>
      </div>
      ` : ''}
      
      <div class="message-box">
        <div class="info-label">Messaggio</div>
        <div style="margin-top: 10px; white-space: pre-wrap; line-height: 1.6;">${message}</div>
      </div>
      
      <div class="timestamp">
        📅 Ricevuto: ${new Date().toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'medium' })}
      </div>
      
      <div style="margin-top: 25px; padding: 15px; background: #fff8e7; border-radius: 8px; border: 1px solid #f0b429;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          <strong style="color: #08090d;">💡 Azione richiesta:</strong><br>
          Rispondi a questo messaggio all'indirizzo <strong style="color: #f0b429;">${email}</strong>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">© ${new Date().getFullYear()} FantaElite Serie A</p>
      <p style="margin: 5px 0 0;">Sistema di supporto automatico</p>
    </div>
  </div>
</body>
</html>
    `

    // 3. Invia email di CONFERMA all'UTENTE
    const userEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f0b429 0%, #c8952a 100%); color: #08090d; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; letter-spacing: 0.15em; font-weight: 900; }
    .header p { margin: 8px 0 0; font-size: 13px; letter-spacing: 0.1em; opacity: 0.9; }
    .content { padding: 35px 30px; }
    .success-badge { background: #6ee7b7; color: #08090d; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 700; margin-bottom: 20px; font-size: 13px; }
    .summary-box { background: #f9f9f9; border-left: 4px solid #f0b429; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
    .value { font-size: 15px; color: #08090d; margin-bottom: 12px; }
    .message-preview { background: white; border: 1px solid #e0e0e0; padding: 15px; border-radius: 6px; margin-top: 10px; font-size: 14px; color: #555; white-space: pre-wrap; line-height: 1.5; }
    .info-box { background: #fff8e7; border: 1px solid #f0b429; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f09433, #dc2743, #bc1888); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 700; margin-top: 15px; }
    .footer { background: #f5f5f5; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0; }
    .footer p { margin: 5px 0; font-size: 12px; color: #999; }
    .footer a { color: #f0b429; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FANTAELITE SERIE A</h1>
      <p>LA FANTALEGA D'ÉLITE</p>
    </div>
    
    <div class="content">
      <span class="success-badge">✓ RICHIESTA RICEVUTA</span>
      
      <p style="font-size: 16px; margin-bottom: 10px;">Ciao <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.7;">
        Abbiamo ricevuto la tua richiesta di supporto e il nostro team ti risponderà 
        entro <strong style="color: #f0b429;">24-48 ore</strong> all'indirizzo 
        <strong style="color: #08090d;">${email}</strong>.
      </p>
      
      <div class="summary-box">
        <p style="margin: 0 0 15px 0; font-weight: 700; color: #08090d;">📋 Riepilogo della tua richiesta:</p>
        
        <div class="label">Tipo di richiesta</div>
        <div class="value">${typeLabel}</div>
        
        ${league_email ? `
        <div class="label">Email LegheFC (rettifica)</div>
        <div class="value" style="color: #f0b429; font-weight: 600;">${league_email}</div>
        ` : ''}
        
        <div class="label">Il tuo messaggio</div>
        <div class="message-preview">${message}</div>
      </div>
      
      <div class="info-box">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #08090d;">💡 Nel frattempo:</p>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">Controlla la cartella <strong>spam/posta indesiderata</strong> per la nostra risposta</li>
          <li style="margin-bottom: 8px;">Consulta il <strong>regolamento ufficiale</strong> sul sito per domande frequenti</li>
          <li>Seguici su <strong>Instagram</strong> per aggiornamenti in tempo reale</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://instagram.com/fantaeliteseriea" class="cta-button">
          📸 Seguici su Instagram
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Grazie per la tua pazienza! 🍀
      </p>
      
      <p style="margin-top: 10px; font-size: 14px; color: #08090d; font-weight: 600;">
        Il Team FantaElite
      </p>
    </div>
    
    <div class="footer">
      <p style="font-weight: 600; color: #666;">Hai altre domande?</p>
      <p><a href="mailto:fantaeliteseriea@gmail.com">fantaeliteseriea@gmail.com</a></p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} FantaElite Serie A</p>
      <p>La lega d'élite più competitiva d'Italia</p>
      <p style="margin-top: 10px; font-size: 11px;">
        Questa è un'email automatica di conferma.<br>
        Riceverai una risposta personale entro 24-48 ore.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Invia entrambe le email
    try {
      await Promise.all([
        // Email all'admin
        transporter.sendMail({
          from: `"FantaElite Support" <${process.env.GMAIL_USER}>`,
          to: 'fantaeliteseriea@gmail.com',
          subject: `[SUPPORTO] ${typeLabel} - ${name}`,
          html: adminEmailHtml,
        }),
        // Email di conferma all'utente
        transporter.sendMail({
          from: `"FantaElite Serie A" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: '✓ Richiesta di supporto ricevuta - FantaElite',
          html: userEmailHtml,
        }),
      ])

      console.log('✅ Email inviate con successo:', { admin: 'fantaeliteseriea@gmail.com', user: email })

    } catch (emailError) {
      console.error('⚠️ Errore invio email (ma richiesta salvata):', emailError)
      // Non blocchiamo la risposta - la richiesta è comunque salvata nel DB
    }

    // 4. Risposta di successo
    return res.status(200).json({
      success: true,
      message: 'Richiesta inviata con successo',
      requestId: supportRequest.id,
    })

  } catch (error) {
    console.error('Errore send-support-email:', error)
    return res.status(500).json({
      error: 'Errore durante l\'invio della richiesta',
      details: error.message,
    })
  }
}
