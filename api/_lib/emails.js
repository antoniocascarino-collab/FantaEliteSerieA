// api/_lib/emails.js
// Email di benvenuto condivisa tra confirm-payment.js (Stripe) e
// admin-confirm-registration.js (conferma manuale PayPal/Bonifico).
export function buildWelcomeEmail({ firstName, lastName, email, leagueEmail, ticketName, amount, discountAmount, inviteCode }) {
  const hasDiscount = Number(discountAmount) > 0
  return {
    subject: '🏆 Benvenuto in FantaElite Serie A!',
    html: `<!DOCTYPE html>
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

          <tr>
            <td style="background: linear-gradient(135deg, #f0b429 0%, #e09e10 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #08090d; font-size: 36px; letter-spacing: 3px; font-weight: 900;">FANTAELITE</h1>
              <p style="margin: 8px 0 0; color: #08090d; font-size: 14px; letter-spacing: 2px; opacity: 0.9;">SERIE A</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #08090d; font-size: 28px; font-weight: 700;">🎉 Benvenuto in FantaElite!</h2>
              <p style="margin: 0 0 15px; color: #333; font-size: 16px; line-height: 1.6;">Ciao <strong>${firstName} ${lastName}</strong>,</p>
              <p style="margin: 0 0 25px; color: #333; font-size: 16px; line-height: 1.6;">Il tuo pagamento è stato confermato con successo! Sei ufficialmente iscritto alla lega più competitiva d'Italia. 🏆</p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; border-left: 4px solid #f0b429; border-radius: 8px; margin: 25px 0;">
                <tr><td style="padding: 20px;">
                  <p style="margin: 0 0 10px; color: #08090d; font-size: 14px; font-weight: 700;">📋 DETTAGLI ISCRIZIONE</p>
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; color: #666; font-size: 14px;">Ticket:</td><td style="padding: 5px 0; color: #08090d; font-size: 14px; font-weight: 600; text-align: right;">${ticketName}</td></tr>
                    ${hasDiscount ? `<tr><td style="padding: 5px 0; color: #666; font-size: 14px;">Sconto codice invito:</td><td style="padding: 5px 0; color: #6ee7b7; font-size: 14px; font-weight: 700; text-align: right;">-€${Number(discountAmount).toFixed(2)}</td></tr>` : ''}
                    <tr><td style="padding: 5px 0; color: #666; font-size: 14px;">Importo pagato:</td><td style="padding: 5px 0; color: #f0b429; font-size: 16px; font-weight: 700; text-align: right;">€${Number(amount).toFixed(2)}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666; font-size: 14px;">Email contatto:</td><td style="padding: 5px 0; color: #08090d; font-size: 14px; text-align: right;">${email}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666; font-size: 14px;">Email LegheFC:</td><td style="padding: 5px 0; color: #08090d; font-size: 14px; font-weight: 600; text-align: right;">${leagueEmail}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666; font-size: 14px;">Data pagamento:</td><td style="padding: 5px 0; color: #08090d; font-size: 14px; text-align: right;">${new Date().toLocaleDateString('it-IT')}</td></tr>
                  </table>
                </td></tr>
              </table>

              ${inviteCode ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #08090d; border-radius: 10px; margin: 25px 0;">
                <tr><td style="padding: 24px; text-align: center;">
                  <p style="margin: 0 0 8px; color: #f0b429; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">🎁 Il tuo codice presentazione</p>
                  <p style="margin: 0 0 10px; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 3px; font-family: monospace;">${inviteCode}</p>
                  <p style="margin: 0; color: #8a8a9a; font-size: 13px; line-height: 1.6;">Condividilo con i tuoi amici: chi lo usa riceve <strong style="color:#6ee7b7;">€5 di sconto</strong> e tu ricevi <strong style="color:#f0b429;">€5 di rimborso</strong> per ogni iscrizione completata (fino a €100).</p>
                </td></tr>
              </table>` : ''}

              <div style="background-color: #fff8e7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 15px; color: #08090d; font-size: 16px; font-weight: 700;">📧 Prossimi passi:</p>
                <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Riceverai l'<strong>invito alla lega LegheFC</strong> all'indirizzo:<br><span style="color: #f0b429; font-weight: 600;">${leagueEmail}</span></li>
                  <li style="margin-bottom: 8px;">Controlla le <strong>classifiche settimanali</strong> pubblicate sul sito</li>
                  <li>Segui il nostro <strong>Instagram</strong> per news e aggiornamenti in tempo reale</li>
                </ol>
              </div>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr><td align="center">
                  <a href="https://instagram.com/fantaeliteseriea" style="display: inline-block; background: linear-gradient(135deg, #f09433, #dc2743, #bc1888); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">📸 Seguici su Instagram</a>
                </td></tr>
              </table>

              <p style="margin: 25px 0 0; color: #666; font-size: 14px; line-height: 1.6;">Buona fortuna per la stagione! 🍀</p>
              <p style="margin: 10px 0 0; color: #08090d; font-size: 14px; font-weight: 600;">Il Team FantaElite</p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #666; font-size: 13px;">Hai domande? Contattaci</p>
              <p style="margin: 0 0 15px;"><a href="mailto:fantaeliteseriea@gmail.com" style="color: #f0b429; text-decoration: none; font-weight: 600;">fantaeliteseriea@gmail.com</a></p>
              <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} FantaElite Serie A<br>La lega d'élite più competitiva d'Italia</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}
