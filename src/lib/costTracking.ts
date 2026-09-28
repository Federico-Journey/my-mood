/**
 * Registrazione dei costi (Claude, Google, e in futuro Vercel/Supabase
 * inseriti a mano) nella tabella "cost_events" — vedi
 * supabase/cost_tracking.sql per lo schema.
 *
 * Principio: registrare un costo non deve MAI bloccare o rallentare la
 * risposta all'utente. Stesso approccio "best effort" già usato per la
 * cache dei luoghi in googlePlaces.ts — se il salvataggio fallisce,
 * logghiamo l'errore e andiamo avanti.
 */

import { supabase } from "./supabase";
import type { GenerationCosts } from "./tripGenerator";

export type CostCenter = "claude" | "google_places" | "vercel" | "supabase" | "altro";

export type LogCostEventInput = {
  tripId?: string | null;
  costCenter: CostCenter;
  description?: string;
  quantity?: number;
  unit?: string;
  amountUsd: number;
  metadata?: Record<string, unknown>;
};

export async function logCostEvent(input: LogCostEventInput): Promise<void> {
  try {
    await supabase.from("cost_events").insert({
      trip_id: input.tripId ?? null,
      cost_center: input.costCenter,
      description: input.description ?? null,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
      amount_usd: input.amountUsd,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.error("[Elly] Errore nel registrare un evento di costo:", err);
  }
}

/**
 * Registra in un colpo solo i costi di una generazione/modifica itinerario:
 * una riga per Claude (sempre) e una per Google (solo se è stata fatta
 * almeno una vera chiamata a pagamento — se tutti i luoghi erano già in
 * cache, il costo Google è zero e non serve registrare nulla).
 *
 * tripId può essere null: succede se il salvataggio del viaggio su Supabase
 * fallisce (vedi le route generate/refine) — il costo va comunque
 * registrato, perché è stato sostenuto lo stesso.
 */
export async function logGenerationCosts(tripId: string | null, costs: GenerationCosts): Promise<void> {
  const events: LogCostEventInput[] = [
    {
      tripId,
      costCenter: "claude",
      description: "Generazione/modifica itinerario",
      quantity: costs.claudeInputTokens + costs.claudeOutputTokens,
      unit: "token",
      amountUsd: costs.claudeCostUsd,
      metadata: { inputTokens: costs.claudeInputTokens, outputTokens: costs.claudeOutputTokens },
    },
  ];

  if (costs.googleNewCalls > 0) {
    events.push({
      tripId,
      costCenter: "google_places",
      description: "Validazione luoghi (Text Search)",
      quantity: costs.googleNewCalls,
      unit: "api_call",
      amountUsd: costs.googleCostUsd,
      metadata: { cachedCalls: costs.googleCachedCalls },
    });
  }

  await Promise.all(events.map((e) => logCostEvent(e)));
}
