"use client";

import { useState, useCallback } from "react";

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

// Coordinate SVG per ogni quartiere (viewBox 0 0 400 420)
// Mappate dalle coordinate reali di Milano
const NEIGHBORHOODS: {
  id: NeighborhoodId;
  emoji: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
}[] = [
  { id: "isola",        emoji: "🌿", label: "Isola",         cx: 218, cy: 78,  r: 34, color: "#10B981" },
  { id: "porta_nuova",  emoji: "🏙️", label: "Porta Nuova",   cx: 232, cy: 112, r: 32, color: "#6366F1" },
  { id: "brera",        emoji: "🎨", label: "Brera",         cx: 188, cy: 148, r: 34, color: "#F59E0B" },
  { id: "porta_venezia",emoji: "🌺", label: "Porta Venezia", cx: 268, cy: 158, r: 36, color: "#EC4899" },
  { id: "sempione",     emoji: "🌳", label: "Sempione",      cx: 142, cy: 148, r: 34, color: "#14B8A6" },
  { id: "centro",       emoji: "🏛️", label: "Duomo",         cx: 208, cy: 200, r: 38, color: "#8B5CF6" },
  { id: "navigli",      emoji: "🌊", label: "Navigli",       cx: 162, cy: 268, r: 36, color: "#3B82F6" },
  { id: "porta_romana", emoji: "🎭", label: "Porta Romana",  cx: 248, cy: 258, r: 34, color: "#F97316" },
];

// Percorso SVG semplificato del confine di Milano (stilizzato)
const MILAN_OUTLINE = `
  M 60,80 L 90,50 L 150,38 L 210,32 L 270,42 L 320,60 L 350,100
  L 360,150 L 355,210 L 340,270 L 310,320 L 270,355 L 220,370
  L 170,365 L 120,345 L 80,310 L 55,260 L 45,200 L 50,140 Z
`;

type Props = {
  accentColor: string;
  onSelect: (neighborhood: NeighborhoodId) => void;
  onBack: () => void;
};

