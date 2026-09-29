"use client";

/**
 * Piani e prezzi: viaggio singolo e abbonamento mensile, con le regole dell'uso equo
 * spiegate in chiaro. L'acquisto passa da Stripe (Checkout); i pagamenti sono attivi
 * solo quando BILLING_ENABLED=true (altrimenti la pagina mostra i prezzi "in arrivo").
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ELLY_COLORS } from "@/lib/travelData";
import { DEFAULT_LIMITS, PRICES, eur } from "@/lib/billingConfig";
import { startStripe, useBillingStatus } from "@/lib/useBillingStatus";
import AppPage from "@/components/AppPage";

const C = ELLY_COLORS;

function PrezziInner() {
  const params = useSearchParams();
  const { status, failed } = useBillingStatus();
  const [busy, setBusy] = useState<"trip" | "monthly" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enabled = status?.enabled === true;
  const loggedIn = status?.enabled === true && status.loggedIn === true;
  const limits = loggedIn && status.loggedIn ? status.limits : DEFAULT_LIMITS;
  const hasSub = loggedIn && status.loggedIn && !!status.subscription?.active;
  const subFailed = loggedIn && status.loggedIn && !!status.subscription && ["past_due", "unpaid"].includes(status.subscription.status);

  const buy = async (plan: "trip" | "monthly") => {
    setBusy(plan);
    setError(null);
    const msg = await startStripe("/api/billing/checkout", { plan });
    if (msg) { setError(msg); setBusy(null); }
  };

  const cta = (plan: "trip" | "monthly", label: string, primary: boolean) => {
    const style = primary
      ? { background: C.accent, color: "#fff" }
      : { background: C.bg, border: `1.3px solid ${C.border}`, color: C.text };
    const cls = "w-full py-3 rounded-xl font-bold text-[14px] text-center block";
    if (!enabled) return <div className={cls} style={{ background: C.disabledBg, color: C.disabledText }}>In arrivo</div>;
    if (!loggedIn) return <Link href="/auth?redirect=/prezzi" className={cls} style={style}>Accedi per acquistare</Link>;
    if (plan === "monthly" && subFailed) return <Link href="/profilo" className={cls} style={style}>Aggiorna il pagamento</Link>;
    if (plan === "monthly" && hasSub) return <div className={cls} style={{ background: C.disabledBg, color: C.disabledText }}>Già attivo</div>;
    return (
      <button onClick={() => buy(plan)} disabled={busy !== null} className={cls} style={{ ...style, opacity: busy ? 0.6 : 1 }}>
        {busy === plan ? "Apro il pagamento…" : label}
      </button>
    );
  };

  return (
    <AppPage>
      <div className="pt-8">
        <h1 className="text-[26px] font-medium leading-tight mb-2">Piani e prezzi</h1>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: C.textMuted }}>
          Un itinerario completo ha luoghi verificati su Google Maps, foto e link per orientarti. Il primo viaggio è gratis
          quando ti registri.
        </p>

        {params.get("pagamento") === "annullato" && (
          <p className="text-[13px] rounded-xl px-4 py-3 mb-4" style={{ background: C.accentSoft, color: C.text }}>
            Pagamento annullato: non ti è stato addebitato nulla.
          </p>
        )}
        {failed && (
          <p className="text-[13px] mb-4" style={{ color: C.accent }}>Non riesco a leggere il tuo piano in questo momento.</p>
        )}

        <div className="rounded-2xl p-5 mb-3.5" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>Viaggio singolo</h2>
            <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{eur(PRICES.tripEur)}</div>
          </div>
          <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: C.textMuted }}>
            Un itinerario completo, giorno per giorno. Le modifiche e le rigenerazioni dello stesso viaggio sono incluse. Puoi
            comprarne più di uno insieme; non scadono.
          </p>
          {cta("trip", "Acquista un viaggio", false)}
        </div>

        <div className="rounded-2xl p-5 mb-3.5" style={{ background: C.bgElev, border: `2px solid ${C.accent}` }}>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>Mensile</h2>
            <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
              {eur(PRICES.monthlyEur)}<span className="text-[13px] font-normal" style={{ color: C.textMuted }}> /mese</span>
            </div>
          </div>
          <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: C.textMuted }}>
            Per chi viaggia spesso: fino a {limits.monthly} nuovi viaggi al mese con luoghi verificati, modifiche incluse.
            Si rinnova ogni mese e lo disdici quando vuoi.
          </p>
          {cta("monthly", "Abbonati", true)}
        </div>

        {error && <p className="text-[13px] mb-3" style={{ color: C.accent }}>{error}</p>}

        <div className="rounded-2xl p-5 mb-3.5" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <h2 className="text-[15px] font-semibold mb-1.5">Senza pagare</h2>
          <p className="text-[13.5px] leading-relaxed" style={{ color: C.textMuted }}>
            Puoi sempre usare la versione di prova: itinerari costruiti con luoghi del nostro archivio aperto, senza verifica
            su Google Maps e con meno mete disponibili.
          </p>
        </div>

        <details className="rounded-2xl px-5 py-4 mb-3.5" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <summary className="cursor-pointer text-[14px] font-semibold">Come funziona l&apos;uso equo del mensile</summary>
          <ul className="list-disc pl-5 mt-3 text-[13px] leading-relaxed space-y-1.5" style={{ color: C.textMuted }}>
            <li>Fino a <strong style={{ color: C.text }}>{limits.monthly} nuovi viaggi</strong> per ogni periodo di abbonamento; il conteggio riparte al rinnovo.</li>
            <li>Fino a <strong style={{ color: C.text }}>{limits.daily} nuovi viaggi al giorno</strong>.</li>
            <li>Modifiche allo stesso viaggio illimitate nell&apos;uso normale, con un tetto tecnico di {limits.refinements} per viaggio.</li>
            <li>Uso personale: l&apos;account non si condivide né si rivende.</li>
            <li>Se raggiungi il limite mensile puoi comunque comprare viaggi singoli o aspettare il rinnovo.</li>
          </ul>
        </details>

        <p className="text-[12px] leading-relaxed" style={{ color: C.textMuted }}>
          Prezzi in euro, tasse incluse. I pagamenti sono gestiti da Stripe: i dati della carta non passano da noi. Per i
          contenuti digitali vale quanto indicato nei <Link href="/terms" className="underline">Termini di servizio</Link>.
        </p>
      </div>
    </AppPage>
  );
}

export default function PrezziPage() {
  return (
    <Suspense fallback={null}>
      <PrezziInner />
    </Suspense>
  );
}
