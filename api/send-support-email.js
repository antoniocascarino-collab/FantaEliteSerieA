// api/send-support-email-nodemailer.js
// Versione alternativa usando Nodemailer (SMTP)

import nodemailer from 'nodemailer'

// Configurazione transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // o 'smtp.gmail.com'
  auth: {
    user: process.env.SMTP_USER, // fantaeliteseriea@gmail.com
    pass: process.env.SMTP_PASSWORD, // App Password di Gmail
  },
})

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, subject, message } = req.body

    // Validazione
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' })
    }

    // Email di supporto ricevuta dal team
    const supportEmailOptions = {
      from: `"FantaElite Serie A Support" <${process.env.SMTP_USER}>`,
      to: 'fantaeliteseriea@gmail.com',
      subject: `[SUPPORTO] ${subject} - da ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f0b429 0%, #c8952a 100%); color: #08090d; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.1em; }
            .content { background: #f5f5f0; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #f0b429; border-radius: 4px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { margin-top: 5px; font-size: 16px; color: #08090d; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #ddd; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 FANTALITE - RICHIESTA SUPPORTO</h1>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">Da</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              <div class="info-row">
                <div class="label">Oggetto</div>
                <div class="value">${subject}</div>
              </div>
              
              <div class="message-box">
                <div class="label">Messaggio</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
              
              <div class="footer">
                <p>Ricevuto: ${new Date().toLocaleString('it-IT', { 
                  dateStyle: 'full', 
                  timeStyle: 'medium' 
                })}</p>
                <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <strong>Rispondi a:</strong> <a href="mailto:${email}">${email}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email, // Per rispondere direttamente all'utente
    }

    // Email di conferma all'utente
    const userConfirmationOptions = {
      from: `"FantaElite Serie A Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Conferma richiesta - FantaElite Serie A',
      html: `
        <!DOCTYPE html>
        <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #f0b429; color: #08090d; padding: 20px; text-align: center; }
      .content { background: #f5f5f0; padding: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>FANTAELITE SERIE A</h1>
      </div>
      <div class="content">
        <p>Ciao <strong>${name}</strong>,</p>
        
        <p>Abbiamo ricevuto la tua richiesta di supporto.</p>
        <p>Il nostro team ti risponderà entro 24-48 ore.</p>
        
        <p><strong>Riepilogo:</strong></p>
        <p>Oggetto: ${subject}</p>
        <p>Messaggio: ${message}</p>
        
        <p>Cordiali saluti,<br>
        <strong>Team FantaElite Serie A</strong><br>
        fantaeliteseriea@gmail.com</p>
      </div>
    </div>
  </body>
  </html>
`,
    }

    // Invia entrambe le email
    await Promise.all([
      transporter.sendMail(supportEmailOptions),
      transporter.sendMail(userConfirmationOptions),
    ])

    console.log('Email inviate con successo a:', email)

    return res.status(200).json({
      success: true,
      message: 'Email inviate con successo',
    })

  } catch (error) {
    console.error('Errore invio email:', error)
    return res.status(500).json({
      error: 'Errore durante l\'invio dell\'email. Riprova più tardi.',
      details: error.message,
    })
  }
}
