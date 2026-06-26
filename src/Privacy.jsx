import React, { useEffect } from 'react'

/* ─────────────────────────────────────────────
   TESTI — modifica liberamente qui, senza
   toccare il resto del file. Righe vuote separano
   i paragrafi. Le righe che iniziano con "## "
   diventano titoli, quelle con "- " diventano elenchi.
───────────────────────────────────────────── */
const PRIVACY_TEXT = `
## 1. Titolare del trattamento

Il Titolare del trattamento dei dati personali raccolti tramite questo sito è:

Gennaro De Silvestri, in qualità di organizzatore della fantalega FantaElite Serie A

Contatto: fantaeliteseriea@gmail.com

Per qualsiasi domanda relativa al trattamento dei tuoi dati personali, o per esercitare i diritti descritti al punto 9, puoi scrivere all'indirizzo email sopra indicato.

## 2. Dati raccolti

Attraverso il sito raccogliamo le seguenti categorie di dati personali, forniti direttamente da te al momento dell'iscrizione o del contatto:

- Dati identificativi: nome, cognome
- Dati di contatto: indirizzo email, indirizzo email per l'invito alla piattaforma LegheFC, numero di cellulare
- Dati relativi al pagamento: metodo di pagamento scelto, importo pagato, identificativo della transazione. Per i pagamenti con carta, i dati della carta di credito/debito sono gestiti esclusivamente da Stripe e non transitano né vengono conservati sui nostri sistemi
- Dati relativi alla richiesta di supporto: nome, email, eventuale email LegheFC da rettificare, contenuto del messaggio, se utilizzi il modulo di assistenza

Non raccogliamo, né richiediamo, categorie particolari di dati personali, come dati relativi alla salute, opinioni politiche o origine etnica.

## 3. Finalità del trattamento e base giuridica

Trattiamo i tuoi dati personali per le seguenti finalità, sulla base dell'esecuzione del contratto di partecipazione alla fantalega (art. 6.1.b GDPR) e, dove indicato, di un obbligo legale (art. 6.1.c GDPR):

- Gestire la tua iscrizione alla fantalega e l'erogazione del servizio, incluso l'invito alla piattaforma LegheFC
- Elaborare il pagamento della quota di iscrizione
- Gestire l'assegnazione dei premi previsti dal regolamento
- Rispondere alle richieste di supporto e assistenza
- Adempiere a obblighi di legge, inclusi quelli contabili e fiscali ove applicabili

Non utilizziamo i tuoi dati per finalità di marketing diretto, profilazione o invio di comunicazioni promozionali.

## 4. Conferimento dei dati

Il conferimento dei dati indicati come obbligatori nel modulo di iscrizione è necessario per poter completare la registrazione e partecipare alla fantalega. Il mancato conferimento comporta l'impossibilità di completare l'iscrizione.

## 5. Modalità del trattamento

Il trattamento è effettuato con strumenti informatici e telematici, con modalità organizzative e logiche strettamente correlate alle finalità indicate, in modo da garantire la sicurezza e la riservatezza dei dati. Adottiamo misure tecniche e organizzative adeguate, tra cui connessioni cifrate HTTPS, accesso ai dati limitato e protetto, separazione tra chiavi di accesso pubbliche e chiavi con privilegi elevati utilizzate solo lato server.

## 6. Destinatari dei dati

I tuoi dati possono essere comunicati, nei limiti strettamente necessari, ai seguenti soggetti che agiscono in qualità di responsabili del trattamento o fornitori di servizi:

- Stripe Payments Europe, Ltd. — per l'elaborazione dei pagamenti con carta di credito/debito. Stripe riceve e tratta direttamente i dati della carta; noi riceviamo solo la conferma dell'esito del pagamento e l'importo
- Google LLC (Gmail) — utilizzato per l'invio delle email transazionali, come conferma iscrizione, istruzioni di pagamento e risposte al supporto
- Supabase Inc. — fornitore dell'infrastruttura di database che ospita i dati raccolti
- LegheFC — la piattaforma su cui si gioca la fantalega. Il tuo indirizzo email LegheFC viene comunicato a questa piattaforma esclusivamente per inviarti l'invito alla lega

Per i pagamenti effettuati tramite PayPal o bonifico bancario, non condividiamo i tuoi dati con PayPal o con la banca: sei tu stesso a effettuare il trasferimento utilizzando le coordinate che ti forniamo.

I tuoi dati non vengono in alcun caso venduti, ceduti o comunicati a terzi per finalità di marketing.

## 7. Trasferimento dati extra-UE

Alcuni dei fornitori indicati al punto 6, in particolare Google e Stripe, possono trattare i dati anche tramite infrastrutture situate fuori dall'Unione Europea, in particolare negli Stati Uniti. In tali casi, il trasferimento avviene sulla base di garanzie adeguate previste dalla normativa, come clausole contrattuali standard approvate dalla Commissione Europea, secondo quanto indicato nelle rispettive privacy policy dei fornitori.

## 8. Periodo di conservazione

Conserviamo i tuoi dati per il tempo necessario a gestire la tua partecipazione per l'intera stagione sportiva di riferimento, ad adempiere a eventuali obblighi di legge inclusi quelli fiscali e contabili, fino a 10 anni per i documenti relativi a transazioni economiche ove applicabile, e a gestire eventuali contestazioni relative ai premi assegnati. Trascorsi tali termini, i dati vengono cancellati o anonimizzati, salvo che la loro conservazione non sia richiesta da specifici obblighi normativi.

## 9. I tuoi diritti

In qualità di interessato, hai il diritto di:

- Accedere ai tuoi dati personali e ottenere informazioni sul trattamento
- Rettificare dati inesatti o incompleti
- Ottenere la cancellazione dei tuoi dati, nei limiti previsti dalla legge
- Ottenere la limitazione del trattamento in determinati casi
- Ottenere i tuoi dati in formato strutturato, dove tecnicamente applicabile
- Opporti al trattamento basato sul legittimo interesse
- Revocare un eventuale consenso in qualsiasi momento, senza pregiudicare la liceità del trattamento basato sul consenso prestato prima della revoca

Puoi esercitare questi diritti scrivendo a fantaeliteseriea@gmail.com, oppure utilizzando il modulo di supporto presente sul sito.

Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali, www.garanteprivacy.it, qualora ritenga che il trattamento dei tuoi dati violi la normativa vigente.

## 10. Modifiche alla presente informativa

Questa informativa può essere aggiornata nel tempo, anche in conseguenza di modifiche normative o dei servizi utilizzati. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
`

