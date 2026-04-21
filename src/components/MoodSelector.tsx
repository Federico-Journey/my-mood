"use client";

import { useState } from "react";
import { MOODS, type Mood } from "@/lib/data";

// Stelle fisse per l'header cosmico (no Math.random → safe per SSR)
const HEADER_STARS = [
  { x: 6,  y: 16, s: 1,   o: 0.45, d: 3.4, dl: 0   },
  { x: 22, y:  8, s: 1.5, o: 0.55, d: 4.2, dl: 0.7 },
  { x: 45, y: 12, s: 1,   o: 0.35, d: 2.9, dl: 1.3 },
  { x: 68, y:  6, s: 2,   o: 0.3,  d: 5.1, dl: 0.4 },
  { x: 82, y: 20, s: 1,   o: 0.5,  d: 3.7, dl: 1.9 },
  { x: 93, y: 10, s: 1.5, o: 0.4,  d: 4.5, dl: 0.9 },
  { x: 35, y: 22, s: 1,   o: 0.3,  d: 3.1, dl: 2.1 },
];

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
    <div className="min-h-screen flex flex-col items-center px-4 pb-48">
      {/* ── Header cosmico ──────────────────────────────────────── */}
      <div className="w-full relative overflow-hidden pt-12 pb-4 flex flex-col items-center">
        {/* Glow della luna */}
        <div
          style={{
            position: "absolute",
            top: -50,
            left: "50%",
            transform: "translateX(-50%)",
            width: "320px",
            height: "220px",
            background: `radial-gradient(ellipse at top, ${accentColor}1e 0%, ${accentColor}08 40%, transparent 70%)`,
            pointerEvents: "none",
            transition: "background 0.5s",
          }}
        />
        {/* Stelle */}
        {HEADER_STARS.map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}px`,
              width: `${star.s}px`,
              height: `${star.s}px`,
              borderRadius: "50%",
              background: "white",
              opacity: star.o,
              animation: `twinkle ${star.d}s ease-in-out ${star.dl}s infinite alternate`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Wordmark */}
        <div className="flex items-center gap-1.5 mb-4 animate-fade-in-up" style={{ position: "relative" }}>
          <span style={{ fontSize: "14px" }}>🌙</span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
            }}
          >
            my mood
          </span>
        </div>

        {/* Step indicator */}
        <p className="text-white/35 text-[10px] tracking-[2px] uppercase font-semibold mb-2 animate-fade-in-up" style={{ position: "relative" }}>
          step 1 di 5
        </p>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1 animate-fade-in-up-delay-1 text-center" style={{ position: "relative" }}>
          Com&apos;è il tuo mood?
        </h2>
        <p className="text-white/40 text-sm mb-2 animate-fade-in-up-delay-2 text-center" style={{ position: "relative" }}>
          Scegli fino a {MAX_MOODS} mood che senti stasera
        </p>
      </div>

      {/* Contatore selezione */}
      <div className="mb-4 h-5 animate-fade-in-up-delay-2">
        {selected.length > 0 && (
          <p className="text-xs font-semibold" style={{ color: accentColor }}>
            {selected.length}/{MAX_MOODS} selezionati
            {atMax && " — massimo raggiunto"}
          </p>
        )}
      </div>

      {/* Mood list */}
      <div className="flex flex-col gap-2.5 w-full max-w-[420px]">
        {MOODS.map((mood: Mood, i: number) => {
          const isSelected = selected.includes(mood.id);
          const isDisabled = atMax && !isSelected;

          return (
            <button
              key={mood.id}
              onClick={() => toggle(mood.id)}
              disabled={isDisabled}
              className="group relative rounded-2xl px-4 py-3.5 text-left transition-all duration-200
                         hover:scale-[1.015] active:scale-[0.98] flex items-center gap-4"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${mood.color}22, ${mood.color}0a)`
                  : `linear-gradient(135deg, ${mood.color}0d, ${mood.color}04)`,
                border: isSelected
                  ? `1.5px solid ${mood.color}60`
                  : "1px solid rgba(255,255,255,0.07)",
                opacity: isDisabled ? 0.35 : 1,
                animationDelay: `${i * 0.04}s`,
              }}
            >
              {/* Glow se selezionato */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 20% 50%, ${mood.color}18, transparent 65%)`,
                  }}
                />
              )}

              {/* Emoji */}
              <span className="text-3xl shrink-0 relative z-10">{mood.emoji}</span>

              {/* Testo */}
              <div className="flex-1 min-w-0 relative z-10">
                <span
                  className="font-bold text-[15px] block leading-tight"
                  style={{ color: mood.color }}
                >
                  {mood.label}
                </span>
                <span className="text-white/35 text-[12px] mt-0.5 block leading-snug">
                  {mood.desc}
                </span>
              </div>

              {/* Checkmark */}
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 relative z-10"
                style={{
                  background: isSelected ? mood.color : "rgba(255,255,255,0.06)",
                  border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                }}
              >
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#09090f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA fisso in basso — pb-24 per stare sopra la NavBar (h-16 = 64px + safe area) */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pt-4 z-50"
        style={{
          background: "linear-gradient(to top, #09090f 70%, transparent)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
        }}
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
