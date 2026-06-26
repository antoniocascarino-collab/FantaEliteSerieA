import React, { useState, useEffect } from 'react'

/* ─────────────────────────────────────────────
   ICONE SVG
───────────────────────────────────────────── */
const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const AlertIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

/* ─────────────────────────────────────────────
   FORM DI SUPPORTO
───────────────────────────────────────────── */
export default function FormSupport({ onBack, settings, onNavigate }) {
  const [form, setForm] = useState({
    tipo: '',
    nome: '',
    email: '',
    emailLegheFC: '',
    messaggio: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    setErrorMsg('')

    try {
      // Chiamata all'endpoint API
      const response = await fetch('/api/send-support-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.tipo,
          name: form.nome,
          email: form.email,
          league_email: form.emailLegheFC || null,
          message: form.messaggio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio')
      }

      // Successo
      setStatus('success')
      setForm({ tipo: '', nome: '', email: '', emailLegheFC: '', messaggio: '' })

      // Reset automatico dopo 5 secondi
      setTimeout(() => {
        setStatus(null)
      }, 5000)

    } catch (err) {
      console.error('Errore invio richiesta:', err)
      setErrorMsg(err.message || 'Si è verificato un errore. Riprova più tardi.')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '5rem' }}>
      {/* Back button */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '100px',
            color: 'var(--muted)',
            fontSize: '0.85rem',
            padding: '0.5rem 1.25rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.03em',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          ← Home
        </button>
      </div>

      {/* Hero */}
      <section style={{ padding: '3rem 2rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>SUPPORTO</span>
        </h1>
        <p style={{ maxWidth: 480, margin: '0 auto', color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6 }}>
          Hai bisogno di assistenza? Compila il form e ti risponderemo al più presto.
        </p>
      </section>

      {/* Form */}
      <section style={{ padding: '0 2rem 6rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem',
        }}>
          {status === 'success' ? (
            // Messaggio di successo
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
                <CheckIcon size={32} />
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
                fontSize: '1rem',
              }}>
                Grazie <strong style={{ color: 'var(--white)' }}>{form.nome || 'per averci contattato'}</strong>!<br />
                Ti abbiamo inviato una conferma all'indirizzo email che hai indicato.<br />
                Ti risponderemo entro <strong style={{ color: 'var(--gold)' }}>24-48 ore</strong>.
              </p>
              <div style={{
                padding: '1rem',
                background: 'rgba(110,231,183,0.05)',
                border: '1px solid rgba(110,231,183,0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                marginBottom: '1.5rem',
              }}>
                💡 Controlla anche la cartella spam se non trovi la risposta
              </div>
              <button
                onClick={() => setStatus(null)}
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
                Invia un'altra richiesta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Tipo richiesta */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Tipo di richiesta *</label>
                <select 
                  name="tipo" 
                  value={form.tipo} 
                  onChange={handleChange} 
                  required 
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <option value="" style={{ background: 'var(--card)', color: 'var(--muted)' }}>Seleziona...</option>
                  <option value="rettifica_email" style={{ background: 'var(--card)' }}>Rettifica email LegheFC</option>
                  <option value="info_generali" style={{ background: 'var(--card)' }}>Informazioni generali</option>
                  <option value="pagamento" style={{ background: 'var(--card)' }}>Problema con il pagamento</option>
                  <option value="regolamento" style={{ background: 'var(--card)' }}>Chiarimenti sul regolamento</option>
                  <option value="altro" style={{ background: 'var(--card)' }}>Altro</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Nome e Cognome *</label>
                  <input 
                    name="nome" 
                    value={form.nome} 
                    onChange={handleChange} 
                    placeholder="Mario Rossi" 
                    required 
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Email *</label>
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
              </div>

              {/* Mostra campo email LegheFC solo se tipo è "rettifica_email" */}
              {form.tipo === 'rettifica_email' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Email LegheFC corretta *</label>
                  <input 
                    type="email" 
                    name="emailLegheFC" 
                    value={form.emailLegheFC} 
                    onChange={handleChange} 
                    placeholder="email.corretta@leghefc.com" 
                    required={form.tipo === 'rettifica_email'}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                    Inserisci l'indirizzo email corretto da utilizzare per l'invito LegheFC
                  </div>
                </div>
              )}

              {/* Messaggio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Messaggio *</label>
                <textarea 
                  name="messaggio" 
                  value={form.messaggio} 
                  onChange={handleChange} 
                  placeholder="Descrivi il tuo problema o la tua richiesta..." 
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

              {/* Error message */}
              {status === 'error' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255,80,80,0.1)',
                  border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: '8px',
                  color: '#ff8080',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <AlertIcon size={20} />
                  <div>
                    <strong>Errore!</strong><br />
                    {errorMsg || 'Si è verificato un errore. Riprova o contattaci via email.'}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  padding: '1rem',
                  background: loading ? 'rgba(240,180,41,0.3)' : 'var(--gold)',
                  color: 'var(--black)',
                  border: 'none',
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? (
                  <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>
                    Invio in corso...
                  </span>
                ) : (
                  <>📤 Invia Richiesta</>
                )}
              </button>

            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Inviando questo modulo, i tuoi dati saranno trattati secondo la nostra{' '}
                <a href="#" onClick={e => { e.preventDefault(); onNavigate && onNavigate('privacy') }} style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                  Privacy Policy
                </a>.
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                In alternativa, puoi scriverci direttamente a<br />
                <a href="mailto:fantaeliteseriea@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                  fantaeliteseriea@gmail.com
                </a>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
