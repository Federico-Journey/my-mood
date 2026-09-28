"use client";

/**
 * Checklist delle prenotazioni di un viaggio confermato.
 * Le voci sono generate dall'itinerario alla conferma (bookingChecklist.ts);
 * qui si spuntano, se ne aggiungono di nuove e si tolgono quelle inutili.
 * Visibile solo a chi ha creato il viaggio (regola nel database).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import {
  BOOKING_SECTIONS,
  approveTrip,
  unapproveTrip,
  type BookingCategory,
  type BookingItem,
} from "@/lib/bookingChecklist";

const C = ELLY_COLORS;

type TripHeader = {
  id: string;
  destination_name: string;
  title: string;
  duration_days: number;
  start_date: string | null;
  approved_at: string | null;
};

const MONTHS_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "guest" | "missing" | "ready">("loading");
  const [trip, setTrip] = useState<TripHeader | null>(null);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<BookingCategory>("altro");
  const [adding, setAdding] = useState(false);

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("trip_bookings")
      .select("id, trip_id, category, label, detail, maps_url, position, is_booked, booked_at")
      .eq("trip_id", id)
      .order("position", { ascending: true });
    setItems((data ?? []) as BookingItem[]);
  }, [id]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setStatus("guest"); return; }
      const { data } = await supabase
        .from("trips")
        .select("id, destination_name, title, duration_days, start_date, approved_at, user_id")
        .eq("id", id)
        .maybeSingle();
      if (!data || data.user_id !== session.user.id) { setStatus("missing"); return; }
      setTrip(data as TripHeader);
      await loadItems();
      setStatus("ready");
    });
  }, [id, loadItems]);

  const toggle = async (item: BookingItem) => {
    const next = !item.is_booked;
    const bookedAt = next ? new Date().toISOString() : null;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_booked: next, booked_at: bookedAt } : i)));
    const { error: err } = await supabase
      .from("trip_bookings")
      .update({ is_booked: next, booked_at: bookedAt })
      .eq("id", item.id);
    if (err) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      setError("Non sono riuscito a salvare la spunta. Controlla la connessione e riprova.");
    }
  };

  const remove = async (item: BookingItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    const { error: err } = await supabase.from("trip_bookings").delete().eq("id", item.id);
    if (err) {
      await loadItems();
      setError("Non sono riuscito a togliere la voce. Riprova.");
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label || adding) return;
    setAdding(true);
    setError(null);
    const position = items.reduce((max, i) => Math.max(max, i.position), -1) + 1;
    const { error: err } = await supabase
      .from("trip_bookings")
      .insert({ trip_id: id, category: newCategory, label, position });
    setAdding(false);
    if (err) { setError("Non sono riuscito ad aggiungere la voce. Riprova."); return; }
    setNewLabel("");
    await loadItems();
  };

  const createChecklist = async () => {
    setError(null);
    const { error: err } = await approveTrip(id);
    if (err) { setError(err); return; }
    await loadItems();
  };

  const handleUnapprove = async () => {
    const { error: err } = await unapproveTrip(id);
    if (err) { setError(err); return; }
    router.push("/viaggi");
  };

  const done = items.filter((i) => i.is_booked).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.text }}>
      <div className="max-w-[560px] mx-auto px-6 pt-12 pb-24">
        <Link href="/viaggi" className="text-[13px] font-semibold inline-block mb-6" style={{ color: C.textMuted }}>
          ← Viaggi
        </Link>

        {status === "loading" && (
          <p className="text-[14px] text-center pt-10" style={{ color: C.textMuted }}>Carico la checklist…</p>
        )}

        {status === "guest" && (
          <div className="text-center pt-8">
            <p className="text-[15px] mb-6" style={{ color: C.textMuted }}>Accedi per vedere la checklist delle prenotazioni.</p>
            <Link
              href={`/auth?redirect=${encodeURIComponent(`/viaggi/${id}`)}`}
              className="inline-block px-7 py-3.5 rounded-xl font-bold text-[14px]"
              style={{ background: C.accent, color: "#fff" }}
            >
              Accedi
            </Link>
          </div>
        )}

        {status === "missing" && (
          <p className="text-[14px] text-center pt-10" style={{ color: C.textMuted }}>
            Questo viaggio non esiste o non è tuo.
          </p>
        )}

        {status === "ready" && trip && (
          <>
            <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
              {trip.destination_name}
              {trip.start_date && (
                <span className="font-normal normal-case tracking-normal" style={{ color: C.textMuted }}>
                  {" · "}{formatDate(trip.start_date)}
                </span>
              )}
            </p>
            <h1 className="text-[24px] font-bold leading-tight mb-5">{trip.title}</h1>

            {/* Avanzamento */}
            <div className="rounded-2xl p-4 mb-7" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[14px] font-bold">Prenotazioni</span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: C.textMuted }}>
                  {done} di {items.length}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: C.disabledBg }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.accent }} />
              </div>
              <Link href={`/viaggio?id=${trip.id}`} className="inline-block text-[12.5px] font-semibold mt-3" style={{ color: C.accent }}>
                Apri l&apos;itinerario →
              </Link>
            </div>

            {error && <p className="text-[13px] mb-4" style={{ color: C.accent }}>{error}</p>}

            {items.length === 0 && (
              <div className="rounded-2xl p-5 mb-7 text-center" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
                <p className="text-[13.5px] mb-3" style={{ color: C.textMuted }}>La checklist è vuota.</p>
                <button
                  onClick={createChecklist}
                  className="px-5 py-2.5 rounded-xl font-bold text-[13.5px]"
                  style={{ background: C.accent, color: "#fff" }}
                >
                  Crea la checklist dall&apos;itinerario
                </button>
              </div>
            )}

            {/* Sezioni */}
            <div className="flex flex-col gap-6">
              {BOOKING_SECTIONS.map(({ category, title }) => {
                const section = items.filter((i) => i.category === category);
                if (section.length === 0) return null;
                return (
                  <section key={category}>
                    <h2 className="text-[12px] font-bold uppercase tracking-[.5px] mb-2" style={{ color: C.textMuted }}>
                      {title}
                    </h2>
                    <ul className="rounded-2xl overflow-hidden" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
                      {section.map((item, idx) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 px-4 py-3"
                          style={{ borderTop: idx === 0 ? "none" : `1px solid ${C.border}` }}
                        >
                          <button
                            onClick={() => toggle(item)}
                            aria-pressed={item.is_booked}
                            aria-label={item.is_booked ? `Segna ${item.label} come da prenotare` : `Segna ${item.label} come prenotato`}
                            className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[13px] font-bold"
                            style={
                              item.is_booked
                                ? { background: C.accent, color: "#fff", border: `1.5px solid ${C.accent}` }
                                : { background: "transparent", color: "transparent", border: `1.5px solid ${C.textMuted}` }
                            }
                          >
                            ✓
                          </button>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-[14px] font-semibold leading-snug"
                              style={{ textDecoration: item.is_booked ? "line-through" : "none", color: item.is_booked ? C.textMuted : C.text }}
                            >
                              {item.label}
                            </div>
                            {item.detail && (
                              <div className="text-[12px] mt-0.5" style={{ color: C.textMuted }}>{item.detail}</div>
                            )}
                          </div>
                          {item.maps_url && (
                            <a
                              href={item.maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[12px] font-semibold shrink-0"
                              style={{ color: C.accent }}
                            >
                              Mappa
                            </a>
                          )}
                          <button
                            onClick={() => remove(item)}
                            aria-label={`Togli ${item.label} dalla checklist`}
                            className="text-[16px] leading-none shrink-0 px-1"
                            style={{ color: C.disabledText }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            {/* Aggiungi voce */}
            <form
              onSubmit={add}
              className="mt-7 rounded-2xl p-4 flex flex-col gap-2.5"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
            >
              <label htmlFor="new-booking" className="text-[13px] font-bold">Aggiungi una prenotazione</label>
              <input
                id="new-booking"
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Es. Auto a noleggio, assicurazione, transfer"
                className="rounded-lg px-3 py-2.5 text-[14px]"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
              />
              <div className="flex gap-2">
                <select
                  id="new-booking-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BookingCategory)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-[13.5px]"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
                >
                  {BOOKING_SECTIONS.map((s) => (
                    <option key={s.category} value={s.category}>{s.title}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!newLabel.trim() || adding}
                  className="px-5 rounded-lg font-bold text-[13.5px]"
                  style={{
                    background: newLabel.trim() ? C.accent : C.disabledBg,
                    color: newLabel.trim() ? "#fff" : C.disabledText,
                  }}
                >
                  {adding ? "…" : "Aggiungi"}
                </button>
              </div>
            </form>

            {trip.approved_at && (
              <div className="text-center mt-10">
                <button onClick={handleUnapprove} className="text-[12px]" style={{ color: C.disabledText }}>
                  Togli dai viaggi confermati
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
