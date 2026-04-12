import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Informativa sulla Privacy — my mood',
  description: 'Come my mood raccoglie, utilizza e protegge i tuoi dati personali.',
};

const LAST_UPDATED = '12 aprile 2025';
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
          style={{
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          ← my mood
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>
          /
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Privacy
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
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
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '48px' }}>
          Ultimo aggiornamento: {LAST_UPDATED}
        </p>

        <Section title="1. Chi siamo">
          <P>
            <strong>my mood</strong> è un servizio digitale che ti aiuta a pianificare serate a
            Milano in base al tuo mood. Il titolare del trattamento dei dati personali è{' '}
            <strong>my mood</strong> (di seguito &quot;noi&quot;, &quot;il Titolare&quot;). Per
            qualsiasi richiesta relativa ai tuoi dati puoi scrivere a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
            .
          </P>
        </Section>

        <Section title="2. Dati che raccogliamo">
          <P>
            <strong>Oggi (versione attuale):</strong> my mood non richiede registrazione. Non
            raccogliamo dati anagrafici, email o informazioni personali identificabili. Le
            preferenze di mood, budget e attività che selezioni restano esclusivamente sul tuo
            dispositivo e non vengono trasmesse a server.
          </P>
          <P>
            <strong>In futuro (funzionalità in arrivo):</strong> con l&apos;introduzione dei
            profili utente e delle funzioni sociali potremo raccogliere:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Indirizzo email e nome scelto dall&apos;utente per la creazione del profilo</li>
            <li>Preferenze di mood e attività salvate volontariamente</li>
            <li>Piani serata generati e condivisi con altri utenti</li>
            <li>
              Dati di utilizzo anonimi (pagine visitate, interazioni) tramite strumenti di
              analisi aggregati
            </li>
          </ul>
          <P>
            Questa informativa verrà aggiornata prima dell&apos;introduzione di ciascuna nuova
            funzionalità.
          </P>
        </Section>

        <Section title="3. Perché trattiamo i tuoi dati (finalità e base giuridica)">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <Th>Finalità</Th>
                <Th>Base giuridica (GDPR)</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td>Fornire il servizio di pianificazione serata</Td>
                <Td>Esecuzione del contratto (art. 6.1.b)</Td>
              </Tr>
              <Tr>
                <Td>Gestione del profilo utente (future)</Td>
                <Td>Esecuzione del contratto (art. 6.1.b)</Td>
              </Tr>
              <Tr>
                <Td>Analisi anonima dell&apos;utilizzo per migliorare il servizio</Td>
                <Td>Legittimo interesse (art. 6.1.f)</Td>
              </Tr>
              <Tr>
                <Td>Comunicazioni di marketing (future, opt-in)</Td>
                <Td>Consenso (art. 6.1.a)</Td>
              </Tr>
              <Tr>
                <Td>Adempimento obblighi legali</Td>
                <Td>Obbligo legale (art. 6.1.c)</Td>
              </Tr>
            </tbody>
          </table>
        </Section>

        <Section title="4. Cookie e tecnologie di tracciamento">
          <P>
            Il sito utilizza esclusivamente cookie tecnici essenziali al funzionamento del
            servizio (es. session storage per mantenere le tue selezioni durante la navigazione).
            Non utilizziamo cookie di profilazione o di terze parti a scopo pubblicitario.
          </P>
          <P>
            Prima di introdurre eventuali cookie analitici, ti chiederemo il consenso esplicito
            tramite banner dedicato.
          </P>
        </Section>

        <Section title="5. Conservazione dei dati">
          <P>
            I dati tecnici minimi necessari al funzionamento del servizio sono conservati per il
            tempo strettamente necessario. Qualora in futuro raccogliessimo dati di profilo,
            saranno conservati per tutta la durata del rapporto contrattuale e per un massimo di
            24 mesi dopo la cancellazione dell&apos;account, salvo obblighi legali di
            conservazione più lunghi.
          </P>
        </Section>

        <Section title="6. Condivisione dei dati con terze parti">
          <P>
            Non vendiamo, affittiamo o cediamo i tuoi dati personali a terze parti per scopi di
            marketing. I dati possono essere trattati da fornitori tecnici selezionati
            (sub-responsabili), tra cui:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              <strong>Supabase</strong> (database e autenticazione) — sede in USA, trasferimento
              dati coperto da Standard Contractual Clauses
            </li>
            <li>
              <strong>Vercel</strong> (hosting e CDN) — sede in USA, trasferimento dati coperto
              da Standard Contractual Clauses
            </li>
          </ul>
        </Section>

        <Section title="7. I tuoi diritti (GDPR, artt. 15–22)">
          <P>In qualità di interessato hai il diritto di:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              <strong>Accesso</strong> — sapere quali dati conserviamo su di te
            </li>
            <li>
              <strong>Rettifica</strong> — correggere dati inesatti o incompleti
            </li>
            <li>
              <strong>Cancellazione</strong> (&quot;diritto all&apos;oblio&quot;) — eliminare i
              tuoi dati
            </li>
            <li>
              <strong>Portabilità</strong> — ricevere i tuoi dati in formato strutturato
            </li>
            <li>
              <strong>Opposizione</strong> — opporti al trattamento basato su legittimo interesse
            </li>
            <li>
              <strong>Limitazione</strong> — richiedere la limitazione del trattamento
            </li>
            <li>
              <strong>Revoca del consenso</strong> — in qualsiasi momento, senza pregiudizio per
              la liceità del trattamento precedente
            </li>
          </ul>
          <P>
            Per esercitare i tuoi diritti scrivi a{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
            </a>
            . Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati
            Personali (
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#F5C842' }}
            >
              garanteprivacy.it
            </a>
            ).
          </P>
        </Section>

        <Section title="8. Sicurezza dei dati">
          <P>
            Adottiamo misure tecniche e organizzative adeguate per proteggere i dati da accessi
            non autorizzati, perdita o distruzione. Le comunicazioni tra il tuo dispositivo e i
            nostri server sono cifrate tramite TLS/HTTPS. I dati archiviati su Supabase sono
            protetti da cifratura a riposo.
          </P>
        </Section>

        <Section title="9. Minori">
          <P>
            my mood è rivolto a persone di età pari o superiore a 16 anni. Non raccogliamo
            consapevolmente dati di minori di 16 anni. Se ritieni che un minore abbia fornito
            dati personali senza consenso parentale, contattaci immediatamente.
          </P>
        </Section>

        <Section title="10. Modifiche a questa informativa">
          <P>
            Ci riserviamo il diritto di aggiornare questa informativa. In caso di modifiche
            sostanziali, ti avviseremo tramite avviso prominente sul sito o — quando disponibile
            — via email. La data in cima al documento indica l&apos;ultima revisione.
          </P>
        </Section>

        <Section title="11. Contatti">
          <P>
            Per domande o richieste relative alla privacy:{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTROLLER_EMAIL}
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
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#F5F5F0',
        }}
      >
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '10px 12px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {children}
    </th>
  );
}

function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{children}</tr>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: '12px',
        color: 'rgba(255,255,255,0.65)',
        verticalAlign: 'top',
        lineHeight: '1.6',
      }}
    >
      {children}
    </td>
  );
}
