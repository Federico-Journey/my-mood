"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import type { Venue } from "@/types/database";
import FavoriteButton from "@/components/FavoriteButton";

const VENUE_TYPE_EMOJI: Record<string, string> = {
  bar: "🍺", cocktail_bar: "🍸", ristorante: "🍽️", pizzeria: "🍕",
  trattoria: "🫕", club: "🎵", lounge: "🛋️", rooftop: "🌆",
  museo: "🎨", teatro: "🎭", parco: "🌿", cinema: "🎬",
  attivita: "⚡", altro: "📍",
};
const PRICE_LABELS: Record<string, string> = {
  low: "€", mid: "€€", high: "€€€", luxury: "€€€€",
};

export default function PreferitivePage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      setLoggedIn(true);

      const { data } = await supabase
        .from("user_favorites")
        .select("venue_id, venues(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const favVenues = (data ?? [])
        .map((row: { venue_id: string; venues: Venue | Venue[] | null }) => {
          const v = row.venues;
          return Array.isArray(v) ? v[0] : v;
        })
        .filter(Boolean) as Venue[];

      setVenues(favVenues);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#09090f", fontFamily: '"DM Sans", sans-serif', paddingBottom: "100px" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <div style={{ paddingTop: "52px", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span style={{ fontSize: "14px" }}>🌙</span>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>my mood</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#F5F5F0", margin: 0, letterSpacing: "-0.5px" }}>
            ❤️ Preferiti
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "4px" }}>
            I locali che hai salvato
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <div style={{ width: "24px", height: "24px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Non loggato */}
        {!loading && !loggedIn && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "24px" }}>
              Accedi per vedere i tuoi preferiti
            </p>
            <Link href="/auth" style={{ display: "inline-block", padding: "14px 28px", borderRadius: "16px", background: "#8B5CF6", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
              Accedi
            </Link>
          </div>
        )}

        {/* Nessun preferito */}
        {!loading && loggedIn && venues.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤍</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "8px" }}>
              Non hai ancora salvato nessun locale
            </p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", marginBottom: "28px" }}>
              Tocca ❤️ su un locale per aggiungerlo qui
            </p>
            <Link href="/esplora" style={{ display: "inline-block", padding: "14px 28px", borderRadius: "16px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
              🔍 Esplora i locali
            </Link>
          </div>
        )}

        {/* Lista preferiti */}
        {!loading && loggedIn && venues.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {venues.map((venue) => {
              const emoji = venue.emoji || VENUE_TYPE_EMOJI[venue.type] || "📍";
              const photoSrc = venue.photo_url
                ?? (venue.google_place_id
                  ? `/api/place-photo?place_id=${encodeURIComponent(venue.google_place_id)}`
                  : `/api/place-photo?name=${encodeURIComponent(venue.name)}`);

              return (
                <VenueRow
                  key={venue.id}
                  venue={venue}
                  emoji={emoji}
                  photoSrc={photoSrc}
                  onRemove={(id) => setVenues(prev => prev.filter(v => v.id !== id))}
                />
              );
            })}
          </div>
        )}
      </div>
      <NavBar />
    </main>
  );
}

function VenueRow({
  venue, emoji, photoSrc, onRemove,
}: {
  venue: Venue;
  emoji: string;
  photoSrc: string;
  onRemove: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      borderRadius: "18px", overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      {/* Thumbnail */}
      <Link href={`/venue/${venue.id}`} style={{ textDecoration: "none", display: "flex", flex: 1, alignItems: "center", gap: "12px", padding: "0", minWidth: 0 }}>
        <div style={{ width: "72px", height: "72px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", overflow: "hidden", background: "rgba(139,92,246,0.1)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {!imgError ? (
            <img src={photoSrc} alt={venue.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgError(true)} />
          ) : emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: "14px 0" }}>
          <p style={{ color: "#F5F5F0", fontWeight: 700, fontSize: "15px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{venue.name}</p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {venue.address}</p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", margin: "2px 0 0" }}>
            {venue.type.replace("_", " ")} · {PRICE_LABELS[venue.price_range] ?? ""}
          </p>
        </div>
      </Link>

      {/* Cuore — al click rimuove dalla lista locale */}
      <div style={{ paddingRight: "16px" }} onClick={() => onRemove(venue.id)}>
        <FavoriteButton venueId={venue.id} size="sm" />
      </div>
    </div>
  );
}
