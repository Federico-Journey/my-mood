/**
 * Chi può generare un viaggio "completo" (luoghi verificati con Google) e chi resta sulla
 * versione di prova (archivio aperto, nessun costo Google).
 *
 * Regole (con i pagamenti attivi, BILLING_ENABLED=true):
 *  - ospite (senza accesso) → prova;
 *  - loggato → nell'ordine: abbonamento (uso equo) → viaggio gratuito → credito acquistato;
 *    se non c'è niente di disponibile → prova, con l'invito ad acquistare;
 *  - le modifiche a un viaggio già pagato sono incluse (tetto antiabuso per viaggio).
 *
 * Con i pagamenti spenti l'app si comporta come prima: loggato = completo.
 * Se il database dei pagamenti non risponde si ricade sulla prova (costo minimo),
 * mai su Google gratis.
 */

import { billingEnabled, supabaseAdmin } from "./supabaseAdmin";
import type { GenerationMode } from "./tripGenerator";
import type { Paywall } from "./billingConfig";

export type { Paywall };

export type GenerationGate = {
  mode: GenerationMode;
  logId: number | null;
  source: "subscription" | "free" | "credit" | null;
  paywall: Paywall;
};

export async function reserveGeneration(userId: string | null): Promise<GenerationGate> {
  if (!userId) return { mode: "trial", logId: null, source: null, paywall: null };
  if (!billingEnabled()) return { mode: "full", logId: null, source: null, paywall: null };
  const { data, error } = await supabaseAdmin().rpc("consume_generation", { p_user: userId });
  if (error || !data) {
    console.error("[Elly] consume_generation:", error);
    return { mode: "trial", logId: null, source: null, paywall: null };
  }
  if (data.source === "none") {
    return { mode: "trial", logId: null, source: null, paywall: (data.reason as Paywall) ?? "none" };
  }
  return { mode: "full", logId: data.log_id as number, source: data.source, paywall: null };
}

export async function attachGenerationTrip(userId: string | null, logId: number | null, tripId: string) {
  if (!userId || !logId) return;
  const { error } = await supabaseAdmin().rpc("attach_generation_trip", { p_user: userId, p_log: logId, p_trip: tripId });
  if (error) console.error("[Elly] attach_generation_trip:", error);
}

/** La generazione è fallita per un errore nostro: il credito o il viaggio gratuito tornano all'utente. */
export async function refundGeneration(userId: string | null, logId: number | null) {
  if (!userId || !logId) return;
  const { error } = await supabaseAdmin().rpc("refund_generation", { p_user: userId, p_log: logId });
  if (error) console.error("[Elly] refund_generation:", error);
}

export type RefinementGate = { mode: GenerationMode; paywall: Paywall; blocked: string | null };

export async function reserveRefinement(userId: string | null, tripId: string | null | undefined): Promise<RefinementGate> {
  if (!userId) return { mode: "trial", paywall: null, blocked: null };
  if (!billingEnabled()) return { mode: "full", paywall: null, blocked: null };
  if (!tripId) return { mode: "trial", paywall: "not_paid", blocked: null };
  const { data, error } = await supabaseAdmin().rpc("consume_refinement", { p_user: userId, p_trip: tripId });
  if (error || !data) {
    console.error("[Elly] consume_refinement:", error);
    return { mode: "trial", paywall: null, blocked: null };
  }
  if (data.ok) return { mode: "full", paywall: null, blocked: null };
  if (data.reason === "limit_refinements") {
    return {
      mode: "full", paywall: null,
      blocked: "Hai raggiunto il numero massimo di modifiche per questo viaggio. Puoi crearne uno nuovo.",
    };
  }
  return { mode: "trial", paywall: "not_paid", blocked: null }; // viaggio non pagato da questo utente
}
