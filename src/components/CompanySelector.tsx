"use client";

import { COMPANIES, type Company } from "@/lib/data";

type Props = {
  accentColor: string;
  onSelect: (companyId: string) => void;
  onBack: () => void;
};

export default function CompanySelector({ accentColor, onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 2 di 3
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 animate-fade-in-up-delay-1">
        Con chi esci?
      </h2>
      <p className="text-white/40 text-sm mb-10 animate-fade-in-up-delay-2">
        Il piano si adatta alla compagnia
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[380px]">
        {COMPANIES.map((c: Company, i: number) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-200
                       border border-white/[0.06] hover:border-white/15
                       hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}06, transparent)`,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-white font-bold text-base">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-8 text-white/30 text-sm hover:text-white/60 transition-colors"
      >
        ← Cambia mood
      </button>
    </div>
  );
}
