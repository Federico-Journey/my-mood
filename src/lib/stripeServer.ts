/** Stripe lato server: client, cerca i prezzi per "lookup key" (creati da scripts/stripe-setup.mjs). */

import Stripe from "stripe";

export const PRICE_LOOKUP = { trip: "elly_trip_single", monthly: "elly_monthly" } as const;

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Manca STRIPE_SECRET_KEY");
  client = new Stripe(key);
  return client;
}

const priceCache = new Map<string, string>();

export async function priceIdFor(lookupKey: string): Promise<string> {
  const hit = priceCache.get(lookupKey);
  if (hit) return hit;
  const list = await getStripe().prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const id = list.data[0]?.id;
  if (!id) throw new Error(`Prezzo "${lookupKey}" non trovato su Stripe: esegui scripts/stripe-setup.mjs`);
  priceCache.set(lookupKey, id);
  return id;
}

export function siteOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
}
