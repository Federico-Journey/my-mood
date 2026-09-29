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
export type Paywall = null | "none" | "limit_month" | "limit_day" | "not_paid";

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
