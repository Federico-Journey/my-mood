"use client";

import { useState } from "react";
import Link from "next/link";
import { ELLY_COLORS } from "@/lib/travelData";
import { fullSource } from "@/lib/billingConfig";
import type { LoggedBilling } from "@/lib/billingConfig";

type Props = {
  billing: LoggedBilling;
  initialChoice: "full" | "base";
  onContinue: (choice: "full" | "base") => void;
};

const C = ELLY_COLORS;

export default function TripModeChoice({ billing, initialChoice, onContinue }: Props) {
  const source = fullSource(billing);
  const [pick, setPick] = useState<"full" | "base">(source ? initialChoice : "base");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-40">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-[13px] font-semibold" style={{ color: C.textMuted }}>
            ← Home
          </Link>
          <Link href="/prezzi" className="text-[12.5px] font-semibold" style={{ color: C.textMuted }}>
            Vedi i prezzi
          </Link>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Prima di iniziare
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Che viaggio generiamo?
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>
          {source
            ? "Scegli ora: lo decidiamo prima di chiederti i dettagli del viaggio."
            : "Non hai viaggi completi disponibili in questo momento: puoi comunque generare la versione base gratuita."}
        </p>

        <div className="grid gap-2.5" role="radiogroup" aria-label="Tipo di viaggio">
          {(
            [
              [
                "full",
                "Viaggio completo",
                source
                  ? `Luoghi verificati su Google Maps, foto e modifiche incluse. ${source}.`
                  : "Nessun viaggio disponibile al momento: acquistane uno o abbonati.",
                !source,
              ],
              [
                "base",
                "Versione base · gratis",
                "Luoghi dal nostro archivio aperto, non verificati. Non usa i tuoi viaggi disponibili.",
                false,
              ],
            ] as const
          ).map(([key, title, text, disabled]) => {
            const on = pick === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={on}
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => !disabled && setPick(key)}
                className="text-left rounded-2xl p-4 flex gap-3 items-start"
                style={{
                  background: on ? C.accentSoft : C.bgElev,
                  border: `1.5px solid ${on ? C.accent : C.border}`,
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
                  style={{ border: `1.8px solid ${on ? C.accent : C.border}` }}
                >
                  {on && <span className="w-[9px] h-[9px] rounded-full" style={{ background: C.accent }} />}
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold">{title}</span>
                  <span className="block text-[12.5px] leading-snug mt-0.5" style={{ color: C.textMuted }}>{text}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[12.5px] leading-relaxed" style={{ color: C.textMuted }}>
          Il tuo saldo: {billing.free_left > 0 ? "1 viaggio gratuito" : "nessun viaggio gratuito rimasto"}
          {" · "}
          {billing.credits > 0 ? `${billing.credits} ${billing.credits === 1 ? "viaggio acquistato" : "viaggi acquistati"}` : "nessun viaggio acquistato"}
          {billing.subscription?.active && (
            <> · abbonamento attivo, {Math.max(0, billing.limits.monthly - billing.subscription.used_month)} viaggi rimasti questo mese</>
          )}
        </p>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-6 pt-4 z-50"
        style={{
          background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)",
        }}
      >
        <button
          onClick={() => onContinue(pick)}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{ background: C.accent, color: "#fff" }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
