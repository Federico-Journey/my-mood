/**
 * Client Supabase con la chiave "service_role": può fare tutto, saltando le regole RLS.
 * SOLO lato server e SOLO per i pagamenti (crediti, abbonamenti): non importarlo mai in
 * un componente "use client" e non stampare mai la chiave.
 *
 * I pagamenti sono attivi solo con BILLING_ENABLED=true e la chiave presente: finché non
 * lo sono, l'app si comporta come prima (chi ha fatto l'accesso ha viaggi completi).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function billingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true" && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Manca SUPABASE_SERVICE_ROLE_KEY");
  cached = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return cached;
}
