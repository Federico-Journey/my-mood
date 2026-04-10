"use client";

import { MOODS, type Mood } from "@/lib/data";

type Props = {
  onSelect: (moodId: string) => void;
};

export default function MoodSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      {/* Header */}
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 1 di 3
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1 animate-fade-in-up-delay-1">
        Com&apos;è il tuo mood?
      </h2>
      <p className="text-white/40 text-sm mb-8 animate-fade-in-up-delay-2">
        Scegli come ti senti stasera
      </p>

      {/* Mood grid — 3 colonne compatte */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[420px]">
        {MOODS.map((mood: Mood, i: number) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className="group relative rounded-xl p-3 text-left transition-all duration-200
                       border border-white/[0.06] hover:border-white/20
                       hover:scale-[1.04] active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg, ${mood.color}0d, ${mood.color}04)`,
              animationDelay: `${i * 0.04}s`,
            }}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${mood.color}18, transparent 70%)`,
              }}
            />

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
        ))}
      </div>

      {/* Padding bottom per scroll */}
      <div className="h-8" />
    </div>
  );
}
