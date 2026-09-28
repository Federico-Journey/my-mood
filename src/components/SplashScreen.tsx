"use client";

import { useEffect, useState } from "react";

// Sfondo dello splash: "Vino", lo stesso accent della palette "Vino e Pietra" di Elly
// (#7A3348) — coerente con l'icona dell'app e con il resto del brand.
// Alternative proposte in chat: Burgundy profondo (#4A1023), Terracotta (#B5543A).
const SPLASH_BG = "#7A3348";
const SPLASH_SESSION_KEY = "elly-splash-shown";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"in" | "zoom">("in");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_SESSION_KEY)) return;
      sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      // sessionStorage non disponibile: mostriamo comunque lo splash una volta.
    }

    setVisible(true);
    const toZoom = setTimeout(() => setPhase("zoom"), 700);
    const toHide = setTimeout(() => setVisible(false), 700 + 550);
    return () => {
      clearTimeout(toZoom);
      clearTimeout(toHide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: SPLASH_BG }}
    >
      <span
        className={`elly-splash-word ${
          phase === "in" ? "elly-splash-word-in" : "elly-splash-word-zoom"
        }`}
      >
        ELLY
      </span>
    </div>
  );
}
