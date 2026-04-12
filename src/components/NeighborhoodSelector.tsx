"use client";

export type NeighborhoodId =
  | "navigli"
  | "brera"
  | "porta_venezia"
  | "isola"
  | "porta_nuova"
  | "centro"
  | "porta_romana"
  | "sempione"
  | "anywhere";

const NEIGHBORHOODS: {
  id: NeighborhoodId;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    id: "anywhere",
    emoji: "🗺️",
    label: "Ovunque",
    desc: "Sorprendimi, non importa la zona",
  },
  {
    id: "navigli",
    emoji: "🌊",
    label: "Navigli",
    desc: "Canali, aperitivi e movida autentica",
  },
  {
    id: "brera",
    emoji: "🎨",
    label: "Brera",
    desc: "Gallerie, vicoli e cocktail bar raffinati",
  },
  {
    id: "porta_venezia",
    emoji: "🌺",
    label: "Porta Venezia",
    desc: "Vivace, multiculturale, sempre piena di vita",
  },
  {
    id: "isola",
    emoji: "🌿",
    label: "Isola",
    desc: "Il quartiere cool, tra Garibaldi e i murales",
  },
  {
    id: "porta_nuova",
    emoji: "🏙️",
    label: "Porta Nuova",
    desc: "Moderno, cosmopolita, skyline milanese",
  },
  {
    id: "centro",
    emoji: "🏛️",
    label: "Centro / Duomo",
    desc: "Il cuore storico della città",
  },
  {
    id: "porta_romana",
    emoji: "🎭",
    label: "Porta Romana",
    desc: "Trendy, tranquillo, sempre sorprendente",
  },
  {
    id: "sempione",
    emoji: "🌳",
    label: "Sempione",
    desc: "Intorno al parco, tra CityLife e Arco della Pace",
  },
];

type Props = {
  accentColor: string;
  onSelect: (neighborhood: NeighborhoodId) => void;
  onBack: () => void;
};

export default function NeighborhoodSelector({
  accentColor,
  onSelect,
  onBack,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-2 animate-fade-in-up">
        step 5 di 5
      </p>
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 animate-fade-in-up-delay-1">
        Che zona?
      </h2>
      <p className="text-white/40 text-sm mb-10 animate-fade-in-up-delay-2">
        Il piano rimane tutto nello stesso quartiere
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[420px]">
        {/* "Ovunque" occupa tutta la larghezza */}
        <button
          onClick={() => onSelect("anywhere")}
          className="col-span-2 group rounded-2xl p-4 text-left transition-all duration-200
                     border border-white/[0.08] hover:border-white/20
                     hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}04)`,
          }}
        >
          <span className="text-3xl">🗺️</span>
          <div>
            <span
              className="text-sm font-bold block"
              style={{ color: accentColor }}
            >
              Ovunque a Milano
            </span>
            <span className="text-white/40 text-xs">
              Sorprendimi — non importa la zona
            </span>
          </div>
        </button>

        {/* Le altre zone in griglia 2 colonne */}
        {NEIGHBORHOODS.filter((n) => n.id !== "anywhere").map((n, i) => (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className="group rounded-2xl p-4 text-left transition-all duration-200
                       border border-white/[0.06] hover:border-white/15
                       hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}06, transparent)`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <span className="text-2xl block mb-2">{n.emoji}</span>
            <span
              className="text-sm font-bold block mb-1"
              style={{ color: accentColor }}
            >
              {n.label}
            </span>
            <span className="text-white/35 text-xs leading-tight block">
              {n.desc}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-white/30 text-sm hover:text-white/60 transition-colors"
      >
        ← Cambia attività
      </button>
    </div>
  );
}
