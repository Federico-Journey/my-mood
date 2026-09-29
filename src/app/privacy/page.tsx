import type { Metadata } from "next";
import { LEGAL, LegalLayout, Section, P, UL, Mail, Ext, FeatureTable } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Informativa sulla privacy — Elly",
  description: "Quali dati tratta Elly, perché, con chi li condivide e come puoi esercitare i tuoi diritti.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Informativa sulla privacy"
      intro="Ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR)"
      current="privacy"
    >
      <Section title="1. Chi siamo">
        <P>
          Elly è un servizio web e mobile che prepara itinerari di viaggio su misura (destinazione, durata, mood e
          budget), li rende condivisibili con il gruppo per decidere insieme e li accompagna fino alla conferma e alla
          lista delle prenotazioni da fare.
        </P>
        <P>
          Il titolare del trattamento è <strong>{LEGAL.ownerName}</strong>, che gestisce Elly a titolo personale in
          questa fase iniziale del progetto. Per qualsiasi richiesta sulla privacy puoi scrivere a <Mail />.
        </P>
      </Section>

      <Section title="2. Quali dati trattiamo, perché e per quanto tempo">
        <P>
          Trattiamo solo i dati che servono a farti usare Elly. Puoi generare e condividere un itinerario anche senza
          account; l&apos;account serve per salvare i viaggi e ritrovarli.
        </P>
        <FeatureTable
          rows={[
            {
              feature: "Crei un account",
              data: "Email e password (la password non la vediamo mai: è conservata in forma cifrata da Supabase). Con “Accedi con Google”: nome, email e foto del tuo account Google. Nome del profilo e, se li aggiungi, foto e città di partenza.",
              basis: "Esecuzione del contratto (art. 6.1.b)",
              retention: "Fino alla cancellazione dell’account, che puoi fare in autonomia dal Profilo",
            },
            {
              feature: "Generi un itinerario",
              data: "Destinazione, date, numero di persone, mood, budget, orari di inizio giornata e cena; l’itinerario prodotto e le tue richieste di modifica scritte in chat.",
              basis: "Esecuzione del contratto (art. 6.1.b)",
              retention: "Un viaggio salvato resta finché non lo elimini tu o cancelli l’account. Un viaggio generato ma non salvato non è collegato al tuo account, è raggiungibile solo da chi ha il suo indirizzo e viene eliminato in automatico dopo 30 giorni.",
            },
            {
              feature: "Salvi, confermi e prenoti",
              data: "Il legame tra il viaggio e il tuo account, la data di conferma e la lista delle prenotazioni da fare con le voci già spuntate.",
              basis: "Esecuzione del contratto (art. 6.1.b)",
              retention: "Come il viaggio a cui si riferiscono",
            },
            {
              feature: "Condividi e fai votare il gruppo",
              data: "L’itinerario condiviso è visibile a chiunque abbia il link. Chi vota non ha bisogno di un account: indica un nome (anche di fantasia) e la risposta (sì, forse, no).",
              basis: "Esecuzione del contratto (art. 6.1.b) e legittimo interesse a far funzionare il voto (art. 6.1.f)",
              retention: "Finché il viaggio condiviso non viene eliminato",
            },
            {
              feature: "Ricevi notifiche",
              data: "Notifiche in app legate al tuo account, ad esempio “Anna ha votato sì” su un tuo viaggio: contengono il nome indicato da chi ha votato e il nome del viaggio.",
              basis: "Esecuzione del contratto (art. 6.1.b)",
              retention: "Finché non le elimini, o fino alla cancellazione dell’account o del viaggio",
            },
            {
              feature: "Paghi un viaggio (quando i pagamenti saranno attivi)",
              data: "Importo, data, viaggio acquistato e ricevuta. I dati della carta sono gestiti direttamente da Stripe: noi non li vediamo né li conserviamo.",
              basis: "Esecuzione del contratto (art. 6.1.b) e obblighi fiscali e contabili (art. 6.1.c)",
              retention: "10 anni, come previsto dalla normativa contabile e fiscale",
            },
            {
              feature: "Controlliamo i costi del servizio",
              data: "Per ogni viaggio generato registriamo i costi tecnici (quantità di testo elaborato dall’IA, chiamate a Google) collegati all’identificativo del viaggio, senza il suo contenuto. Servono a calcolare il prezzo giusto e a tenere in ordine i conti.",
              basis: "Legittimo interesse (art. 6.1.f) alla sostenibilità del servizio",
              retention: "Finché servono a fini contabili; se il viaggio viene eliminato il collegamento con esso si interrompe",
            },
            {
              feature: "Ci scrivi",
              data: "Nome, indirizzo email e contenuto del messaggio inviato a info@planwithelly.com.",
              basis: "Esecuzione di misure precontrattuali o del contratto, oppure legittimo interesse a risponderti (art. 6.1.b e 6.1.f)",
              retention: "Il tempo necessario a rispondere e a gestire eventuali contestazioni",
            },
            {
              feature: "Usi il sito o l’app",
              data: "Dati tecnici di navigazione: indirizzo IP, tipo di browser e dispositivo, data e ora delle richieste, registrati dai fornitori di hosting e database.",
              basis: "Legittimo interesse alla sicurezza e al corretto funzionamento (art. 6.1.f)",
              retention: "Per il tempo strettamente necessario, secondo le impostazioni dei fornitori",
            },
          ]}
        />
        <P>
          Il conferimento dei dati è facoltativo, ma senza quelli indicati come necessari (ad esempio destinazione e
          mood) non possiamo generare l&apos;itinerario.
        </P>
      </Section>

      <Section title="3. Intelligenza artificiale">
        <P>
          Gli itinerari sono scritti da un modello di intelligenza artificiale (Claude, di Anthropic). Al modello
          inviamo solo ciò che serve a costruire il viaggio: destinazione, date, numero di persone, mood, budget,
          orari e le richieste di modifica che scrivi in chat. Non gli inviamo il tuo nome, la tua email né altri dati
          del tuo account. Secondo i termini commerciali di Anthropic, i dati inviati tramite le sue interfacce per
          sviluppatori non vengono usati per addestrare i suoi modelli.
        </P>
        <P>
          L&apos;itinerario è un suggerimento: non prendiamo decisioni automatizzate che producano effetti giuridici o
          incidano in modo analogo su di te (art. 22 GDPR). Per luoghi, orari e prezzi consulta anche le fonti
          ufficiali.
        </P>
      </Section>

      <Section title="4. Cookie, archiviazione locale e tecnologie simili">
        <P>
          Elly non usa cookie di profilazione né strumenti pubblicitari o di analisi del comportamento. Usiamo solo
          strumenti tecnici necessari, per i quali la legge non richiede il tuo consenso:
        </P>
        <UL>
          <li>
            la <strong>sessione di accesso</strong>, conservata nell&apos;archiviazione locale del browser tramite
            Supabase, per tenerti collegato;
          </li>
          <li>
            una <strong>copia locale dell&apos;app</strong> (service worker) che la rende più veloce e installabile
            sulla schermata Home del telefono.
          </li>
        </UL>
        <P>
          Due fornitori possono ricevere il tuo indirizzo IP direttamente dal tuo browser: <strong>Google</strong>, da cui
          carichiamo i caratteri tipografici del sito (Google Fonts), e, se scegli “Accedi con Google”, Google stesso
          durante il login, che può impostare propri cookie tecnici.
        </P>
      </Section>

      <Section title="5. Con chi condividiamo i dati">
        <P>
          Non vendiamo i tuoi dati e non li usiamo per pubblicità. Li trattano i fornitori che rendono possibile il
          servizio, ciascuno per la propria funzione e con contratti che rispettano il GDPR:
        </P>
        <UL>
          <li><strong>Supabase</strong> — database e autenticazione (responsabile del trattamento).</li>
          <li><strong>Vercel</strong> — hosting dell&apos;applicazione (responsabile del trattamento).</li>
          <li><strong>Anthropic</strong> — generazione e modifica degli itinerari, con i dati indicati al punto 3.</li>
          <li>
            <strong>Google</strong> — verifica dei luoghi, foto e mappe (Places API e Static Maps: riceve nomi e coordinate dei
            luoghi e la destinazione, non i tuoi dati personali), Google Fonts, e accesso con Google se lo scegli.
          </li>
          <li>
            <strong>Wikimedia Foundation</strong> — nella versione di prova le foto dei luoghi vengono caricate direttamente da
            Wikimedia Commons, che riceve quindi l&apos;indirizzo IP del tuo dispositivo come per qualsiasi immagine sul web.
          </li>
          <li><strong>Cloudflare</strong> — gestione del dominio e inoltro delle email inviate a {LEGAL.email}.</li>
          <li><strong>Stripe</strong> — pagamenti, quando saranno attivi.</li>
          <li>
            <strong>Autorità</strong> — se lo richiede la legge, o per far valere o difendere un diritto in sede
            giudiziaria.
          </li>
        </UL>
        <P>
          Chi riceve il link di un itinerario condiviso lo vede per intero, insieme ai nomi e alle risposte di chi ha già
          votato. Condividi il link solo con le persone con cui vuoi decidere.
        </P>
      </Section>

      <Section title="6. Trasferimenti fuori dallo Spazio Economico Europeo">
        <P>
          Alcuni fornitori (Anthropic, Google, Vercel, Stripe e in parte Supabase) possono trattare dati anche fuori
          dal SEE, in particolare negli Stati Uniti. In questi casi i trasferimenti avvengono sulla base di una
          decisione di adeguatezza della Commissione europea (come il Data Privacy Framework UE–USA per i fornitori che
          vi aderiscono) oppure delle Clausole Contrattuali Standard. Puoi chiederci maggiori informazioni scrivendo a{" "}
          <Mail />.
        </P>
      </Section>

      <Section title="7. I tuoi diritti">
        <P>Ai sensi degli artt. 15–22 GDPR puoi in qualsiasi momento:</P>
        <UL>
          <li><strong>accedere</strong> ai tuoi dati e averne copia;</li>
          <li><strong>rettificarli</strong>, se inesatti o incompleti;</li>
          <li><strong>cancellarli</strong> (“diritto all’oblio”), salvo gli obblighi di conservazione previsti dalla legge;</li>
          <li><strong>limitarne</strong> il trattamento;</li>
          <li><strong>riceverli</strong> in un formato strutturato e leggibile (portabilità);</li>
          <li><strong>opporti</strong> ai trattamenti basati sul legittimo interesse;</li>
          <li><strong>revocare il consenso</strong>, dove il trattamento si basa su di esso, senza pregiudicare quanto fatto prima.</li>
        </UL>
        <P>
          Molte cose le puoi fare da solo direttamente dall&apos;app: eliminare i tuoi viaggi e le notifiche, ed eliminare
          l&apos;intero account da <strong>Profilo → Elimina account</strong> (cancella subito profilo, viaggi, link condivisi,
          liste di prenotazione e notifiche). Per tutto il resto scrivi a <Mail />: rispondiamo entro 30 giorni. Se ritieni che il
          trattamento violi la normativa puoi proporre reclamo al{" "}
          <Ext href="https://www.garanteprivacy.it">Garante per la protezione dei dati personali</Ext>.
        </P>
      </Section>

      <Section title="8. Come proteggiamo i dati">
        <UL>
          <li>Connessione cifrata (HTTPS) e dati cifrati a riposo presso i nostri fornitori.</li>
          <li>Password mai in chiaro: le gestisce e le conserva in forma cifrata Supabase.</li>
          <li>
            Regole di accesso a livello di database: i viaggi salvati, le liste di prenotazione e le notifiche sono
            leggibili solo dal loro proprietario.
          </li>
          <li>I dati economici del servizio (costi, ricavi) sono consultabili solo dall&apos;amministratore.</li>
        </UL>
        <P>
          Nessun sistema è invulnerabile. Se si verificasse una violazione che comporta un rischio elevato per i tuoi
          diritti ti avviseremo senza ingiustificato ritardo (art. 34 GDPR).
        </P>
      </Section>

      <Section title="9. Minori">
        <P>
          Elly è destinato a persone che hanno compiuto <strong>18 anni</strong>. Non raccogliamo consapevolmente dati
          di minori: se pensi che un minore ci abbia fornito dei dati, scrivi a <Mail /> e li cancelleremo.
        </P>
      </Section>

      <Section title="10. Modifiche a questa informativa">
        <P>
          Possiamo aggiornare questa informativa quando cambiano il servizio, i fornitori o la normativa. La versione in
          vigore è sempre quella pubblicata in questa pagina, con la data di aggiornamento; se le modifiche sono
          importanti ti avvisiamo anche nell&apos;app o via email.
        </P>
      </Section>

      <Section title="11. Contatti">
        <P>
          Titolare del trattamento: {LEGAL.ownerName} — <Mail />
        </P>
      </Section>

      <Section title="Crediti">
        <P>
          I suggerimenti di destinazione si basano su dati geografici <Ext href="https://www.geonames.org">GeoNames</Ext>,
          distribuiti con licenza Creative Commons Attribution 4.0.
        </P>
        <P>
          Nella versione di prova i luoghi provengono da <Ext href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</Ext>{" "}
          (licenza ODbL) e da <Ext href="https://www.wikidata.org">Wikidata</Ext> (CC0); le foto da{" "}
          <Ext href="https://commons.wikimedia.org">Wikimedia Commons</Ext>, con autore e licenza indicati in ogni viaggio.
        </P>
        <P>
          Dei dati di Google Maps conserviamo solo quanto consentito dai termini di Google: l&apos;identificativo del luogo e le
          coordinate per non più di 30 giorni. Le foto di Google vengono mostrate al momento, con il nome del loro autore.
        </P>
      </Section>
    </LegalLayout>
  );
}