const COOKIE_TEXT = `
## Cosa sono i cookie

I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell'utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva.

## Cookie utilizzati da questo sito

Questo sito utilizza esclusivamente cookie tecnici, strettamente necessari al funzionamento del sito e all'erogazione del servizio richiesto. Questi cookie non richiedono il tuo consenso preventivo, secondo quanto previsto dall'art. 122 del Codice Privacy e dalle Linee Guida del Garante in materia di cookie.

In particolare, durante il pagamento con carta vengono impostati i cookie di Stripe (__stripe_mid, __stripe_sid), con finalità di prevenzione delle frodi, della durata di una sessione o massimo un anno.

Il sito non utilizza cookie di profilazione, cookie di analisi statistica come Google Analytics, né cookie di marketing o pubblicitari di terze parti.

I font utilizzati per la grafica del sito sono caricati direttamente dal nostro server, e non da servizi esterni: la visita al sito non comporta quindi l'invio di dati di navigazione a fornitori terzi di font.

## Come gestire i cookie

Anche per i cookie tecnici, puoi in ogni momento gestire le tue preferenze direttamente dalle impostazioni del tuo browser, che ti permettono di eliminare i cookie già installati e bloccarne l'installazione futura. Disabilitare i cookie tecnici potrebbe impedire il corretto funzionamento del processo di pagamento.

## Aggiornamenti

Se in futuro il sito dovesse introdurre strumenti di analisi statistica, marketing o tracciamento di terze parti, questa Cookie Policy sarà aggiornata e verrà introdotto un apposito banner di consenso preventivo, come richiesto dalla normativa.
`

/* ─────────────────────────────────────────────
   RENDER TESTO SEMPLICE → JSX
───────────────────────────────────────────── */
function PolicyBlock({ text }) {
  const blocks = text.trim().split(/\n\n+/)
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.03em', color: 'var(--gold)', marginTop: '2.5rem', marginBottom: '1rem' }}>
              {trimmed.replace('## ', '')}
            </h3>
          )
        }
        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').map(l => l.replace(/^- /, '').trim())
          return (
            <ul key={i} style={{ margin: '0 0 1.25rem', paddingLeft: '1.25rem', color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {items.map((it, j) => <li key={j} style={{ marginBottom: '0.4rem' }}>{it}</li>)}
            </ul>
          )
        }
        return (
          <p key={i} style={{ margin: '0 0 1.25rem', color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
            {trimmed}
          </p>
        )
      })}
    </>
  )
}

/* ─────────────────────────────────────────────
   PAGINA PRIVACY
───────────────────────────────────────────── */
export default function Privacy({ onBack }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '5rem' }}>

      {/* ── BACK BUTTON ── */}
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

      {/* ── HEADER ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 2rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.35em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Informativa
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1, letterSpacing: '0.04em', color: 'var(--white)' }}>
          PRIVACY &amp; COOKIE
        </h1>
      </div>

      {/* ── CONTENUTO ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem 2rem 6rem' }}>
        <PolicyBlock text={PRIVACY_TEXT} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '3rem 0 1.5rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cookie Policy</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <PolicyBlock text={COOKIE_TEXT} />
      </div>
    </div>
  )
}
