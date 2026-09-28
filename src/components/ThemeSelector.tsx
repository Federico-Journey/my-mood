"use client";

import { useState } from "react";
import { TRAVEL_THEMES, ELLY_COLORS, type Theme } from "@/lib/travelData";
import { CheckIcon } from "@/components/EllyIcons";

const MAX_THEMES = 3;
const C = ELLY_COLORS;

type Props = {
  onSelect: (themeIds: string[]) => void;
  onBack: () => void;
};

export default function ThemeSelector({ onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_THEMES) return prev;
      return [...prev, id];
    });
  };

  const canContinue = selected.length >= 1;
  const atMax = selected.length >= MAX_THEMES;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-40">
        <button onClick={onBack} className="text-sm mb-6 block" style={{ color: C.textMuted }}>
          ← indietro
        </button>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Passo 4 di 5
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>Che mood ha questo viaggio?</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: C.textMuted }}>
          Scegli fino a {MAX_THEMES} temi — definiscono lo stile dell&apos;itinerario.
        </p>

        <div className="flex flex-col gap-2.5">
          {TRAVEL_THEMES.map((theme: Theme) => {
            const isSelected = selected.includes(theme.id);
            const isDisabled = atMax && !isSelected;
            return (
              <button
                key={theme.id}
                onClick={() => toggle(theme.id)}
                disabled={isDisabled}
                className="relative rounded-xl px-4 py-3.5 text-left flex items-center gap-3.5 transition-colors"
                style={{
                  background: isSelected ? C.accentSoft : C.bgElev,
                  border: `1.3px solid ${isSelected ? C.accent : C.border}`,
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[14.5px] block leading-tight">{theme.label}</span>
                  <span className="text-[12px] mt-0.5 block leading-snug" style={{ color: C.textMuted }}>
                    {theme.desc}
                  </span>
                </div>
                <div
                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                  style={{
                    background: isSelected ? C.accent : "transparent",
                    border: isSelected ? "none" : `1.3px solid ${C.border}`,
                    color: "#fff",
                  }}
                >
                  {isSelected && <CheckIcon size={11} />}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-center text-[12px] mt-3.5" style={{ color: C.textMuted }}>
          Puoi selezionarne massimo {MAX_THEMES}
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
          onClick={() => canContinue && onSelect(selected)}
          disabled={!canContinue}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{
            background: canContinue ? C.accent : C.disabledBg,
            color: canContinue ? "#fff" : C.disabledText,
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
