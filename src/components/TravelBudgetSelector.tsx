"use client";

import { useState } from "react";
import { ELLY_COLORS } from "@/lib/travelData";
import { WalletIcon } from "@/components/EllyIcons";

type Props = {
  people: number;
  initialBudget?: number;
  onSelect: (budgetPerPerson: number) => void;
  onBack: () => void;
};

const C = ELLY_COLORS;

const CHIPS = [
  { label: "Economico", value: 250 },
  { label: "Medio", value: 700 },
  { label: "Confort", value: 1200 },
  { label: "Lusso", value: 2200 },
];

function tierFor(value: number) {
  if (value < 350) return "Economico";
  if (value < 900) return "Medio";
  if (value < 1700) return "Confort";
  return "Lusso";
}

export default function TravelBudgetSelector({ people, initialBudget = 700, onSelect, onBack }: Props) {
  const [budget, setBudget] = useState(initialBudget);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-40">
        <button onClick={onBack} className="text-sm mb-6 block" style={{ color: C.textMuted }}>
          ← indietro
        </button>
        <div
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-4"
          style={{ border: `1.3px solid ${C.border}`, background: C.bgElev, color: C.accent }}
        >
          <WalletIcon size={21} />
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Passo 5 di 5
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Budget a persona</h2>
        <p className="text-sm mb-2 leading-relaxed" style={{ color: C.textMuted }}>
          Per l&apos;intero viaggio, a persona — voli esclusi.
        </p>

        <div className="text-center my-9">
          <div className="text-[40px] font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
            €{budget.toLocaleString("it-IT")}{budget >= 3000 ? "+" : ""}
          </div>
          <div className="text-[12px]" style={{ color: C.textMuted }}>a persona per l&apos;intero viaggio</div>
          <div
            className="inline-block mt-2.5 text-[12px] font-bold px-3.5 py-1 rounded-full"
            style={{ border: `1.3px solid ${C.accent}`, color: C.accent }}
          >
            {tierFor(budget)}
          </div>
        </div>

        <input
          type="range"
          min={100}
          max={3000}
          step={50}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full mb-1.5"
          style={{ height: 4, borderRadius: 999, background: C.border, accentColor: C.accent }}
        />
        <div className="flex justify-between text-[11px] mb-6" style={{ color: "#B0A690" }}>
          <span>€100</span><span>€3000+</span>
        </div>

        <div className="flex gap-2 flex-wrap justify-center mb-2">
          {CHIPS.map((c) => {
            const active = budget === c.value;
            return (
              <button
                key={c.label}
                onClick={() => setBudget(c.value)}
                className="text-[12px] font-semibold px-3.5 py-2 rounded-full"
                style={{
                  background: active ? C.accent : C.bgElev,
                  border: `1.3px solid ${active ? C.accent : C.border}`,
                  color: active ? "#fff" : C.text,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div
          className="mt-6 rounded-xl p-3.5 text-center text-[13px]"
          style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.textMuted }}
        >
          Totale gruppo ({people} persone): <b style={{ color: C.text }}>€{(budget * people).toLocaleString("it-IT")}</b>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-6 pt-4 z-50"
        style={{
          background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)",
        }}
      >
        <button
          onClick={() => onSelect(budget)}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{ background: C.accent, color: "#fff" }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
