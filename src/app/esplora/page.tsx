"use client";

import { useState, useEffect } from "react";
import { MOODS } from "@/lib/data";
import { getVenuesByMood } from "@/lib/venues";
import type { Venue } from "@/types/database";
import NavBar from "@/components/NavBar";
import Link from "next/link";

const VENUE_TYPES: { id: string; label: string; emoji: string }[] = [
  { id: "",            label: "Tutti",       emoji: "✨" },
  { id: "bar",         label: "Bar",         emoji: "🍺" },
  { id: "cocktail_bar",label: "Cocktail",    emoji: "🍸" },
  { id: "ristorante",  label: "Ristorante",  emoji: "🍽️" },
  { id: "pizzeria",    label: "Pizzeria",    emoji: "🍕" },
  { id: "trattoria",   label: "Trattoria",   emoji: "🫕" },
  { id: "club",        label: "Club",        emoji: "🎵" },
  { id: "lounge",      label: "Lounge",      emoji: "🛋️" },
  { id: "rooftop",     label: "Rooftop",     emoji: "🌆" },
  { id: "museo",       label: "Museo",       emoji: "🎨" },
  { id: "teatro",      label: "Teatro",      emoji: "🎭" },
  { id: "parco",       label: "Parco",       emoji: "🌿" },
];

const PRICE_LABELS: Record<string, string> = {
  low: "€",
  mid: "€€",
  high: "€€€",
  luxury: "€€€€",
};

export default function EsploraPage() {
  const [selectedMood, setSelectedMood] = useState<string>(MOODS[0].id);
  const [selectedType, setSelectedType] = useState<string>("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  const activeMood = MOODS.find((m) => m.id === selectedMood)!;

  useEffect(() => {
    setLoading(true);
    // Converte l'ID mood (inglese) nel label italiano (come salvato nel DB)
    const moodLabel = activeMood.label.toLowerCase();
    getVenuesByMood(moodLabel, selectedType || undefined)
      .then((data) => setVenues(data))
      .finally(() => setLoading(false));
  }, [selectedMood, selectedType]);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#09090f", color: "#F5F5F0" }}
    >
      {/* Header */}
      <div className="pt-12 px-5 pb-4">
        <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-1">
          Milano
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Esplora
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Trova i posti giusti per il tuo mood
        </p>
      </div>

      {/* Mood selector — scroll orizzontale */}
      <div className="overflow-x-auto scrollbar-hide px-5 pb-1">
        <div className="flex gap-2 w-max">
          {MOODS.map((mood) => {
            const active = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200"
                style={{
                  background: active ? `${mood.color}22` : "rgba(255,255,255,0.05)",
                  border: active ? `1.5px solid ${mood.color}60` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? mood.color : "rgba(255,255,255,0.45)",
                }}
              >
                <span className="text-base">{mood.emoji}</span>
                {mood.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type filter — scroll orizzontale */}
      <div className="overflow-x-auto scrollbar-hide px-5 pt-3 pb-4">
        <div className="flex gap-2 w-max">
          {VENUE_TYPES.map((type) => {
            const active = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200"
                style={{
                  background: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                  border: active ? "1.5px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.07)",
                  color: active ? "#A78BFA" : "rgba(255,255,255,0.4)",
                }}
              >
                <span>{type.emoji}</span>
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider con risultati */}
      <div className="px-5 mb-3 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-white/30 text-xs">
          {loading ? "Carico..." : `${venues.length} posti`}
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Venue list */}
      <div className="px-5 flex flex-col gap-3">
        {loading ? (
          // Skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl h-[72px] animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          ))
        ) : venues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{activeMood.emoji}</p>
            <p className="text-white/40 text-sm">
              Nessun posto trovato per questo mood.
              <br />
              Prova a cambiare filtro tipo.
            </p>
          </div>
        ) : (
          venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venue/${venue.id}`}
              className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.015] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${activeMood.color}0d, rgba(255,255,255,0.03))`,
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Emoji / tipo icona */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  background: `${activeMood.color}14`,
                  border: `1px solid ${activeMood.color}25`,
                }}
              >
                {venue.emoji || VENUE_TYPES.find((t) => t.id === venue.type)?.emoji || "📍"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] truncate">{venue.name}</p>
                <p className="text-white/35 text-xs mt-0.5 truncate">{venue.address}</p>
              </div>

              {/* Badge tipo + prezzo */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${activeMood.color}18`,
                    color: activeMood.color,
                  }}
                >
                  {VENUE_TYPES.find((t) => t.id === venue.type)?.label ?? venue.type}
                </span>
                <span className="text-white/40 text-xs font-semibold">
                  {PRICE_LABELS[venue.price_range] ?? venue.price_range}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <NavBar />
    </div>
  );
}
