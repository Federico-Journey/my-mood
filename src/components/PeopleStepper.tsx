"use client";

import { useState } from "react";
import { ELLY_COLORS } from "@/lib/travelData";
import { UsersIcon } from "@/components/EllyIcons";

type Props = {
  initialPeople?: number;
  onSelect: (people: number) => void;
  onBack: () => void;
};

const C = ELLY_COLORS;

function hintFor(people: number) {
  if (people === 1) return "In solitaria";
  if (people === 2) return "In coppia";
  if (people <= 4) return "Piccolo gruppo";
  if (people <= 8) return "Gruppo numeroso";
  return "Grande gruppo";
}

export default function PeopleStepper({ initialPeople = 2, onSelect, onBack }: Props) {
  const [people, setPeople] = useState(initialPeople);
  const change = (delta: number) => setPeople((p) => Math.max(1, Math.min(16, p + delta)));

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
          <UsersIcon size={21} />
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Passo 2 di 5
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Con quante persone parti?
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>
          Un&apos;idea di massima, per calcolare l&apos;itinerario e il budget.
        </p>

        <div className="flex items-center justify-center gap-8 my-10">
          <button
            onClick={() => change(-1)}
            disabled={people <= 1}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold disabled:opacity-35"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
          >
            –
          </button>
          <div className="text-[48px] font-semibold min-w-[80px] text-center" style={{ fontFamily: "'Fraunces', serif" }}>{people}</div>
          <button
            onClick={() => change(1)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
          >
            +
          </button>
        </div>
        <p className="text-center text-[13px] mb-8" style={{ color: C.textMuted }}>{hintFor(people)}</p>

        <div
          className="rounded-xl p-4 flex gap-3 items-start text-[13px] leading-relaxed"
          style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.textMuted }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: C.accent, marginTop: 1, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5l3 2" />
          </svg>
          <span>Potrai invitare le persone e far votare l&apos;itinerario più avanti — qui basta il numero.</span>
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
          onClick={() => onSelect(people)}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{ background: C.accent, color: "#fff" }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
