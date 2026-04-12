"use client";

import { useState } from "react";
import { MOODS, type Mood } from "@/lib/data";

const MAX_MOODS = 3;

type Props = {
  onSelect: (moodIds: string[]) => void;
};

export default function MoodSelector({ onSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (moodId: string) => {
    setSelected((prev) => {
      if (prev.includes(moodId)) {
        // Deseleziona
        return prev.filter((id) => id !== moodId);
      }
      if (prev.length >= MAX_MOODS) {
        // Già al massimo — non aggiungere
        return prev;
      }
      return [...prev, moodId];
    });
  };

  const canContinue = selected.length >= 1;
  const atMax = selected.length >= MAX_MOODS;

  // Colore accent basato sul primo mood selezionato
  const firstMood = MOODS.find((m) => m.id === selected[0]);
  const accentColor = firstMood?.color ?? "#8B5CF6";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-32">
      {/* Header */}
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 1 di 5
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1 animate-fade-in-up-delay-1">
        Com&apos;è il tuo mood?
      </h2>
      <p className="text-white/40 text-sm mb-2 animate-fade-in-up-delay-2">
        Scegli fino a {MAX_MOODS} mood che senti stasera
      </p>

      {/* Contatore selezione */}
      <div className="mb-6 h-5 animate-fade-in-up-delay-2">
        {selected.length > 0 && (
          <p className="text-xs font-semibold" style={{ color: accentColor }}>
            {selected.length}/{MAX_MOODS} selezionati
            {atMax && " — massimo raggiunto"}
          </p>
        )}
      </div>

      {/* Mood grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[420px]">
        {MOODS.map((mood: Mood, i: number) => {
          const isSelected = selected.includes(mood.id);
          const isDisabled = atMax && !isSelected;

          return (
            <button
              key={mood.id}
              onClick={() => toggle(mood.id)}
              disabled={isDisabled}
              className="group relative rounded-xl p-3 text-left transition-all duration-200
                         hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${mood.color}22, ${mood.color}0a)`
                  : `linear-gradient(135deg, ${mood.color}0d, ${mood.color}04)`,
                border: isSelected
                  ? `1.5px solid ${mood.color}60`
                  : "1px solid rgba(255,255,255,0.06)",
                opacity: isDisabled ? 0.35 : 1,
                animationDelay: `${i * 0.04}s`,
              }}
            >
              {/* Glow se selezionato */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${mood.color}20, transparent 70%)`,
                  }}
                />
              )}

              {/* Checkmark */}
              {isSelected && (
                <div
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold z-20"
                  style={{ background: mood.color, color: "#09090f" }}
                >
                  ✓
                </div>
              )}

              <span className="text-2xl mb-1 block relative z-10">{mood.emoji}</span>
              <span
                className="font-bold text-[11px] block relative z-10 leading-tight"
                style={{ color: mood.color }}
              >
                {mood.label}
              </span>
              <span className="text-white/25 text-[9px] mt-0.5 block relative z-10 leading-snug line-clamp-2">
                {mood.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* CTA fisso in basso */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, #09090f 70%, transparent)" }}
      >
        <button
          onClick={() => canContinue && onSelect(selected)}
          disabled={!canContinue}
          className="w-full max-w-[420px] mx-auto flex items-center justify-center gap-2
                     py-4 rounded-2xl font-bold text-base transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: canContinue
              ? `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`
              : "rgba(255,255,255,0.08)",
            color: canContinue ? "#09090f" : "rgba(255,255,255,0.3)",
            boxShadow: canContinue ? `0 4px 24px ${accentColor}40` : "none",
          }}
        >
          {canContinue
            ? `Continua con ${selected.length === 1 ? "questo mood" : `questi ${selected.length} mood`} →`
            : "Scegli almeno un mood"}
        </button>
      </div>
    </div>
  );
}
