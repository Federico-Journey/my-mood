"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import type { GeneratedTrip, ItineraryActivity } from "@/lib/tripGenerator";
import { approveTrip } from "@/lib/bookingChecklist";

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

// Foto reali (da Google Places) solo per le categorie dove l'immagine aiuta
// davvero a scegliere: alloggi, ristoranti, natura/panorami, monumenti.
// Ogni foto costa una chiamata a Google la prima volta che viene vista,
// quindi non le mostriamo ovunque.
const PHOTO_CATEGORIES = new Set<ItineraryActivity["category"]>(["alloggio", "ristorante", "natura", "monumento"]);

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

  // Conferma del viaggio: quando chi l'ha creato lo conferma, entra nella
  // sezione Viaggi con la checklist delle prenotazioni (vedi bookingChecklist.ts).
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

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
      const { data } = await supabase.from("trips").select("user_id, approved_at").eq("id", tripId).maybeSingle();
      setSaveState(data?.user_id === session.user.id ? "saved" : "not-saved");
      setApprovedAt(data?.approved_at ?? null);
    });
  }, [tripId]);

  const handleApprove = async () => {
    if (!tripId || approving) return;
    setApproving(true);
    setApproveError(null);
    const { error: err } = await approveTrip(tripId);
    setApproving(false);
    if (err) { setApproveError(err); return; }
    setApprovedAt(new Date().toISOString());
  };

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
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-12 pb-32">
        <Link href="/" className="text-[13px] font-semibold inline-block mb-6" style={{ color: C.textMuted }}>
          ← Home
        </Link>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Il tuo itinerario
        </p>
        <h2 className="text-[26px] font-bold leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {trip.title}
        </h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: C.textMuted }}>{trip.subtitle}</p>

        {/* Barra azioni: Salva · PDF · Condividi */}
        <div className="mb-8">
          <div
            className="grid grid-cols-3 rounded-2xl overflow-hidden"
            style={{ background: C.bgElev, border: `1px solid ${C.border}` }}
          >
            <ActionCell
              label={saveState === "saved" ? "Salvato ✓" : saveState === "saving" ? "Salvo…" : "Salva"}
              hint={
                saveState === "saved" ? "nei miei viaggi"
                : saveState === "guest" ? "accedi per salvare"
                : "nei miei viaggi"
              }
              onClick={saveState === "saved" ? undefined : handleSaveTrip}
              disabled={!tripId || saveState === "unknown" || saveState === "saving"}
              highlighted={saveState === "saved"}
            />
            <ActionCell
              label="PDF"
              hint="diario di viaggio"
              href={tripId ? `/viaggio/diario/${tripId}` : undefined}
              disabled={!tripId}
              divider
            />
            <ActionCell
              label="Condividi"
              hint={sharing ? "creo il link…" : shareUrl ? "aggiorna il link" : "invia al gruppo"}
              onClick={handleShare}
              disabled={sharing}
              divider
            />
          </div>
          {tripId && (saveState === "not-saved" || saveState === "guest") && (
            <p className="text-[12px] mt-2 leading-snug" style={{ color: C.textMuted }}>
              Questo viaggio non è ancora salvato: premi Salva per ritrovarlo in Home e in I miei viaggi.
            </p>
          )}
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

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${trip.title} — dai un'occhiata al viaggio e dimmi cosa ne pensi! ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-[13px]"
                style={{ background: "#25D366", color: "#fff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.09c-.24.68-1.4 1.33-1.93 1.4-.5.08-1.06.11-3.46-.91-2.9-1.24-4.79-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.47-.15.17-.31.37-.44.5-.15.14-.3.3-.13.58.17.29.75 1.24 1.62 2.01 1.11 1 2.05 1.31 2.34 1.45.29.15.46.13.63-.07.17-.2.72-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.68.8 1.97.94.29.15.48.22.55.34.07.13.07.72-.17 1.4z"/></svg>
                Condividi su WhatsApp
              </a>

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
                  <VoteCount label="Sì" count={yesVotes.length} names={yesVotes.map((v) => v.voter_name)} />
                  <VoteCount label="Forse" count={maybeVotes.length} names={maybeVotes.map((v) => v.voter_name)} />
                  <VoteCount label="No" count={noVotes.length} names={noVotes.map((v) => v.voter_name)} />
                </div>
              ) : (
                <p className="text-[12.5px] mt-1.5" style={{ color: C.textMuted }}>
                  Nessuna risposta ancora — manda il link al gruppo.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Conferma del viaggio (solo per chi l'ha creato e salvato) */}
        {tripId && saveState === "saved" && (
          <div
            className="mb-8 rounded-xl p-4"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
          >
            {approvedAt ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="flex items-center gap-2 text-[14px] font-bold">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[13px]"
                    style={{ background: C.accent, color: "#fff" }}
                  >
                    ✓
                  </span>
                  Viaggio confermato
                </span>
                <Link href={`/viaggi/${tripId}`} className="text-[13px] font-bold" style={{ color: C.accent }}>
                  Checklist prenotazioni →
                </Link>
              </div>
            ) : (
              <>
                {votes && votes.length > 0 && yesVotes.length > votes.length / 2 ? (
                  <p className="text-[13.5px] mb-3 leading-relaxed">
                    <strong>La maggioranza ha votato sì</strong> ({yesVotes.length} su {votes.length}). Confermi il viaggio?
                  </p>
                ) : (
                  <p className="text-[13px] mb-3 leading-relaxed" style={{ color: C.textMuted }}>
                    Quando il gruppo è d&apos;accordo, conferma il viaggio: entrerà nella sezione Viaggi con la checklist delle prenotazioni da fare.
                  </p>
                )}
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="w-full py-3 rounded-xl font-bold text-[14px]"
                  style={{ background: C.accent, color: "#fff", opacity: approving ? 0.6 : 1 }}
                >
                  {approving ? "Confermo…" : "Confermo il viaggio"}
                </button>
                {approveError && <p className="text-[12px] mt-2" style={{ color: C.accent }}>{approveError}</p>}
              </>
            )}
          </div>
        )}

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
                    const showPhoto = PHOTO_CATEGORIES.has(act.category) && !!act.photo_url;
                    return (
                    <div key={i} className="flex gap-3">
                      <div className="relative z-10 w-6 shrink-0 flex justify-center pt-4">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: C.accent, boxShadow: `0 0 0 3px ${C.bg}` }}
                        />
                      </div>
                      <div
                        className="flex-1 rounded-xl p-3.5"
                        style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
                      >
                        <div className="flex items-start gap-3">
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
                                Consiglio: {act.tip}
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
                          {showPhoto && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={act.photo_url!}
                              alt={act.name}
                              loading="lazy"
                              className="w-[72px] h-[72px] rounded-lg object-cover shrink-0"
                            />
                          )}
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
              Meno attività, più relax
            </button>
            <button
              onClick={handleMoreActivities}
              disabled={sending}
              className="flex-1 px-3 py-2.5 rounded-xl font-semibold text-[12.5px]"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
            >
              Più attività
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

