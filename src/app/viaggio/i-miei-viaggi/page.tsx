"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS, TRAVEL_THEMES } from "@/lib/travelData";
import { CompassIcon, CalendarIcon } from "@/components/EllyIcons";
import type { User } from "@supabase/supabase-js";
import AppPage from "@/components/AppPage";

const C = ELLY_COLORS;

type SavedTrip = {
  id: string;
  destination_name: string;
  title: string;
  subtitle: string | null;
  duration_days: number;
  themes: string[];
  start_date: string | null;
  created_at: string;
  approved_at: string | null;
};

const MONTHS_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

export default function IMieiViaggiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("trips")
          .select("id, destination_name, title, subtitle, duration_days, themes, start_date, created_at, approved_at")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });
        setTrips(data ?? []);
      }
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("trips").delete().eq("id", id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppPage>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[.1em] pt-5" style={{ color: C.textMuted }}>
          I tuoi itinerari
        </p>
        <h1 className="text-[26px] font-medium leading-tight mt-1 mb-1">
          I miei viaggi
        </h1>
        {user && (
          <p className="text-[13px] mb-4" style={{ color: C.textMuted }}>{user.email}</p>
        )}
        {user && (
          <Link
            href="/viaggi"
            className="flex items-center justify-between rounded-xl px-4 py-3 mb-8 text-[13.5px] font-bold"
            style={{ background: C.accentSoft, color: C.accent }}
          >
            <span>✓ Viaggi confermati e prenotazioni</span>
            <span>→</span>
          </Link>
        )}

        {loading && (
          <div className="flex justify-center pt-16">
            <p className="text-[14px]" style={{ color: C.textMuted }}>Carico i tuoi viaggi…</p>
          </div>
        )}

        {/* Non loggato */}
        {!loading && !user && (
          <div className="text-center pt-12">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.accent }}
            >
              <CompassIcon size={24} />
            </div>
            <p className="text-[15px] mb-6 leading-relaxed" style={{ color: C.textMuted }}>
              Accedi per salvare e rivedere i tuoi viaggi in qualsiasi momento.
            </p>
            <Link
              href="/auth?redirect=/viaggio/i-miei-viaggi"
              className="inline-block px-7 py-3.5 rounded-xl font-bold text-[14px]"
              style={{ background: C.accent, color: "#fff" }}
            >
              Accedi
            </Link>
          </div>
        )}

        {/* Nessun viaggio */}
        {!loading && user && trips.length === 0 && (
          <div className="text-center pt-12">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.accent }}
            >
              <CompassIcon size={24} />
            </div>
            <p className="text-[15px] mb-6" style={{ color: C.textMuted }}>
              Non hai ancora generato nessun viaggio.
            </p>
            <Link
              href="/viaggio"
              className="inline-block px-7 py-3.5 rounded-xl font-bold text-[14px]"
              style={{ background: C.accent, color: "#fff" }}
            >
              Pianifica il tuo primo viaggio
            </Link>
          </div>
        )}

        {/* Lista viaggi */}
        {!loading && user && trips.length > 0 && (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => {
              const themeChips = trip.themes
                .map((id) => TRAVEL_THEMES.find((t) => t.id === id))
                .filter((t): t is (typeof TRAVEL_THEMES)[number] => !!t);
              return (
                <div
                  key={trip.id}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
                >
                  <Link href={`/viaggio?id=${trip.id}`} className="block px-5 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {trip.approved_at && (
                        <span
                          aria-label="Viaggio confermato"
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: C.accent, color: "#fff" }}
                        >
                          ✓
                        </span>
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-[.3px]" style={{ color: C.accent }}>
                        {trip.destination_name}
                      </span>
                      <span className="text-[11px]" style={{ color: C.textMuted }}>· {trip.duration_days} giorni</span>
                    </div>
                    <h3 className="font-bold text-[16px] mb-1.5 pr-6">{trip.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {themeChips.map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{ background: C.accentSoft, color: C.accent }}
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px]" style={{ color: C.textMuted }}>
                      <CalendarIcon size={13} />
                      {trip.start_date ? formatDate(trip.start_date) : formatDate(trip.created_at.slice(0, 10))}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="absolute top-4 right-4 text-[11px] font-semibold"
                    style={{ color: C.disabledText }}
                  >
                    elimina
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppPage>
  );
}
