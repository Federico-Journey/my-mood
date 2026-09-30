"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import type { GeneratedTrip, ItineraryActivity, ItineraryDay } from "@/lib/tripGenerator";
import { approveTrip } from "@/lib/bookingChecklist";
import { recomputeDayTimes } from "@/lib/itineraryEdit";
import PlacePhoto, { TripCredits } from "@/components/PlacePhoto";
import { PRICES, eur, type Paywall } from "@/lib/billingConfig";

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

type ChatMessage = { role: "user" | "assistant"; text: string };
type Vote = { voter_name: string; response: string };

type Props = {
  trip: GeneratedTrip;
  tripId: string | null;
  /** Se l'utente ha fatto l'accesso ma è finito sulla versione di prova: il motivo. */
  paywall?: Paywall;
  onNewTrip: () => void;
  onRefine: (feedback: string) => Promise<GeneratedTrip>;
  onRename: (title: string) => void;
  onReorder: (days: ItineraryDay[]) => void;
};

type EditableActivity = ItineraryActivity & { _id: string };
type EditableDay = Omit<ItineraryDay, "activities"> & { activities: EditableActivity[] };

function withEditIds(days: ItineraryDay[]): EditableDay[] {
  return days.map((d) => ({
    ...d,
    activities: d.activities.map((a, i) => ({
      ...a,
      _id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${d.day}-${i}-${Math.random()}`,
    })),
  }));
}

function stripEditIds(days: EditableDay[]): ItineraryDay[] {
  return days.map((d) => ({
    ...d,
    activities: d.activities.map(({ _id, ...a }) => a),
  }));
}

export default function TripResult({ trip, tripId, paywall = null, onNewTrip, onRefine, onRename, onReorder }: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(trip.title);

  const confirmRename = () => {
    const trimmed = titleDraft.trim();
    setEditingTitle(false);
    if (trimmed && trimmed !== trip.title) onRename(trimmed);
  };

  // Riordino del piano: teniamo una copia locale dei giorni con un id stabile
  // per attività (serve a dnd-kit), rigenerata ogni volta che arriva un
  // itinerario nuovo (nuova generazione o modifica via chat).
  const [reorderMode, setReorderMode] = useState(false);
  const [editDays, setEditDays] = useState<EditableDay[]>(() => withEditIds(trip.days));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setEditDays(withEditIds(trip.days));
  }, [trip]);

  const activeActivity = useMemo(
    () => (activeId ? editDays.flatMap((d) => d.activities).find((a) => a._id === activeId) ?? null : null),
    [activeId, editDays]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const activeActId = String(active.id);
    const overId = String(over.id);

    const srcDayIdx = editDays.findIndex((d) => d.activities.some((a) => a._id === activeActId));
    if (srcDayIdx === -1) return;
    const srcActIdx = editDays[srcDayIdx].activities.findIndex((a) => a._id === activeActId);
    const moving = editDays[srcDayIdx].activities[srcActIdx];

    let dstDayIdx = editDays.findIndex((d) => d.activities.some((a) => a._id === overId));
    let dstActIdx: number;
    if (dstDayIdx === -1) {
      const m = /^day-drop-(\d+)$/.exec(overId);
      if (!m) return;
      dstDayIdx = editDays.findIndex((d) => d.day === Number(m[1]));
      if (dstDayIdx === -1) return;
      dstActIdx = editDays[dstDayIdx].activities.length;
    } else {
      dstActIdx = editDays[dstDayIdx].activities.findIndex((a) => a._id === overId);
    }

    const next = editDays.map((d) => ({ ...d, activities: [...d.activities] }));
    next[srcDayIdx].activities.splice(srcActIdx, 1);
    if (srcDayIdx === dstDayIdx && srcActIdx < dstActIdx) dstActIdx -= 1;
    next[dstDayIdx].activities.splice(dstActIdx, 0, moving);

    next[srcDayIdx] = { ...next[srcDayIdx], activities: recomputeDayTimes(next[srcDayIdx].activities) as EditableActivity[] };
    if (dstDayIdx !== srcDayIdx) {
      next[dstDayIdx] = { ...next[dstDayIdx], activities: recomputeDayTimes(next[dstDayIdx].activities) as EditableActivity[] };
    }

    setEditDays(next);
    onReorder(stripEditIds(next));
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
  }, []);

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
        {editingTitle ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              autoFocus
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={confirmRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); confirmRename(); }
                if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(trip.title); }
              }}
              className="flex-1 min-w-0 text-[22px] font-bold leading-tight rounded-lg px-2.5 py-1.5 outline-none"
              style={{ fontFamily: "var(--font-display)", background: C.bgElev, border: `1.5px solid ${C.accent}`, color: C.text }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={confirmRename}
              aria-label="Salva il nome del viaggio"
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px]"
              style={{ background: C.accent, color: "#fff" }}
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setTitleDraft(trip.title); setEditingTitle(true); }}
            className="flex items-center gap-2 mb-1 text-left"
            aria-label="Rinomina il viaggio"
          >
            <h2 className="text-[26px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {trip.title}
            </h2>
            <span className="text-[14px] shrink-0" style={{ color: C.textMuted }} aria-hidden="true">✎</span>
          </button>
        )}
        <p className="text-sm mb-4 leading-relaxed" style={{ color: C.textMuted }}>{trip.subtitle}</p>

        {trip.mode === "trial" && (
          <div className="mb-4 rounded-xl px-4 py-3 text-[13px] leading-relaxed" style={{ background: C.accentSoft, color: C.text }}>
            <strong>Versione base.</strong> I luoghi vengono dal nostro archivio aperto e non sono verificati su Google Maps.{" "}
            {loggedIn ? (
              <>
                {paywall === "chosen_base"
                  ? "Hai scelto la versione base: il tuo viaggio completo resta disponibile. Per usarlo, rigenera il viaggio scegliendo «Viaggio completo». "
                  : paywall === "limit_day"
                  ? "Hai raggiunto il limite di nuovi viaggi di oggi: domani potrai crearne altri con luoghi verificati. "
                  : paywall === "limit_month"
                    ? "Hai usato i viaggi di questo periodo: puoi comprare un viaggio singolo o attendere il rinnovo. "
                    : `Per luoghi verificati scegli un viaggio singolo (${eur(PRICES.tripEur)}) o l'abbonamento mensile (${eur(PRICES.monthlyEur)}). `}
                {paywall !== "chosen_base" && (
                  <Link href="/prezzi" className="font-bold underline" style={{ color: C.accent }}>Vedi i prezzi</Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href={`/auth?redirect=${encodeURIComponent(tripId ? `/viaggio?id=${tripId}` : "/viaggio")}`}
                  className="font-bold underline"
                  style={{ color: C.accent }}
                >
                  Accedi
                </Link>{" "}
                per itinerari con luoghi verificati: il primo viaggio è gratis.
              </>
            )}
          </div>
        )}

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

        <div className="flex items-center justify-between mb-1">
          <p className="text-[12px] font-semibold uppercase tracking-[.5px]" style={{ color: C.accent }}>
            Giorno per giorno
          </p>
          <button
            type="button"
            onClick={() => setReorderMode((v) => !v)}
            className="text-[12.5px] font-bold"
            style={{ color: C.accent }}
          >
            {reorderMode ? "Fatto" : "Riordina ⠿"}
          </button>
        </div>
        {reorderMode && (
          <p className="text-[12px] mb-3 leading-snug" style={{ color: C.textMuted }}>
            Trascina un&apos;attività dalla maniglia ⠿ per spostarla, anche su un altro giorno: gli orari di quel giorno si aggiornano da soli.
          </p>
        )}

        {reorderMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="flex flex-col gap-6 mt-3">
              {editDays.map((day) => (
                <DayDropZone key={day.day} day={day} />
              ))}
            </div>
            <DragOverlay>
              {activeActivity ? (
                <div className="rounded-xl p-3.5 min-w-[240px] max-w-[320px]" style={{ background: C.bgElev, border: `1.5px solid ${C.accent}`, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
                  <ActivityCardBody act={activeActivity} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-col gap-6 mt-3">
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

                {/* Colonna degli orari a sinistra, card a destra: niente più linea né pallini. */}
                <div className="flex flex-col gap-2.5">
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-11 shrink-0 pt-4 text-right">
                        <span
                          className="text-[12px] font-bold tabular-nums leading-tight"
                          style={{ color: C.accent, fontFamily: "var(--font-display)" }}
                        >
                          {act.time}
                        </span>
                      </div>
                      <div
                        className="flex-1 rounded-xl p-3.5 min-w-0"
                        style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
                      >
                        <ActivityCardBody act={act} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <TripCredits activities={trip.days.flatMap((d) => d.activities)} />

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

function ActivityCardBody({ act }: { act: ItineraryActivity }) {
  const showPhoto = !!act.photo_url;
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <span className="text-[10px] uppercase tracking-[.3px]" style={{ color: C.textMuted }}>
          {CATEGORY_LABEL[act.category]}
        </span>
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
          ) : act.maps_url ? (
            <a
              href={act.maps_url}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-semibold underline"
              style={{ color: C.textMuted }}
            >
              Cerca su Google Maps · da verificare
            </a>
          ) : (
            <span className="text-[11px]" style={{ color: C.disabledText }}>
              luogo da verificare
            </span>
          )}
        </div>
      </div>
      {showPhoto && (
        <div className="w-[72px] shrink-0">
          <PlacePhoto
            src={act.photo_url!}
            alt={act.name}
            credit={act.photo_credit}
            className="w-[72px] h-[72px] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

function SortableActivityRow({ act }: { act: EditableActivity }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: act._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-3">
      <div className="w-11 shrink-0 pt-4 text-right">
        <span
          className="text-[12px] font-bold tabular-nums leading-tight"
          style={{ color: C.accent, fontFamily: "var(--font-display)" }}
        >
          {act.time}
        </span>
      </div>
      <div
        className="flex-1 rounded-xl p-3.5 min-w-0 flex gap-2"
        style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Trascina per spostare l'attività"
          className="shrink-0 w-7 flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing touch-none"
          style={{ color: C.textMuted, touchAction: "none" }}
        >
          <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="3" r="1.4" /><circle cx="10" cy="3" r="1.4" />
            <circle cx="4" cy="9" r="1.4" /><circle cx="10" cy="9" r="1.4" />
            <circle cx="4" cy="15" r="1.4" /><circle cx="10" cy="15" r="1.4" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <ActivityCardBody act={act} />
        </div>
      </div>
    </div>
  );
}

function DayDropZone({ day }: { day: EditableDay }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-drop-${day.day}` });
  return (
    <div>
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
      <SortableContext items={day.activities.map((a) => a._id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2.5 rounded-xl p-1.5 -m-1.5 min-h-[64px]"
          style={{ background: isOver ? C.accentSoft : "transparent" }}
        >
          {day.activities.map((act) => (
            <SortableActivityRow key={act._id} act={act} />
          ))}
          {day.activities.length === 0 && (
            <div
              className="rounded-xl p-4 text-center text-[12.5px]"
              style={{ border: `1.5px dashed ${C.border}`, color: C.textMuted }}
            >
              Trascina qui un&apos;attività
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
