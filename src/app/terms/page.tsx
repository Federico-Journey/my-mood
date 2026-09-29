import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, LegalLayout, Section, P, UL, Mail, DefinitionList } from "@/components/LegalPage";
import { ELLY_COLORS } from "@/lib/travelData";

export const metadata: Metadata = {
  title: "Termini di servizio — Elly",
  description: "Le condizioni con cui puoi usare Elly: cosa fa il servizio, pagamenti, responsabilità e diritti.",
};

const C = ELLY_COLORS;

export default function TermsPage() {
  return (
    <LegalLayout title="Termini di servizio" current="terms">
      <Section title="1. Chi offre il servizio">
        <P>
          Elly è offerto da <strong>{LEGAL.ownerName}</strong> (di seguito “Elly” o “noi”), raggiungibile a{" "}
          <Mail />. Usando Elly accetti questi Termini e la{" "}
          <Link href="/privacy" style={{ color: C.accent }}>Informativa sulla privacy</Link>. Se non li accetti,
          non usare il servizio.
        </P>
        <DefinitionList
          items={[
            ["Servizio", "L’applicazione web e mobile Elly, raggiungibile su " + LEGAL.site + "."],
            ["Utente", "Chi usa il Servizio, con o senza account."],
            ["Itinerario", "Il piano di viaggio giorno per giorno generato dal Servizio a partire da destinazione, date, persone, mood e budget."],
            ["Viaggio salvato", "Un Itinerario che l’Utente ha scelto di salvare nel proprio account."],
            ["Voto di gruppo", "La funzione che permette di condividere un Itinerario con un link e raccogliere le risposte del gruppo."],
          ]}
        />
      </Section>

      <Section title="2. Cosa fa Elly (e cosa non fa)">
        <P>Elly ti aiuta a organizzare un viaggio di gruppo. In particolare puoi:</P>
        <UL>
          <li>generare un Itinerario scegliendo destinazione, date, mood e budget, e chiedere modifiche in chat;</li>
          <li>condividerlo con un link e far votare il gruppo, anche a chi non ha un account;</li>
          <li>salvarlo, confermarlo e seguire la lista delle prenotazioni da fare (voli, alloggi, ristoranti, attività);</li>
          <li>ricevere notifiche, per esempio quando qualcuno vota un tuo viaggio, e leggere gli articoli della Bacheca.</li>
        </UL>
        <P>
          <strong>Elly non è un’agenzia di viaggi, un tour operator né un intermediario.</strong> Non vende né prenota
          voli, alloggi, ristoranti o attività: ti suggerisce cosa fare e ti rimanda alle fonti (ad esempio Google Maps).
          Le prenotazioni le concludi tu direttamente con i fornitori, alle loro condizioni.
        </P>
        <P>
          Il Servizio è in fase iniziale: funzioni, contenuti e interfaccia possono cambiare e, in caso di
          manutenzione o problemi tecnici, essere temporaneamente non disponibili.
        </P>
      </Section>

      <Section title="3. Requisiti e account">
        <P>
          Per usare Elly devi avere almeno <strong>18 anni</strong>. Puoi generare e condividere un Itinerario senza
          registrarti; per salvarlo e ritrovarlo serve un account (email e password oppure accesso con Google).
        </P>
        <P>
          Sei responsabile della veridicità dei dati che fornisci e della custodia delle tue credenziali. Se sospetti un
          accesso non autorizzato scrivi subito a <Mail />. Puoi chiedere in qualsiasi momento la cancellazione
          dell&apos;account.
        </P>
      </Section>

      <Section title="4. Salvataggio e link di condivisione">
        <P>
          Un Itinerario appena generato <strong>non viene salvato nel tuo account finché non scegli “Salva”</strong>. Fino
          a quel momento resta raggiungibile solo da chi ha il suo indirizzo, non compare nei tuoi viaggi e può essere
          eliminato automaticamente.
        </P>
        <P>
          Il link di condivisione mostra l&apos;Itinerario a chiunque lo riceva, senza bisogno di account, insieme ai nomi
          e alle risposte di chi ha già votato. Chi lo inoltra ad altri ne allarga la visibilità: condividilo solo con
          le persone con cui vuoi decidere. Se modifichi un Itinerario già condiviso, il link mostra la versione
          aggiornata.
        </P>
      </Section>

      <Section title="5. Prezzi e pagamenti">
        <P>
          Il modello di Elly è il <strong>pagamento per singolo viaggio</strong>: il prezzo dipende dal lavoro necessario
          a costruire l&apos;Itinerario e ti viene mostrato, IVA inclusa, <strong>prima</strong> che tu confermi
          l&apos;acquisto. Questa funzione è in arrivo: finché non viene attivata, i prezzi indicati in questo punto non
          si applicano e non ti verrà addebitato nulla. Ti avviseremo nell&apos;app quando i pagamenti saranno attivi.
        </P>
        <P>
          Quando saranno attivi, i pagamenti passeranno da <strong>Stripe</strong>, un fornitore esterno: i dati della
          carta sono trattati da lui e non transitano dai nostri sistemi. Se la generazione non va a buon fine per un
          nostro problema tecnico, l&apos;importo non ti viene addebitato o ti viene rimborsato.
        </P>
        <P>
          <strong>Contenuto digitale e recesso.</strong> L&apos;Itinerario è un contenuto digitale che viene creato e messo a
          tua disposizione subito. Per questo, al momento dell&apos;acquisto ti chiederemo il consenso espresso
          all&apos;esecuzione immediata e la presa d&apos;atto che, una volta fornito il contenuto, perdi il diritto di
          recesso previsto dal Codice del consumo. Restano ferme le tutele che la legge ti riconosce in ogni caso,
          come quelle per i difetti di conformità del contenuto digitale.
        </P>
        <P>
          Alcune sezioni o funzioni, come determinati articoli della Bacheca, potranno essere riservate a utenti
          premium. Le condizioni di un eventuale abbonamento ti saranno mostrate prima della sottoscrizione.
        </P>
      </Section>

      <Section title="6. Itinerari generati con intelligenza artificiale">
        <P>
          Gli Itinerari sono scritti con l&apos;aiuto di un modello di intelligenza artificiale e, dove possibile, i luoghi
          vengono verificati con dati reali (indirizzo, foto, valutazioni). Nonostante questo{" "}
          <strong>orari di apertura, prezzi, disponibilità, distanze e persino l&apos;esistenza di un luogo possono essere
          imprecisi, incompleti o cambiati</strong>. I luoghi indicati come “da verificare” non sono stati riscontrati.
        </P>
        <P>
          Prima di partire e di prenotare, controlla le informazioni che contano (orari, prezzi, requisiti d&apos;ingresso,
          visti, condizioni meteo e di sicurezza della destinazione) sulle fonti ufficiali. Il budget indicato negli
          Itinerari è una stima, non un preventivo.
        </P>
      </Section>

      <Section title="7. Uso corretto del Servizio">
        <P>Usando Elly ti impegni a non:</P>
        <UL>
          <li>inserire contenuti falsi, offensivi, discriminatori o che violino diritti di terzi (inclusi i nomi che scrivi votando);</li>
          <li>usare bot, scraper o altri sistemi automatici, o sovraccaricare il Servizio, senza il nostro consenso scritto;</li>
          <li>cercare di accedere ad account, dati o sistemi che non sono tuoi, o aggirare le misure di sicurezza;</li>
          <li>rivendere o sfruttare commercialmente il Servizio o i suoi contenuti senza autorizzazione;</li>
          <li>usare Elly per attività illecite.</li>
        </UL>
        <P>
          Se violi questi Termini possiamo rimuovere i contenuti interessati e sospendere o chiudere il tuo account,
          dandoti dove possibile un preavviso.
        </P>
      </Section>

      <Section title="8. Contenuti degli utenti e Voto di gruppo">
        <P>
          Chi partecipa a un Voto di gruppo indica un nome e una risposta, visibili a chi ha il link e al proprietario del
          viaggio. Sei responsabile di ciò che scrivi. Non siamo responsabili delle decisioni che il gruppo prende in base
          ai voti né di eventuali accordi tra i partecipanti.
        </P>
      </Section>

      <Section title="9. Proprietà intellettuale">
        <P>
          Il marchio, il logo, il design, i testi originali, il codice e la grafica di Elly appartengono a{" "}
          {LEGAL.ownerName} o ai suoi licenzianti. Ti concediamo una licenza personale, non esclusiva, non
          trasferibile e revocabile per usare il Servizio secondo questi Termini.
        </P>
        <P>
          Puoi usare gli Itinerari che generi per organizzare i tuoi viaggi e condividerli con chi viaggia con te. Le
          fotografie, le valutazioni e i dati sui luoghi provengono da terze parti (ad esempio Google) e restano dei
          rispettivi titolari, secondo le loro condizioni.
        </P>
      </Section>

      <Section title="10. Responsabilità">
        <P>
          Facciamo il possibile perché Elly funzioni bene, ma il Servizio è fornito “così com&apos;è”. Nei limiti consentiti
          dalla legge non rispondiamo di danni indiretti o consequenziali, di interruzioni del Servizio, delle
          informazioni imprecise contenute negli Itinerari, di esperienze negative presso i luoghi suggeriti, né di
          prenotazioni, pagamenti o accordi conclusi con fornitori terzi.
        </P>
        <P>
          Nessuna parte di questi Termini esclude o limita la responsabilità che non può essere esclusa per legge, ad
          esempio per dolo o colpa grave, per morte o danni alla persona, né i diritti inderogabili che la legge
          riconosce ai consumatori.
        </P>
      </Section>

      <Section title="11. Modifiche ai Termini e al Servizio">
        <P>
          Possiamo modificare questi Termini, per esempio per nuove funzioni o cambi di legge. Se le modifiche sono
          rilevanti ti avviseremo con ragionevole anticipo nell&apos;app o via email; continuando a usare Elly dopo tale
          data accetti la nuova versione. Se non sei d&apos;accordo puoi smettere di usare il Servizio e chiedere la
          cancellazione dell&apos;account. Le modifiche non si applicano agli acquisti già conclusi.
        </P>
      </Section>

      <Section title="12. Legge applicabile e foro competente">
        <P>
          Questi Termini sono regolati dalla legge italiana. Se sei un consumatore, restano ferme le norme
          inderogabili del tuo Paese di residenza e puoi rivolgerti al giudice del luogo in cui risiedi o hai il domicilio.
          Prima di ricorrere al giudice puoi anche contattarci a <Mail /> per trovare una soluzione, o rivolgerti a un
          organismo di risoluzione alternativa delle controversie (ADR).
        </P>
      </Section>

      <Section title="13. Contatti">
        <P>
          Per domande, segnalazioni o richieste su questi Termini scrivi a <Mail />.
        </P>
      </Section>
    </LegalLayout>
  );
}
