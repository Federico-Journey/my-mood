"use client";

import { useState } from "react";
import Link from "next/link";
import { ELLY_COLORS } from "@/lib/travelData";
import { EllyWordmark } from "@/components/EllyLogo";
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

const MONTHS_SHORT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

type Vote = { voter_name: string; response: string };

const RESPONSE_OPTIONS = [
  { value: "yes", label: "Ci sono" },
  { value: "maybe", label: "Forse" },
  { value: "no", label: "Non posso" },
];

type Props = {
  shareId: string;
  trip: GeneratedTrip;
  themeAccent: string;
  initialVotes: Vote[];
};

export default function ShareTripClient({ shareId, trip, themeAccent, initialVotes }: Props) {
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [voterName, setVoterName] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVote = async () => {
    if (!voterName.trim() || !selectedResponse) return;
    setSubmitting(true);
    const res = await fetch("/api/trip/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId, voterName: voterName.trim(), response: selectedResponse }),
    });
    if (res.ok) {
      setVotes((prev) => [...prev, { voter_name: voterName.trim(), response: selectedResponse }]);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const yesVotes = votes.filter((v) => v.response === "yes");
  const maybeVotes = votes.filter((v) => v.response === "maybe");
  const noVotes = votes.filter((v) => v.response === "no");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-12 pb-32 max-w-[560px] mx-auto w-full">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[3px]" style={{ color: C.textMuted }}>
            elly
          </span>
        </div>

        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: themeAccent }}>
          Viaggio proposto
        </p>
        <h1 className="text-[26px] font-bold leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {trip.title}
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>{trip.subtitle}</p>

        <div className="flex flex-col gap-6">
          {trip.days.map((day) => (
            <div key={day.day}>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${themeAccent}1a`, color: themeAccent }}
                >
                  Giorno {day.day}
                </span>
                {day.date && <span className="text-[12px]" style={{ color: C.textMuted }}>{formatDate(day.date)}</span>}
              </div>
              <h3 className="text-[15px] font-bold mb-3">{day.title}</h3>

              <div className="relative pl-1">
                <div className="absolute top-1 bottom-1" style={{ left: "9px", width: "1.5px", background: C.border }} />
                <div className="flex flex-col gap-2.5">
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative z-10 w-5 shrink-0 flex justify-center pt-4">
                        <div className="w-[9px] h-[9px] rounded-full" style={{ background: themeAccent, boxShadow: `0 0 0 3px ${C.bg}` }} />
                      </div>
                      <div className="flex-1 rounded-xl p-3.5" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold" style={{ color: themeAccent }}>{act.time}</span>
                              <span className="text-[10px] uppercase tracking-[.3px]" style={{ color: C.textMuted }}>
                                {CATEGORY_LABEL[act.category]}
                              </span>
                            </div>
                            <div className="font-bold text-[14.5px] mt-0.5">{act.name}</div>
                            <p className="text-[13px] mt-1 leading-snug" style={{ color: C.textMuted }}>{act.description}</p>
                            {act.tip && (
                              <p className="text-[12px] mt-1.5 italic leading-snug" style={{ color: C.textMuted }}>Consiglio: {act.tip}</p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap mt-2">
                              {act.estimated_cost_per_person !== null && (
                                <span className="text-[12px] font-semibold">
                                  {act.estimated_cost_per_person === 0 ? "Gratuito" : `~€${act.estimated_cost_per_person} a persona`}
                                </span>
                              )}
                              {act.verified && act.maps_url ? (
                                <a href={act.maps_url} target="_blank" rel="noreferrer" className="text-[12px] font-semibold underline" style={{ color: themeAccent }}>
                                  Apri in Google Maps{act.rating ? ` · ★ ${act.rating}` : ""}
                                </a>
                              ) : (
                                <span className="text-[11px]" style={{ color: C.disabledText }}>luogo da verificare</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RSVP */}
        <div className="mt-10 rounded-2xl p-5" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
          <h2 className="text-[18px] font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Chi viene?</h2>
          <p className="text-[13px] mb-4" style={{ color: C.textMuted }}>Fai sapere se ci sei!</p>

          {votes.length > 0 && (
            <div className="flex gap-2.5 mb-4">
              <VoteCount label="Sì" count={yesVotes.length} names={yesVotes.map((v) => v.voter_name)} />
              <VoteCount label="Forse" count={maybeVotes.length} names={maybeVotes.map((v) => v.voter_name)} />
              <VoteCount label="No" count={noVotes.length} names={noVotes.map((v) => v.voter_name)} />
            </div>
          )}

          {submitted ? (
            <div className="text-center rounded-xl p-4" style={{ background: `${themeAccent}14`, border: `1.3px solid ${themeAccent}40` }}>
              <p className="font-bold text-[15px]" style={{ color: themeAccent }}>
                {selectedResponse === "yes" ? "Ottimo, ci sei!" : selectedResponse === "maybe" ? "Ok, segnato come forse." : "Peccato, sarà per la prossima."}
              </p>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Il tuo nome"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                className="w-full rounded-xl px-3.5 py-3 text-[14px] outline-none mb-3"
                style={{ background: C.bg, border: `1.3px solid ${C.border}`, color: C.text }}
              />
              <div className="flex gap-2 mb-3.5">
                {RESPONSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedResponse(opt.value)}
                    className="flex-1 flex items-center justify-center py-3.5 rounded-xl"
                    style={{
                      background: selectedResponse === opt.value ? `${themeAccent}1f` : C.bg,
                      border: `1.3px solid ${selectedResponse === opt.value ? themeAccent : C.border}`,
                    }}
                  >
                    <span className="text-[13.5px] font-semibold" style={{ color: selectedResponse === opt.value ? themeAccent : C.text }}>{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleVote}
                disabled={!voterName.trim() || !selectedResponse || submitting}
                className="w-full py-3.5 rounded-xl font-bold text-[15px]"
                style={{
                  background: voterName.trim() && selectedResponse ? themeAccent : C.disabledBg,
                  color: voterName.trim() && selectedResponse ? "#fff" : C.disabledText,
                }}
              >
                {submitting ? "Invio..." : "Invia risposta"}
              </button>
            </>
          )}
        </div>

        <Link
          href="/viaggio"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-[15px] mt-6"
          style={{ background: themeAccent, color: "#fff" }}
        >
          Pianifica il tuo viaggio
        </Link>
        <div className="flex justify-center mt-6"><EllyWordmark size={20} /></div>
      </div>
    </div>
  );
}

function VoteCount({ label, count, names }: { label: string; count: number; names: string[] }) {
  if (count === 0) return null;
  return (
    <div className="flex-1 rounded-lg py-2.5 px-2 text-center" style={{ background: C.bg, border: `1.3px solid ${C.border}` }}>
      <p className="font-bold text-[18px] leading-none" style={{ fontFamily: "var(--font-display)" }}>{count}</p>
      <p className="text-[11px] font-semibold uppercase tracking-[.06em] mt-1" style={{ color: C.accent }}>{label}</p>
      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>
        {names.slice(0, 2).join(", ")}{names.length > 2 ? ` +${names.length - 2}` : ""}
      </p>
    </div>
  );
}
