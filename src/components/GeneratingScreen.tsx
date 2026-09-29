"use client";

/**
 * Schermata di attesa mentre Elly costruisce (o riapre) un itinerario:
 * una lente d'ingrandimento si muove su una cartina, si ferma sulle citta',
 * e di tanto in tanto la cartina si avvicina, poi torna a mostrare tutto.
 *
 * L'animazione e' disegnata in SVG e aggiornata con requestAnimationFrame
 * scrivendo direttamente gli attributi degli elementi (nessun re-render di
 * React per fotogramma). Con "riduci movimento" attivo nel sistema resta
 * ferma su un'immagine fissa.
 */

import { useEffect, useRef, useState } from "react";
import { ELLY_COLORS } from "@/lib/travelData";
import { CompassIcon } from "@/components/EllyIcons";

const C = ELLY_COLORS;

type Props = {
  error?: string | null;
  onRetry?: () => void;
  onBack?: () => void;
  /** "generate": sto creando un itinerario. "open": sto riaprendo un viaggio salvato. */
  variant?: "generate" | "open";
  /** Se nota, viene citata nel titolo (es. "Lisbona, Portogallo"). */
  destination?: string;
};

// ── La cartina (coordinate del "mondo" 480 x 480) ─────────────────
const WORLD = 480;
const VIEW = 320; // lato della finestra visibile, in unita' SVG
const LENS_R = 44;
const MAGNIFY = 2;

// Citta' (i pallini della cartina): la lente le visita in quest'ordine.
const TOWNS: [number, number][] = [
  [92, 165], [172, 128], [335, 118], [252, 205], [300, 268],
  [380, 292], [222, 322], [140, 262], [112, 352],
];
const ROUTE = [0, 1, 2, 3, 5, 4, 6, 8, 7]; // ordine di visita (poi ricomincia)
const ROADS: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [3, 7], [7, 6], [6, 4], [7, 8], [0, 7]];

const LAND =
  "M-20 150 C40 108 92 122 132 90 C176 55 240 72 286 60 C336 48 382 86 420 80 C452 76 472 94 500 100 L500 332 C458 346 432 320 396 346 C360 372 350 412 300 422 C250 432 216 402 170 416 C120 432 60 412 -20 382 Z";
const ISLANDS = [
  "M58 440 c10-14 34-16 46-4 c8 10-4 26-24 28 c-16 2-30-8-22-24z",
  "M396 432 c12-10 30-8 36 4 c4 12-10 22-26 20 c-14-2-18-16-10-24z",
  "M215 452 c6-8 20-8 24 0 c3 8-6 14-16 13 c-8-1-13-7-8-13z",
  "M436 30 c10-8 26-6 30 4 c2 10-10 16-22 14 c-10-2-14-12-8-18z",
];
const LAKE = "M190 205 c10-14 34-14 42-2 c6 12-8 24-26 24 c-16 0-24-10-16-22z";
const RIVER = "M335 190 C320 232 350 252 320 288 C295 318 330 348 306 388 C298 402 300 416 302 428";

// Dolci "curve di livello" attorno a una zona montuosa.
const MOUNTAIN_RINGS = [46, 36, 26, 16, 7];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const MOVE_S = 2.1; // secondi per spostarsi da una citta' all'altra
const DWELL_S = 1.0; // secondi di sosta su ogni citta'
const ZOOM_OUT = 0.72;
const ZOOM_IN = 1.55;

