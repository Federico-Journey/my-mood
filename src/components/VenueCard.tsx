"use client";

/**
 * VenueCard — card riutilizzabile per mostrare un locale.
 *
 * Mostra la foto reale del posto usando l'API proxy /api/place-photo,
 * che chiama Google Places API lato server (la chiave non è mai esposta).
 *
 * Se la venue non ha google_place_id, o se l'API fallisce,
 * mostra l'emoji come fallback.
 */

import { useState } from "react";
import Link from "next/link";
import type { Venue } from "@/types/database";

const VENUE_TYPE_EMOJI: Record<string, string> = {
  bar: "🍺",
  cocktail_bar: "🍸",
  ristorante: "🍽️",
  pizzeria: "🍕",
  trattoria: "🫕",
  club: "🎵",
  lounge: "🛋️",
  rooftop: "🌆",
  museo: "🎨",
  teatro: "🎭",
  parco: "🌿",
  cinema: "🎬",
  attivita: "⚡",
  altro: "📍",
};

const PRICE_LABELS: Record<string, string> = {
  low: "€",
  mid: "€€",
  high: "€€€",
  luxury: "€€€€",
};

type Props = {
  venue: Venue;
  accentColor?: string;
  /** Layout compatto (lista) o card grande con foto in evidenza */
  variant?: "list" | "card";
};

export default function VenueCard({
  venue,
  accentColor = "#8B5CF6",
  variant = "list",
}: Props) {
  const typeEmoji =
    venue.emoji || VENUE_TYPE_EMOJI[venue.type] || "📍";

  // Sorgente foto:
  // 1. photo_url già salvata nel DB (zero latenza)
  // 2. google_place_id → API proxy con place_id diretto
  // 3. fallback: Text Search per nome (funziona anche senza place_id nel DB)
  const photoSrc = venue.photo_url
    ? venue.photo_url
    : venue.google_place_id
    ? `/api/place-photo?place_id=${encodeURIComponent(venue.google_place_id)}`
    : `/api/place-photo?name=${encodeURIComponent(venue.name)}`;

  if (variant === "card") {
    return <VenueCardLarge venue={venue} photoSrc={photoSrc} typeEmoji={typeEmoji} accentColor={accentColor} />;
  }

  return <VenueCardList venue={venue} photoSrc={photoSrc} typeEmoji={typeEmoji} accentColor={accentColor} />;
}

/* ─── Variante lista (riga compatta con thumbnail) ──────────── */

function VenueCardList({
  venue,
  photoSrc,
  typeEmoji,
  accentColor,
}: {
  venue: Venue;
  photoSrc: string | null;
  typeEmoji: string;
  accentColor: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/venue/${venue.id}`}
      className="flex items-center gap-3.5 rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.015] active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${accentColor}0d, rgba(255,255,255,0.03))`,
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Thumbnail: foto o emoji */}
      <div
        className="w-[72px] h-[72px] shrink-0 flex items-center justify-center text-2xl overflow-hidden"
        style={{
          background: `${accentColor}14`,
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {photoSrc && !imgError ? (
          <img
            src={photoSrc}
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          typeEmoji
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-3 pr-1">
        <p className="text-white font-bold text-[15px] truncate">{venue.name}</p>
        <p className="text-white/35 text-xs mt-0.5 truncate">📍 {venue.address}</p>
        {venue.google_rating && (
          <p className="text-yellow-400/70 text-xs mt-0.5">
            ⭐ {venue.google_rating.toFixed(1)}
          </p>
        )}
      </div>

      {/* Badge tipo + prezzo */}
      <div className="flex flex-col items-end gap-1 shrink-0 pr-4 py-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `${accentColor}18`,
            color: accentColor,
          }}
        >
          {VENUE_TYPE_EMOJI[venue.type] || ""} {venue.type.replace("_", " ")}
        </span>
        <span className="text-white/40 text-xs font-semibold">
          {PRICE_LABELS[venue.price_range] ?? venue.price_range}
        </span>
      </div>
    </Link>
  );
}

/* ─── Variante card grande (con foto in evidenza) ───────────── */

function VenueCardLarge({
  venue,
  photoSrc,
  typeEmoji,
  accentColor,
}: {
  venue: Venue;
  photoSrc: string | null;
  typeEmoji: string;
  accentColor: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/venue/${venue.id}`}
      className="block rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.015] active:scale-[0.98]"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Foto in evidenza */}
      <div
        className="w-full h-40 flex items-center justify-center text-5xl overflow-hidden relative"
        style={{ background: `${accentColor}18` }}
      >
        {photoSrc && !imgError ? (
          <img
            src={photoSrc}
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: "48px" }}>{typeEmoji}</span>
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(9,9,15,0.85) 0%, transparent 60%)",
          }}
        />
        {/* Nome sovrapposto */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white font-bold text-lg leading-tight drop-shadow-md">
            {venue.name}
          </p>
          <p className="text-white/55 text-xs mt-0.5">📍 {venue.address}</p>
        </div>
      </div>

      {/* Footer info */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: `${accentColor}18`,
              color: accentColor,
            }}
          >
            {venue.type.replace("_", " ")}
          </span>
          {venue.google_rating && (
            <span className="text-yellow-400/70 text-xs">
              ⭐ {venue.google_rating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-white/40 text-sm font-bold">
          {PRICE_LABELS[venue.price_range] ?? venue.price_range}
        </span>
      </div>
    </Link>
  );
}
