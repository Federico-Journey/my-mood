"use client";

/**
 * Sezione Viaggi — solo i viaggi CONFERMATI da chi li ha creati.
 * Ogni viaggio mostra la spunta e quante prenotazioni della checklist sono
 * gia' state fatte; toccandolo si apre la checklist (/viaggi/[id]).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";

const C = ELLY_COLORS;

type ApprovedTrip = {
  id: string;
  destination_name: string;
  title: string;
  duration_days: number;
  start_date: string | null;
  approved_at: string;
};

type Progress = { done: number; total: number };

const MONTHS_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

export default function ViaggiPage() {
  const [status, setStatus] = useState<"loading" | "guest" | "ready">("loading");
  const [trips, setTrips] = useState<ApprovedTrip[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setStatus("guest"); return; }

      const { data } = await supabase
        .from("trips")
        .select("id, destination_name, title, duration_days, start_date, approved_at")
        .eq("user_id", session.user.id)
        .not("approved_at", "is", null)
        .order("start_date", { ascending: true, nullsFirst: false });
      const list = (data ?? []) as ApprovedTrip[];
      setTrips(list);

      if (list.length > 0) {
        const { data: bookings } = await supabase
          .from("trip_bookings")
          .select("trip_id, is_booked")
          .in("trip_id", list.map((t) => t.id));
        const p: Record<string, Progress> = {};
        for (const b of bookings ?? []) {
          p[b.trip_id] ??= { done: 0, total: 0 };
          p[b.trip_id].total++;
          if (b.is_booked) p[b.trip_id].done++;
        }
        setProgress(p);
      }
      setStatus("ready");
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <div className="max-w-[560px] mx-auto px-6 pt-12 pb-24">
        <Link href="/viaggio/i-miei-viaggi" className="text-[13px] font-semibold inline-block mb-6" style={{ color: C.textMuted }}>
          ← Tutti i miei viaggi
        </Link>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Si parte
        </p>
        <h1 className="text-[26px] font-bold leading-tight mb-2">Viaggi confermati</h1>
        <p className="text-[13.5px] mb-8 leading-relaxed" style={{ color: C.textMuted }}>
          Tocca un viaggio per vedere cosa resta da prenotare.
        </p>

        {status === "loading" && (
          <p className="text-[14px] text-center pt-10" style={{ color: C.textMuted }}>Carico i tuoi viaggi…</p>
        )}

        {status === "guest" && (
          <div className="text-center pt-8">
            <p className="text-[15px] mb-6" style={{ color: C.textMuted }}>Accedi per vedere i tuoi viaggi confermati.</p>
            <Link
              href="/auth?redirect=/viaggi"
              className="inline-block px-7 py-3.5 rounded-xl font-bold text-[14px]"
              style={{ background: C.accent, color: "#fff" }}
            >
              Accedi
            </Link>
          </div>
        )}

        {status === "ready" && trips.length === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
            <p className="text-[14.5px] font-bold mb-1.5">Nessun viaggio confermato</p>
            <p className="text-[13px] mb-5 leading-relaxed" style={{ color: C.textMuted }}>
              Apri un viaggio salvato e premi &quot;Confermo il viaggio&quot; quando il gruppo è d&apos;accordo.
            </p>
            <Link
              href="/viaggio/i-miei-viaggi"
              className="inline-block px-6 py-3 rounded-xl font-bold text-[13.5px]"
              style={{ background: C.accent, color: "#fff" }}
            >
              Vai ai miei viaggi
            </Link>
          </div>
        )}

        {status === "ready" && trips.length > 0 && (
          <div className="flex flex-col gap-3">
            {trips.map((t) => {
              const p = progress[t.id] ?? { done: 0, total: 0 };
              const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
              const complete = p.total > 0 && p.done === p.total;
              return (
                <Link
                  key={t.id}
                  href={`/viaggi/${t.id}`}
                  className="block rounded-2xl px-5 py-4"
                  style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-label="Viaggio confermato"
                      className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[14px] font-bold mt-0.5"
                      style={{ background: C.accent, color: "#fff" }}
                    >
                      ✓
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[.3px]" style={{ color: C.accent }}>
                        {t.destination_name}
                        <span className="font-normal normal-case tracking-normal" style={{ color: C.textMuted }}>
                          {" · "}{t.start_date ? formatDate(t.start_date) : `${t.duration_days} giorni`}
                        </span>
                      </div>
                      <h3 className="font-bold text-[16px] leading-snug mt-0.5">{t.title}</h3>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.disabledBg }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.accent }} />
                        </div>
                        <span className="text-[12px] font-semibold tabular-nums shrink-0" style={{ color: complete ? C.accent : C.textMuted }}>
                          {complete ? "Tutto prenotato" : `${p.done} di ${p.total} prenotati`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
