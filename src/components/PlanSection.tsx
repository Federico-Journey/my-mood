"use client";

/** Sezione "Piano e viaggi" del Profilo: viaggi disponibili, abbonamento, acquisti e portale Stripe. */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ELLY_COLORS } from "@/lib/travelData";
import { startStripe, useBillingStatus } from "@/lib/useBillingStatus";
import { ListRow, ListSection } from "@/components/SettingsList";

const C = ELLY_COLORS;

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function PlanSection() {
  const { status, reload } = useBillingStatus();
  const params = useSearchParams();
  const justPaid = params.get("pagamento") === "ok";
  const [waiting, setWaiting] = useState(justPaid);
  const [error, setError] = useState<string | null>(null);

  // Dopo il pagamento Stripe avvisa l'app con qualche secondo di ritardo: riproviamo a leggere il saldo.
  useEffect(() => {
    if (!justPaid) return;
    let tries = 0;
    const t = setInterval(async () => {
      tries += 1;
      await reload();
      if (tries >= 6) { clearInterval(t); setWaiting(false); }
    }, 2500);
    return () => clearInterval(t);
  }, [justPaid, reload]);

  if (!status) return null;

  // Pagamenti non ancora attivi: solo il rimando ai prezzi.
  if (!status.enabled || !status.loggedIn) {
    return (
      <ListSection title="Piano e viaggi">
        <ListRow first label="Piani e prezzi" href="/prezzi" />
      </ListSection>
    );
  }

  const sub = status.subscription;
  const subText = sub?.active
    ? sub.cancel_at_period_end ? `Termina il ${fmtDate(sub.period_end)}` : `Attivo · rinnovo il ${fmtDate(sub.period_end)}`
    : "Non attivo";

  const openPortal = async () => {
    setError(null);
    const msg = await startStripe("/api/billing/portal");
    if (msg) setError(msg);
  };

  return (
    <>
      {justPaid && (
        <p className="text-[13px] rounded-xl px-4 py-3 mt-5" style={{ background: C.accentSoft, color: C.text }}>
          {waiting ? "Pagamento ricevuto: aggiorno il tuo saldo…" : "Grazie! Il tuo piano è aggiornato."}
        </p>
      )}
      <ListSection title="Piano e viaggi">
        <ListRow first label="Viaggio gratuito" value={status.free_left > 0 ? "Disponibile" : "Già usato"} />
        <ListRow label="Viaggi acquistati" value={String(status.credits)} />
        <ListRow label="Abbonamento" value={subText} />
        {sub?.active && (
          <ListRow label="Usati in questo periodo" value={`${sub.used_month} di ${status.limits.monthly}`} />
        )}
        <ListRow label="Piani e prezzi" href="/prezzi" />
        {status.has_customer && <ListRow label="Gestisci abbonamento e ricevute" onClick={openPortal} />}
      </ListSection>
      {error && <p className="text-[12.5px] mt-2 px-1" style={{ color: C.accent }}>{error}</p>}
    </>
  );
}
