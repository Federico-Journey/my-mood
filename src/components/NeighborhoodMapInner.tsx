"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NeighborhoodId } from "./NeighborhoodSelector";

const NEIGHBORHOODS: {
  id: NeighborhoodId;
  emoji: string;
  label: string;
  lat: number;
  lng: number;
  color: string;
}[] = [
  { id: "isola",         emoji: "🌿", label: "Isola",         lat: 45.4877, lng: 9.1930, color: "#10B981" },
  { id: "porta_nuova",   emoji: "🏙️", label: "Porta Nuova",   lat: 45.4822, lng: 9.1958, color: "#6366F1" },
  { id: "brera",         emoji: "🎨", label: "Brera",         lat: 45.4718, lng: 9.1865, color: "#F59E0B" },
  { id: "porta_venezia", emoji: "🌺", label: "Porta Venezia", lat: 45.4703, lng: 9.2096, color: "#EC4899" },
  { id: "sempione",      emoji: "🌳", label: "Sempione",      lat: 45.4750, lng: 9.1689, color: "#14B8A6" },
  { id: "centro",        emoji: "🏛️", label: "Duomo",         lat: 45.4641, lng: 9.1919, color: "#8B5CF6" },
  { id: "navigli",       emoji: "🌊", label: "Navigli",       lat: 45.4492, lng: 9.1732, color: "#3B82F6" },
  { id: "porta_romana",  emoji: "🎭", label: "Porta Romana",  lat: 45.4538, lng: 9.2020, color: "#F97316" },
];

function makeIcon(color: string, emoji: string, label: string, selected: boolean) {
  const size = selected ? 72 : 60;
  return L.divIcon({
    className: "",
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:${color}${selected ? "30" : "18"};
        border:${selected ? "2.5" : "1.5"}px solid ${color}${selected ? "" : "80"};
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        box-shadow: 0 0 ${selected ? "20px" : "10px"} ${color}${selected ? "60" : "30"};
        transition: all 0.2s;
        backdrop-filter: blur(4px);
      ">
        <span style="font-size:${selected ? "18" : "15"}px; line-height:1">${emoji}</span>
        <span style="
          font-size:${selected ? "8.5" : "7.5"}px;
          font-weight:700;
          color:${selected ? color : "rgba(255,255,255,0.75)"};
          font-family:'DM Sans',sans-serif;
          margin-top:2px;
          white-space:nowrap;
          text-align:center;
        ">${label}</span>
      </div>
    `,
  });
}

type Props = {
  accentColor: string;
  onSelect: (id: NeighborhoodId) => void;
};

export default function NeighborhoodMapInner({ accentColor, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<NeighborhoodId, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<NeighborhoodId | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Aggiorna icone quando cambia selezione
  const updateMarkers = useCallback((selectedId: NeighborhoodId | null) => {
    NEIGHBORHOODS.forEach((n) => {
      const marker = markersRef.current.get(n.id);
      if (marker) {
        marker.setIcon(makeIcon(n.color, n.emoji, n.label, n.id === selectedId));
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Init mappa
    const map = L.map(containerRef.current, {
      center: [45.4654, 9.1859],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // Tile dark CartoDB (gratuito, no API key)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Attribution minima
    L.control.attribution({ prefix: false, position: "bottomright" })
      .addAttribution('© <a href="https://carto.com/">CARTO</a>')
      .addTo(map);

    // Zoom control posizionato a destra
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Markers quartieri
    NEIGHBORHOODS.forEach((n) => {
      const marker = L.marker([n.lat, n.lng], {
        icon: makeIcon(n.color, n.emoji, n.label, false),
      }).addTo(map);

      marker.on("click", () => {
        setSelected(n.id);
        updateMarkers(n.id);
        map.flyTo([n.lat, n.lng], 14, { duration: 0.8 });
        setTimeout(() => onSelect(n.id), 600);
      });

      markersRef.current.set(n.id, marker);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [onSelect, updateMarkers]);

  // Geolocalizzazione
  const handleLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocalizzazione non supportata dal dispositivo.");
      return;
    }
    setLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;

        // Zoom sulla posizione utente
        mapRef.current?.flyTo([latitude, longitude], 15, { duration: 1 });

        // Trova quartiere più vicino
        let nearest: NeighborhoodId = "anywhere";
        let minDist = Infinity;
        NEIGHBORHOODS.forEach((n) => {
          const dist = Math.sqrt((latitude - n.lat) ** 2 + (longitude - n.lng) ** 2);
          if (dist < minDist) { minDist = dist; nearest = n.id; }
        });

        // Marker posizione utente
        const pulseIcon = L.divIcon({
          className: "",
          iconAnchor: [12, 12],
          html: `<div style="
            width:24px; height:24px; border-radius:50%;
            background:${accentColor}; opacity:0.9;
            border:3px solid white;
            box-shadow:0 0 12px ${accentColor};
          "/>`,
        });
        L.marker([latitude, longitude], { icon: pulseIcon }).addTo(mapRef.current!);

        if (minDist < 0.04) {
          setSelected(nearest);
          updateMarkers(nearest);
          setTimeout(() => onSelect(nearest), 800);
        } else {
          setLocError("Sei fuori da Milano. Seleziona un quartiere manualmente.");
        }
      },
      () => {
        setLocating(false);
        setLocError("Posizione non disponibile. Controlla i permessi.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Bottone GPS */}
      <div style={{
        position: "absolute", top: "12px", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}>
        <button
          onClick={handleLocation}
          disabled={locating}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "9px 18px", borderRadius: "20px",
            background: "rgba(9,4,18,0.85)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${accentColor}60`,
            color: accentColor,
            fontSize: "13px", fontWeight: 700,
            cursor: locating ? "default" : "pointer",
            boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
            whiteSpace: "nowrap",
          }}
        >
          {locating ? (
            <>
              <span style={{
                display: "inline-block", width: "13px", height: "13px",
                border: `2px solid ${accentColor}30`, borderTopColor: accentColor,
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              Rilevamento…
            </>
          ) : "📍 Usa la mia posizione"}
        </button>
      </div>

      {/* Errore GPS */}
      {locError && (
        <div style={{
          position: "absolute", top: "56px", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#FCA5A5", fontSize: "11px", fontWeight: 600,
          padding: "6px 14px", borderRadius: "12px",
          whiteSpace: "nowrap",
          backdropFilter: "blur(8px)",
        }}>
          {locError}
        </div>
      )}

      {/* Mappa */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "420px", borderRadius: "20px", overflow: "hidden" }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-control-attribution { background: rgba(0,0,0,0.5) !important; color: rgba(255,255,255,0.3) !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.4) !important; }
        .leaflet-control-zoom a { background: rgba(9,4,18,0.9) !important; color: rgba(255,255,255,0.7) !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-control-zoom a:hover { background: rgba(139,92,246,0.3) !important; }
      `}</style>
    </div>
  );
}
