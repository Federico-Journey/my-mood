"use client";

import { MOODS, type Mood } from "@/lib/data";

type Props = {
  onSelect: (moodId: string) => void;
};

export default function MoodSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      {/* Header */}
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 1 di 3
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 animate-fade-in-up-delay-1">
        Com&apos;è il tuo mood?
      </h2>
      <p className="text-white/40 text-sm mb-10 animate-fade-in-up-delay-2">
        Scegli come ti senti stasera
      </p>

      {/* Mood grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
        {MOODS.map((mood: Mood, i: number) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className="group relative rounded-2xl p-5 text-left transition-all duration-200
                       border border-white/[0.06] hover:border-white/20
                       hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${mood.color}08, ${mood.color}03)`,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${mood.color}15, transparent 70%)`,
              }}
            />

            <span className="text-3xl mb-2 block relative z-10">{mood.emoji}</span>
            <span
              className="font-bold text-sm block relative z-10"
              style={{ color: mood.color }}
            >
              {mood.label}
            </span>
            <span className="text-white/30 text-[11px] mt-1 block relative z-10 leading-snug">
              {mood.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
