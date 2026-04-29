"use client";

import { useState } from "react";

type Props = {
  photos: string[];
  venueName: string;
  fallbackEmoji: string;
  accentColor: string;
};

export default function PhotoCarousel({ photos, venueName, fallbackEmoji, accentColor }: Props) {
  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  if (photos.length === 0) {
    return (
      <div style={{
        width: "100%", height: "300px", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: `${accentColor}18`, fontSize: "64px",
      }}>
        {fallbackEmoji}
      </div>
    );
  }

  const goTo = (idx: number) => setCurrent((idx + photos.length) % photos.length);

  return (
    <div style={{ position: "relative", width: "100%", height: "300px", overflow: "hidden", background: "#09090f" }}>
      {/* Foto attiva */}
      {!imgErrors[current] ? (
        <img
          key={current}
          src={photos[current]}
          alt={`${venueName} foto ${current + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setImgErrors(prev => ({ ...prev, [current]: true }))}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `${accentColor}18`, fontSize: "64px" }}>
          {fallbackEmoji}
        </div>
      )}

      {/* Gradient overlay basso */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "130px",
        background: "linear-gradient(to top, #09090f, transparent)",
        pointerEvents: "none",
      }} />

      {/* Frecce navigazione — solo se più di 1 foto */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            style={{
              position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white", fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>
          <button
            onClick={() => goTo(current + 1)}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white", fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>

          {/* Dots */}
          <div style={{
            position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: "6px", zIndex: 2,
          }}>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px", borderRadius: "3px",
                  background: i === current ? accentColor : "rgba(255,255,255,0.35)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Contatore foto */}
      {photos.length > 1 && (
        <div style={{
          position: "absolute", top: "52px", right: "12px",
          padding: "3px 10px", borderRadius: "12px",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
          color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600,
        }}>
          {current + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}
