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
      from: `"FantaElite Support" <${process.env.SMTP_USER}>`,
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
      from: `"FantaElite Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '✓ Richiesta di supporto ricevuta - FantaElite',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f0b429 0%, #c8952a 100%); color: #08090d; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; letter-spacing: 0.1em; }
            .content { background: #f5f5f0; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-badge { background: #6ee7b7; color: #08090d; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f0b429; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FANTALITE</h1>
              <p style="margin: 0; opacity: 0.9;">La Fantalega d'Élite</p>
            </div>
            <div class="content">
              <div class="success-badge">✓ Richiesta Ricevuta</div>
              
              <p>Ciao <strong>${name}</strong>,</p>
              
              <p>Abbiamo ricevuto la tua richiesta di supporto e il nostro team ti risponderà entro <strong>24-48 ore</strong>.</p>
              
              <div class="info-box">
                <p style="margin: 0 0 10px 0;"><strong>Riepilogo della tua richiesta:</strong></p>
                <p style="margin: 5px 0;"><strong>Oggetto:</strong> ${subject}</p>
                <p style="margin: 5px 0;"><strong>Messaggio:</strong></p>
                <p style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">${message}</p>
              </div>
              
              <p><strong>💡 Nel frattempo:</strong></p>
              <ul>
                <li>Controlla la cartella <strong>spam/posta indesiderata</strong> per la nostra risposta</li>
                <li>Consulta il <strong>regolamento ufficiale</strong> per domande frequenti</li>
                <li>Seguici su <strong>Instagram</strong> per aggiornamenti</li>
              </ul>
              
              <div class="footer">
                <p><strong>FantaElite Support</strong></p>
                <p>fantaeliteseriea@gmail.com</p>
                <p style="margin-top: 15px; font-size: 11px;">
                  Questa è un'email automatica. Non rispondere a questo messaggio.<br />
                  Riceverai una risposta personale entro 24-48 ore.
                </p>
              </div>
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
