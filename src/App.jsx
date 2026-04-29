import React, { useEffect, useState } from 'react'
import Montepremi from './Montepremi.jsx'
import FormSupport from './FormSupport.jsx'
import { supabase } from './supabase.js'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

/* ─────────────────────────────────────────────
   STILI GLOBALI
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black:   #08090d;
      --navy:    #0d0f1a;
      --gold:    #f0b429;
      --gold2:   #e09e10;
      --white:   #f5f5f0;
      --muted:   #8a8a9a;
      --card:    #111220;
      --border:  rgba(240,180,41,0.18);
      --font-display: 'Bebas Neue', sans-serif;
      --font-body:    'Outfit', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-body);
      background: var(--black);
      color: var(--white);
      overflow-x: hidden;
      min-height: 100vh;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

    /* Animazioni */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes rotateSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-10px); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    .fade-up { animation: fadeUp 0.7s ease both; }
    .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
    .fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }

    /* Input base */
    input, select, textarea {
      font-family: var(--font-body);
    }

    /* PayPal button container */
    #paypal-button-container > div {
      border-radius: 8px !important;
      overflow: hidden;
    }
  `}</style>
)

/* ─────────────────────────────────────────────
   COMING SOON
───────────────────────────────────────────── */
function ComingSoon({ settings }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Sfondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(240,180,41,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        border: '1px solid rgba(240,180,41,0.06)',
        borderRadius: '50%',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        animation: 'rotateSlow 40s linear infinite',
      }} />

      {/* Logo */}
      <div className="fade-up" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{
          fontSize: '0.75rem',
          letterSpacing: '0.4em',
          color: 'var(--gold)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
        }}>
          La lega d'Élite
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4rem, 12vw, 8rem)',
          lineHeight: 1,
          letterSpacing: '0.05em',
          background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shimmer 3s linear infinite',
        }}>
          FANTAELITE SERIE A
        </div>

        <div style={{
          marginTop: '2rem',
          fontSize: '1.1rem',
          color: 'var(--muted)',
          fontWeight: 300,
          letterSpacing: '0.05em',
        }}>
          Il portale apre presto. Preparati a dominare.
        </div>

        {settings?.instagram_url && (
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              marginTop: '2.5rem',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              color: 'var(--gold)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <InstagramIcon size={16} /> Seguici su Instagram
          </a>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ICONE SVG
───────────────────────────────────────────── */
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const DownloadIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const TrophyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0L5 4z"/><path d="M5 9H3a2 2 0 0 0 2 2"/><path d="M19 9h2a2 2 0 0 1-2 2"/>
  </svg>
)
const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const TicketIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><line x1="9" y1="12" x2="9.01" y2="12"/><line x1="15" y1="12" x2="15.01" y2="12"/>
  </svg>
)

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({ settings, onNavigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkStyle = (active) => ({
    color: active ? 'var(--gold)' : 'var(--muted)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    transition: 'color 0.2s',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    padding: 0,
  })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(8,9,13,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo — click torna a home */}
      <button
        onClick={() => onNavigate('home')}
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.08em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        FANTAELITE SERIE A
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Link home-only (anchor scroll) */}
        {currentPage === 'home' && (
          <>
            <a href="#documenti" style={linkStyle(false)}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              Documenti
            </a>
            <a href="#classifica" style={linkStyle(false)}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              Classifica
            </a>
            <a href="#supporto" style={linkStyle(false)}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              Supporto
            </a>
          </>
        )}

        {/* Montepremi link — sempre visibile */}
        <button
          onClick={() => onNavigate('montepremi')}
          style={linkStyle(currentPage === 'montepremi')}
          onMouseEnter={e => e.currentTarget.style.color = currentPage === 'montepremi' ? 'var(--gold)' : 'var(--white)'}
          onMouseLeave={e => e.currentTarget.style.color = currentPage === 'montepremi' ? 'var(--gold)' : 'var(--muted)'}
        >
          🏆 Montepremi
        </button>

        {settings?.instagram_url && (
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.875rem' }}>
            <InstagramIcon size={16} />
          </a>
        )}

        {currentPage === 'home' && (
          <a href="#iscrizione" style={{
            padding: '0.5rem 1.25rem',
            background: 'var(--gold)',
            color: 'var(--black)',
            borderRadius: '100px',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Iscriviti
          </a>
        )}
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({ settings }) {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '8rem 2rem 4rem',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* BG effects */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 100% 50% at 50% -10%, rgba(240,180,41,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(240,180,41,0.04) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
      }} />
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(240,180,41,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(240,180,41,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Badge stagione */}
      <div className="fade-up" style={{
        display: 'inline-block',
        padding: '0.375rem 1rem',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        fontSize: '0.75rem',
        letterSpacing: '0.3em',
        color: 'var(--gold)',
        textTransform: 'uppercase',
        marginBottom: '1.5rem',
      }}>
        Stagione {settings?.season || '2025/2026'}
      </div>

      <h1 className="fade-up-1" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(4.5rem, 14vw, 10rem)',
        lineHeight: 0.95,
        letterSpacing: '0.04em',
        marginBottom: '1rem',
      }}>
        <span style={{
          display: 'block',
          background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shimmer 4s linear infinite',
        }}>FANTA ELITE</span>
        <span style={{ display: 'block', color: 'var(--white)' }}>SERIE A</span>
      </h1>

      <p className="fade-up-2" style={{
        maxWidth: '520px',
        fontSize: '1.1rem',
        lineHeight: 1.7,
        color: 'var(--muted)',
        fontWeight: 300,
        marginBottom: '2.5rem',
      }}>
        La fantalega ufficiale più competitiva d'Italia. Premi esclusivi, regolamento professionale, emozioni reali.
      </p>

      <div className="fade-up-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="#iscrizione" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.875rem 2rem',
          background: 'var(--gold)',
          color: 'var(--black)',
          borderRadius: '100px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '0.05em',
          transition: 'transform 0.2s, opacity 0.2s',
          animation: 'float 4s ease-in-out infinite',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
          <TicketIcon size={18} /> Acquista il Ticket
        </a>
        <a href="#documenti" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.875rem 2rem',
          border: '1px solid var(--border)',
          color: 'var(--white)',
          borderRadius: '100px',
          textDecoration: 'none',
          fontWeight: 400,
          fontSize: '1rem',
          letterSpacing: '0.05em',
          transition: 'border-color 0.2s, background 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}>
          Scopri il Regolamento
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="fade-up-4" style={{
        position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        color: 'var(--muted)', fontSize: '0.7rem', letterSpacing: '0.2em',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   SEZIONE DOCUMENTI (PDF)
───────────────────────────────────────────── */
function DocCard({ doc }) {
  const typeLabels = {
    regolamento: { icon: '📋', color: '#4a9eff' },
    montepremi:  { icon: '🏆', color: 'var(--gold)' },
    classifica:  { icon: '📊', color: '#6ee7b7' },
  }
  const meta = typeLabels[doc.type] || { icon: '📄', color: 'var(--white)' }

  return (
    <a
      href={doc.file_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        padding: '1.5rem',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'border-color 0.2s, transform 0.2s, background 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = meta.color
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.background = 'rgba(17,18,32,0.9)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.background = 'var(--card)'
      }}
    >
      <div style={{
        width: 48, height: 48,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}30`,
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', flexShrink: 0,
      }}>
        {meta.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--white)', marginBottom: '0.2rem' }}>
          {doc.label}
        </div>
        {doc.week && (
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Giornata {doc.week}</div>
        )}
        {doc.season && !doc.week && (
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Stagione {doc.season}</div>
        )}
      </div>
      <div style={{ color: meta.color, flexShrink: 0 }}>
        <DownloadIcon size={18} />
      </div>
    </a>
  )
}