function useMapAnimation() {
  const worldA = useRef<SVGGElement>(null); // cartina di sfondo
  const lensPos = useRef<SVGGElement>(null); // lente (posizione sullo schermo)
  const lensMap = useRef<SVGGElement>(null); // cartina ingrandita dentro la lente
  const pins = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let raf = 0;
    let last = performance.now();
    const start = last;
    const first = TOWNS[ROUTE[0]];
    let camX = first[0], camY = first[1], zoom = ZOOM_OUT;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = reduce ? 0 : (now - start) / 1000;

      // Dove si trova la lente nel "mondo".
      const step = MOVE_S + DWELL_S;
      const i = Math.floor(t / step);
      const local = t - i * step;
      const from = TOWNS[ROUTE[i % ROUTE.length]];
      const to = TOWNS[ROUTE[(i + 1) % ROUTE.length]];
      const p = ease(clamp(local / MOVE_S, 0, 1));
      // Piccola oscillazione, cosi' la lente sembra "cercare" invece di scivolare sui binari.
      const wob = local < MOVE_S ? Math.sin(local * 4.2) * 5 * Math.sin(p * Math.PI) : Math.sin(t * 2.6) * 1.8;
      const lx = from[0] + (to[0] - from[0]) * p + wob;
      const ly = from[1] + (to[1] - from[1]) * p + Math.cos(local * 3.3) * (local < MOVE_S ? 4 : 1.2) * Math.sin(Math.min(p, 1) * Math.PI + 0.4);

      // Ogni tre spostamenti la cartina si avvicina, poi torna a mostrare tutto.
      const zoomTarget = i % 3 === 1 ? ZOOM_IN : ZOOM_OUT;
      if (reduce) {
        camX = lx; camY = ly; zoom = ZOOM_OUT;
      } else {
        zoom += (zoomTarget - zoom) * (1 - Math.exp(-dt * 1.9));
        camX += (lx - camX) * (1 - Math.exp(-dt * 3.2));
        camY += (ly - camY) * (1 - Math.exp(-dt * 3.2));
      }
      const half = VIEW / 2 / zoom;
      const cx = clamp(camX, half, WORLD - half);
      const cy = clamp(camY, half, WORLD - half);

      // Cartina di sfondo: scala e centra sulla camera.
      worldA.current?.setAttribute("transform", `translate(${VIEW / 2} ${VIEW / 2}) scale(${zoom}) translate(${-cx} ${-cy})`);
      // Lente: posizione sullo schermo e, dentro, la stessa cartina ingrandita.
      const sx = VIEW / 2 + (lx - cx) * zoom;
      const sy = VIEW / 2 + (ly - cy) * zoom;
      lensPos.current?.setAttribute("transform", `translate(${sx} ${sy})`);
      lensMap.current?.setAttribute("transform", `scale(${zoom * MAGNIFY}) translate(${-lx} ${-ly})`);

      // Le citta' "si accendono" quando la lente ci passa sopra.
      TOWNS.forEach(([tx, ty], k) => {
        const el = pins.current[k];
        if (!el) return;
        const d = Math.hypot(tx - lx, ty - ly);
        const s = 1 + 0.55 * (1 - smooth(14, 46, d));
        el.setAttribute("transform", `translate(${tx} ${ty}) scale(${s})`);
      });

      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { worldA, lensPos, lensMap, pins };
}

function roadPath([a, b]: [number, number]) {
  const [x1, y1] = TOWNS[a];
  const [x2, y2] = TOWNS[b];
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
}

/** Il disegno della cartina, riusato due volte (sfondo + dentro la lente). */
function WorldArt({ pins }: { pins?: React.MutableRefObject<(SVGGElement | null)[]> }) {
  return (
    <g>
      <rect x={-40} y={-40} width={WORLD + 80} height={WORLD + 80} fill="#DDE7E9" />
      {/* onde leggerissime nel mare */}
      <g fill="none" stroke="#C6D6DA" strokeWidth={1}>
        {[[30, 40], [120, 30], [70, 92], [430, 200], [455, 380], [30, 420], [300, 455], [170, 470]].map(([x, y], k) => (
          <path key={k} d={`M${x} ${y} q6-5 12 0 t12 0 t12 0`} />
        ))}
      </g>
      <path d={LAND} fill="#F5F0E6" stroke="#C7B9A6" strokeWidth={2} strokeLinejoin="round" />
      {ISLANDS.map((d, k) => (
        <path key={k} d={d} fill="#F5F0E6" stroke="#C7B9A6" strokeWidth={1.6} />
      ))}
      <path d={LAKE} fill="#DDE7E9" stroke="#C6D6DA" strokeWidth={1.4} />
      {/* rilievo */}
      <g fill="none" stroke="#7A3348" strokeOpacity={0.2} strokeWidth={1}>
        {MOUNTAIN_RINGS.map((r, k) => (
          <ellipse key={k} cx={345} cy={158} rx={r * 1.5} ry={r} transform="rotate(-18 345 158)" />
        ))}
        {[34, 24, 14].map((r, k) => (
          <ellipse key={`b${k}`} cx={120} cy={225} rx={r * 1.3} ry={r * 0.8} transform="rotate(20 120 225)" />
        ))}
      </g>
      <path d={RIVER} fill="none" stroke="#B9CDD4" strokeWidth={3} strokeLinecap="round" />
      {/* strade */}
      <g fill="none" stroke="#7A3348" strokeOpacity={0.35} strokeWidth={1.6} strokeDasharray="5 4" strokeLinecap="round">
        {ROADS.map((r, k) => <path key={k} d={roadPath(r)} />)}
      </g>
      {/* reticolo geografico */}
      <g stroke="#7A3348" strokeOpacity={0.07} strokeWidth={0.8}>
        {[80, 160, 240, 320, 400].map((v) => (
          <g key={v}>
            <line x1={0} y1={v} x2={WORLD} y2={v} />
            <line x1={v} y1={0} x2={v} y2={WORLD} />
          </g>
        ))}
      </g>
      {/* citta' */}
      {TOWNS.map(([x, y], k) => (
        <g key={k} ref={pins ? (el) => { pins.current[k] = el; } : undefined} transform={`translate(${x} ${y})`}>
          <circle r={9} fill="#7A3348" fillOpacity={0.14} />
          <circle r={4.2} fill="#7A3348" stroke="#FBFAF7" strokeWidth={1.6} />
        </g>
      ))}
    </g>
  );
}

