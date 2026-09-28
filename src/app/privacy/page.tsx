import type { Metadata } from 'next';
import Link from 'next/link';
import { ELLY_COLORS } from '@/lib/travelData';

export const metadata: Metadata = {
  title: 'Informativa sulla Privacy — Elly',
  description: 'Come Elly raccoglie, utilizza e protegge i tuoi dati personali.',
};

const C = ELLY_COLORS;
const LAST_UPDATED = 'Settembre 2026';
const VERSION = 'Bozza 0.1';
const CONTROLLER_EMAIL = '[la tua email di contatto]';
const CONTROLLER_NAME = '[Nome o ragione sociale del titolare]';

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '"DM Sans", sans-serif' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/viaggio" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          ← Elly
        </Link>
        <span style={{ color: C.border, fontSize: '14px' }}>/</span>
        <span style={{ color: C.text, fontSize: '14px' }}>Privacy</span>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 120px' }}>
        {/* Banner bozza */}
        <div style={{
          background: C.accentSoft2, border: `1.3px solid ${C.accent}`, borderRadius: '14px',
          padding: '16px 18px', marginBottom: '36px', fontSize: '13.5px', lineHeight: 1.6, color: C.text,
        }}>
          <strong>⚠️ Questa è una bozza, non ancora valida.</strong> È riscritta sui dati che Elly tratta davvero (prima era basata su My Mood), ma contiene ancora dei placeholder da completare — nome del titolare, email di contatto — e non ha ricevuto una revisione legale. Non pubblicarla come informativa definitiva finché non l&apos;hai fatta controllare da un professionista.
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>
          Informativa sulla Privacy
        </h1>
        <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '6px' }}>
          {VERSION} — Ultimo aggiornamento: {LAST_UPDATED}
        </p>
        <p style={{ color: C.textMuted, fontSize: '13px', marginBottom: '44px' }}>
          Ai sensi degli artt. 13–14 del Regolamento (UE) 2016/679 (GDPR)
        </p>

        <Section title="1. Chi siamo — Il Titolare del Trattamento">
          <P>
            <strong>Elly</strong> è un servizio che genera itinerari di viaggio personalizzati in base a destinazione,
            durata e mood scelti dall&apos;utente, validati con dati reali sui luoghi, e condivisibili con un gruppo
            per decidere insieme. Il titolare del trattamento dei tuoi dati personali è{' '}
            <strong>{CONTROLLER_NAME}</strong>. Per qualsiasi richiesta relativa alla privacy scrivi a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: C.accent }}>{CONTROLLER_EMAIL}</a>.
          </P>
        </Section>

        <Section title="2. Dati che Raccogliamo — Per Funzionalità">
          <P>Raccogliamo solo i dati necessari a offrirti il servizio. Ecco cosa raccogliamo per ciascuna funzionalità:</P>
          <FeatureTable
            rows={[
              {
                feature: 'Registrazione e account',
                data: 'Email, password (hashed) — oppure account Google se accedi con Google',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: 'Fino alla cancellazione dell’account',
              },
              {
                feature: 'Creazione di un itinerario',
                data: 'Destinazione, date, numero di persone, temi/mood scelti, budget indicativo',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: 'Fino alla cancellazione del viaggio da parte dell’utente',
              },
              {
                feature: 'Generazione con intelligenza artificiale',
                data: 'Destinazione, temi e i messaggi scritti in chat per modificare l’itinerario vengono inviati ad Anthropic (Claude) per generare il testo dell’itinerario',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: 'Secondo la politica di conservazione di Anthropic per le richieste API',
              },
              {
                feature: 'Validazione dei luoghi',
                data: 'Nomi dei luoghi proposti e destinazione, inviati a Google (Places API) per verificare indirizzi reali, foto e valutazioni',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: 'I luoghi validati restano in una cache interna per velocizzare le prossime ricerche',
              },
              {
                feature: 'Condivisione e voto di gruppo',
                data: 'L’itinerario condiviso è visibile tramite link pubblico; chi vota inserisce solo un nome (nessun account richiesto) e la risposta scelta',
                basis: 'Esecuzione del contratto (art. 6.1.b) + legittimo interesse (art. 6.1.f)',
                retention: 'Finché il viaggio condiviso non viene eliminato',
              },
              {
                feature: '"I miei viaggi" — cronologia',
                data: 'I viaggi generati mentre sei loggato restano associati al tuo account',
                basis: 'Esecuzione del contratto (art. 6.1.b)',
                retention: 'Fino alla cancellazione manuale o dell’account',
              },
              {
                feature: 'Log tecnici e sicurezza',
                data: 'Indirizzo IP, browser, timestamp delle richieste',
                basis: 'Legittimo interesse (art. 6.1.f)',
                retention: '90 giorni',
              },
            ]}
          />
        </Section>

        <Section title="3. Cookie e Tecnologie Simili">
          <P>
            Elly utilizza esclusivamente tecnologie tecniche essenziali: la sessione di accesso viene mantenuta tramite
            il local storage del browser (gestito da Supabase, il nostro fornitore di autenticazione), non tramite
            cookie di tracciamento. Non utilizziamo cookie pubblicitari o di profilazione di terze parti.
          </P>
        </Section>

        <Section title="4. Chi Riceve i Tuoi Dati">
          <P>I tuoi dati non vengono venduti a terzi. Vengono trattati dai fornitori tecnici che rendono possibile il servizio:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li><strong>Supabase</strong> (database e autenticazione) — responsabile del trattamento ai sensi dell&apos;art. 28 GDPR.</li>
            <li><strong>Anthropic</strong> (generazione dell&apos;itinerario tramite il modello Claude) — riceve i dati del viaggio necessari a scrivere l&apos;itinerario.</li>
            <li><strong>Google</strong> (Places API, Maps, e Google Sign-In se scegli di accedere con Google) — riceve i nomi dei luoghi e la destinazione per validarli, e i dati dell&apos;account Google se usato per l&apos;accesso.</li>
            <li><strong>Vercel</strong> (hosting dell&apos;applicazione).</li>
            <li><strong>Autorità giudiziarie o amministrative</strong> — quando richiesto dalla legge vigente.</li>
          </ul>
        </Section>

        <Section title="5. Trasferimenti Internazionali dei Dati">
          <P>
            Alcuni fornitori tecnici (Supabase, Anthropic, Google, Vercel) elaborano i dati anche al di fuori dello
            Spazio Economico Europeo (SEE). Questi trasferimenti sono coperti da Clausole Contrattuali Standard (SCC)
            o da meccanismi di adeguatezza riconosciuti dalla Commissione Europea. L&apos;elenco aggiornato dei
            sub-responsabili è disponibile su richiesta a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: C.accent }}>{CONTROLLER_EMAIL}</a>.
          </P>
        </Section>

        <Section title="6. I Tuoi Diritti (GDPR, artt. 15–22)">
          <P>In qualità di interessato hai il diritto di:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li><strong>Accesso (art. 15)</strong> — sapere quali dati conserviamo su di te e ottenerne una copia.</li>
            <li><strong>Rettifica (art. 16)</strong> — correggere dati inesatti o incompleti.</li>
            <li><strong>Cancellazione (art. 17)</strong> — eliminare i tuoi dati, salvo obblighi di legge.</li>
            <li><strong>Portabilità (art. 20)</strong> — ricevere i tuoi dati in formato strutturato e leggibile.</li>
            <li><strong>Opposizione (art. 21)</strong> — opporti al trattamento basato su legittimo interesse.</li>
            <li><strong>Limitazione (art. 18)</strong> — richiedere la limitazione del trattamento.</li>
            <li><strong>Revoca del consenso</strong> — in qualsiasi momento.</li>
          </ul>
          <P>
            Invia la tua richiesta a <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: C.accent }}>{CONTROLLER_EMAIL}</a>.
            Risponderemo entro <strong>30 giorni</strong>. Hai inoltre il diritto di proporre reclamo al{' '}
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
              Garante per la Protezione dei Dati Personali
            </a>.
          </P>
        </Section>

        <Section title="7. Come Proteggiamo i Tuoi Dati">
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li>Cifratura dei dati in transito (TLS) e a riposo, tramite i nostri fornitori tecnici.</li>
            <li>Password conservate esclusivamente in formato hashed, gestite da Supabase Auth.</li>
            <li>Accesso ai dati limitato al personale autorizzato.</li>
          </ul>
          <P>
            In caso di violazione dei dati personali che possa comportare un rischio elevato per i tuoi diritti, ti
            notificheremo senza ingiustificato ritardo, ai sensi dell&apos;art. 34 GDPR.
          </P>
        </Section>

        <Section title="8. Minori">
          <P>
            Elly è rivolto a persone di età pari o superiore a <strong>16 anni</strong>. Non raccogliamo
            consapevolmente dati di minori di 16 anni senza consenso parentale. Se ritieni che un minore abbia
            fornito dati senza il consenso del genitore o tutore, contattaci a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: C.accent }}>{CONTROLLER_EMAIL}</a>.
          </P>
        </Section>

        <Section title="9. Modifiche a questa Informativa">
          <P>
            Ci riserviamo il diritto di aggiornare questa informativa per riflettere modifiche normative, tecnologiche
            o operative. Gli aggiornamenti saranno pubblicati in questa pagina con la data di revisione.
          </P>
        </Section>

        <Section title="10. Contatti">
          <P>
            Per domande, richieste o reclami relativi alla privacy:{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: C.accent }}>{CONTROLLER_EMAIL}</a>
          </P>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '38px' }}>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 600, marginBottom: '14px', color: C.text }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: C.textMuted, lineHeight: '1.75', marginBottom: '14px', fontSize: '15px' }}>{children}</p>;
}

type FeatureRow = { feature: string; data: string; basis: string; retention: string };

function FeatureTable({ rows }: { rows: FeatureRow[] }) {
  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted,
    borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px', color: C.textMuted, verticalAlign: 'top', lineHeight: '1.6',
    fontSize: '13px', borderBottom: `1px solid ${C.border}`,
  };
  const tdFeatureStyle: React.CSSProperties = { ...tdStyle, color: C.text, fontWeight: 600 };

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
