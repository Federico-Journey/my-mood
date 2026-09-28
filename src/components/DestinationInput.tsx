"use client";

import { useState } from "react";
import Link from "next/link";
import { DESTINATION_SUGGESTIONS, ELLY_COLORS } from "@/lib/travelData";
import { PinIcon, RouteIcon } from "@/components/EllyIcons";

type Props = {
  onSelect: (destination: string) => void;
};

const C = ELLY_COLORS;

export default function DestinationInput({ onSelect }: Props) {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const canContinue = value.trim().length > 1;

  const matches = value.trim().length
    ? DESTINATION_SUGGESTIONS.filter((d) =>
        `${d.name} ${d.country}`.toLowerCase().includes(value.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  const pick = (label: string) => {
    setValue(label);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: C.bg, color: C.text }}>
      <div
        className="absolute pointer-events-none"
        style={{ top: -30, right: -60, width: 220, height: 220, color: C.accent, opacity: 0.11 }}
      >
        <RouteIcon size={220} />
      </div>

      <div className="flex-1 px-6 pt-16 pb-40 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-[46px] h-[46px] rounded-full flex items-center justify-center"
            style={{ border: `1.3px solid ${C.border}`, background: C.bgElev, color: C.accent }}
          >
            <PinIcon size={21} />
          </div>
          <Link href="/viaggio/i-miei-viaggi" className="text-[12.5px] font-semibold pt-3" style={{ color: C.textMuted }}>
            I miei viaggi
          </Link>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Passo 1 di 5
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ color: C.text, fontFamily: "'Fraunces', serif" }}>
          Dove vuoi andare?
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>
          Scrivi una destinazione, o scegli tra i suggerimenti.
        </p>

        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => { if (e.key === "Enter" && canContinue) onSelect(value.trim()); }}
            placeholder="Es. Lisbona, Giappone, Toscana…"
            autoFocus
            className="w-full rounded-xl px-4 py-[15px] text-[16px] font-semibold outline-none"
            style={{ background: C.bgElev, border: `1.3px solid ${value ? C.accent : C.border}`, color: C.text }}
          />

          {showDropdown && value.trim().length > 0 && (
            <div
              className="mt-2 rounded-xl overflow-hidden max-h-[280px] overflow-y-auto"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
            >
              {matches.length === 0 ? (
                <div className="px-4 py-3.5 text-[13px]" style={{ color: C.textMuted }}>
                  Nessun suggerimento — puoi continuare comunque scrivendo la destinazione
                </div>
              ) : (
                matches.map((d) => (
                  <div
                    key={d.name}
                    onClick={() => pick(`${d.name}, ${d.country}`)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <span className="text-[19px]">{d.flag}</span>
                    <div>
                      <div className="font-semibold text-[14px]">{d.name}</div>
                      <div className="text-[12px]" style={{ color: C.textMuted }}>{d.country}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-6 pt-4 z-50"
        style={{
          background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)",
        }}
      >
        <button
          onClick={() => canContinue && onSelect(value.trim())}
          disabled={!canContinue}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px] transition-all"
          style={{
            background: canContinue ? C.accent : C.disabledBg,
            color: canContinue ? "#fff" : C.disabledText,
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
