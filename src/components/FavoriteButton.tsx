"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  venueId: string;
  size?: "sm" | "md" | "lg";
};

export default function FavoriteButton({ venueId, size = "md" }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("venue_id", venueId)
        .maybeSingle();

      setIsFav(!!data);
      setLoading(false);
    };
    init();
  }, [venueId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || loading) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (isFav) {
      setIsFav(false);
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("venue_id", venueId);
    } else {
      setIsFav(true);
      await supabase
        .from("user_favorites")
        .insert({ user_id: userId, venue_id: venueId });
    }
  };

  if (!userId) return null;

  const dim = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const fontSize = size === "sm" ? "13px" : size === "lg" ? "20px" : "16px";

  return (
    <button
      onClick={toggle}
      title={isFav ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: "50%",
        background: isFav ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${isFav ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.14)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize,
        transition: "all 0.2s",
        transform: animating ? "scale(1.3)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      {isFav ? "❤️" : "🤍"}
    </button>
  );
}
