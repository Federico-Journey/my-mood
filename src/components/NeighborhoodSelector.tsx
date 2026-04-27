"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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

// Carica la mappa solo lato client (Leaflet non supporta SSR)
const NeighborhoodMapInner = dynamic(
  () => import("./NeighborhoodMapInner"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: "100%", height: "420px", borderRadius: "20px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "28px", height: "28px",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "#8B5CF6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

const NEIGHBORHOODS_META: Record<NeighborhoodId, { emoji: string; label: string }> = {
  navigli:       { emoji: "🌊", label: "Navigli" },
  brera:         { emoji: "🎨", label: "Brera" },
  porta_venezia: { emoji: "🌺", label: "Porta Venezia" },
  isola:         { emoji: "🌿", label: "Isola" },
  porta_nuova:   { emoji: "🏙️", label: "Porta Nuova" },
  centro:        { emoji: "🏛️", label: "Duomo" },
  porta_romana:  { emoji: "🎭", label: "Porta Romana" },
  sempione:      { emoji: "🌳", label: "Sempione" },
  anywhere:      { emoji: "🗺️", label: "Ovunque" },
};

type Props = {
  accentColor: string;
  onSelect: (neighborhood: NeighborhoodId) => void;
  onBack: () => void;
};

export default function NeighborhoodSelector({ accentColor, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<NeighborhoodId | null>(null);

  const handleSelect = (id: NeighborhoodId) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 400);
  };

  const meta = selected ? NEIGHBORHOODS_META[selected] : null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "40px 16px 100px",
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

      {/* Mappa interattiva */}
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <NeighborhoodMapInner
          accentColor={accentColor}
          onSelect={handleSelect}
        />
      </div>

      {/* Chip quartiere selezionato */}
      {selected && meta && (
        <div style={{
          marginTop: "16px",
          padding: "10px 22px",
          borderRadius: "20px",
          background: `${accentColor}20`,
          border: `1px solid ${accentColor}50`,
          color: accentColor,
          fontSize: "14px", fontWeight: 700,
          animation: "fadeIn 0.25s ease",
        }}>
          {meta.emoji} {meta.label} selezionato!
        </div>
      )}

      {/* Ovunque */}
      <button
        onClick={() => handleSelect("anywhere")}
        style={{
          marginTop: "16px", padding: "12px 24px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.45)",
          fontSize: "13px", fontWeight: 600,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: "8px",
        }}
      >
        🗺️ Ovunque a Milano — sorprendimi!
      </button>

      <button
        onClick={onBack}
        style={{
          marginTop: "18px", color: "rgba(255,255,255,0.25)",
          fontSize: "13px", background: "none", border: "none", cursor: "pointer",
        }}
      >
        ← Cambia attività
      </button>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
