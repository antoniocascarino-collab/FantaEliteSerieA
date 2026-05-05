import React, { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

/* ─────────────────────────────────────────────
   ICONE SVG
───────────────────────────────────────────── */
const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ─────────────────────────────────────────────
   FORM DI SUPPORTO
───────────────────────────────────────────── */
export default function FormSupport({ onBack, settings }) {
  const [form, setForm] = useState({
    tipo: '',
    nome: '',
    email: '',
    emailLegheFC: '',
    messaggio: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error' | null

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          type: form.tipo,
          name: form.nome,
          email: form.email,
          league_email: form.emailLegheFC || null,
          message: form.messaggio,
          status: 'pending',
        })

      if (error) throw error

      setStatus('success')
      setForm({ tipo: '', nome: '', email: '', emailLegheFC: '', messaggio: '' })
    } catch (err) {
      console.error(err)
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

            {/* Status messages */}
            {status === 'success' && (
              <div style={{
                padding: '1rem',
                background: 'rgba(110,231,183,0.1)',
                border: '1px solid rgba(110,231,183,0.3)',
                borderRadius: '8px',
                color: '#6ee7b7',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <CheckIcon size={20} />
                <div>
                  <strong>Richiesta inviata con successo!</strong><br />
                  Ti risponderemo al più presto all'indirizzo <strong>{form.email}</strong>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div style={{
                padding: '1rem',
                background: 'rgba(255,80,80,0.1)',
                border: '1px solid rgba(255,80,80,0.3)',
                borderRadius: '8px',
                color: '#ff8080',
                fontSize: '0.875rem',
              }}>
                Si è verificato un errore. Riprova o contattaci via email a <strong>fantaeliteseriea@gmail.com</strong>
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
              }}
            >
              {loading ? 'Invio in corso...' : '📤 Invia Richiesta'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              In alternativa, puoi scriverci direttamente a<br />
              <a href="mailto:fantaeliteseriea@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                fantaeliteseriea@gmail.com
              </a>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
