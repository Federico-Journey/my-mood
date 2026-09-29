/**
 * Prepara Stripe per Elly (una volta sola, ripetibile senza fare doppioni):
 *   1) crea i due prodotti con i prezzi (viaggio singolo, abbonamento mensile);
 *   2) configura il portale clienti (annulla abbonamento, cambio carta, ricevute);
 *   3) crea il webhook che avvisa l'app dei pagamenti e STAMPA il suo segreto.
 *
 * Uso (dal Terminale, nella cartella del progetto):
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs https://tuo-sito.vercel.app
 *
 * Per sicurezza rifiuta le chiavi "live" (pagamenti veri) a meno di aggiungere --live.
 * La chiave la incolli tu, solo nel Terminale: non va scritta in nessun file.
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const site = (process.argv.find((a) => a.startsWith("http")) ?? "").replace(/\/$/, "");
const live = process.argv.includes("--live");

if (!key) { console.error("Manca STRIPE_SECRET_KEY (la chiave segreta di test, inizia con sk_test_)."); process.exit(1); }
if (!site) { console.error("Indica l'indirizzo del sito, es.: node scripts/stripe-setup.mjs https://tuo-sito.vercel.app"); process.exit(1); }
if (key.startsWith("sk_live") && !live) { console.error("Questa è una chiave LIVE (soldi veri). Usa quella di test, oppure aggiungi --live se sei sicuro."); process.exit(1); }

const stripe = new Stripe(key);

const PRODUCTS = [
  { lookup: "elly_trip_single", name: "Elly · Viaggio completo", description: "Un itinerario completo con luoghi verificati, modifiche incluse.", cents: 299, recurring: null },
  { lookup: "elly_monthly", name: "Elly · Abbonamento mensile", description: "Viaggi con luoghi verificati (uso equo), modifiche incluse. Si rinnova ogni mese.", cents: 599, recurring: { interval: "month" } },
];

for (const p of PRODUCTS) {
  const found = await stripe.prices.list({ lookup_keys: [p.lookup], active: true, limit: 1 });
  if (found.data[0]) {
    const f = found.data[0];
    console.log(`= ${p.lookup}: già presente (${(f.unit_amount ?? 0) / 100} ${f.currency.toUpperCase()}).` +
      (f.unit_amount !== p.cents ? " ATTENZIONE: importo diverso da quello previsto; i prezzi di Stripe non si modificano, se serve se ne crea uno nuovo." : ""));
    continue;
  }
  const product = await stripe.products.create({ name: p.name, description: p.description });
  await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: p.cents,
    tax_behavior: "inclusive",
    lookup_key: p.lookup,
    ...(p.recurring ? { recurring: p.recurring } : {}),
  });
  console.log(`+ ${p.lookup}: creato a ${p.cents / 100} EUR.`);
}

// Portale clienti
const existing = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
if (existing.data[0]) {
  console.log("= Portale clienti: già configurato.");
} else {
  await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Gestisci il tuo abbonamento a Elly", privacy_policy_url: `${site}/privacy`, terms_of_service_url: `${site}/terms` },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email", "name"] },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
    },
  });
  console.log("+ Portale clienti: configurato.");
}

// Webhook
const EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "charge.refunded",          // rimborso: toglie i crediti corrispondenti
  "charge.dispute.closed",    // contestazione persa: idem
];
const url = `${site}/api/stripe/webhook`;
const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
const found = hooks.data.find((h) => h.url === url);
if (found) {
  await stripe.webhookEndpoints.update(found.id, { enabled_events: EVENTS });
  console.log(`= Webhook ${url}: già presente, eventi aggiornati. Il segreto (whsec_...) si vede solo alla creazione:`);
  console.log("  se non l'hai salvato, in Stripe → Sviluppatori → Webhook → il tuo endpoint → 'Mostra segreto'.");
} else {
  const hook = await stripe.webhookEndpoints.create({ url, enabled_events: EVENTS });
  console.log(`+ Webhook creato: ${url}`);
  console.log(`\nSEGRETO DEL WEBHOOK (copialo in Vercel come STRIPE_WEBHOOK_SECRET):\n${hook.secret}\n`);
}
console.log("Fatto.");
