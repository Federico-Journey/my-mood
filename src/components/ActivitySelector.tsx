"use client";

export type ActivityMode =
  | "aperitivo"
  | "cena"
  | "aperitivo_cena"
  | "cena_dopocena"
  | "serata_completa"
  | "ballare"
  | "outdoor"
  | "cultura";

const ACTIVITIES: {
  id: ActivityMode;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    id: "aperitivo",
    emoji: "🥂",
    label: "Solo aperitivo",
    desc: "Un drink, qualche stuzzichino, basta così",
  },
  {
    id: "cena",
    emoji: "🍽️",
    label: "Solo cena",
    desc: "Voglio mangiare bene, punto",
  },
  {
    id: "aperitivo_cena",
    emoji: "🍷",
    label: "Aperitivo + cena",
    desc: "Il classico milanese",
  },
  {
    id: "cena_dopocena",
    emoji: "🍸",
    label: "Cena + dopocena",
    desc: "Si mangia e poi si continua",
  },
  {
    id: "serata_completa",
    emoji: "🌟",
    label: "Serata completa",
    desc: "Dal tramonto a mezzanotte",
  },
  {
    id: "ballare",
    emoji: "💃",
    label: "Voglio ballare",
    desc: "Cena veloce e poi in pista",
  },
  {
    id: "outdoor",
    emoji: "🌿",
    label: "Aria aperta",
    desc: "Parco, navigli, qualcosa fuori",
  },
  {
    id: "cultura",
    emoji: "🎭",
    label: "Cultura & cena",
    desc: "Museo, teatro o cinema, poi si mangia",
  },
];

type Props = {
  accentColor: string;
  onSelect: (activity: ActivityMode) => void;
  onBack: () => void;
};

export default function ActivitySelector({ accentColor, onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 4 di 5
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 animate-fade-in-up-delay-1">
        Cosa vuoi fare?
      </h2>
      <p className="text-white/40 text-sm mb-10 animate-fade-in-up-delay-2">
        Il piano si adatta alla tua serata
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[420px]">
        {ACTIVITIES.map((a, i) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className="group rounded-2xl p-4 text-left transition-all duration-200
                       border border-white/[0.06] hover:border-white/15
                       hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <span className="text-2xl block mb-2">{a.emoji}</span>
            <span
              className="text-sm font-bold block mb-1"
              style={{ color: accentColor }}
            >
              {a.label}
            </span>
            <span className="text-white/35 text-xs leading-tight block">
              {a.desc}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-white/30 text-sm hover:text-white/60 transition-colors"
      >
        ← Cambia budget
      </button>
    </div>
  );
}