const MESSAGES: Record<NonNullable<Props["variant"]>, string[]> = {
  generate: [
    "Scelgo i luoghi giusti per il vostro mood…",
    "Controllo che esistano davvero, uno per uno…",
    "Metto in fila le giornate senza correre…",
    "Cerco le foto e i dettagli utili…",
    "Ancora un attimo, sto rifinendo l'itinerario…",
  ],
  open: ["Recupero il tuo viaggio…"],
};

function MapAnimation() {
  const { worldA, lensPos, lensMap, pins } = useMapAnimation();
  const handle = (LENS_R + 4) * Math.SQRT1_2;
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-label="Una lente d'ingrandimento cerca luoghi su una cartina geografica"
      className="w-full h-auto block"
    >
      <defs>
        <clipPath id="elly-lens-clip"><circle r={LENS_R} /></clipPath>
        <clipPath id="elly-frame-clip"><rect width={VIEW} height={VIEW} rx={22} /></clipPath>
        <filter id="elly-lens-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#22201F" floodOpacity="0.28" />
        </filter>
      </defs>

      <g clipPath="url(#elly-frame-clip)">
        <g ref={worldA}><WorldArt pins={pins} /></g>

        {/* Lente */}
        <g ref={lensPos} filter="url(#elly-lens-shadow)">
          <g clipPath="url(#elly-lens-clip)">
            <rect x={-LENS_R} y={-LENS_R} width={LENS_R * 2} height={LENS_R * 2} fill="#F5F0E6" />
            <g ref={lensMap}><WorldArt /></g>
            <circle r={LENS_R} fill="#FFFFFF" fillOpacity={0.1} />
          </g>
          {/* manico */}
          <line x1={handle} y1={handle} x2={handle + 34} y2={handle + 34} stroke="#5A2434" strokeWidth={10} strokeLinecap="round" />
          <line x1={handle + 4} y1={handle + 4} x2={handle + 30} y2={handle + 30} stroke="#7A3348" strokeWidth={5} strokeLinecap="round" />
          {/* montatura */}
          <circle r={LENS_R + 2} fill="none" stroke="#7A3348" strokeWidth={5} />
          <circle r={LENS_R - 1.5} fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1} />
          {/* riflesso */}
          <path d={`M${-LENS_R * 0.62} ${-LENS_R * 0.18} A${LENS_R * 0.66} ${LENS_R * 0.66} 0 0 1 ${-LENS_R * 0.16} ${-LENS_R * 0.64}`} fill="none" stroke="#FFFFFF" strokeOpacity={0.75} strokeWidth={3.5} strokeLinecap="round" />
        </g>

        {/* Rosa dei venti, fissa in un angolo */}
        <g transform={`translate(${VIEW - 30} 30)`} opacity={0.75}>
          <circle r={13} fill="#FBFAF7" fillOpacity={0.9} stroke="#C7B9A6" strokeWidth={1} />
          <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="#7A3348" />
          <path d="M0 -10 L3 0 L-3 0 Z" fill="#7A3348" />
          <path d="M0 10 L3 0 L-3 0 Z" fill="#B5ABA4" />
        </g>
      </g>
      <rect width={VIEW} height={VIEW} rx={22} fill="none" stroke="#E7E1DA" strokeWidth={2} />
    </svg>
  );
}

export default function GeneratingScreen({ error, onRetry, onBack, variant = "generate", destination }: Props) {
  const messages = MESSAGES[variant];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (error || messages.length < 2) return;
    const id = setInterval(() => setMsgIndex((n) => Math.min(n + 1, messages.length - 1)), 4500);
    return () => clearInterval(id);
  }, [error, messages.length]);

  const place = destination?.split(",")[0]?.trim();
  const title =
    variant === "open"
      ? "Apro il tuo viaggio"
      : place
        ? `Cerco il meglio di ${place}`
        : "Sto costruendo il tuo itinerario";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: C.paper, color: C.text }}>
      <style>{`@keyframes ellyMsgIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>

      {!error ? (
        <>
          <div
            className="w-full max-w-[340px] mb-7 rounded-[22px]"
            style={{ boxShadow: "0 18px 40px -22px rgba(34,32,31,.45)" }}
          >
            <MapAnimation />
          </div>
          <h2 className="text-[22px] font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <p
            key={msgIndex}
            className="text-sm max-w-[290px] min-h-[42px]"
            style={{ color: C.textMuted, animation: "ellyMsgIn .5s ease both" }}
            aria-live="polite"
          >
            {messages[msgIndex]}
          </p>
        </>
      ) : (
        <>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ border: `1.3px solid ${C.border}`, background: C.bgElev, color: C.accent }}
          >
            <CompassIcon size={28} />
          </div>
          <h2 className="text-[20px] font-bold mb-2">Qualcosa non ha funzionato</h2>
          <p className="text-sm max-w-[300px] mb-6" style={{ color: C.textMuted }}>{error}</p>
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-5 py-3 rounded-xl font-bold text-sm"
                style={{ background: C.accent, color: "#fff" }}
              >
                Riprova
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-3 rounded-xl font-bold text-sm"
                style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
              >
                Torna indietro
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
