import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termini di Servizio — my mood',
  description: 'Condizioni di utilizzo del servizio my mood.',
};

const LAST_UPDATED = '12 aprile 2025';
const CONTACT_EMAIL = 'hello@mymood.app';

export default function TermsPage() {
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
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Termini di Servizio
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
          Termini di Servizio
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '48px' }}>
          Ultimo aggiornamento: {LAST_UPDATED}
        </p>

        <Section title="1. Accettazione dei termini">
          <P>
            Utilizzando my mood (il &quot;Servizio&quot;) accetti integralmente i presenti
            Termini di Servizio. Se non li accetti, ti preghiamo di non utilizzare il Servizio.
            Il Servizio è fornito da <strong>my mood</strong> (il &quot;Fornitore&quot;). Potrai
            contattarci all&apos;indirizzo{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTACT_EMAIL}
            </a>
            .
          </P>
        </Section>

        <Section title="2. Descrizione del Servizio">
          <P>
            my mood è una piattaforma digitale che aiuta gli utenti a pianificare serate a
            Milano suggerendo venue, attività e percorsi personalizzati in base al mood, al
            budget e alle preferenze selezionate. Il Servizio include attualmente:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Selezione del mood e generazione di un piano serata</li>
            <li>Filtri per budget, attività e quartiere</li>
            <li>Informazioni su venue a Milano (indirizzi, categorie, link esterni)</li>
          </ul>
          <P>
            <strong>Funzionalità in arrivo:</strong> profili utente, condivisione del piano con
            amici, voto di gruppo e discovery di nuove persone. Queste funzioni saranno soggette
            a termini aggiuntivi comunicati prima della loro attivazione.
          </P>
        </Section>

        <Section title="3. Accesso al Servizio e account">
          <P>
            Il Servizio è attualmente accessibile senza registrazione. Quando sarà introdotta la
            funzionalità di account:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Sei responsabile della riservatezza delle tue credenziali di accesso</li>
            <li>Puoi creare un solo account per persona</li>
            <li>
              Non puoi cedere o condividere il tuo account con terze parti senza il nostro
              consenso scritto
            </li>
            <li>
              Sei responsabile di tutte le attività svolte tramite il tuo account
            </li>
          </ul>
        </Section>

        <Section title="4. Uso consentito">
          <P>Puoi utilizzare my mood esclusivamente per scopi personali e non commerciali. È vietato:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              Utilizzare il Servizio per attività illecite o contrarie all&apos;ordine pubblico
            </li>
            <li>
              Effettuare reverse engineering, decompilare o tentare di estrarre il codice
              sorgente del Servizio
            </li>
            <li>
              Accedere al Servizio tramite metodi automatizzati (bot, scraper) senza nostra
              autorizzazione scritta
            </li>
            <li>
              Caricare o condividere contenuti che violino diritti di terzi, siano diffamatori,
              osceni o illegali
            </li>
            <li>
              Tentare di compromettere la sicurezza o l&apos;integrità del Servizio
            </li>
            <li>
              Utilizzare le informazioni sui venue per creare prodotti o servizi concorrenti
            </li>
          </ul>
        </Section>

        <Section title="5. Contenuti dell'utente (future funzionalità sociali)">
          <P>
            Quando saranno disponibili funzionalità che consentono di pubblicare contenuti
            (recensioni, foto, commenti, piani condivisi), l&apos;utente:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              Mantiene la proprietà dei propri contenuti, ma concede a my mood una licenza
              non esclusiva, mondiale, gratuita per visualizzarli, riprodurli e distribuirli
              all&apos;interno del Servizio
            </li>
            <li>
              Garantisce che i contenuti pubblicati non violino diritti di terzi
            </li>
            <li>
              Accetta che my mood possa rimuovere contenuti che violano questi Termini, senza
              preavviso
            </li>
          </ul>
        </Section>

        <Section title="6. Accuratezza delle informazioni sui venue">
          <P>
            my mood si impegna a mantenere aggiornate le informazioni sui locali (orari,
            indirizzi, prezzi). Tuttavia, tali informazioni sono fornite a scopo orientativo e
            possono non essere sempre aggiornate in tempo reale. Ti invitiamo a verificare
            direttamente con i locali prima di recarti in un posto. my mood non è responsabile
            per chiusure, modifiche di orari o inaccuratezze nelle informazioni dei venue.
          </P>
        </Section>

        <Section title="7. Proprietà intellettuale">
          <P>
            Tutti i contenuti del Servizio — inclusi testi, grafica, logo, interfaccia,
            software e database — sono di proprietà di my mood o dei rispettivi titolari e sono
            protetti dalle leggi sul diritto d&apos;autore. È vietata qualsiasi riproduzione,
            distribuzione o utilizzo non autorizzato.
          </P>
        </Section>

        <Section title="8. Limitazione di responsabilità">
          <P>
            Il Servizio è fornito &quot;così com&apos;è&quot; e &quot;come disponibile&quot;,
            senza garanzie di alcun tipo. Nella misura massima consentita dalla legge applicabile,
            my mood non sarà responsabile per:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Danni indiretti, incidentali o consequenziali derivanti dall&apos;uso del Servizio</li>
            <li>Interruzioni temporanee del Servizio per manutenzione o cause di forza maggiore</li>
            <li>
              Esperienze negative presso i venue suggeriti dal Servizio (qualità, servizio,
              sicurezza)
            </li>
            <li>
              Perdita di dati causata da eventi al di fuori del nostro ragionevole controllo
            </li>
          </ul>
          <P>
            Nulla in questi Termini esclude o limita la responsabilità di my mood per frode,
            morte o lesioni personali causate da negligenza, o qualsiasi altra responsabilità
            che non possa essere esclusa o limitata dalla legge italiana.
          </P>
        </Section>

        <Section title="9. Sospensione e chiusura dell'account">
          <P>
            my mood si riserva il diritto di sospendere o chiudere l&apos;accesso al Servizio
            in caso di violazione di questi Termini, con o senza preavviso. L&apos;utente può
            chiudere il proprio account in qualsiasi momento inviando una richiesta a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTACT_EMAIL}
            </a>
            .
          </P>
        </Section>

        <Section title="10. Modifiche al Servizio e ai Termini">
          <P>
            my mood si riserva il diritto di modificare o interrompere il Servizio (o parte di
            esso) in qualsiasi momento. In caso di modifiche sostanziali ai presenti Termini,
            forniremo un preavviso di almeno 30 giorni — tramite avviso in-app o email —
            prima che le modifiche entrino in vigore. Il continuato utilizzo del Servizio dopo
            tale periodo costituirà accettazione dei nuovi Termini.
          </P>
        </Section>

        <Section title="11. Legge applicabile e foro competente">
          <P>
            I presenti Termini sono disciplinati dalla legge italiana. Per qualsiasi
            controversia derivante dall&apos;uso del Servizio, le parti concordano di tentare
            una risoluzione amichevole. In assenza di accordo, il foro competente sarà quello
            di <strong>Milano</strong>, salvo diversa previsione inderogabile di legge a tutela
            dei consumatori.
          </P>
        </Section>

        <Section title="12. Contatti">
          <P>
            Per domande, segnalazioni o richieste relative a questi Termini:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTACT_EMAIL}
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