export default function NeighborhoodSelector({ accentColor, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<NeighborhoodId | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const handleSelect = (id: NeighborhoodId) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 300);
  };

  // Trova il quartiere più vicino alla posizione GPS
  const findNearestNeighborhood = useCallback((lat: number, lng: number): NeighborhoodId => {
    // Coordinate geografiche reali dei centri dei quartieri
    const geoNeighborhoods: { id: NeighborhoodId; lat: number; lng: number }[] = [
      { id: "isola",         lat: 45.488, lng: 9.193 },
      { id: "porta_nuova",   lat: 45.484, lng: 9.196 },
      { id: "brera",         lat: 45.472, lng: 9.186 },
      { id: "porta_venezia", lat: 45.470, lng: 9.210 },
      { id: "sempione",      lat: 45.475, lng: 9.169 },
      { id: "centro",        lat: 45.464, lng: 9.192 },
      { id: "navigli",       lat: 45.449, lng: 9.173 },
      { id: "porta_romana",  lat: 45.454, lng: 9.202 },
    ];

    let nearest: NeighborhoodId = "anywhere";
    let minDist = Infinity;

    for (const n of geoNeighborhoods) {
      const dist = Math.sqrt(Math.pow(lat - n.lat, 2) + Math.pow(lng - n.lng, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = n.id;
      }
    }

    // Se troppo lontano da tutti i quartieri → "anywhere"
    return minDist < 0.05 ? nearest : "anywhere";
  }, []);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Il tuo dispositivo non supporta la geolocalizzazione.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const nearest = findNearestNeighborhood(pos.coords.latitude, pos.coords.longitude);
        handleSelect(nearest);
      },
      () => {
        setLocating(false);
        setLocError("Non riesco ad accedere alla tua posizione. Controlla i permessi.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const selectedNeighborhood = NEIGHBORHOODS.find(n => n.id === selected);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "40px 20px 100px",
      fontFamily: '"DM Sans", sans-serif',
    }}>
      {/* Header */}
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
        step 5 di 5
      </p>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#F5F5F0", letterSpacing: "-0.02em", marginBottom: "6px", textAlign: "center" }}>
        Che zona?
      </h2>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
        Tocca un quartiere sulla mappa
      </p>

      {/* Bottone GPS */}
      <button
        onClick={handleUseLocation}
        disabled={locating}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", borderRadius: "20px",
          background: locating ? "rgba(139,92,246,0.1)" : `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`,
          border: `1px solid ${accentColor}50`,
          color: accentColor, fontSize: "13px", fontWeight: 700,
          cursor: locating ? "default" : "pointer",
          marginBottom: "16px",
          transition: "all 0.2s",
        }}
      >
        {locating ? (
          <>
            <span style={{ display: "inline-block", width: "14px", height: "14px", border: `2px solid ${accentColor}30`, borderTopColor: accentColor, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Rilevamento posizione…
          </>
        ) : (
          <>📍 Usa la mia posizione</>
        )}
      </button>

      {locError && (
        <p style={{ color: "#EF4444", fontSize: "12px", marginBottom: "12px", textAlign: "center", maxWidth: "280px" }}>
          {locError}
        </p>
      )}

      {/* Mappa SVG */}
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        position: "relative",
      }}>
        <svg
          viewBox="0 0 400 410"
          style={{ width: "100%", display: "block" }}
        >
          {/* Sfondo mappa */}
          <rect width="400" height="410" fill="#0a0812" />

          {/* Griglia stradale stilizzata */}
          {[80,120,160,200,240,280,320].map(y => (
            <line key={`h${y}`} x1="30" y1={y} x2="370" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {[80,130,180,220,260,310,350].map(x => (
            <line key={`v${x}`} x1={x} y1="30" x2={x} y2="390" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}

          {/* Confine di Milano */}
          <path
            d={MILAN_OUTLINE}
            fill="rgba(139,92,246,0.04)"
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />

          {/* Quartieri */}
          {NEIGHBORHOODS.map((n) => {
            const isSelected = selected === n.id;
            return (
              <g
                key={n.id}
                onClick={() => handleSelect(n.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Alone glow */}
                <circle
                  cx={n.cx} cy={n.cy} r={isSelected ? n.r + 12 : n.r + 6}
                  fill={isSelected ? n.color + "30" : n.color + "12"}
                  style={{ transition: "all 0.2s" }}
                />
                {/* Cerchio principale */}
                <circle
                  cx={n.cx} cy={n.cy} r={n.r}
                  fill={isSelected ? n.color + "35" : n.color + "18"}
                  stroke={isSelected ? n.color : n.color + "60"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s" }}
                />
                {/* Emoji */}
                <text
                  x={n.cx} y={n.cy - 4}
                  textAnchor="middle"
                  fontSize={isSelected ? "16" : "13"}
                  style={{ transition: "font-size 0.2s", userSelect: "none" }}
                >
                  {n.emoji}
                </text>
                {/* Label */}
                <text
                  x={n.cx} y={n.cy + 14}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight={isSelected ? "800" : "600"}
                  fill={isSelected ? n.color : "rgba(255,255,255,0.55)"}
                  fontFamily='"DM Sans", sans-serif'
                  style={{ transition: "all 0.2s", userSelect: "none" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}

          {/* Label "Milano" in basso */}
          <text x="200" y="398" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.15)" fontFamily='"DM Sans", sans-serif' letterSpacing="3">
            MILANO
          </text>
        </svg>
      </div>

      {/* Chip quartiere selezionato */}
      {selected && selectedNeighborhood && (
        <div style={{
          marginTop: "16px",
          padding: "10px 20px",
          borderRadius: "20px",
          background: `${selectedNeighborhood.color}20`,
          border: `1px solid ${selectedNeighborhood.color}50`,
          color: selectedNeighborhood.color,
          fontSize: "14px",
          fontWeight: 700,
          animation: "fadeIn 0.2s ease",
        }}>
          {selectedNeighborhood.emoji} {selectedNeighborhood.label} selezionato!
        </div>
      )}

      {/* Ovunque */}
      <button
        onClick={() => handleSelect("anywhere")}
        style={{
          marginTop: "16px",
          padding: "12px 24px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.45)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: "8px",
        }}
      >
        🗺️ Ovunque a Milano — sorprendimi!
      </button>

      <button
        onClick={onBack}
        style={{
          marginTop: "20px", color: "rgba(255,255,255,0.25)",
          fontSize: "13px", background: "none", border: "none",
          cursor: "pointer",
        }}
      >
        ← Cambia attività
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
