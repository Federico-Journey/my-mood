import type { Metadata } from 'next';
import Link from 'next/link';
import { ELLY_COLORS } from '@/lib/travelData';

export const metadata: Metadata = {
  title: 'Termini di Servizio — Elly',
  description: 'Condizioni di utilizzo del servizio Elly.',
};

const C = ELLY_COLORS;
const LAST_UPDATED = 'Settembre 2026';
const VERSION = 'Bozza 0.1';
const CONTACT_EMAIL = '[la tua email di contatto]';
const LEGAL_EMAIL = '[la tua email legale]';

export default function TermsPage() {
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
        <span style={{ color: C.text, fontSize: '14px' }}>Termini di Servizio</span>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 120px' }}>
        {/* Banner bozza */}
        <div style={{
          background: C.accentSoft2, border: `1.3px solid ${C.accent}`, borderRadius: '14px',
          padding: '16px 18px', marginBottom: '36px', fontSize: '13.5px', lineHeight: 1.6, color: C.text,
        }}>
          <strong>⚠️ Questa è una bozza, non ancora valida.</strong> È riscritta su ciò che Elly fa davvero (prima era basata su My Mood), ma contiene ancora dei placeholder da completare — email di contatto — e non ha ricevuto una revisione legale. Non pubblicarla come termini definitivi finché non l&apos;hai fatta controllare da un professionista.
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>
          Termini di Servizio
        </h1>
        <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '44px' }}>
          {VERSION} — Ultimo aggiornamento: {LAST_UPDATED}
        </p>

        <Section title="1. Definizioni">
          <DefinitionList
            items={[
              ['«Piattaforma»', 'L\'applicazione web/mobile "Elly".'],
              ['«Utente»', 'Qualsiasi persona che utilizza la Piattaforma, con o senza account.'],
              ['«Itinerario»', 'Il piano di viaggio generato dalla Piattaforma sulla base di destinazione, durata, persone e temi indicati.'],
              ['«Voto di Gruppo»', 'Funzionalità che permette di condividere un Itinerario tramite link e raccogliere le risposte dei partecipanti.'],
              ['«Contenuto UGC»', 'Il nome e la risposta lasciati da chi partecipa al Voto di Gruppo, o qualsiasi altro contenuto inserito dagli Utenti.'],
            ]}
          />
        </Section>

        <Section title="2. Accettazione dei Termini">
          <P>
            Utilizzando Elly accetti integralmente i presenti Termini di Servizio («Termini»). Se non li accetti,
            ti preghiamo di non utilizzare la Piattaforma. Per qualsiasi questione legale puoi contattarci a{' '}
            <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: C.accent }}>{LEGAL_EMAIL}</a>.
          </P>
          <P>
            L&apos;utilizzo della Piattaforma implica l&apos;accettazione anche dell&apos;{' '}
            <Link href="/privacy" style={{ color: C.accent }}>Informativa sulla Privacy</Link>, parte integrante
            dei presenti Termini.
          </P>
        </Section>

        <Section title="3. Descrizione del Servizio">
          <P>
            Elly è un servizio che aiuta a pianificare viaggi in base al mood o al tema di chi parte. Il Servizio
            include:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li>
              <strong>Generazione di itinerari</strong> — piani giorno per giorno personalizzati su destinazione,
              durata e tema del viaggio (avventuroso, storico, relax, culturale...), con luoghi validati tramite
              dati reali.
            </li>
            <li>
              <strong>Voto di Gruppo</strong> — crea un Itinerario, condividilo con il tuo gruppo tramite link e
              lascia che ognuno risponda, per decidere insieme dove andare senza il classico &quot;vediamo&quot;.
            </li>
            <li>
              <strong>&quot;I miei viaggi&quot;</strong> — se hai un account, i tuoi Itinerari restano salvati e
              consultabili in qualsiasi momento.
            </li>
          </ul>
          <P>
            I luoghi e le attività suggeriti sono soggetti a variazioni indipendenti dalla Società. Elly non
            garantisce la disponibilità o le caratteristiche effettive dei singoli luoghi.
          </P>
        </Section>

        <Section title="4. Registrazione e Account">
          <P>
            Puoi generare e condividere un Itinerario anche senza registrarti. Un account (email e password, oppure
            accesso con Google) è necessario solo per salvare i tuoi viaggi in &quot;I miei viaggi&quot; e
            ritrovarli in seguito.
          </P>
          <P>
            L&apos;Utente è responsabile della veridicità dei dati forniti in fase di registrazione, della custodia
            delle proprie credenziali di accesso e di qualsiasi attività svolta sul proprio account. In caso di
            accesso non autorizzato, contattaci a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.accent }}>{CONTACT_EMAIL}</a>.
          </P>
          <P>
            Elly si riserva il diritto di sospendere o cancellare l&apos;account in caso di violazione dei Termini
            o di utilizzo fraudolento della Piattaforma.
          </P>
        </Section>

        <Section title="5. Condotta dell'Utente">
          <P>Utilizzando la Piattaforma ti impegni a:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li>Non pubblicare contenuti falsi, diffamatori, discriminatori o lesivi di diritti di terzi.</li>
            <li>Non violare i diritti di proprietà intellettuale della Società o di terzi.</li>
            <li>Non utilizzare sistemi automatizzati (bot, scraper) senza autorizzazione scritta.</li>
            <li>Non tentare di accedere in modo non autorizzato ai sistemi o agli account altrui.</li>
            <li>Non condividere le proprie credenziali di accesso con terzi.</li>
          </ul>
          <P>La violazione di questi obblighi può determinare la sospensione dell&apos;account e/o l&apos;avvio di azioni legali.</P>
        </Section>

        <Section title="6. Contenuti Generati dagli Utenti (UGC)">
          <P>
            Partecipando al Voto di Gruppo inserisci un nome e una risposta, visibili a chi ha accesso al link
            dell&apos;Itinerario condiviso. Dichiari che il Contenuto UGC non viola diritti di terzi e non contiene
            dati personali di terzi senza il loro consenso.
          </P>
          <P>
            Elly si riserva il diritto di rimuovere qualsiasi Contenuto UGC che risulti in violazione dei presenti
            Termini, senza obbligo di preavviso.
          </P>
        </Section>

        <Section title="7. Voto di Gruppo">
          <P>
            Il link di condivisione di un Itinerario è accessibile a chiunque lo riceva. Ti raccomandiamo di non
            condividerlo su canali pubblici, per tutelare la privacy tua e degli altri partecipanti al voto.
          </P>
          <P>
            Elly non è responsabile delle decisioni prese dal gruppo sulla base dei risultati del voto.
          </P>
        </Section>

        <Section title="8. Accuratezza dei Contenuti Generati con l'IA">
          <P>
            Gli Itinerari sono generati con l&apos;ausilio di intelligenza artificiale e i luoghi proposti vengono
            verificati, dove possibile, con dati reali (indirizzi, foto, valutazioni). Nonostante questo,
            informazioni come <strong>orari di apertura, prezzi, disponibilità e distanze possono risultare
            imprecise o non aggiornate</strong>.
          </P>
          <P>
            Ti consigliamo di <strong>verificare sempre in autonomia</strong> le informazioni rilevanti (in
            particolare orari e prezzi) prima e durante il viaggio. Elly non è responsabile di eventuali
            inconvenienti derivanti da informazioni imprecise contenute in un Itinerario generato dalla
            Piattaforma.
          </P>
        </Section>

        <Section title="9. Proprietà Intellettuale">
          <P>
            Tutti i contenuti della Piattaforma — marchio, logo, interfaccia, testi, grafica, codice sorgente —
            sono di proprietà esclusiva di Elly o dei suoi licenzianti. È concessa all&apos;Utente una licenza
            personale, non esclusiva, non trasferibile e revocabile per utilizzare la Piattaforma nei modi
            consentiti dai presenti Termini.
          </P>
          <P>
            È espressamente vietato copiare, decompilare, modificare o distribuire qualsiasi elemento della
            Piattaforma senza autorizzazione scritta.
          </P>
        </Section>

        <Section title="10. Limitazione di Responsabilità">
          <P>
            Il Servizio è fornito &quot;così com&apos;è&quot; senza garanzie di alcun tipo. Nella misura massima
            consentita dalla legge applicabile, Elly non sarà responsabile per:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li>Danni indiretti, incidentali o consequenziali derivanti dall&apos;uso del Servizio.</li>
            <li>Interruzioni temporanee per manutenzione o cause di forza maggiore.</li>
            <li>Imprecisioni negli Itinerari generati, incluse informazioni su luoghi, orari o prezzi.</li>
            <li>Esperienze negative presso i luoghi suggeriti.</li>
            <li>Contenuti pubblicati dagli Utenti.</li>
          </ul>
          <P>
            Nulla in questi Termini esclude la responsabilità di Elly per frode, morte o lesioni personali causate
            da nostra negligenza, o qualsiasi responsabilità non escludibile dalla legge italiana obbligatoria.
          </P>
        </Section>

        <Section title="11. Modifiche ai Termini">
          <P>
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. In caso di modifiche
            sostanziali, ti daremo un preavviso ragionevole tramite avviso in-app o email. Il continuato utilizzo
            del Servizio dopo tale periodo costituirà accettazione dei nuovi Termini.
          </P>
        </Section>

        <Section title="12. Legge Applicabile e Risoluzione delle Controversie">
          <P>
            I presenti Termini sono disciplinati dalla legge italiana. Per gli Utenti consumatori, in caso di
            controversia è possibile ricorrere alla piattaforma europea ODR (
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
              ec.europa.eu/consumers/odr
            </a>
            ) o al foro del luogo di residenza del consumatore.
          </P>
        </Section>

        <Section title="13. Contatti">
          <P>Per qualsiasi domanda o segnalazione relativa a questi Termini:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: C.textMuted }}>
            <li>
              Assistenza generale:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.accent }}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              Questioni legali:{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: C.accent }}>{LEGAL_EMAIL}</a>
            </li>
          </ul>
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

function DefinitionList({ items }: { items: [string, string][] }) {
  return (
    <dl style={{ marginBottom: '14px' }}>
      {items.map(([term, def]) => (
        <div
          key={term}
          style={{
            display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 16px',
            padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: '15px',
          }}
        >
          <dt style={{ color: C.accent, fontWeight: 600, alignSelf: 'start' }}>{term}</dt>
          <dd style={{ color: C.textMuted, lineHeight: '1.6', margin: 0 }}>{def}</dd>
        </div>
      ))}
    </dl>
  );
}
