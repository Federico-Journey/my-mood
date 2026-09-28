"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS, TRAVEL_THEMES } from "@/lib/travelData";
import { PinIcon, CalendarIcon, CompassIcon } from "@/components/EllyIcons";
import type { GeneratedTrip, ItineraryActivity } from "@/lib/tripGenerator";

const C = ELLY_COLORS;

const CATEGORY_LABEL: Record<ItineraryActivity["category"], string> = {
  ristorante: "Ristorante",
  bar: "Bar",
  museo: "Museo",
  monumento: "Monumento",
  natura: "Natura",
  attivita: "Attività",
  vita_notturna: "Vita notturna",
  shopping: "Shopping",
  alloggio: "Alloggio",
  altro: "Altro",
};

const MONTHS = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
function formatDateLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
const MONTHS_SHORT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
function formatDateShort(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

type TripRow = {
  id: string;
  destination_name: string;
  start_date: string | null;
  duration_days: number;
  themes: string[];
  title: string;
  subtitle: string | null;
  itinerary: GeneratedTrip["days"];
};

export default function DiarioViaggioPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mapOk, setMapOk] = useState(true);

  useEffect(() => {
    supabase
      .from("trips")
      .select("id, destination_name, start_date, duration_days, themes, title, subtitle, itinerary")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setTrip(data as TripRow);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.textMuted }}>
        Carico il diario di viaggio…
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: C.bg, color: C.text }}>
        <p>Viaggio non trovato.</p>
        <Link href="/viaggio" style={{ color: C.accent }}>← Torna a Elly</Link>
      </div>
    );
  }

  const themeChips = trip.themes
    .map((tid) => TRAVEL_THEMES.find((t) => t.id === tid))
    .filter((t): t is (typeof TRAVEL_THEMES)[number] => !!t);

  const heroPhoto = trip.itinerary
    .flatMap((d) => d.activities)
    .find((a) => a.photo_url)?.photo_url ?? null;

  return (
    <div style={{ background: C.bg, color: C.text }}>
      {/* Barra azioni — nascosta in stampa */}
      <div
        className="print:hidden sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: C.bgElev, borderBottom: `1.3px solid ${C.border}` }}
      >
        <Link href={`/viaggio?id=${trip.id}`} className="text-[13px] font-semibold" style={{ color: C.textMuted }}>
          ← Torna al viaggio
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg font-bold text-[13px]"
          style={{ background: C.accent, color: "#fff" }}
        >
          Stampa / Salva PDF
        </button>
      </div>

      <div className="max-w-[720px] mx-auto px-6 py-10 print:px-0 print:py-0 print:max-w-none">
        {/* ── Copertina ─────────────────────────────────────────── */}
        <div className="mb-10 print:mb-8">
          {heroPhoto ? (
            <img
              src={heroPhoto}
              alt={trip.destination_name}
              className="w-full h-[220px] object-cover rounded-2xl mb-6 print:rounded-none"
              style={{ border: `1.3px solid ${C.border}` }}
            />
          ) : (
            <div
              className="w-full h-[180px] rounded-2xl mb-6 flex items-center justify-center print:rounded-none"
              style={{ background: C.accentSoft, border: `1.3px solid ${C.border}`, color: C.accent }}
            >
              <CompassIcon size={40} />
            </div>
          )}
          <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
            {trip.destination_name} · Diario di viaggio
          </p>
          <h1 className="text-[34px] font-bold leading-tight mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            {trip.title}
          </h1>
          {trip.subtitle && (
            <p className="text-[15px] mb-4 leading-relaxed" style={{ color: C.textMuted }}>{trip.subtitle}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap text-[13px]" style={{ color: C.textMuted }}>
            {trip.start_date && (
              <span className="flex items-center gap-1.5"><CalendarIcon size={14} />{formatDateLong(trip.start_date)}</span>
            )}
            <span>{trip.duration_days} giorni</span>
            {themeChips.map((t) => (
              <span key={t.id} className="px-2 py-0.5 rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
                {t.emoji} {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Cartina degli spostamenti ─────────────────────────── */}
        {mapOk && (
          <div className="mb-10 print:mb-8 print:break-inside-avoid">
            <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-3" style={{ color: C.accent }}>
              Cartina degli spostamenti
            </p>
            <img
              src={`/api/trip/staticmap?tripId=${trip.id}`}
              alt="Cartina degli spostamenti"
              className="w-full rounded-2xl print:rounded-none"
              style={{ border: `1.3px solid ${C.border}` }}
              onError={() => setMapOk(false)}
            />
          </div>
        )}

        {/* ── Giorno per giorno ──────────────────────────────────── */}
        <div className="flex flex-col gap-10 print:gap-6">
          {trip.itinerary.map((day) => (
            <div key={day.day} className="print:break-inside-avoid">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
                  Giorno {day.day}
                </span>
                {day.date && <span className="text-[13px]" style={{ color: C.textMuted }}>{formatDateShort(day.date)}</span>}
              </div>
              <h2 className="text-[19px] font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>{day.title}</h2>

              <div className="flex flex-col gap-4">
                {day.activities.map((act, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden print:break-inside-avoid"
                    style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
                  >
                    {act.photo_url && (
                      <img src={act.photo_url} alt={act.name} className="w-full h-[160px] object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold" style={{ color: C.accent }}>{act.time}</span>
                        <span className="text-[10px] uppercase tracking-[.3px]" style={{ color: C.textMuted }}>
                          {CATEGORY_LABEL[act.category]}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5" style={{ color: C.accent }}><PinIcon size={14} /></div>
                        <div className="font-bold text-[16px]">{act.name}</div>
                      </div>
                      <p className="text-[13.5px] mt-1.5 leading-relaxed" style={{ color: C.textMuted }}>{act.description}</p>
                      {act.tip && (
                        <p className="text-[12.5px] mt-1.5 italic leading-relaxed" style={{ color: C.textMuted }}>💡 {act.tip}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap mt-2 text-[12.5px]" style={{ color: C.textMuted }}>
                        {act.address && <span>📍 {act.address}</span>}
                        {act.estimated_cost_per_person !== null && (
                          <span className="font-semibold" style={{ color: C.text }}>
                            {act.estimated_cost_per_person === 0 ? "Gratuito" : `~€${act.estimated_cost_per_person} a persona`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[12px] mt-12 print:mt-8" style={{ color: C.textMuted }}>
          Generato con Elly
        </p>
      </div>
    </div>
  );
}
