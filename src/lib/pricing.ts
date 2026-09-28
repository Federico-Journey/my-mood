/**
 * Tariffario dei servizi esterni a pagamento usati da Elly — centralizzato
 * qui cosi' quando un prezzo cambia (Anthropic o Google aggiornano le
 * tariffe) va aggiornato in un solo posto, non cercato in giro nel codice.
 *
 * Fonti (verificate il 28/09/2026):
 * - Claude Haiku 4.5: https://www.anthropic.com/pricing — $1 / milione di
 *   token in input, $5 / milione di token in output.
 * - Google Places API (legacy, quella usata da googlePlaces.ts e da
 *   /api/places/photo): https://developers.google.com/maps/billing-and-pricing/pricing
 *   - Text Search: $32 ogni 1000 chiamate (fascia base, fino a 100.000/mese)
 *   - Place Photo: $7 ogni 1000 chiamate (fascia base, fino a 1.000/mese)
 * - Google Maps Static API (usata da /api/trip/staticmap): $2 ogni 1000
 *   chiamate (fascia base, fino a 10.000/mese).
 *
 * Nota: Google applica fasce di sconto a volumi piu' alti (es. Text Search
 * scende a $25,60/1000 sopra i 100.000 al mese). Finche' i volumi di Elly
 * restano sotto quelle soglie, i prezzi "base" qui sotto sono quelli giusti
 * da usare. Da rivedere se il traffico cresce molto.
 *
 * NON ancora coperti da questo tariffario (e quindi non ancora tracciati
 * nei costi): /api/place-photo e /api/venue-photo, che usano le API Google
 * "New Places" e "Find Place"/"Place Details" legacy — endpoint della
 * vecchia sezione "locali/preferiti", non del motore di generazione
 * viaggi. Da aggiungere se restano in uso dopo il pivot a Elly.
 */

// --- Claude (Anthropic) ---------------------------------------------------

/** Prezzo in USD per singolo token, non per milione: più comodo per i calcoli. */
export const CLAUDE_HAIKU_4_5_INPUT_USD_PER_TOKEN = 1 / 1_000_000;
export const CLAUDE_HAIKU_4_5_OUTPUT_USD_PER_TOKEN = 5 / 1_000_000;

export function claudeCostUsd(inputTokens: number, outputTokens: number): number {
  return (
    inputTokens * CLAUDE_HAIKU_4_5_INPUT_USD_PER_TOKEN +
    outputTokens * CLAUDE_HAIKU_4_5_OUTPUT_USD_PER_TOKEN
  );
}

// --- Google Places (legacy API) -------------------------------------------

export const GOOGLE_TEXT_SEARCH_USD_PER_CALL = 32 / 1000;
export const GOOGLE_PLACE_PHOTO_USD_PER_CALL = 7 / 1000;

// --- Google Maps Static API -------------------------------------------

export const GOOGLE_STATIC_MAP_USD_PER_CALL = 2 / 1000;

// --- Conversione valuta (solo per il modulo di inserimento manuale) -------

/**
 * Cambio EUR->USD approssimativo, per convertire in USD (la valuta unica
 * usata in cost_events/revenue_events) i costi/ricavi che su fattura sono
 * in euro (es. canone Vercel/Supabase se addebitato in EUR, incassi da
 * clienti italiani). E' una stima arrotondata, non un tasso in tempo reale:
 * va bene per capire l'ordine di grandezza dei costi, non per contabilita'
 * o fisco. Aggiorna questo numero ogni tanto se il cambio si muove molto.
 */
export const EUR_TO_USD_RATE = 1.08;
