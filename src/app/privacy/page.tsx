import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Informativa sulla Privacy — my mood',
  description: 'Come my mood raccoglie, utilizza e protegge i tuoi dati personali. GDPR-compliant.',
};

const LAST_UPDATED = 'Aprile 2026';
const VERSION = '2.0';
const CONTROLLER_EMAIL = 'privacy@mymood.app';

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        color: '#F5F5F0',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Link
          href="/"
          style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}
        >
          ← my mood
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Privacy</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 6vw, 40px)',
            fontWeight: 700,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Informativa sulla Privacy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '8px' }}>
          Versione {VERSION} — Ultimo aggiornamento: {LAST_UPDATED}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '48px' }}>
          Ai sensi degli artt. 13–14 del Regolamento (UE) 2016/679 (GDPR)
        </p>

        {/* ── 1. TITOLARE ── */}
        <Section title="1. Chi siamo — Il Titolare del Trattamento">
          <P>
            <strong>my mood</strong> è un servizio digitale che ti aiuta a pianificare serate a
            Milano in base al tuo mood e a incontrare nuove persone con interessi simili. Il
            titolare del trattamento dei tuoi dati personali è <strong>my mood</strong>. Per
            qualsiasi richiesta relativa alla privacy scrivici a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
            .
          </P>
        </Section>

        {/* ── 2. DATI RACCOLTI ── */}
        <Section title="2. Dati che Raccogliamo — Per Funzionalità">
          <P>
            Raccogliamo solo i dati strettamente necessari a offrirti il servizio. Ecco cosa
            raccogliamo per ciascuna funzionalità:
          </P>

          <FeatureTable
            rows={[
              {
                feature: 'Registrazione e account',
                data: 'Email, nickname, password (hashed), data di nascita',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: '5 anni dopo la cancellazione',
              },
              {
                feature: 'Piani serata e filtro quartiere',
                data: 'Mood, compagnia, budget, quartiere selezionato',
                basis: 'Esecuzione del contratto (art. 6.1.b) + legittimo interesse (art. 6.1.f)',
                retention: '24 mesi (aggregati: illimitato)',
              },
              {
                feature: 'Voto di Gruppo',
                data: 'ID Piano, voto espresso (anonimo), timestamp',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: '30 giorni dalla scadenza del link',
              },
              {
                feature: 'Matching Sociale (Premium)',
                data: 'Mood, interessi, fascia d\'età preferita, disponibilità, foto profilo (opzionale)',
                basis: 'Esecuzione del contratto (art. 6.1.b) + consenso (art. 6.1.a)',
                retention: '12 mesi dall\'ultimo utilizzo',
              },
              {
                feature: 'Feedback Post-Serata',
                data: 'Rating (1–5), commento testuale (opzionale), Piano associato',
                basis: 'Legittimo interesse (art. 6.1.f) + consenso per condivisione con Partner (art. 6.1.a)',
                retention: '36 mesi',
              },
              {
                feature: 'Notifiche push (PWA)',
                data: 'Token dispositivo, preferenze di notifica',
                basis: 'Consenso esplicito (art. 6.1.a)',
                retention: 'Fino alla revoca del consenso',
              },
              {
                feature: 'Log tecnici e sicurezza',
                data: 'Indirizzo IP, browser, pagine visitate, timestamp',
                basis: 'Legittimo interesse (art. 6.1.f)',
                retention: '90 giorni',
              },
              {
                feature: 'Piano Premium — pagamenti',
                data: 'Dati fatturazione (tokenizzati dal provider di pagamento)',
                basis: 'Esecuzione del contratto + obbligo legale (art. 6.1.b/c)',
                retention: '10 anni (normativa fiscale)',
              },
              {
                feature: 'Newsletter e marketing',
                data: 'Email, preferenze di comunicazione',
                basis: 'Consenso esplicito (art. 6.1.a)',
                retention: 'Fino alla revoca del consenso',
              },
            ]}
          />
        </Section>

        {/* ── 3. COOKIE ── */}
        <Section title="3. Cookie e Tecnologie di Tracciamento">
          <P>
            <strong>Cookie tecnici essenziali</strong> — Necessari al funzionamento della
            Piattaforma (sessione di login, preferenze UI). Non richiedono consenso ai sensi
            dell'art. 122 del D.Lgs. 196/2003.
          </P>
          <P>
            <strong>Cookie analitici</strong> — Se attivi, utilizziamo strumenti privacy-first
            (nessun tracciamento cross-site, nessun fingerprinting) per raccogliere statistiche
            aggregate. Richiediamo il tuo consenso tramite banner dedicato.
          </P>
          <P>
            <strong>Cookie di marketing</strong> — my mood non utilizza cookie pubblicitari di
            terze parti. In caso di futura introduzione, il banner cookie verrà aggiornato e il
            consenso preventivo richiesto.
          </P>
          <P>
            Puoi gestire le preferenze cookie in qualsiasi momento tramite le impostazioni del
            browser o il pannello cookie presente nella Piattaforma.
          </P>
        </Section>

        {/* ── 4. DESTINATARI ── */}
        <Section title="4. Chi Riceve i Tuoi Dati">
          <P>
            I tuoi dati non vengono venduti a terzi. Possono essere comunicati a:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              <strong>Supabase</strong> (database e autenticazione) — responsabile del trattamento
              ai sensi dell'art. 28 GDPR, con trasferimento extra-UE coperto da Clausole
              Contrattuali Standard (SCC).
            </li>
            <li>
              <strong>Vercel</strong> (hosting e CDN) — responsabile del trattamento, con
              trasferimento extra-UE coperto da SCC e EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Stripe</strong> (pagamenti) — per la gestione degli abbonamenti Premium.
              Stripe non riceve i dati completi della carta, bensì token sicuri (PCI-DSS Level 1).
            </li>
            <li>
              <strong>Partner della Piattaforma</strong> — ricevono esclusivamente feedback
              anonimi/aggregati, o il tuo nome solo se hai autorizzato esplicitamente una
              prenotazione.
            </li>
            <li>
              <strong>Autorità giudiziarie o amministrative</strong> — quando richiesto dalla
              legge vigente.
            </li>
          </ul>
        </Section>

        {/* ── 5. TRASFERIMENTI EXTRA-UE ── */}
        <Section title="5. Trasferimenti Internazionali dei Dati">
          <P>
            Alcuni dei nostri fornitori tecnici (Vercel, Supabase/AWS) elaborano i dati in paesi
            al di fuori dello Spazio Economico Europeo (SEE). Garantiamo che tali trasferimenti
            avvengano con adeguate garanzie:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Clausole Contrattuali Standard (SCC) — Decisione UE 2021/914.</li>
            <li>Meccanismi di adeguatezza riconosciuti dalla Commissione Europea (es. EU-US Data Privacy Framework).</li>
          </ul>
          <P>
            L'elenco aggiornato dei sub-responsabili del trattamento è disponibile su richiesta
            a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
            .
          </P>
        </Section>

        {/* ── 6. DIRITTI ── */}
        <Section title="6. I Tuoi Diritti (GDPR, artt. 15–22)">
          <P>In qualità di interessato hai il diritto di:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              <strong>Accesso (art. 15)</strong> — Sapere quali dati conserviamo su di te e
              ottenerne una copia.
            </li>
            <li>
              <strong>Rettifica (art. 16)</strong> — Correggere dati inesatti o incompleti.
            </li>
            <li>
              <strong>Cancellazione (art. 17)</strong> — Eliminare i tuoi dati («diritto
              all'oblio»), salvo obblighi di legge.
            </li>
            <li>
              <strong>Portabilità (art. 20)</strong> — Ricevere i tuoi dati in formato
              strutturato e leggibile da macchina.
            </li>
            <li>
              <strong>Opposizione (art. 21)</strong> — Opporti al trattamento basato su legittimo
              interesse o per marketing diretto.
            </li>
            <li>
              <strong>Limitazione (art. 18)</strong> — Richiedere la limitazione del trattamento
              in determinate circostanze.
            </li>
            <li>
              <strong>Revoca del consenso</strong> — In qualsiasi momento, senza pregiudizio per
              la liceità del trattamento precedente.
            </li>
          </ul>
          <P>
            Invia la tua richiesta a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
            . Risponderemo entro <strong>30 giorni</strong> (proroga di 60 giorni in caso di
            complessità). Hai inoltre il diritto di proporre reclamo al{' '}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#F5C842' }}
            >
              Garante per la Protezione dei Dati Personali
            </a>
            .
          </P>
        </Section>

        {/* ── 7. SICUREZZA ── */}
        <Section title="7. Come Proteggiamo i Tuoi Dati">
          <P>Adottiamo misure tecniche e organizzative adeguate al rischio:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Cifratura dei dati in transito (TLS 1.2+) e a riposo.</li>
            <li>Password conservate esclusivamente in formato hashed (bcrypt/argon2).</li>
            <li>Accesso ai dati limitato al personale autorizzato, con autenticazione a due fattori (2FA) per gli accessi amministrativi.</li>
            <li>Backup periodici con cifratura.</li>
            <li>Monitoraggio continuo per la rilevazione di accessi anomali.</li>
          </ul>
          <P>
            In caso di violazione dei dati personali (data breach) che possa comportare un rischio
            elevato per i tuoi diritti, ti notificheremo senza ingiustificato ritardo, ai sensi
            dell'art. 34 GDPR.
          </P>
        </Section>

        {/* ── 8. MINORI ── */}
        <Section title="8. Minori">
          <P>
            my mood è rivolto a persone di età pari o superiore a <strong>16 anni</strong>, in
            conformità all'art. 8 GDPR e all'art. 2-quinquies del Codice Privacy italiano. Non
            raccogliamo consapevolmente dati di minori di 16 anni senza consenso parentale.
          </P>
          <P>
            Se ritieni che un minore abbia fornito dati senza il consenso del genitore o tutore,
            contattaci immediatamente a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
            : provvederemo alla cancellazione dei dati.
          </P>
        </Section>

        {/* ── 9. MATCHING SOCIALE ── */}
        <Section title="9. Una nota sul Matching Sociale">
          <P>
            Il Matching Sociale elabora dati relativi a mood e interessi per abbinare Utenti
            compatibili. Questo trattamento è soggetto a una{' '}
            <strong>Valutazione d'Impatto sulla Protezione dei Dati (DPIA)</strong> ai sensi
            dell'art. 35 GDPR, data la natura sistematica del trattamento.
          </P>
          <P>
            Il Matching Sociale <strong>non</strong> elabora categorie particolari di dati
            (art. 9 GDPR) come orientamento sessuale, origine etnica o condizioni di salute.
            La foto profilo è facoltativa e non viene utilizzata come criterio di abbinamento.
          </P>
          <P>
            Puoi disattivare il Matching Sociale in qualsiasi momento dalle impostazioni del
            profilo. I tuoi dati di matching vengono eliminati entro 30 giorni dalla
            disattivazione.
          </P>
        </Section>

        {/* ── 10. MODIFICHE ── */}
        <Section title="10. Modifiche a questa Informativa">
          <P>
            Ci riserviamo il diritto di aggiornare questa informativa per riflettere modifiche
            normative, tecnologiche o operative. Gli aggiornamenti saranno pubblicati nella
            Piattaforma con la data di revisione. Per modifiche sostanziali, ti avviseremo
            tramite email con almeno 15 giorni di preavviso.
          </P>
        </Section>

        {/* ── 11. CONTATTI ── */}
        <Section title="11. Contatti">
          <P>
            Per domande, richieste o reclami relativi alla privacy:{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
          </P>
          <P>
            Hai il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali:{' '}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#F5C842' }}
            >
              garanteprivacy.it
            </a>
          </P>
        </Section>
      </div>
    </main>
  );
}

/* ─── Helper components ─────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F5F5F0' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: 'rgba(255,255,255,0.7)',
        lineHeight: '1.75',
        marginBottom: '14px',
        fontSize: '15px',
      }}
    >
      {children}
    </p>
  );
}

type FeatureRow = {
  feature: string;
  data: string;
  basis: string;
  retention: string;
};

function FeatureTable({ rows }: { rows: FeatureRow[] }) {
  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px',
    color: 'rgba(255,255,255,0.65)',
    verticalAlign: 'top',
    lineHeight: '1.6',
    fontSize: '13px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };
  const tdFeatureStyle: React.CSSProperties = {
    ...tdStyle,
    color: '#F5F5F0',
    fontWeight: 600,
    fontSize: '13px',
  };

  return (
    <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Funzionalità</th>
            <th style={thStyle}>Dati raccolti</th>
            <th style={thStyle}>Base GDPR</th>
            <th style={thStyle}>Conservazione</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <td style={tdFeatureStyle}>{row.feature}</td>
              <td style={tdStyle}>{row.data}</td>
              <td style={tdStyle}>{row.basis}</td>
              <td style={tdStyle}>{row.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
