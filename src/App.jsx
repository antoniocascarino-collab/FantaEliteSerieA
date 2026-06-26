import React, { useEffect, useState } from 'react'
import Montepremi from './Montepremi.jsx'
import FormSupport from './FormSupport.jsx'
import Privacy from './Privacy.jsx'
import Admin from './Admin.jsx'
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

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

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
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }

 .fade-up   { animation: fadeUp 0.7s ease both; }
    .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }

    .navbar-links-desktop { display: flex; }
    .navbar-hamburger { display: none; }

    @media (max-width: 768px) {
      .navbar-links-desktop { display: none !important; }
      .navbar-hamburger { display: flex !important; }
    }
  `}</style>
)

/* ─────────────────────────────────────────────
   ICONE SVG INLINE
───────────────────────────────────────────── */
const TicketIcon  = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
const CheckIcon   = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const FileIcon    = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
const MailIcon    = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
const AlertCircleIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const PhoneIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21 16v.92z"/></svg>

/* ─────────────────────────────────────────────
   COMING SOON
───────────────────────────────────────────── */
function ComingSoon({ settings }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(240,180,41,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, border: '1px solid rgba(240,180,41,0.06)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: 'rotateSlow 40s linear infinite' }} />
      <div className="fade-up" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.4em', color: 'var(--gold)', marginBottom: '1rem', textTransform: 'uppercase' }}>La lega d'Élite</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 1, letterSpacing: '0.05em', background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 2s linear infinite' }}>
          FANTAELITE SERIE A
        </div>
        <div style={{ marginTop: '2rem', fontSize: '1.1rem', color: 'var(--muted)', fontWeight: 300, letterSpacing: '0.05em' }}>Il portale apre presto. Preparati a dominare.</div>
        {settings?.instagram_url && (
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--gold)', textDecoration: 'none', fontSize: '0.875rem', letterSpacing: '0.05em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            <InstagramIcon size={16} /> Seguici su Instagram
          </a>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({ settings, onNavigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkStyle = (active) => ({
    color: active ? 'var(--gold)' : 'var(--muted)',
    textDecoration: 'none', fontSize: '0.875rem', letterSpacing: '0.05em',
    transition: 'color 0.2s', background: 'transparent', border: 'none',
    cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0,
  })

  const mobileLinkStyle = (active) => ({
    color: active ? 'var(--gold)' : 'var(--white)',
    textDecoration: 'none', fontSize: '1.05rem', letterSpacing: '0.03em',
    background: 'transparent', border: 'none', textAlign: 'left',
    cursor: 'pointer', fontFamily: 'var(--font-body)', padding: '0.6rem 0',
    width: '100%', display: 'block',
  })

  const goTo = (page) => { setMobileOpen(false); onNavigate(page); window.scrollTo(0, 0) }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled || mobileOpen ? 'rgba(8,9,13,0.95)' : 'transparent',
        backdropFilter: scrolled || mobileOpen ? 'blur(12px)' : 'none',
        borderBottom: scrolled || mobileOpen ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <button onClick={() => goTo('home')}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 4.5vw, 1.8rem)', letterSpacing: '0.06em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>
          FANTAELITE SERIE A
        </button>

        {/* ── LINK DESKTOP (nascosti sotto 768px via CSS) ── */}
        <div className="navbar-links-desktop" style={{ alignItems: 'center', gap: '2rem' }}>
          {currentPage === 'home' && (
            <>
              <a href="#documenti" style={linkStyle(false)} onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>Documenti</a>
              <a href="#classifica" style={linkStyle(false)} onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>Classifica</a>
            </>
          )}
          <button onClick={() => onNavigate('montepremi')} style={linkStyle(currentPage === 'montepremi')}
            onMouseEnter={e => e.currentTarget.style.color = currentPage === 'montepremi' ? 'var(--gold)' : 'var(--white)'}
            onMouseLeave={e => e.currentTarget.style.color = currentPage === 'montepremi' ? 'var(--gold)' : 'var(--muted)'}>
            🏆 Montepremi
          </button>
          <button onClick={() => { onNavigate('supporto'); window.scrollTo(0, 0) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            Supporto
          </button>
          <button onClick={() => { onNavigate('privacy'); window.scrollTo(0, 0) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            Privacy &amp; Cookie
          </button>
          {settings?.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.875rem' }}>
              <InstagramIcon size={16} />
            </a>
          )}
          {currentPage === 'home' && (
            <a href="#iscrizione" style={{ padding: '0.5rem 1.25rem', background: 'var(--gold)', color: 'var(--black)', borderRadius: '100px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Iscriviti
            </a>
          )}
        </div>

        {/* ── HAMBURGER (visibile solo sotto 768px via CSS) ── */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
          style={{ alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--white)', fontSize: '1.6rem', cursor: 'pointer', padding: '0.25rem', lineHeight: 1, flexShrink: 0 }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── PANNELLO MENU MOBILE ── */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '62px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(8,9,13,0.98)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0.5rem 1.5rem 1.5rem',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 62px)', overflowY: 'auto',
        }}>
          {currentPage === 'home' && (
            <>
              <a href="#documenti" onClick={() => setMobileOpen(false)} style={mobileLinkStyle(false)}>Documenti</a>
              <a href="#classifica" onClick={() => setMobileOpen(false)} style={mobileLinkStyle(false)}>Classifica</a>
            </>
          )}
          <button onClick={() => goTo('montepremi')} style={mobileLinkStyle(currentPage === 'montepremi')}>🏆 Montepremi</button>
          <button onClick={() => goTo('supporto')} style={mobileLinkStyle(currentPage === 'supporto')}>💬 Supporto</button>
          <button onClick={() => goTo('privacy')} style={mobileLinkStyle(currentPage === 'privacy')}>Privacy &amp; Cookie</button>
          {settings?.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}
              style={{ ...mobileLinkStyle(false), display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)' }}>
              <InstagramIcon size={18} /> Instagram
            </a>
          )}
          {currentPage === 'home' && (
            <a href="#iscrizione" onClick={() => setMobileOpen(false)}
              style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'var(--gold)', color: 'var(--black)', borderRadius: '100px', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center' }}>
              Iscriviti
            </a>
          )}
        </div>
      )}
    </>
  )
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({ settings }) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 100% 50% at 50% -10%, rgba(240,180,41,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(240,180,41,0.04) 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(240,180,41,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(240,180,41,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      <div className="fade-up" style={{ display: 'inline-block', padding: '0.375rem 1rem', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        Stagione {settings?.season || '2025/2026'}
      </div>
      <h1 className="fade-up-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4.5rem, 14vw, 10rem)', lineHeight: 0.95, letterSpacing: '0.04em', marginBottom: '1rem' }}>
        <span style={{ display: 'block', background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>FANTA ELITE</span>
        <span style={{ display: 'block', color: 'var(--white)' }}>SERIE A</span>
      </h1>
      <p className="fade-up-2" style={{ maxWidth: '520px', fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--muted)', fontWeight: 300, marginBottom: '2.5rem' }}>
        La fantalega ufficiale più competitiva d'Italia.
        Conosci ogni giocatore. Domina ogni giornata.
      </p>
      <div className="fade-up-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="#iscrizione" style={{ padding: '0.875rem 2rem', background: 'var(--gold)', color: 'var(--black)', borderRadius: '100px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(0)' }}>
          Acquista il Ticket →
        </a>
        <a href="#documenti" style={{ padding: '0.875rem 2rem', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '100px', textDecoration: 'none', fontSize: '1rem', letterSpacing: '0.05em', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.08)'; e.currentTarget.style.borderColor = 'var(--gold)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}>
          Leggi il Regolamento
        </a>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   DOCUMENTI
───────────────────────────────────────────── */
const DownloadIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

function DocCard({ doc }) {
  const typeLabels = {
    regolamento: { icon: '📋', color: '#4a9eff' },
    montepremi:  { icon: '🏆', color: 'var(--gold)' },
    classifica:  { icon: '📊', color: '#6ee7b7' },
  }
  const meta = typeLabels[doc.type] || { icon: '📄', color: 'var(--white)' }
  return (
    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', transition: 'border-color 0.2s, transform 0.2s, background 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(17,18,32,0.9)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--card)' }}>
      <div style={{ width: 48, height: 48, background: `${meta.color}18`, border: `1px solid ${meta.color}30`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{meta.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--white)', marginBottom: '0.2rem' }}>{doc.label}</div>
        {doc.week && <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Giornata {doc.week}</div>}
        {doc.season && !doc.week && <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Stagione {doc.season}</div>}
      </div>
      <div style={{ color: meta.color, flexShrink: 0 }}><DownloadIcon size={18} /></div>
    </a>
  )
}

function Documenti({ documents }) {
  if (!documents?.length) return null
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
          <div id="classifica" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '3rem 0 1.5rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Classifiche Settimanali</span>
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
   INSTAGRAM BANNER
───────────────────────────────────────────── */
function InstagramBanner({ settings }) {
  if (!settings?.instagram_url) return null
  return (
    <section style={{ padding: '0 2rem 5rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', padding: '1.75rem 2rem', background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <InstagramIcon size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>Seguici su Instagram</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>News, aggiornamenti e highlights della lega</div>
          </div>
        </div>
        <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
          style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)', borderRadius: '100px', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Vai al Profilo →
        </a>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PENDING PAYMENT FORM (PayPal / Bonifico)
───────────────────────────────────────────── */
function PendingPaymentForm({ method, selectedTicket, regId, form, onSuccess, onError, onBack }) {
  const [loading, setLoading] = useState(false)
  const isPaypal = method === 'paypal'

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pending-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regId,
          ticketId: selectedTicket.id,
          paymentMethod: method,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          leagueEmail: form.leagueEmail,
          phone: form.phone,
          privacyAcceptedAt: form.privacyAcceptedAt,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore')
      onSuccess(method)
    } catch (err) {
      console.error(err)
      onError(err.message || 'Errore nell\'invio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
          {isPaypal ? '🅿️ Pagamento PayPal' : '🏦 Pagamento Bonifico'}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          {isPaypal
            ? 'Riceverai via email le istruzioni per completare il pagamento PayPal. La tua iscrizione verrà confermata dopo la verifica del pagamento.'
            : 'Riceverai via email le coordinate bancarie. La tua iscrizione verrà confermata dopo la ricezione del bonifico (1-2 giorni lavorativi).'}
        </div>
      </div>
      <div style={{ padding: '1rem', background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '10px', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>Importo da pagare</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', lineHeight: 1 }}>€{Number(selectedTicket.price).toFixed(0)}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{selectedTicket.name}</div>
      </div>
      <button onClick={handleConfirm} disabled={loading}
        style={{ width: '100%', padding: '1rem', background: loading ? 'rgba(240,180,41,0.3)' : 'var(--gold)', color: 'var(--black)', border: 'none', borderRadius: '100px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {loading ? <span>Invio in corso...</span> : <>{isPaypal ? '🅿️' : '🏦'} Conferma e ricevi istruzioni</>}
      </button>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center', marginTop: '0.25rem' }}>
        ← Scegli un altro metodo
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SELEZIONE METODO DI PAGAMENTO
───────────────────────────────────────────── */
function PaymentMethodSelector({ selectedTicket, regId, form, onSuccess, onError, onBack }) {
  const [method, setMethod] = useState(null)

  const methods = [
    { id: 'stripe',   icon: '💳', label: 'Carta di credito / debito', sub: 'Pagamento immediato e sicuro via Stripe',      color: '#635bff' },
    { id: 'paypal',   icon: '🅿️', label: 'PayPal',                    sub: 'Riceverai le istruzioni via email',             color: '#0070ba' },
    { id: 'bonifico', icon: '🏦', label: 'Bonifico Bancario',          sub: 'Riceverai le coordinate bancarie via email',   color: '#28a745' },
  ]

  if (method === 'stripe') {
    return (
      <Elements stripe={stripePromise}>
        <StripeCardForm selectedTicket={selectedTicket} regId={regId} form={form} onSuccess={onSuccess} onError={onError} onBack={() => setMethod(null)} />
      </Elements>
    )
  }

  if (method === 'paypal' || method === 'bonifico') {
    return (
      <PendingPaymentForm method={method} selectedTicket={selectedTicket} regId={regId} form={form} onSuccess={onSuccess} onError={onError} onBack={() => setMethod(null)} />
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Scegli il metodo di pagamento</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Ticket: {selectedTicket.name} · €{Number(selectedTicket.price).toFixed(0)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {methods.map(m => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${m.color}66`; e.currentTarget.style.background = `${m.color}11` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--white)' }}>{m.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{m.sub}</div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>›</span>
          </button>
        ))}
      </div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center' }}>
        ← Torna indietro
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   STRIPE CARD FORM
───────────────────────────────────────────── */
function StripeCardForm({ selectedTicket, regId, form, onSuccess, onError, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState('')

  const cardStyle = {
    style: {
      base: { color: '#f5f5f0', fontFamily: "'Outfit', sans-serif", fontSize: '16px', '::placeholder': { color: '#8a8a9a' }, iconColor: '#f0b429' },
      invalid: { color: '#ff8080', iconColor: '#ff8080' },
    },
  }

  const handlePay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setCardError('')
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, ticketId: selectedTicket.id }),
      })
      const { clientSecret, error: backendError } = await res.json()
      if (backendError) throw new Error(backendError)

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement), billing_details: { name: `${form.firstName} ${form.lastName}`, email: form.email } },
      })
      if (stripeError) throw new Error(stripeError.message)

      const confirmRes = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          registrationId: regId,
          ticketId: selectedTicket.id,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          leagueEmail: form.leagueEmail,
          phone: form.phone,
          privacyAcceptedAt: form.privacyAcceptedAt,
        }),
      })
      const confirmData = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Errore aggiornamento')
      onSuccess('stripe')
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
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>💳 Pagamento con carta</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Importo: €{Number(selectedTicket.price).toFixed(0)} · {selectedTicket.name}</div>
      </div>
      <div style={{ padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
        <CardElement options={cardStyle} />
      </div>
      {cardError && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: '#ff8080', marginBottom: '1rem' }}>{cardError}</div>
      )}
      <button onClick={handlePay} disabled={loading || !stripe}
        style={{ width: '100%', padding: '1rem', background: loading ? 'rgba(240,180,41,0.3)' : 'var(--gold)', color: 'var(--black)', border: 'none', borderRadius: '100px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {loading ? <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>Elaborazione...</span> : <>🔒 Paga €{Number(selectedTicket.price).toFixed(0)}</>}
      </button>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center', marginTop: '0.25rem' }}>
        ← Scegli un altro metodo
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FORM ISCRIZIONE
───────────────────────────────────────────── */
function FormIscrizione({ tickets, settings, onNavigate }) {
  const [step, setStep] = useState('form') // 'form' | 'payment' | 'success' | 'error'
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    leagueEmail: '',
    phone: '',
    ticketId: '',
    privacyAccepted: false,
    privacyAcceptedAt: null,
  })
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [regId, setRegId] = useState(null)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleTicketSelect = (t) => { setSelectedTicket(t); setForm(f => ({ ...f, ticketId: t.id })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.leagueEmail || !form.phone || !form.ticketId) {
      setErrorMsg('Compila tutti i campi e seleziona un ticket.')
      return
    }
   // Validazione telefono: almeno 8 cifre
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 8) {
      setErrorMsg('Inserisci un numero di cellulare valido.')
      return
    }
    if (!form.privacyAccepted) {
      setErrorMsg("Devi accettare l'informativa privacy per procedere.")
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: existing } = await supabase
  .rpc('check_existing_registration', { p_email: form.email, p_ticket_id: form.ticketId })
      if (existing) {
        setErrorMsg('Questa email ha già acquistato questo ticket. Usa un indirizzo email diverso.')
        setLoading(false)
        return
      }
     // Nessun INSERT qui: la registrazione viene creata dal backend solo
      // quando il pagamento Stripe va a buon fine, oppure quando viene
      // scelto PayPal/Bonifico. Generiamo solo l'id da passare al backend.
     setForm(f => ({ ...f, privacyAcceptedAt: new Date().toISOString() }))
      setRegId(crypto.randomUUID())
      setStep('payment')
    } catch (err) {
      console.error(err)
      setErrorMsg('Errore durante la registrazione. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'var(--white)', fontSize: '1rem',
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-body)',
  }

  return (
    <section id="iscrizione" style={{ padding: '6rem 2rem 8rem', maxWidth: 960, margin: '0 auto' }}>
      <SectionLabel>Partecipa</SectionLabel>
      <SectionTitle>Acquista il tuo<br />Ticket</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Selezione ticket */}
        <div>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Scegli il ticket</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {tickets.map(t => (
              <button key={t.id} onClick={() => handleTicketSelect(t)}
                style={{ padding: '1.25rem', background: selectedTicket?.id === t.id ? 'rgba(240,180,41,0.1)' : 'var(--card)', border: `2px solid ${selectedTicket?.id === t.id ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { if (selectedTicket?.id !== t.id) { e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)'; e.currentTarget.style.background = 'rgba(240,180,41,0.05)' } }}
                onMouseLeave={e => { if (selectedTicket?.id !== t.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'var(--card)' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)' }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', lineHeight: 1 }}>€{Number(t.price).toFixed(0)}</div>
                </div>
                {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{t.description}</div>}
                {t.max_participants && <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '0.5rem', opacity: 0.7 }}>Max {t.max_participants} partecipanti</div>}
              </button>
            ))}
          </div>

          {/* Info box */}
          <div style={{ padding: '1.25rem', background: 'rgba(240,180,41,0.05)', border: '1px solid rgba(240,180,41,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>✓ COSA INCLUDE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {['Regolamento professionale Serie A', 'Montepremi reale garantito', 'Classifica aggiornata ogni giornata', 'Supporto e assistenza dedicata'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <CheckIcon size={14} /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>

          {step === 'form' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Banner residenti Italia */}
              <div style={{ padding: '0.875rem 1rem', background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: '8px', fontSize: '0.8rem', color: '#8ab4f8', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertCircleIcon size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#9cc5ff' }}>Partecipazione riservata ai residenti in Italia</strong>
                  I premi sono assegnabili esclusivamente a partecipanti residenti sul territorio italiano.
                </div>
              </div>

              {/* Nome / Cognome */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Nome *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Mario" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Cognome *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Rossi" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              {/* Email contatto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Email di contatto *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="mario@esempio.it" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Email LegheFC */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Email account LegheFC *</label>
                <input name="leagueEmail" type="email" value={form.leagueEmail} onChange={handleChange} placeholder="mario@leghefc.it" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>L'invito alla lega verrà inviato a questo indirizzo</div>
              </div>

              {/* ── NUOVO: Cellulare ── */}
              <div><label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PhoneIcon size={13} /> Cellulare *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+39 333 1234567"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>Usato solo per comunicazioni urgenti legate alla lega</div>
              </div>

              {errorMsg && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: '#ff8080' }}>{errorMsg}</div>
              )}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={e => setForm(f => ({ ...f, privacyAccepted: e.target.checked }))}
                  style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
                />
                <span>
                  Ho letto e accetto l'
                  <a href="#" onClick={e => { e.preventDefault(); onNavigate && onNavigate('privacy') }} style={{ color: 'var(--gold)' }}>
                    informativa privacy
                  </a>
                  {' '}*
                </span>
              </label>

              <button type="submit" disabled={loading || !selectedTicket}
                style={{ marginTop: '0.5rem', padding: '1rem', background: loading || !selectedTicket ? 'rgba(240,180,41,0.3)' : 'var(--gold)', color: 'var(--black)', border: 'none', borderRadius: '100px', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', cursor: loading || !selectedTicket ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)' }}>
                {loading ? <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>Salvataggio...</span> : <><TicketIcon size={18} /> Procedi al Pagamento {selectedTicket ? `— €${Number(selectedTicket.price).toFixed(0)}` : ''}</>}
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>🔒 Pagamento sicuro · Stripe, PayPal o Bonifico</div>
            </form>
          )}

          {step === 'payment' && (
            <PaymentMethodSelector
              selectedTicket={selectedTicket}
              regId={regId}
              form={form}
              onSuccess={(method) => { setPaymentMethod(method); setStep('success') }}
              onError={(msg) => { setErrorMsg(msg); setStep('error') }}
              onBack={() => setStep('form')}
            />
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: 72, height: 72, margin: '0 auto 1.5rem', background: 'rgba(110,231,183,0.15)', border: '2px solid #6ee7b7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckIcon size={32} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.05em', marginBottom: '0.75rem', color: '#6ee7b7' }}>
                {paymentMethod && paymentMethod !== 'stripe' ? 'REGISTRATO!' : 'BENVENUTO!'}
              </h3>
              {paymentMethod === 'stripe' && (
                <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Iscrizione completata con successo.<br />
                  Riceverai una conferma all'indirizzo <strong style={{ color: 'var(--white)' }}>{form.email}</strong><br />
                  L'invito alla lega LegheFC sarà inviato a <strong style={{ color: 'var(--white)' }}>{form.leagueEmail}</strong>
                </p>
              )}
              {paymentMethod === 'paypal' && (
                <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Iscrizione salvata! Controlla <strong style={{ color: 'var(--white)' }}>{form.email}</strong><br />
                  per le istruzioni PayPal.<br />
                  <span style={{ fontSize: '0.875rem' }}>La conferma arriverà entro 24-48 ore dal pagamento.</span>
                </p>
              )}
              {paymentMethod === 'bonifico' && (
                <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Iscrizione salvata! Controlla <strong style={{ color: 'var(--white)' }}>{form.email}</strong><br />
                  per le coordinate bancarie.<br />
                  <span style={{ fontSize: '0.875rem' }}>La conferma arriverà entro 24-48 ore dal bonifico.</span>
                </p>
              )}
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
   HELPER COMPONENTI
───────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '0.72rem', letterSpacing: '0.35em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ width: 24, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
      {children}
    </div>
  )
}
function SectionTitle({ children, style = {} }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '0.03em', marginBottom: '2.5rem', ...style }}>
      {children}
    </h2>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer({ settings, onNavigate }) {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2.5rem 2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '0.75rem' }}>FANTAELITE SERIE A</div>
      <div>© {new Date().getFullYear()} FantaElite — Stagione {settings?.season || '2025/2026'}</div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => onNavigate('montepremi')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          Montepremi
        </button>
        <button onClick={() => { onNavigate('supporto'); window.scrollTo(0, 0) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          Supporto
        </button>
        {settings?.instagram_url && (
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <InstagramIcon size={14} /> Instagram
          </a>
        )}
        {settings?.contact_email && (
          <a href={`mailto:${settings.contact_email}`}
            style={{ color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <MailIcon size={14} /> Email
          </a>
        )}
      </div>
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
  const [page, setPage]           = useState(() => (typeof window !== 'undefined' && window.location.pathname === '/admin') ? 'admin' : 'home')

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

  // La pagina admin è indipendente dal caricamento dati pubblici e dal
  // "coming soon": deve restare sempre accessibile a chi ha le credenziali.
  if (page === 'admin') {
    return (
      <>
        <GlobalStyles />
        <Admin />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.15em', background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 2s linear infinite' }}>
            FANTAELITE SERIE A
          </div>
        </div>
      </>
    )
  }

  if (!settings?.portal_visible) {
    return (<><GlobalStyles /><ComingSoon settings={settings} /></>)
  }

  if (page === 'montepremi') {
    return (<><GlobalStyles /><Navbar settings={settings} onNavigate={setPage} currentPage={page} /><Montepremi onBack={() => setPage('home')} settings={settings} /></>)
  }

if (page === 'supporto') {
    return (<><GlobalStyles /><Navbar settings={settings} onNavigate={setPage} currentPage={page} /><FormSupport onBack={() => setPage('home')} settings={settings} onNavigate={setPage} /><Footer settings={settings} onNavigate={setPage} /></>)
  }

  if (page === 'privacy') {
    return (<><GlobalStyles /><Navbar settings={settings} onNavigate={setPage} currentPage={page} /><Privacy onBack={() => setPage('home')} /><Footer settings={settings} onNavigate={setPage} /></>)
  }

  return (
    <>
      <GlobalStyles />
      <Navbar settings={settings} onNavigate={setPage} currentPage={page} />
      <main>
        <Hero settings={settings} />
        <Documenti documents={documents} />
        <InstagramBanner settings={settings} />
        <FormIscrizione tickets={tickets} settings={settings} onNavigate={setPage} />
      </main>
      <Footer settings={settings} onNavigate={setPage} />
    </>
  )
}
