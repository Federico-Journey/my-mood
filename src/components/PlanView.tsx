"use client";

import { MOODS, STEP_TYPE_COLORS, type Plan } from "@/lib/data";

type Props = {
  plan: Plan;
  mood: string;
  accentColor: string;
  visibleSteps: number[];
  onRegenerate: () => void;
  onNewMood: () => void;
  onShare: () => void;
};

export default function PlanView({
  plan,
  mood,
  accentColor,
  visibleSteps,
  onRegenerate,
  onNewMood,
  onShare,
}: Props) {
  const selectedMood = MOODS.find((m) => m.id === mood);

  return (
    <div className="min-h-screen px-5 py-10 max-w-[500px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm">{"\u{1F319}"}</span>
          <span className="text-white/35 text-[10px] tracking-[3px] uppercase font-bold">
            my mood
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          {plan.title}
        </h1>
        <p className="text-white/40 text-sm mb-4">{plan.subtitle}</p>

        {/* Mood + City tags */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold"
            style={{
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
              color: accentColor,
            }}
          >
            {selectedMood?.emoji} {selectedMood?.label}
          </span>
          <span className="rounded-full px-3 py-1 text-[11px] text-white/45 bg-white/5 border border-white/10">
            {"\u{1F4CD}"} Milano
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative ml-6 border-l border-white/[0.06] pl-8">
        {plan.steps.map((step, i) => {
          const typeColor = STEP_TYPE_COLORS[step.type] || accentColor;
          const isVisible = visibleSteps.includes(i);

          return (
            <div
              key={i}
              className="relative mb-8 last:mb-0 transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
              }}
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-[41px] w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: typeColor,
                  background: `${typeColor}30`,
                  boxShadow: `0 0 12px ${typeColor}40`,
                }}
              />

              {/* Time badge */}
              <span
                className="text-xs font-bold mb-3 inline-block"
                style={{ color: typeColor }}
              >
                {step.time}
              </span>

              {/* Card */}
              <div
                className="rounded-2xl p-5 border border-white/[0.06]"
                style={{
                  background: `linear-gradient(135deg, ${typeColor}08, transparent)`,
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{
                      background: `${typeColor}12`,
                      border: `1px solid ${typeColor}22`,
                    }}
                  >
                    {step.img}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base">{step.name}</h3>
                    <p className="text-white/30 text-xs">
                      {"\u{1F4CD}"} {step.address}
                    </p>
                  </div>
                </div>

                <p className="text-white/45 text-sm leading-relaxed mb-3">
                  {step.desc}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-white/5 rounded-lg px-2.5 py-1 text-white/35 text-[11px]">
                    {"\u{1F552}"} {step.duration}
                  </span>
                  <span className="bg-white/5 rounded-lg px-2.5 py-1 text-white/35 text-[11px]">
                    {"\u{1F4B0}"} {step.price}
                  </span>
                </div>

                {/* Tip */}
                <div
                  className="rounded-xl px-3 py-2.5 text-[12px] leading-relaxed"
                  style={{
                    background: `${typeColor}08`,
                    border: `1px solid ${typeColor}12`,
                    color: `${typeColor}cc`,
                  }}
                >
                  {"\u{1F4A1}"} <span className="font-semibold">Tip:</span> {step.tip}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-10 flex flex-col gap-3 max-w-[380px] mx-auto">
        {/* Share button */}
        <button
          onClick={onShare}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
            boxShadow: `0 4px 24px ${accentColor}30`,
          }}
        >
          {"\u{1F4E4}"} Condividi con gli amici
        </button>

        {/* Regenerate */}
        <button
          onClick={onRegenerate}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white/60
                     bg-white/5 border border-white/10
                     hover:bg-white/10 hover:text-white/80 transition-all"
        >
          {"\u{1F504}"} Rigenera piano
        </button>

        {/* New mood */}
        <button
          onClick={onNewMood}
          className="w-full py-3 text-white/30 text-sm hover:text-white/60 transition-colors"
        >
          {"\u{1F319}"} Nuovo Mood
        </button>
      </div>
    </div>
  );
}
