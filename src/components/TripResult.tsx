"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import {
  PinIcon, ForkKnifeIcon, GlassIcon, MuseumIcon, ObeliskIcon,
  LeafIcon, CompassIcon, MoonIcon, BagIcon, BedIcon,
} from "@/components/EllyIcons";
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

const CATEGORY_ICON: Record<ItineraryActivity["category"], React.ComponentType<{ size?: number }>> = {
  ristorante: ForkKnifeIcon,
  bar: GlassIcon,
  museo: MuseumIcon,
  monumento: ObeliskIcon,
  natura: LeafIcon,
  attivita: CompassIcon,
  vita_notturna: MoonIcon,
  shopping: BagIcon,
  alloggio: BedIcon,
  altro: PinIcon,
};

const MONTHS_SHORT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

type ChatMessage = { role: "user" | "assistant"; text: string };
type Vote = { voter_name: string; response: string };

type Props = {
  trip: GeneratedTrip;
  tripId: string | null;
  onNewTrip: () => void;
  onRefine: (feedback: string) => Promise<GeneratedTrip>;
};

export default function TripResult({ trip, tripId, onNewTrip, onRefine }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<"unknown" | "guest" | "not-saved" | "saving" | "saved">("unknown");

  const [shareId, setShareId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Vote[] | null>(null);
  const [votesLoading, setVotesLoading] = useState(false);

  const loadVotes = async (sid: string) => {
    setVotesLoading(true);
    const { data } = await supabase
      .from("trip_votes")
      .select("voter_name, response")
      .eq("share_id", sid)
      .order("created_at", { ascending: true });
    setVotes(data ?? []);
    setVotesLoading(false);
  };

  // Verifica se il viaggio e' gia' associato all'account dell'utente loggato
  // (generato mentre era loggato) o se serve ancora un salvataggio esplicito.
  useEffect(() => {
    if (!tripId) { setSaveState("not-saved"); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setSaveState("guest"); return; }
      const { data } = await supabase.from("trips").select("user_id").eq("id", tripId).maybeSingle();
      setSaveState(data?.user_id === session.user.id ? "saved" : "not-saved");
    });
  }, [tripId]);

  const handleSaveTrip = async () => {
    if (!tripId || saveState === "saving") return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = `/auth?redirect=${encodeURIComponent(`/viaggio?id=${tripId}`)}`;
      return;
    }
    setSaveState("saving");
    const { error } = await supabase.from("trips").update({ user_id: session.user.id }).eq("id", tripId);
    setSaveState(error ? "not-saved" : "saved");
  };

  // Se questo viaggio è già stato condiviso in passato (es. riaperto da
  // "I miei viaggi"), recuperiamo subito il link e i voti già arrivati,
  // senza dover ricliccare "Condividi".
  useEffect(() => {
    if (!tripId) return;
    supabase
      .from("shared_trips")
      .select("id")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setShareId(data.id);
          setShareUrl(`${window.location.origin}/viaggio/condividi/${data.id}`);
          loadVotes(data.id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const handleShare = async () => {
    setSharing(true);
    setShareError(null);
    try {
      const res = await fetch("/api/trip/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, trip, themeAccent: C.accent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore nella creazione del link.");
      const url = `${window.location.origin}/viaggio/condividi/${data.id}`;
      setShareId(data.id);
      setShareUrl(url);
      loadVotes(data.id);
      if (navigator.clipboard) {
        try { await navigator.clipboard.writeText(url); } catch { /* clipboard non disponibile */ }
      }
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Non sono riuscito a creare il link.");
    } finally {
      setSharing(false);
    }
  };

  const sendFeedback = async (text: string) => {
    if (!text.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);
    setError(null);
    try {
      const updated = await onRefine(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: updated.changeSummary || "Fatto, ho aggiornato il piano." },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Non sono riuscito ad aggiornare il piano.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => sendFeedback(input.trim());

  const handleFewerActivities = () =>
    sendFeedback(
      "Riduci leggermente il numero di attività per ogni giorno (togli circa una attività a giornata, dando priorità a quelle meno importanti), lasciando più tempo libero e un ritmo più rilassato. Non cambiare altro."
    );

  const handleMoreActivities = () =>
    sendFeedback(
      "Aggiungi circa una attività in più per ogni giorno, mantenendo comunque un ritmo rilassato e senza riempire ogni fascia oraria. Non cambiare altro."
    );

  const yesVotes = votes?.filter((v) => v.response === "yes") ?? [];
  const maybeVotes = votes?.filter((v) => v.response === "maybe") ?? [];
  const noVotes = votes?.filter((v) => v.response === "no") ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-32">
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Il tuo itinerario
        </p>
        <h2 className="text-[26px] font-bold leading-tight mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          {trip.title}
        </h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: C.textMuted }}>{trip.subtitle}</p>

        {/* Condividi con il gruppo + diario stampabile */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13.5px]"
              style={{ background: C.accentSoft, color: C.accent, border: `1.3px solid ${C.border}` }}
            >
              {sharing ? "Creo il link…" : shareUrl ? "Aggiorna il link" : "Condividi con il gruppo"}
            </button>
            {tripId && (
              <a
                href={`/viaggio/diario/${tripId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13.5px]"
                style={{ background: C.bgElev, color: C.text, border: `1.3px solid ${C.border}` }}
              >
                Diario di viaggio (stampabile)
              </a>
            )}
            {tripId && saveState !== "unknown" && (
              saveState === "saved" ? (
                <span className="flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-semibold" style={{ color: C.textMuted }}>
                  ✓ Salvato nei tuoi viaggi
                </span>
              ) : (
                <button
                  onClick={handleSaveTrip}
                  disabled={saveState === "saving"}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13.5px]"
                  style={{ background: C.bgElev, color: C.text, border: `1.3px solid ${C.border}` }}
                >
                  {saveState === "saving" ? "Salvo…" : "Salva nei miei viaggi"}
                </button>
              )
            )}
          </div>
          {shareError && <p className="text-[12px] mt-2" style={{ color: C.accent }}>{shareError}</p>}

          {shareUrl && (
            <div
              className="mt-3 rounded-xl p-4"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12.5px] flex-1 min-w-0 truncate" style={{ color: C.textMuted }}>{shareUrl}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  className="text-[12px] font-bold shrink-0"
                  style={{ color: C.accent }}
                >
                  Copia link
                </button>
              </div>

              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[.5px]" style={{ color: C.accent }}>
                  Voti del gruppo
                </p>
                <button
                  onClick={() => shareId && loadVotes(shareId)}
                  disabled={votesLoading}
                  className="text-[11px] font-semibold"
                  style={{ color: C.textMuted }}
                >
                  {votesLoading ? "Aggiorno…" : "Aggiorna"}
                </button>
              </div>

              {votes && votes.length > 0 ? (
                <div className="flex gap-2 mt-2.5">
                  <VoteCount emoji="🙋" count={yesVotes.length} names={yesVotes.map((v) => v.voter_name)} />
                  <VoteCount emoji="🤔" count={maybeVotes.length} names={maybeVotes.map((v) => v.voter_name)} />
                  <VoteCount emoji="😔" count={noVotes.length} names={noVotes.map((v) => v.voter_name)} />
                </div>
              ) : (
                <p className="text-[12.5px] mt-1.5" style={{ color: C.textMuted }}>
                  Nessuna risposta ancora — manda il link al gruppo.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {trip.days.map((day) => (
            <div key={day.day}>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: C.accentSoft, color: C.accent }}
                >
                  Giorno {day.day}
                </span>
                {day.date && <span className="text-[12px]" style={{ color: C.textMuted }}>{formatDate(day.date)}</span>}
              </div>
              <h3 className="text-[15px] font-bold mb-3">{day.title}</h3>

              {/* Timeline: una riga a sinistra collega i pallini di ogni tappa della giornata */}
              <div className="relative pl-1">
                <div
                  className="absolute top-1 bottom-1"
                  style={{ left: "9px", width: "1.5px", background: C.border }}
                />
                <div className="flex flex-col gap-2.5">
                  {day.activities.map((act, i) => {
                    const CategoryIcon = CATEGORY_ICON[act.category];
                    return (
                    <div key={i} className="flex gap-3">
                      <div className="relative z-10 w-6 shrink-0 flex justify-center pt-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: C.accent, color: "#fff", boxShadow: `0 0 0 3px ${C.bg}` }}
                        >
                          <CategoryIcon size={13} />
                        </div>
                      </div>
                      <div
                        className="flex-1 rounded-xl p-3.5"
                        style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
                            style={{ background: C.bg, color: C.accent }}
                          >
                            <PinIcon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold" style={{ color: C.accent }}>{act.time}</span>
                              <span className="text-[10px] uppercase tracking-[.3px]" style={{ color: C.textMuted }}>
                                {CATEGORY_LABEL[act.category]}
                              </span>
                            </div>
                            <div className="font-bold text-[14.5px] mt-0.5">{act.name}</div>
                            <p className="text-[13px] mt-1 leading-snug" style={{ color: C.textMuted }}>{act.description}</p>
                            {act.tip && (
                              <p className="text-[12px] mt-1.5 italic leading-snug" style={{ color: C.textMuted }}>
                                💡 {act.tip}
                              </p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap mt-2">
                              {act.estimated_cost_per_person !== null && (
                                <span className="text-[12px] font-semibold">
                                  {act.estimated_cost_per_person === 0 ? "Gratuito" : `~€${act.estimated_cost_per_person} a persona`}
                                </span>
                              )}
                              {act.verified && act.maps_url ? (
                                <a
                                  href={act.maps_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[12px] font-semibold underline"
                                  style={{ color: C.accent }}
                                >
                                  Apri in Google Maps
                                  {act.rating ? ` · ★ ${act.rating}` : ""}
                                </a>
                              ) : (
                                <span className="text-[11px]" style={{ color: C.disabledText }}>
                                  luogo da verificare
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );})}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Modifica il piano via chat ─────────────────────────── */}
        <div className="mt-10">
          <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-3" style={{ color: C.accent }}>
            Modifica il piano
          </p>
          <p className="text-[13px] mb-4 leading-relaxed" style={{ color: C.textMuted }}>
            Scrivi cosa vuoi cambiare (es. &quot;togli il museo del giorno 2&quot;, &quot;più vita notturna&quot;,
            &quot;il ristorante del giorno 1 è troppo caro&quot;) e aggiorno l&apos;itinerario qui sopra.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleFewerActivities}
              disabled={sending}
              className="flex-1 px-3 py-2.5 rounded-xl font-semibold text-[12.5px]"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
            >
              😌 Meno attività, più relax
            </button>
            <button
              onClick={handleMoreActivities}
              disabled={sending}
              className="flex-1 px-3 py-2.5 rounded-xl font-semibold text-[12.5px]"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
            >
              ⚡ Più attività
            </button>
          </div>

          {messages.length > 0 && (
            <div className="flex flex-col gap-2.5 mb-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl px-3.5 py-2.5 text-[13px] leading-snug max-w-[88%]"
                  style={
                    m.role === "user"
                      ? { background: C.accent, color: "#fff", alignSelf: "flex-end" }
                      : { background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text, alignSelf: "flex-start" }
                  }
                >
                  {m.text}
                </div>
              ))}
              {sending && (
                <div
                  className="rounded-xl px-3.5 py-2.5 text-[13px]"
                  style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.textMuted, alignSelf: "flex-start" }}
                >
                  Sto aggiornando il piano…
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-[12px] mb-2" style={{ color: C.accent }}>{error}</p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Scrivi una modifica…"
              disabled={sending}
              className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="px-4 rounded-xl font-bold text-[14px]"
              style={{
                background: sending || !input.trim() ? C.disabledBg : C.accent,
                color: sending || !input.trim() ? C.disabledText : "#fff",
              }}
            >
              Invia
            </button>
          </div>
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
          onClick={onNewTrip}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
        >
          Pianifica un altro viaggio
        </button>
      </div>
    </div>
  );
}

function VoteCount({ emoji, count, names }: { emoji: string; count: number; names: string[] }) {
  if (count === 0) return null;
  return (
    <div className="flex-1 rounded-lg py-2 px-2 text-center" style={{ background: C.bg, border: `1.3px solid ${C.border}` }}>
      <p className="text-[16px] mb-0.5">{emoji}</p>
      <p className="font-bold text-[15px] mb-0.5">{count}</p>
      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>
        {names.slice(0, 2).join(", ")}{names.length > 2 ? ` +${names.length - 2}` : ""}
      </p>
    </div>
  );
}