function Documenti({ documents }) {
  const regolamento = documents.filter(d => d.type === 'regolamento')
  const montepremi  = documents.filter(d => d.type === 'montepremi')
  const classifiche = documents.filter(d => d.type === 'classifica').sort((a, b) => (b.week || 0) - (a.week || 0))

  return (
    <section id="documenti" style={{ padding: '6rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <SectionLabel>Documenti Ufficiali</SectionLabel>
      <SectionTitle>Tutto quello che<br />devi sapere</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[...regolamento, ...montepremi].map(doc => <DocCard key={doc.id} doc={doc} />)}
      </div>

      {classifiche.length > 0 && (
        <>
          <div id="classifica" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            margin: '3rem 0 1.5rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Classifiche Settimanali
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {classifiche.map(doc => <DocCard key={doc.id} doc={doc} />)}
          </div>
        </>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────────
   SEZIONE INSTAGRAM
───────────────────────────────────────────── */
function InstagramBanner({ settings }) {
  if (!settings?.instagram_url) return null
  return (
    <section style={{ padding: '3rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(240,180,41,0.08) 0%, rgba(17,18,32,0.8) 100%)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <InstagramIcon size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>
              Seguici su Instagram
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              News, aggiornamenti e highlights della lega
            </div>
          </div>
        </div>
        <a
          href={settings.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.75rem 1.75rem',
            background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
            borderRadius: '100px',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Vai al Profilo →
        </a>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   HELPER COMPONENTI
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
function SectionTitle({ children, style = {} }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      lineHeight: 1.05,
      letterSpacing: '0.03em',
      marginBottom: '2.5rem',
      ...style,
    }}>
      {children}
    </h2>
  )
}

/* ─────────────────────────────────────────────
   STRIPE CARD FORM (inner component)
───────────────────────────────────────────── */
function StripeCardForm({ selectedTicket, regId, form, onSuccess, onError, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState('')

  const cardStyle = {
    style: {
      base: {
        color: '#f5f5f0',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '16px',
        '::placeholder': { color: '#8a8a9a' },
        iconColor: '#f0b429',
      },
      invalid: { color: '#ff8080', iconColor: '#ff8080' },
    },
  }

  const handlePay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setCardError('')

    try {
      // 1. Crea il PaymentIntent sul backend
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTicket.price,
          ticketName: selectedTicket.name,
          registrationId: regId,
        }),
      })
      const { clientSecret, error: backendError } = await res.json()
      if (backendError) throw new Error(backendError)

      // 2. Conferma il pagamento con la carta
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
          },
        },
      })

      if (stripeError) throw new Error(stripeError.message)

      // 3. Aggiorna Supabase tramite backend (bypassa RLS)
      const confirmRes = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          registrationId: regId,
          amount: Number(selectedTicket.price),
        }),
      })
      const confirmData = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Errore aggiornamento')
      onSuccess()
    } catch (err) {
      console.error(err)
      setCardError(err.message || 'Errore nel pagamento. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Stai acquistando</div>
        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedTicket?.name}</div>
        <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
          €{Number(selectedTicket?.price).toFixed(2)}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: '#6ee7b7' }}>
        ✓ Registrazione salvata — inserisci i dati della carta
      </div>

      {/* Card Element */}
      <div style={{
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}>
        <CardElement options={cardStyle} />
      </div>

      {cardError && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: '#ff8080', marginBottom: '1rem' }}>
          {cardError}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !stripe}
        style={{
          width: '100%',
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
      >
        {loading
          ? <span style={{ animation: 'pulse 1s infinite' }}>Elaborazione...</span>
          : <>🔒 Paga €{Number(selectedTicket?.price).toFixed(2)}</>
        }
      </button>

      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
        Pagamento sicuro tramite Stripe · I tuoi dati sono protetti
      </div>

      <button
        onClick={onBack}
        style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center' }}
      >
        ← Torna indietro
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FORM ISCRIZIONE
───────────────────────────────────────────── */
function FormIscrizione({ tickets, settings }) {
  const [step, setStep] = useState('form') // 'form' | 'payment' | 'success' | 'error'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', ticketId: '' })
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [regId, setRegId] = useState(null)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTicketSelect = (t) => {
    setSelectedTicket(t)
    setForm(f => ({ ...f, ticketId: t.id }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.ticketId) {
      setErrorMsg('Compila tutti i campi e seleziona un ticket.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      // Controlla se email + ticket già acquistato
      const { data: existing } = await supabase
        .from('registrations')
        .select('id')
        .eq('email', form.email)
        .eq('ticket_id', form.ticketId)
        .eq('payment_status', 'completed')
        .maybeSingle()

      if (existing) {
        setErrorMsg('Questa email ha già acquistato questo ticket. Usa un indirizzo email diverso.')
        setLoading(false)
        return
      }

      const newId = crypto.randomUUID()
      const { error } = await supabase
        .from('registrations')
        .insert({
          id: newId,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          ticket_id: form.ticketId,
          payment_status: 'pending',
        })

      if (error) throw error
      setRegId(newId)
      setStep('payment')
    } catch (err) {
      console.error(err)
      setErrorMsg('Errore durante la registrazione. Riprova.')
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

  return (
    <section id="iscrizione" style={{ padding: '6rem 2rem 8rem', maxWidth: 960, margin: '0 auto' }}>
      <SectionLabel>Partecipa</SectionLabel>
      <SectionTitle>Acquista il tuo<br />Ticket</SectionTitle>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start',
      }}>
        {/* Selezione ticket */}
        <div>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Scegli il ticket
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {tickets.map(t => (
              <button
                key={t.id}
                onClick={() => handleTicketSelect(t)}
                style={{
                  padding: '1.25rem',
                  background: selectedTicket?.id === t.id ? 'rgba(240,180,41,0.1)' : 'var(--card)',
                  border: `2px solid ${selectedTicket?.id === t.id ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  color: 'var(--white)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem' }}>{t.name}</div>
                  {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.description}</div>}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  color: selectedTicket?.id === t.id ? 'var(--gold)' : 'var(--white)',
                  letterSpacing: '0.02em',
                  marginLeft: '1rem',
                  flexShrink: 0,
                }}>
                  €{Number(t.price).toFixed(0)}
                </div>
              </button>
            ))}
          </div>

          <div style={{
            padding: '1.25rem',
            background: 'rgba(240,180,41,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            color: 'var(--muted)',
            lineHeight: 1.7,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 500 }}>
              <TrophyIcon size={16} /> Perché iscriversi?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {['Regolamento professionale Serie A', 'Montepremi reale garantito', 'Classifica aggiornata ogni giornata', 'Supporto e assistenza dedicata'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckIcon size={14} /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card form */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          {step === 'form' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Nome *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Mario" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Cognome *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Rossi" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="mario@email.com" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {errorMsg && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: '#ff8080' }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={loading || !selectedTicket} style={{
                marginTop: '0.5rem', padding: '1rem',
                background: loading || !selectedTicket ? 'rgba(240,180,41,0.3)' : 'var(--gold)',
                color: 'var(--black)', border: 'none', borderRadius: '100px',
                fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em',
                cursor: loading || !selectedTicket ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontFamily: 'var(--font-body)',
              }}>
                {loading
                  ? <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>Salvataggio...</span>
                  : <><TicketIcon size={18} /> Procedi al Pagamento {selectedTicket ? `— €${Number(selectedTicket.price).toFixed(0)}` : ''}</>
                }
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
                🔒 Pagamento sicuro tramite Stripe
              </div>
            </form>
          )}

          {step === 'payment' && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                selectedTicket={selectedTicket}
                regId={regId}
                form={form}
                onSuccess={() => setStep('success')}
                onError={(msg) => { setErrorMsg(msg); setStep('error') }}
                onBack={() => setStep('form')}
              />
            </Elements>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: 72, height: 72, margin: '0 auto 1.5rem',
                background: 'rgba(110,231,183,0.15)',
                border: '2px solid #6ee7b7',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckIcon size={32} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.05em', marginBottom: '0.75rem', color: '#6ee7b7' }}>
                BENVENUTO!
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Iscrizione completata con successo.<br />
                Riceverai una conferma all'indirizzo <strong style={{ color: 'var(--white)' }}>{form.email}</strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                Segui <a href={settings?.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>il nostro Instagram</a> per gli aggiornamenti.
              </p>
            </div>
          )}

          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem', color: '#ff8080' }}>ATTENZIONE</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>{errorMsg}</p>
              <button onClick={() => { setStep('form'); setErrorMsg('') }}
                style={{ padding: '0.75rem 1.5rem', background: 'var(--gold)', color: 'var(--black)', border: 'none', borderRadius: '100px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Riprova
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer({ settings }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2.5rem 2rem',
      textAlign: 'center',
      color: 'var(--muted)',
      fontSize: '0.8rem',
      letterSpacing: '0.05em',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '0.75rem' }}>
        FANTAELITE SERIE A
      </div>
      <div>© {new Date().getFullYear()} FantaElite — Stagione {settings?.season || '2025/2026'}</div>
      {settings?.instagram_url && (
        <div style={{ marginTop: '0.75rem' }}>
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <InstagramIcon size={14} /> Instagram
          </a>
        </div>
      )}
    </footer>
  )
}

/* ─────────────────────────────────────────────
   APP PRINCIPALE
───────────────────────────────────────────── */
export default function App() {
  const [settings, setSettings]   = useState(null)
  const [tickets, setTickets]     = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState('home')   // 'home' | 'montepremi'

  useEffect(() => {
    async function loadData() {
      const [{ data: s }, { data: t }, { data: d }] = await Promise.all([
        supabase.from('settings').select('*').single(),
        supabase.from('tickets').select('*').eq('active', true).order('price'),
        supabase.from('documents').select('*').eq('visible', true).order('uploaded_at', { ascending: false }),
      ])
      setSettings(s)
      setTickets(t || [])
      setDocuments(d || [])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--black)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 2s linear infinite',
          }}>
            FANTAELITE SERIE A
          </div>
        </div>
      </>
    )
  }

  if (!settings?.portal_visible) {
    return (
      <>
        <GlobalStyles />
        <ComingSoon settings={settings} />
      </>
    )
  }

  /* ── pagina montepremi ── */
  if (page === 'montepremi') {
    return (
      <>
        <GlobalStyles />
        <Navbar settings={settings} onNavigate={setPage} currentPage={page} />
        <Montepremi onBack={() => setPage('home')} settings={settings} />
      </>
    )
  }

  /* ── pagina principale ── */
  return (
    <>
      <GlobalStyles />
      <Navbar settings={settings} onNavigate={setPage} currentPage={page} />
      <main>
        <Hero settings={settings} />
        <Documenti documents={documents} />
        <InstagramBanner settings={settings} />
        <FormIscrizione tickets={tickets} settings={settings} />
        <FormSupport settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  )
}
