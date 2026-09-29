"use client";

/** Legge da /api/billing/status il piano di chi è loggato (crediti, viaggio gratuito, abbonamento). */

import { useCallback, useEffect, useState } from "react";
import { authHeaders } from "./authHeaders";
import type { BillingStatus } from "./billingConfig";

export function useBillingStatus() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status", { headers: await authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("status");
      setStatus((await res.json()) as BillingStatus);
      setFailed(false);
      return true;
    } catch {
      setFailed(true);
      return false;
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return { status, failed, reload };
}

/** Apre la pagina di pagamento (o il portale) di Stripe; restituisce un messaggio se qualcosa non va. */
export async function startStripe(path: "/api/billing/checkout" | "/api/billing/portal", body?: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(path, { method: "POST", headers: await authHeaders(), body: JSON.stringify(body ?? {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) return data.error || "Qualcosa è andato storto. Riprova tra poco.";
    window.location.href = data.url;
    return null;
  } catch {
    return "Connessione assente. Riprova tra poco.";
  }
}