function VoteCount({ label, count, names }: { label: string; count: number; names: string[] }) {
  if (count === 0) return null;
  return (
    <div className="flex-1 rounded-lg py-2 px-2 text-center" style={{ background: C.bg, border: `1.3px solid ${C.border}` }}>
      <p className="font-bold text-[18px] leading-none" style={{ fontFamily: "var(--font-display)" }}>{count}</p>
      <p className="text-[11px] font-semibold uppercase tracking-[.06em] mt-1" style={{ color: C.accent }}>{label}</p>
      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>
        {names.slice(0, 2).join(", ")}{names.length > 2 ? ` +${names.length - 2}` : ""}
      </p>
    </div>
  );
}

function ActionCell({
  label, hint, onClick, href, disabled, divider, highlighted,
}: {
  label: string;
  hint: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  divider?: boolean;
  highlighted?: boolean;
}) {
  const style = {
    borderLeft: divider ? `1px solid ${C.border}` : "none",
    background: highlighted ? C.accentSoft : "transparent",
    color: highlighted ? C.accent : C.text,
    opacity: disabled && !highlighted ? 0.45 : 1,
  } as const;
  const className = "flex flex-col items-center justify-center text-center py-3.5 px-1.5 min-h-[64px]";
  const inner = (
    <>
      <span className="text-[14.5px] font-semibold leading-tight">{label}</span>
      <span className="text-[11px] mt-0.5 leading-tight" style={{ color: highlighted ? C.accent : C.textMuted }}>{hint}</span>
    </>
  );
  if (href && !disabled) {
    return <a href={href} className={className} style={style}>{inner}</a>;
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled || !onClick} className={className} style={style}>
      {inner}
    </button>
  );
}
