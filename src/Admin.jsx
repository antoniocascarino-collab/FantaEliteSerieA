import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const STATUS_LABELS = {
  pending: 'In attesa',
  completed: 'Completato',
  cancelled: 'Annullato',
}
const STATUS_COLORS = {
  pending: '#f0b429',
  completed: '#6ee7b7',
  cancelled: '#8a8a9a',
}
const SUPPORT_STATUS_LABELS = {
  pending: 'Da gestire',
  in_progress: 'In lavorazione',
  resolved: 'Risolto',
}
const SUPPORT_STATUS_COLORS = {
  pending: '#ff8080',
  in_progress: '#f0b429',
  resolved: '#6ee7b7',
}
const PAYMENT_METHOD_LABELS = {
  stripe: '💳 Carta',
  paypal: '🅿️ PayPal',
  bonifico: '🏦 Bonifico',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatEuro(n) {
  if (n === null || n === undefined) return '—'
  return `€${Number(n).toFixed(2)}`
}

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Credenziali non valide.')
      setLoading(false)
    }
    // Se il login va a buon fine, onAuthStateChange nel componente Admin
    // si occupa di aggiornare la sessione e mostrare la dashboard.
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em', color: 'var(--gold)', textAlign: 'center', marginBottom: '0.5rem' }}>
          FANTAELITE
        </div>
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Area Admin
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
            style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '1rem', outline: 'none', fontFamily: 'var(--font-body)' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '1rem', outline: 'none', fontFamily: 'var(--font-body)' }}
          />
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#ff8080', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.875rem', background: loading ? 'rgba(240,180,41,0.3)' : 'var(--gold)', color: 'var(--black)', border: 'none', borderRadius: '100px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CARD STATISTICA
───────────────────────────────────────────── */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem 1.5rem', flex: '1 1 200px', minWidth: 180 }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: color || 'var(--white)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>{sub}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('ticket') // 'ticket' | 'registrazioni' | 'inviti' | 'supporto'
  const [tickets, setTickets] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [rewards, setRewards] = useState([])
  const [supportRequests, setSupportRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ticketFilter, setTicketFilter] = useState('all')
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    const [
      { data: tix, error: tixError },
      { data: regs, error: regError },
      { data: rew, error: rewError },
      { data: support, error: supportError },
    ] = await Promise.all([
      supabase.from('tickets').select('*').order('price'),
      supabase.from('registrations').select('*, tickets(name, price, max_participants)').order('created_at', { ascending: false }),
      supabase.from('invite_rewards').select(`
        *,
        owner:registrations!invite_rewards_owner_registration_id_fkey(first_name,last_name,email,invite_code),
        redeemed:registrations!invite_rewards_redeemed_registration_id_fkey(first_name,last_name,email)
      `).order('created_at', { ascending: false }),
      supabase.from('support_requests').select('*').order('created_at', { ascending: false }),
    ])
    if (tixError) setErrorMsg('Errore nel caricamento dei ticket: ' + tixError.message)
    else if (regError) setErrorMsg('Errore nel caricamento delle registrazioni: ' + regError.message)
    else if (rewError) setErrorMsg('Errore nel caricamento dei rimborsi invito: ' + rewError.message)
    else if (supportError) setErrorMsg('Errore nel caricamento delle richieste di supporto: ' + supportError.message)
    else setErrorMsg('')
    setTickets(tix || [])
    setRegistrations(regs || [])
    setRewards(rew || [])
    setSupportRequests(support || [])
    setLoading(false)
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  const updateRegistrationStatus = async (reg, newStatus) => {
    setSavingId(reg.id)

    if (newStatus === 'completed' && reg.payment_status !== 'completed') {
      // Passa dal nuovo endpoint sicuro: assegna il codice invito, accredita
      // l'eventuale rimborso all'invitante e invia la mail di benvenuto.
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        const res = await fetch('/api/admin-confirm-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ registrationId: reg.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Errore durante la conferma')
        await loadData()
      } catch (err) {
        setErrorMsg('Errore durante la conferma: ' + err.message)
      }
      setSavingId(null)
      return
    }

    // Altri cambi di stato (pending / cancelled) restano diretti
    const { error } = await supabase.from('registrations').update({ payment_status: newStatus }).eq('id', reg.id)
    if (error) {
      setErrorMsg('Errore durante il salvataggio: ' + error.message)
    } else {
      await loadData()
    }
    setSavingId(null)
  }

  const updatePayoutStatus = async (reward, newStatus) => {
    setSavingId(reward.id)
    const patch = { payout_status: newStatus }
    if (newStatus === 'paid') patch.paid_at = new Date().toISOString()
    else patch.paid_at = null
    const { error } = await supabase.from('invite_rewards').update(patch).eq('id', reward.id)
    if (error) {
      setErrorMsg('Errore durante il salvataggio: ' + error.message)
    } else {
      await loadData()
    }
    setSavingId(null)
  }

  const updateSupportStatus = async (req, newStatus) => {
    setSavingId(req.id)
    const { error } = await supabase.from('support_requests').update({ status: newStatus }).eq('id', req.id)
    if (error) {
      setErrorMsg('Errore durante il salvataggio: ' + error.message)
    } else {
      await loadData()
    }
    setSavingId(null)
  }

  // ── Statistiche ──
  const totaleIscritti = registrations.length
  const completati = registrations.filter(r => r.payment_status === 'completed')
  const pendingRows = registrations.filter(r => r.payment_status === 'pending')
  const montepremiRaccolto = completati.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0)
  const totalePending = pendingRows.length
  const sommaPending = pendingRows.reduce((sum, r) => sum + Number(r.tickets?.price || 0), 0)
  const supportDaGestire = supportRequests.filter(r => r.status === 'pending').length
  const rimborsiDaPagare = rewards.filter(r => r.payout_status === 'pending').reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const rimborsiPagati = rewards.filter(r => r.payout_status === 'paid').reduce((sum, r) => sum + Number(r.amount || 0), 0)

  // ── Statistiche per ticket ──
  const perTicketStats = tickets.map(t => {
    const regsForTicket = registrations.filter(r => r.ticket_id === t.id)
    const completedForTicket = regsForTicket.filter(r => r.payment_status === 'completed')
    const pendingForTicket = regsForTicket.filter(r => r.payment_status === 'pending')
    const cancelledForTicket = regsForTicket.filter(r => r.payment_status === 'cancelled')
    const incasso = completedForTicket.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0)
    const activeCount = regsForTicket.length - cancelledForTicket.length // pending + completed contano posto
    const remaining = t.max_participants ? Math.max(0, t.max_participants - activeCount) : null
    return {
      ticket: t,
      totale: regsForTicket.length,
      paganti: completedForTicket.length,
      inAttesa: pendingForTicket.length,
      annullati: cancelledForTicket.length,
      incasso,
      remaining,
    }
  })

  // ── Filtri tabella registrazioni ──
  const filteredRegs = registrations.filter(r => {
    if (statusFilter !== 'all' && r.payment_status !== statusFilter) return false
    if (ticketFilter !== 'all' && r.ticket_id !== ticketFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const haystack = `${r.first_name} ${r.last_name} ${r.email} ${r.league_email}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

 const selectStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', color: 'var(--white)', fontSize: '0.8rem', padding: '0.35rem 0.5rem',
    fontFamily: 'var(--font-body)', cursor: 'pointer', colorScheme: 'dark',
  }
  const optionStyle = { background: '#111220', color: '#f5f5f0' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.06em', color: 'var(--gold)' }}>FANTAELITE — ADMIN</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {lastUpdate ? `Aggiornato alle ${lastUpdate.toLocaleTimeString('it-IT')} · aggiornamento automatico ogni 30s` : 'Caricamento...'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadData} style={{ padding: '0.6rem 1.1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--white)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              ↻ Aggiorna
            </button>
            <button onClick={onLogout} style={{ padding: '0.6rem 1.1rem', background: 'none', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              Esci
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '10px', color: '#ff8080', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Statistiche */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <StatCard label="Totale Iscritti" value={totaleIscritti} sub="tutte le registrazioni" />
          <StatCard label="Paganti" value={completati.length} sub="pagamenti completati" color="#6ee7b7" />
          <StatCard label="Montepremi Raccolto" value={formatEuro(montepremiRaccolto)} sub="somma pagamenti completati" color="var(--gold)" />
          <StatCard label="In Attesa" value={totalePending} sub={`stimati ${formatEuro(sommaPending)} se confermati`} color="#f0b429" />
          <StatCard label="Rimborsi da pagare" value={formatEuro(rimborsiDaPagare)} sub={`${rewards.filter(r => r.payout_status === 'pending').length} rimborsi in sospeso`} color="#ff8080" />
          <StatCard label="Rimborsi pagati" value={formatEuro(rimborsiPagati)} sub="totale già erogato" color="#6ee7b7" />
          {supportDaGestire > 0 && (
            <StatCard label="Supporto da gestire" value={supportDaGestire} sub="richieste in attesa" color="#ff8080" />
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('ticket')}
            style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: tab === 'ticket' ? '2px solid var(--gold)' : '2px solid transparent', color: tab === 'ticket' ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            Per Ticket ({tickets.length})
          </button>
          <button onClick={() => setTab('registrazioni')}
            style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: tab === 'registrazioni' ? '2px solid var(--gold)' : '2px solid transparent', color: tab === 'registrazioni' ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            Registrazioni ({registrations.length})
          </button>
          <button onClick={() => setTab('inviti')}
            style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: tab === 'inviti' ? '2px solid var(--gold)' : '2px solid transparent', color: tab === 'inviti' ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            Rimborsi Invito ({rewards.length})
          </button>
          <button onClick={() => setTab('supporto')}
            style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: tab === 'supporto' ? '2px solid var(--gold)' : '2px solid transparent', color: tab === 'supporto' ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            Supporto ({supportRequests.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Caricamento dati...</div>
        ) : tab === 'ticket' ? (
          /* Riepilogo per ticket */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {perTicketStats.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '12px' }}>Nessun ticket configurato.</div>
            ) : perTicketStats.map(s => (
              <div key={s.ticket.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {s.ticket.name}
                      {!s.ticket.active && <span style={{ fontSize: '0.7rem', color: '#ff8080', border: '1px solid #ff8080', borderRadius: '100px', padding: '0.1rem 0.6rem' }}>disattivato</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                      {Number(s.ticket.price) === 0 ? 'Gratuito' : formatEuro(s.ticket.price)}
                      {s.ticket.max_participants ? ` · Massimo ${s.ticket.max_participants} partecipanti` : ' · Nessun limite di partecipanti'}
                    </div>
                  </div>
                  {s.ticket.max_participants && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: s.remaining === 0 ? '#ff8080' : 'var(--gold)', lineHeight: 1 }}>
                        {s.remaining === 0 ? 'ESAURITO' : `${s.remaining} posti liberi`}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <StatCard label="Iscritti totali" value={s.totale} />
                  <StatCard label="Paganti" value={s.paganti} color="#6ee7b7" />
                  <StatCard label="In attesa" value={s.inAttesa} color="#f0b429" />
                  <StatCard label="Annullati" value={s.annullati} color="var(--muted)" />
                  <StatCard label="Incasso" value={formatEuro(s.incasso)} color="var(--gold)" />
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'registrazioni' ? (
          <>
            {/* Filtri */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: '1 1 240px', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)' }}
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="completed">Completati</option>
                <option value="cancelled">Annullati</option>
              </select>
              <select value={ticketFilter} onChange={e => setTicketFilter(e.target.value)} style={selectStyle}>
                <option value="all">Tutti i ticket</option>
                {tickets.map(t => (
                  <option key={t.id} value={t.id} style={optionStyle}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Tabella registrazioni */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Data', 'Nome', 'Email', 'Email LegheFC', 'Telefono', 'Ticket', 'Metodo', 'Importo', 'Invito', 'Stato', ''].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Nessuna registrazione trovata.</td></tr>
                  ) : filteredRegs.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{r.first_name} {r.last_name}</td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--white)' }}>{r.email}</td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)' }}>{r.league_email}</td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.phone || '—'}</td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{r.tickets?.name || '—'}</td>
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>{PAYMENT_METHOD_LABELS[r.payment_method] || r.payment_method || '—'}</td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                        {r.paid_amount ? formatEuro(r.paid_amount) : (r.tickets?.price ? `(${formatEuro(r.tickets.price)})` : '—')}
                        {Number(r.discount_amount) > 0 && <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>-{formatEuro(r.discount_amount)} invito</div>}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {r.invite_code && <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace' }}>{r.invite_code}</div>}
                        {r.referral_code_used && <div style={{ color: '#6ee7b7' }}>da: {r.referral_code_used}</div>}
                        {!r.invite_code && !r.referral_code_used && '—'}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ color: STATUS_COLORS[r.payment_status] || 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {STATUS_LABELS[r.payment_status] || r.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                       <select
                          value={r.payment_status}
                          disabled={savingId === r.id}
                          onChange={e => updateRegistrationStatus(r, e.target.value)}
                          style={selectStyle}
                        >
                          <option value="pending" style={optionStyle}>In attesa</option>
                          <option value="completed" style={optionStyle}>Completato</option>
                          <option value="cancelled" style={optionStyle}>Annullato</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : tab === 'inviti' ? (
          /* Tabella rimborsi invito */
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Data', 'Codice', 'Proprietario', 'Iscritto invitato', 'Importo', 'Stato', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rewards.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Nessun rimborso maturato finora.</td></tr>
                ) : rewards.map(rw => (
                  <tr key={rw.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(rw.created_at)}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>{rw.code}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--white)' }}>
                      {rw.owner ? `${rw.owner.first_name} ${rw.owner.last_name}` : '—'}
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{rw.owner?.email}</div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--white)' }}>
                      {rw.redeemed ? `${rw.redeemed.first_name} ${rw.redeemed.last_name}` : '—'}
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{rw.redeemed?.email}</div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--gold)', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatEuro(rw.amount)}</td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ color: rw.payout_status === 'paid' ? '#6ee7b7' : '#f0b429', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {rw.payout_status === 'paid' ? 'Pagato' : 'Da pagare'}
                      </span>
                      {rw.paid_at && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{formatDate(rw.paid_at)}</div>}
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                     <select
                        value={rw.payout_status}
                        disabled={savingId === rw.id}
                        onChange={e => updatePayoutStatus(rw, e.target.value)}
                        style={selectStyle}
                      >
                        <option value="pending" style={optionStyle}>Da pagare</option>
                        <option value="paid" style={optionStyle}>Pagato</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tabella supporto */
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Data', 'Tipo', 'Nome', 'Email', 'Email LegheFC', 'Messaggio', 'Stato', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supportRequests.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Nessuna richiesta di supporto.</td></tr>
                ) : supportRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(req.created_at)}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{req.type}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{req.name}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--white)' }}>{req.email}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)' }}>{req.league_email || '—'}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--muted)', maxWidth: 280, whiteSpace: 'normal' }}>{req.message}</td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ color: SUPPORT_STATUS_COLORS[req.status] || 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {SUPPORT_STATUS_LABELS[req.status] || req.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                     <select
                        value={req.status}
                        disabled={savingId === req.id}
                        onChange={e => updateSupportStatus(req, e.target.value)}
                        style={selectStyle}
                      >
                        <option value="pending" style={optionStyle}>Da gestire</option>
                        <option value="in_progress" style={optionStyle}>In lavorazione</option>
                        <option value="resolved" style={optionStyle}>Risolto</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ENTRY POINT — gestisce la sessione
───────────────────────────────────────────── */
export default function Admin() {
  const [session, setSession] = useState(undefined) // undefined = ancora da verificare

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Verifica sessione...
      </div>
    )
  }

  return session ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin />
}
