"use client";

import { BUDGETS, type Budget } from "@/lib/data";

type Props = {
  accentColor: string;
  onSelect: (budgetId: string) => void;
  onBack: () => void;
};

export default function BudgetSelector({ accentColor, onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 3 di 3
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 animate-fade-in-up-delay-1">
        Budget?
      </h2>
      <p className="text-white/40 text-sm mb-10 animate-fade-in-up-delay-2">
        Quanto vuoi spendere a testa
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
        {BUDGETS.map((b: Budget, i: number) => (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className="group rounded-2xl p-6 text-center transition-all duration-200
                       border border-white/[0.06] hover:border-white/15
                       hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}06, transparent)`,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <span
              className="text-2xl font-extrabold block mb-1"
              style={{ color: accentColor }}
            >
              {b.label}
            </span>
            <span className="text-white/35 text-xs">{b.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-white/30 text-sm hover:text-white/60 transition-colors"
      >
        ← Cambia compagnia
      </button>
    </div>
  );
}
