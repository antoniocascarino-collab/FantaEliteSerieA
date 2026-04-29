import React, { useState } from 'react'

/* ─────────────────────────────────────────────
   ICONE
───────────────────────────────────────────── */
const MessageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const MailIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const CheckCircleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const AlertCircleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.72rem', letterSpacing: '0.35em', color: 'var(--gold)',
      textTransform: 'uppercase', marginBottom: '0.75rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ width: 24, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      lineHeight: 1.05,
      letterSpacing: '0.03em',
      marginBottom: '2.5rem',
    }}>
      {children}
    </h2>
  )
}

/* ─────────────────────────────────────────────
   FORM SUPPORTO PRINCIPALE
───────────────────────────────────────────── */
export default function FormSupport({ settings }) {
  const [step, setStep] = useState('form') // 'form' | 'success' | 'error'
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.name || !form.email || !form.subject || !form.message) {
      setErrorMsg('Compila tutti i campi per inviare la richiesta.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      // Chiamata API per inviare l'email
      const response = await fetch('/api/send-support-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio')
      }

      setStep('success')
      
      // Reset form dopo 5 secondi
      setTimeout(() => {
        setForm({ name: '', email: '', subject: '', message: '' })
        setStep('form')
      }, 5000)

    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Errore durante l\'invio. Riprova più tardi.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'var(--white)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-body)',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginBottom: '0.4rem',
    letterSpacing: '0.05em',
  }

  return (
    <section id="supporto" style={{ padding: '6rem 2rem 8rem', maxWidth: 960, margin: '0 auto' }}>
      <SectionLabel>Assistenza</SectionLabel>
      <SectionTitle>Hai bisogno di aiuto?<br />Contattaci</SectionTitle>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start',
      }}>
        
        {/* Info Box */}
        <div>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(240,180,41,0.05) 0%, rgba(17,18,32,0.8) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: 'rgba(240,180,41,0.15)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}>
                💬
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                  Supporto Dedicato
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Ti rispondiamo entro 24-48 ore
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
              }}>
                <MailIcon size={18} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.1rem' }}>
                    Email
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--white)', fontWeight: 500 }}>
                    fantaeliteseriea@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ rapide */}
          <div style={{
            padding: '1.25rem',
            background: 'rgba(240,180,41,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            color: 'var(--muted)',
            lineHeight: 1.7,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold)',
              marginBottom: '0.875rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>
              <MessageIcon size={16} /> Domande Frequenti
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong style={{ color: 'var(--white)' }}>• Come funziona l'iscrizione?</strong><br />
                Scegli il ticket, compila il form e paga con carta. Riceverai conferma via email.
              </div>
              <div>
                <strong style={{ color: 'var(--white)' }}>• Quando vengono assegnati i premi?</strong><br />
                I premi vengono assegnati a fine stagione secondo la classifica finale.
              </div>
              <div>
                <strong style={{ color: 'var(--white)' }}>• Posso modificare la mia squadra?</strong><br />
                Consulta il regolamento ufficiale per le tempistiche di mercato.
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          {step === 'form' && (
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div>
                <label style={labelStyle}>Nome Completo *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Mario Rossi"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="mario@email.com"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Oggetto *</label>
                <select
    name="subject"
    value={form.subject}
    onChange={handleChange}
    required
    style={{
      ...inputStyle,
      cursor: 'pointer',
      color: form.subject ? 'var(--white)' : 'var(--muted)',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23f0b429' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      paddingRight: '2.5rem',
    }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <option value="" style={{ background: '#111220', color: '#8a8a9a' }}>Seleziona un oggetto</option>
<option value="iscrizione" style={{ background: '#111220', color: '#f5f5f0' }}>Problemi con l'iscrizione</option>
<option value="pagamento" style={{ background: '#111220', color: '#f5f5f0' }}>Problemi con il pagamento</option>
<option value="regolamento" style={{ background: '#111220', color: '#f5f5f0' }}>Chiarimenti sul regolamento</option>
<option value="premi" style={{ background: '#111220', color: '#f5f5f0' }}>Informazioni sui premi</option>
<option value="tecnico" style={{ background: '#111220', color: '#f5f5f0' }}>Problema tecnico</option>
<option value="altro" style={{ background: '#111220', color: '#f5f5f0' }}>Altro</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Messaggio *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Descrivi il tuo problema o la tua domanda..."
                  required
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '120px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {errorMsg && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,80,80,0.1)',
                  border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#ff8080',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <AlertCircleIcon size={16} />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: loading ? 'rgba(240,180,41,0.3)' : 'var(--gold)',
                  color: 'var(--black)',
                  border: 'none',
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => !loading && (e.currentTarget.style.opacity = '1')}
              >
                {loading ? (
                  <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>
                    Invio in corso...
                  </span>
                ) : (
                  <>
                    <MailIcon size={18} /> Invia Richiesta
                  </>
                )}
              </button>

              <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--muted)',
              }}>
                📧 Riceverai una copia della richiesta via email
              </div>
            </form>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: 72,
                height: 72,
                margin: '0 auto 1.5rem',
                background: 'rgba(110,231,183,0.15)',
                border: '2px solid #6ee7b7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircleIcon size={32} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
                color: '#6ee7b7',
              }}>
                RICEVUTO!
              </h3>
              <p style={{
                color: 'var(--muted)',
                lineHeight: 1.7,
                marginBottom: '1rem',
              }}>
                Grazie per averci contattato, <strong style={{ color: 'var(--white)' }}>{form.name}</strong>!<br />
                Riceverai una risposta all'indirizzo <strong style={{ color: 'var(--white)' }}>{form.email}</strong> entro 24-48 ore.
              </p>
              <div style={{
                padding: '1rem',
                background: 'rgba(110,231,183,0.05)',
                border: '1px solid rgba(110,231,183,0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--muted)',
              }}>
                💡 Controlla anche la cartella spam se non trovi la risposta
              </div>
            </div>
          )}

          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: 64,
                height: 64,
                margin: '0 auto 1.25rem',
                background: 'rgba(255,80,80,0.15)',
                border: '2px solid rgba(255,80,80,0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircleIcon size={28} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                marginBottom: '0.75rem',
                color: '#ff8080',
              }}>
                ERRORE
              </h3>
              <p style={{
                color: 'var(--muted)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}>
                {errorMsg}
              </p>
              <button
                onClick={() => {
                  setStep('form')
                  setErrorMsg('')
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--gold)',
                  color: 'var(--black)',
                  border: 'none',
                  borderRadius: '100px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                }}
              >
                Riprova
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
