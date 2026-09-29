/**
 * Listino e testi dei pagamenti, condivisi tra server e interfaccia.
 * I prezzi veri li decide Stripe (script scripts/stripe-setup.mjs): se li cambi qui
 * cambia solo quello che l'app mostra, quindi tienili allineati.
 * I limiti dell'uso equo sono nel database (tabella billing_settings): qui ci sono solo
 * i valori predefiniti mostrati se il database non risponde.
 */

export const PRICES = {
  tripEur: 2.99,      // un viaggio completo (con modifiche incluse)
  monthlyEur: 5.99,   // abbonamento mensile
} as const;

export const DEFAULT_LIMITS = { monthly: 15, daily: 5, refinements: 30 } as const;

/** Perché un utente loggato è finito sulla versione di prova (restituito da generate/refine). */
export type Paywall = null | "none" | "limit_month" | "limit_day" | "not_paid" | "chosen_base";

/** Come generare: "auto" = decide il server (completo se disponibile), "base" = versione base scelta dall'utente. */
export type GenerationChoice = "auto" | "base";

export const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

/** Testo mostrato nella pagina di pagamento di Stripe (consenso all'esecuzione immediata). */
export const CHECKOUT_CONSENT_TEXT =
  "Confermando chiedi l'accesso immediato al servizio digitale di Elly. Una volta iniziata la fornitura " +
  "(ad esempio generato un viaggio) perdi il diritto di recesso di 14 giorni per la parte già fornita, " +
  "come previsto dall'art. 59 del Codice del Consumo. Dettagli nei Termini di servizio.";

/** Stato dei pagamenti restituito da /api/billing/status. */
export type BillingStatus =
  | { enabled: false }
  | { enabled: true; loggedIn: false }
  | {
      enabled: true;
      loggedIn: true;
      credits: number;
      free_left: number;
      has_customer: boolean;
      subscription: null | {
        active: boolean; status: string; period_end: string | null; cancel_at_period_end: boolean;
        used_month: number; used_day: number;
      };
      limits: { monthly: number; daily: number; refinements: number };
    };

/** Stato di un utente loggato con i pagamenti attivi. */
export type LoggedBilling = Extract<BillingStatus, { enabled: true; loggedIn: true }>;

export type PlanSummary = {
  kind: "subscription" | "payment_failed" | "pay_per_trip" | "trial";
  /** Nome del piano, per esempio "Abbonamento mensile". */
  label: string;
  /** Riga di dettaglio, per esempio "3 di 15 viaggi usati". */
  detail: string;
  /** Viaggi completi ancora disponibili (crediti + viaggio gratuito). Con abbonamento: quelli rimasti nel periodo. */
  available: number;
};

/** Piano attivo dell'utente, in ordine di priorità: abbonamento, crediti acquistati, prova. */
export function planSummary(s: LoggedBilling): PlanSummary {
  const sub = s.subscription;
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long" }) : "";
  if (sub?.active) {
    const left = Math.max(0, s.limits.monthly - sub.used_month);
    return {
      kind: "subscription",
      label: "Abbonamento mensile",
      detail: sub.cancel_at_period_end
        ? `${left} viaggi ancora disponibili · termina il ${fmt(sub.period_end)}`
        : `${sub.used_month} di ${s.limits.monthly} viaggi usati · rinnovo il ${fmt(sub.period_end)}`,
      available: left,
    };
  }
  if (sub && ["past_due", "unpaid"].includes(sub.status)) {
    return { kind: "payment_failed", label: "Pagamento non riuscito", detail: "Aggiorna il metodo di pagamento per riattivare l'abbonamento", available: s.credits + s.free_left };
  }
  const available = s.credits + s.free_left;
  if (s.credits > 0) {
    return {
      kind: "pay_per_trip",
      label: "Pay per viaggio",
      detail: s.credits === 1 ? "1 viaggio acquistato disponibile" : `${s.credits} viaggi acquistati disponibili`,
      available,
    };
  }
  return {
    kind: "trial",
    label: "Prova gratuita",
    detail: s.free_left > 0 ? "1 viaggio completo incluso" : "Viaggio gratuito già usato: acquista un viaggio o abbonati",
    available,
  };
}
