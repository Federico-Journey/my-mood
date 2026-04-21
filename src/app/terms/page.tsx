import type { Metadata } from 'next';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Termini di Servizio — my mood',
  description: 'Condizioni di utilizzo del servizio my mood. Versione aggiornata aprile 2026.',
};

const LAST_UPDATED = 'Aprile 2026';
const VERSION = '2.0';
const CONTACT_EMAIL = 'hello@mymood.app';
const LEGAL_EMAIL = 'legal@mymood.app';
const SECURITY_EMAIL = 'security@mymood.app';

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
          style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}
        >
          ← my mood
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Termini di Servizio</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 120px' }}>
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
          Versione {VERSION} — Ultimo aggiornamento: {LAST_UPDATED}
        </p>

        {/* ── 1. DEFINIZIONI ── */}
        <Section title="1. Definizioni">
          <P>
            I seguenti termini con iniziale maiuscola hanno il significato specificato di seguito:
          </P>
          <DefinitionList
            items={[
              ['«Piattaforma»', 'L\'applicazione web, mobile e/o Progressive Web App (PWA) "my mood".'],
              ['«Utente»', 'Qualsiasi persona fisica registrata che accede alla Piattaforma.'],
              ['«Partner»', 'Locali, ristoranti, venue e fornitori di esperienze presenti nella Piattaforma.'],
              ['«Piano»', 'Il piano serata generato dalla Piattaforma o creato dall\'Utente.'],
              ['«Voto di Gruppo»', 'Funzionalità che permette a un gruppo di Utenti di votare un Piano condiviso.'],
              ['«Matching Sociale»', 'Funzionalità che abbina Utenti sconosciuti per mood e interessi comuni (Piano Premium).'],
              ['«Feedback Post-Serata»', 'Valutazione espressa dall\'Utente al termine di un\'esperienza.'],
              ['«Contenuto UGC»', 'Qualsiasi contenuto (testo, foto, rating) pubblicato dagli Utenti sulla Piattaforma.'],
              ['«Piano Premium»', 'Abbonamento a pagamento con accesso a funzionalità avanzate (Matching Sociale, zero pubblicità, eventi esclusivi).'],
            ]}
          />
        </Section>

        {/* ── 2. ACCETTAZIONE ── */}
        <Section title="2. Accettazione dei Termini">
          <P>
            Utilizzando my mood accetti integralmente i presenti Termini di Servizio («Termini»).
            Se non li accetti, ti preghiamo di non utilizzare la Piattaforma. Il Servizio è fornito
            da <strong>my mood</strong>. Per qualsiasi questione legale puoi contattarci a{' '}
            <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: '#F5C842' }}>
              {LEGAL_EMAIL}
            </a>
            .
          </P>
          <P>
            L'utilizzo della Piattaforma implica l'accettazione anche dell'{' '}
            <Link href="/privacy" style={{ color: '#F5C842' }}>
              Informativa sulla Privacy
            </Link>
            , parte integrante dei presenti Termini.
          </P>
        </Section>

        {/* ── 3. SERVIZI ── */}
        <Section title="3. Descrizione del Servizio">
          <P>
            my mood è una piattaforma digitale che trasforma il tempo libero in esperienza sociale,
            aiutando gli utenti a pianificare serate a Milano e a conoscere nuove persone con interessi
            simili. Il Servizio include:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              <strong>Generazione Piani Serata</strong> — Piani personalizzati per mood, compagnia,
              budget e quartiere di Milano, con venue e attività reali.
            </li>
            <li>
              <strong>Filtro Quartiere</strong> — Selezione della zona di Milano (Navigli, Brera,
              Porta Venezia, ecc.) per piani pertinenti alla tua area.
            </li>
            <li>
              <strong>Voto di Gruppo</strong> — Crea un Piano, condividilo via WhatsApp, lascia
              votare i tuoi amici (👍/👎) e scopri la preferenza del gruppo.
            </li>
            <li>
              <strong>Matching Sociale</strong> <em>(Piano Premium)</em> — Incontra persone nuove
              che condividono il tuo stesso mood per esperienze condivise.
            </li>
            <li>
              <strong>Feedback Post-Serata</strong> — Valuta la tua esperienza dopo la serata per
              migliorare i piani futuri.
            </li>
            <li>
              <strong>Progressive Web App (PWA)</strong> — Installa my mood sul tuo telefono come
              app nativa, con notifiche push opzionali.
            </li>
          </ul>
          <P>
            I locali e le attività suggeriti sono soggetti a variazioni indipendenti dalla Società.
            my mood non garantisce la disponibilità o le caratteristiche dei singoli Partner.
          </P>
        </Section>

        {/* ── 4. REGISTRAZIONE ── */}
        <Section title="4. Registrazione e Account">
          <P>
            La Piattaforma è accessibile agli Utenti che abbiano compiuto il <strong>16° anno
            di età</strong>. Per i minori di 18 anni, l'utilizzo del Matching Sociale e
            dell'acquisto del Piano Premium richiede il consenso dei genitori o del tutore legale.
          </P>
          <P>
            L'Utente è responsabile della veridicità dei dati forniti in fase di registrazione,
            della custodia delle proprie credenziali di accesso e di qualsiasi attività svolta sul
            proprio account. In caso di accesso non autorizzato, contatta immediatamente{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#F5C842' }}>
              {CONTACT_EMAIL}
            </a>
            .
          </P>
          <P>
            my mood si riserva il diritto di sospendere o cancellare l'account in caso di:
            violazione dei Termini, comportamento lesivo verso altri Utenti o Partner, utilizzo
            fraudolento della Piattaforma, o inattività superiore a 24 mesi.
          </P>
        </Section>

        {/* ── 5. CONDOTTA ── */}
        <Section title="5. Condotta dell'Utente">
          <P>Utilizzando la Piattaforma ti impegni a:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Non pubblicare contenuti falsi, diffamatori, discriminatori o lesivi di diritti di terzi.</li>
            <li>Non violare i diritti di proprietà intellettuale della Società o di terzi.</li>
            <li>Non utilizzare sistemi automatizzati (bot, scraper) senza autorizzazione scritta.</li>
            <li>Non tentare di accedere in modo non autorizzato ai sistemi o agli account altrui.</li>
            <li>Non utilizzare la Piattaforma per fini commerciali non autorizzati.</li>
            <li>Non condividere le proprie credenziali di accesso con terzi.</li>
          </ul>
          <P>
            Nell'utilizzo del <strong>Matching Sociale</strong>, l'Utente si impegna inoltre a
            rispettare gli altri Utenti, a non divulgare informazioni personali altrui al di fuori
            della Piattaforma, e a segnalare comportamenti inappropriati tramite la funzione
            «Segnala» presente nella Piattaforma.
          </P>
          <P>
            La violazione di questi obblighi può determinare la sospensione dell'account e/o
            l'avvio di azioni legali.
          </P>
        </Section>

        {/* ── 6. UGC ── */}
        <Section title="6. Contenuti Generati dagli Utenti (UGC)">
          <P>
            Pubblicando Contenuto UGC (feedback, commenti, foto), concedi a my mood una licenza
            non esclusiva, gratuita, mondiale, sublicenziabile per utilizzare, riprodurre,
            distribuire e visualizzare tale contenuto ai fini del funzionamento e miglioramento
            del Servizio.
          </P>
          <P>
            Dichiari che il Contenuto UGC: (i) è di tua titolarità o che disponi delle
            autorizzazioni necessarie; (ii) non viola diritti di terzi; (iii) non contiene dati
            personali di terzi senza il loro consenso.
          </P>
          <P>
            my mood si riserva il diritto di rimuovere qualsiasi Contenuto UGC che risulti in
            violazione dei presenti Termini, senza obbligo di preavviso. I feedback pubblicati
            possono essere condivisi con il Partner coinvolto nel Piano.
          </P>
        </Section>

        {/* ── 7. VOTO DI GRUPPO ── */}
        <Section title="7. Voto di Gruppo">
          <P>
            Il link di Voto di Gruppo è accessibile a chiunque lo riceva. Ti raccomandiamo di
            non condividerlo su canali pubblici per tutelare la tua privacy e quella degli altri
            partecipanti. I link di voto hanno una scadenza di <strong>72 ore</strong> dalla
            creazione.
          </P>
          <P>
            my mood non è responsabile delle decisioni prese dal gruppo sulla base dei risultati
            del voto. I dati di voto (anonimi) vengono eliminati automaticamente entro 30 giorni
            dalla scadenza del link.
          </P>
        </Section>

        {/* ── 8. MATCHING SOCIALE ── */}
        <Section title="8. Matching Sociale">
          <P>
            Il Matching Sociale è riservato agli Utenti in possesso di Piano Premium. my mood
            abbina gli Utenti sulla base di mood e interessi, <strong>non</strong> sull'aspetto
            fisico. La foto profilo è facoltativa.
          </P>
          <P>
            my mood <strong>non garantisce</strong> l'identità degli Utenti abbinati né la buona
            riuscita dell'esperienza. La Società non è responsabile del comportamento degli Utenti
            offline. Usi il servizio assumendoti la responsabilità delle tue azioni.
          </P>
          <P>
            Per tutela della community: ogni Utente ha a disposizione le funzioni «Segnala» e
            «Blocca». Le segnalazioni sono valutate dal team my mood entro 48 ore. I
            comportamenti abusivi o molesti comportano la sospensione immediata dell'account.
          </P>
        </Section>

        {/* ── 9. FEEDBACK POST-SERATA ── */}
        <Section title="9. Feedback Post-Serata">
          <P>
            Il Feedback Post-Serata (rating 1–5 stelle e commento testuale facoltativo) è
            utilizzato per migliorare l'algoritmo di raccomandazione e può essere visibile ai
            Partner coinvolti nel Piano. I feedback devono essere veritieri e basati
            sull'esperienza effettiva.
          </P>
          <P>
            La Direttiva Omnibus (D.Lgs. 208/2021) impone di garantire l'autenticità delle
            recensioni: i feedback vengono pubblicati solo da Utenti verificati che abbiano
            effettivamente utilizzato il Piano. Ci riserviamo di rimuovere feedback falsi o
            diffamatori.
          </P>
        </Section>

        {/* ── 10. PIANO PREMIUM ── */}
        <Section title="10. Piano Premium e Pagamenti">
          <P>
            Il Piano Premium è disponibile su base mensile o annuale. Il corrispettivo è
            indicato nella pagina dedicata e può variare nel tempo con preavviso di almeno
            30 giorni.
          </P>
          <P>
            L'abbonamento si <strong>rinnova automaticamente</strong> al termine di ciascun
            periodo, salvo disdetta almeno 24 ore prima della data di rinnovo dall'area account.
            Riceverai una email di promemoria 7 giorni prima del rinnovo.
          </P>
          <P>
            <strong>Diritto di recesso:</strong> In qualità di consumatore hai diritto di
            recedere entro 14 giorni dalla stipula ai sensi dell'art. 52 del D.Lgs. 206/2005
            (Codice del Consumo), salvo fruizione integrale del servizio. Per esercitare il
            recesso scrivi a{' '}
            <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: '#F5C842' }}>
              {LEGAL_EMAIL}
            </a>
            .
          </P>
          <P>
            I pagamenti sono gestiti tramite provider certificati PCI-DSS (es. Stripe). my mood
            non archivia mai i dati della tua carta di credito.
          </P>
        </Section>

        {/* ── 11. PROPRIETÀ INTELLETTUALE ── */}
        <Section title="11. Proprietà Intellettuale">
          <P>
            Tutti i contenuti della Piattaforma — marchio, logo, interfaccia, algoritmi, testi,
            grafica, codice sorgente — sono di proprietà esclusiva di my mood o dei suoi
            licenzianti. È concessa all'Utente una licenza personale, non esclusiva,
            non trasferibile e revocabile per utilizzare la Piattaforma nei modi consentiti dai
            presenti Termini.
          </P>
          <P>
            È espressamente vietato copiare, decompilare, modificare o distribuire qualsiasi
            elemento della Piattaforma senza autorizzazione scritta.
          </P>
        </Section>

        {/* ── 12. LIMITAZIONE DI RESPONSABILITÀ ── */}
        <Section title="12. Limitazione di Responsabilità">
          <P>
            Il Servizio è fornito &quot;così com&apos;è&quot; senza garanzie di alcun tipo. Nella
            misura massima consentita dalla legge applicabile, my mood non sarà responsabile per:
          </P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>Danni indiretti, incidentali o consequenziali derivanti dall'uso del Servizio.</li>
            <li>Interruzioni temporanee per manutenzione o cause di forza maggiore.</li>
            <li>Esperienze negative presso i venue suggeriti (qualità, servizio, sicurezza).</li>
            <li>Il comportamento offline degli Utenti abbinati tramite Matching Sociale.</li>
            <li>Contenuti pubblicati da Utenti o Partner.</li>
          </ul>
          <P>
            La responsabilità massima di my mood nei tuoi confronti è limitata all'importo
            corrisposto nell'ultimo anno di abbonamento, o a €50,00 per gli Utenti del piano
            gratuito.
          </P>
          <P>
            Nulla in questi Termini esclude la responsabilità di my mood per frode, morte o
            lesioni personali causate da nostra negligenza, o qualsiasi responsabilità non
            escludibile dalla legge italiana obbligatoria.
          </P>
        </Section>

        {/* ── 13. SICUREZZA ── */}
        <Section title="13. Sicurezza e Responsible Disclosure">
          <P>
            my mood adotta misure tecniche e organizzative adeguate per proteggere dati e sistemi
            (TLS in transito, cifratura a riposo, 2FA per accessi amministrativi). Se dovessi
            riscontrare una vulnerabilità di sicurezza, segnalala a{' '}
            <a href={`mailto:${SECURITY_EMAIL}`} style={{ color: '#F5C842' }}>
              {SECURITY_EMAIL}
            </a>{' '}
            prima di divulgarla pubblicamente. Risponderemo entro 48 ore.
          </P>
        </Section>

        {/* ── 14. MODIFICHE ── */}
        <Section title="14. Modifiche ai Termini">
          <P>
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. In caso
            di modifiche sostanziali, ti daremo un preavviso di almeno <strong>15 giorni</strong>{' '}
            tramite avviso in-app o email. Il continuato utilizzo del Servizio dopo tale periodo
            costituirà accettazione dei nuovi Termini. In caso di disaccordo, puoi cancellare il
            tuo account in qualsiasi momento.
          </P>
        </Section>

        {/* ── 15. LEGGE E FORO ── */}
        <Section title="15. Legge Applicabile e Risoluzione delle Controversie">
          <P>
            I presenti Termini sono disciplinati dalla legge italiana. Per qualsiasi controversia,
            le parti si impegnano a tentare una risoluzione amichevole entro 30 giorni dalla
            notifica scritta.
          </P>
          <P>
            Per gli Utenti consumatori, in caso di mancata risoluzione amichevole, è possibile
            ricorrere alla piattaforma europea ODR (
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#F5C842' }}
            >
              ec.europa.eu/consumers/odr
            </a>
            ) o al foro del luogo di residenza del consumatore. Per gli Utenti non consumatori,
            il foro esclusivamente competente è quello di <strong>Milano</strong>.
          </P>
        </Section>

        {/* ── 16. CONTATTI ── */}
        <Section title="16. Contatti">
          <P>Per qualsiasi domanda o segnalazione relativa a questi Termini:</P>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'rgba(255,255,255,0.7)' }}>
            <li>
              Assistenza generale:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#F5C842' }}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              Questioni legali e recesso:{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: '#F5C842' }}>
                {LEGAL_EMAIL}
              </a>
            </li>
            <li>
              Segnalazione vulnerabilità:{' '}
              <a href={`mailto:${SECURITY_EMAIL}`} style={{ color: '#F5C842' }}>
                {SECURITY_EMAIL}
              </a>
            </li>
          </ul>
        </Section>
      </div>
      <NavBar />
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

function DefinitionList({ items }: { items: [string, string][] }) {
  return (
    <dl style={{ marginBottom: '14px' }}>
      {items.map(([term, def]) => (
        <div
          key={term}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: '8px 16px',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: '15px',
          }}
        >
          <dt style={{ color: '#F5C842', fontWeight: 600, alignSelf: 'start' }}>{term}</dt>
          <dd style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>{def}</dd>
        </div>
      ))}
    </dl>
  );
}
