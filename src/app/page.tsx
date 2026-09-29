"use client";

/**
 * Home di Elly.
 * - Con login: prossimo viaggio (foto reale + coordinate del primo luogo
 *   verificato, voti del gruppo), ultimi viaggi, archivio dei diari PDF.
 * - Senza login: presentazione breve e invito a pianificare.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS, TRAVEL_THEMES } from "@/lib/travelData";
import type { ItineraryDay } from "@/lib/tripGenerator";
import AppPage from "@/components/AppPage";

const C = ELLY_COLORS;

type HomeTrip = {
  id: string;
  destination_name: string;
  title: string;
  duration_days: number;
  start_date: string | null;
  approved_at: string | null;
  themes: string[];
  itinerary: ItineraryDay[] | null;
  created_at: string;
};

type Votes = { yes: number; maybe: number; no: number };

const MONTHS_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysUntil(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / 86400000);
}

function dateRange(start: string | null, days: number) {
  if (!start) return `${days} ${days === 1 ? "giorno" : "giorni"}`;
  const [y, m, d] = start.slice(0, 10).split("-").map(Number);
  const end = new Date(y, m - 1, d + days - 1);
  const sameMonth = end.getMonth() === m - 1;
  return sameMonth
    ? `${d}–${end.getDate()} ${MONTHS_SHORT[m - 1]}`
    : `${d} ${MONTHS_SHORT[m - 1]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]}`;
}

function firstPhoto(trip: HomeTrip) {
  for (const day of trip.itinerary ?? []) for (const a of day.activities) if (a.verified && a.photo_url) return a.photo_url;
  return null;
}

function coordinates(trip: HomeTrip) {
  for (const day of trip.itinerary ?? []) for (const a of day.activities) {
    if (a.latitude !== null && a.longitude !== null) {
      const lat = `${Math.abs(a.latitude).toFixed(2)}°${a.latitude >= 0 ? "N" : "S"}`;
      const lng = `${Math.abs(a.longitude).toFixed(2)}°${a.longitude >= 0 ? "E" : "W"}`;
      return `${lat} · ${lng}`;
    }
  }
  return null;
}

function themeLabels(trip: HomeTrip) {
  return trip.themes
    .map((id) => TRAVEL_THEMES.find((t) => t.id === id)?.label)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
}

function voteText(v: Votes | undefined) {
  if (!v) return "Non ancora condiviso";
  const total = v.yes + v.maybe + v.no;
  if (total === 0) return "Voti in attesa";
  const parts = [v.yes && `${v.yes} sì`, v.maybe && `${v.maybe} forse`, v.no && `${v.no} no`].filter(Boolean);
  return parts.join(", ");
}

function Photo({ src, className }: { src: string | null; className: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" className={`${className} object-cover`} />
  ) : (
    <div className={className} style={{ background: `linear-gradient(135deg, ${C.accentSoft2}, ${C.accentSoft})` }} />
  );
}

function Tally({ v }: { v: Votes | undefined }) {
  if (!v) return null;
  const dots = [
    ...Array(v.yes).fill(C.accent),
    ...Array(v.maybe).fill("#D8A7B4"),
    ...Array(v.no).fill(C.border),
  ].slice(0, 8);
  if (dots.length === 0) return null;
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      {dots.map((color, i) => <i key={i} className="block w-[7px] h-[7px] rounded-full" style={{ background: color }} />)}
    </span>
  );
}

export default function HomePage() {
  const [status, setStatus] = useState<"loading" | "guest" | "ready">("loading");
  const [name, setName] = useState<string | null>(null);
  const [trips, setTrips] = useState<HomeTrip[]>([]);
  const [votes, setVotes] = useState<Record<string, Votes>>({});

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setStatus("guest"); return; }

      const [{ data: profile }, { data: tripData }] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", session.user.id).maybeSingle(),
        supabase
          .from("trips")
          .select("id, destination_name, title, duration_days, start_date, approved_at, themes, itinerary, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setName(profile?.name ? String(profile.name).split(" ")[0] : null);
      const list = (tripData ?? []) as HomeTrip[];
      setTrips(list);

      if (list.length > 0) {
        const { data: shares } = await supabase
          .from("shared_trips")
          .select("id, trip_id")
          .in("trip_id", list.map((t) => t.id));
        const shareToTrip = new Map((shares ?? []).map((s) => [s.id as string, s.trip_id as string]));
        const v: Record<string, Votes> = {};
        for (const tripId of shareToTrip.values()) v[tripId] ??= { yes: 0, maybe: 0, no: 0 };
        if (shareToTrip.size > 0) {
          const { data: voteRows } = await supabase
            .from("trip_votes")
            .select("share_id, response")
            .in("share_id", Array.from(shareToTrip.keys()));
          for (const r of voteRows ?? []) {
            const tripId = shareToTrip.get(r.share_id as string);
            if (!tripId) continue;
            const key = r.response as keyof Votes;
            if (key in v[tripId]) v[tripId][key]++;
          }
        }
        setVotes(v);
      }
      setStatus("ready");
    });
  }, []);

  const today = todayIso();
  const upcoming = trips
    .filter((t) => t.start_date && t.start_date.slice(0, 10) >= today)
    .sort((a, b) => Number(!!b.approved_at) - Number(!!a.approved_at) || a.start_date!.localeCompare(b.start_date!));
  const hero = upcoming[0] ?? trips[0] ?? null;
  const others = trips.filter((t) => t.id !== hero?.id).slice(0, 3);

  const dateLine = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const heroDays = hero?.start_date ? daysUntil(hero.start_date) : null;
  const headline = !hero
    ? `Ciao${name ? ` ${name}` : ""}, dove si va?`
    : heroDays === null || heroDays < 0
      ? `Ciao${name ? ` ${name}` : ""}, riprendiamo da ${hero.destination_name}?`
      : heroDays === 0
        ? `Si parte oggi per ${hero.destination_name}`
        : heroDays === 1
          ? `Domani si parte per ${hero.destination_name}`
          : `Ciao${name ? ` ${name}` : ""}, ${hero.destination_name} ti aspetta tra ${heroDays} giorni`;

  return (
    <AppPage>
      {status === "loading" && (
        <p className="text-[14px] text-center pt-16" style={{ color: C.textMuted }}>Un attimo…</p>
      )}

      {status === "guest" && (
        <div className="pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em]" style={{ color: C.textMuted }}>Pianificatore di viaggi di gruppo</p>
          <h1 className="text-[32px] font-medium leading-[1.08] mt-2 mb-3" style={{ textWrap: "balance" }}>
            Il viaggio del gruppo, deciso insieme.
          </h1>
          <p className="text-[15px] leading-relaxed mb-7" style={{ color: C.textMuted }}>
            Scegli meta, date e mood. Elly scrive l&apos;itinerario giorno per giorno con luoghi reali, il gruppo vota e voi prenotate.
          </p>
          <Link
            href="/viaggio"
            className="block text-center py-4 rounded-xl font-bold text-[15px]"
            style={{ background: C.accent, color: "#fff" }}
          >
            Pianifica un viaggio
          </Link>
          <p className="text-center text-[13.5px] mt-4" style={{ color: C.textMuted }}>
            Hai già un account?{" "}
            <Link href="/auth" className="font-bold" style={{ color: C.accent }}>Accedi</Link>
          </p>

          <ol className="mt-10 rounded-2xl" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
            {[
              ["Scegli", "destinazione, date, persone e il mood del viaggio."],
              ["Ricevi", "un itinerario con luoghi verificati su Google Maps."],
              ["Decidete", "insieme: il gruppo vota dal link, tu confermi e prenoti."],
            ].map(([k, v], i) => (
              <li key={k} className="flex gap-3 px-4 py-3.5" style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <span className="text-[13px] font-bold tabular-nums w-4 shrink-0" style={{ color: C.accent, fontFamily: "var(--font-display)" }}>{i + 1}</span>
                <span className="text-[14px] leading-snug"><strong>{k}</strong> {v}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="pt-5 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[.1em]" style={{ color: C.textMuted }}>{dateLine}</p>
            <h1 className="text-[27px] font-medium leading-[1.1] mt-1" style={{ textWrap: "balance" }}>{headline}</h1>
          </div>

          {!hero && (
            <div className="rounded-2xl p-5" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold mb-1">Il tuo primo viaggio</p>
              <p className="text-[13.5px] mb-4 leading-relaxed" style={{ color: C.textMuted }}>
                Tocca il pulsante al centro della barra in basso, oppure parti da qui.
              </p>
              <Link href="/viaggio" className="inline-block px-5 py-3 rounded-xl font-bold text-[14px]" style={{ background: C.accent, color: "#fff" }}>
                Pianifica un viaggio
              </Link>
            </div>
          )}

          {hero && (
            <Link
              href={hero.approved_at ? `/viaggi/${hero.id}` : `/viaggio?id=${hero.id}`}
              className="block rounded-2xl p-2"
              style={{ background: C.bgElev, border: `1px solid ${C.border}` }}
            >
              <div className="relative h-[168px] rounded-xl overflow-hidden">
                <Photo src={firstPhoto(hero)} className="w-full h-full" />
                {coordinates(hero) && (
                  <span
                    className="absolute left-2 bottom-2 text-[10px] tracking-[.08em] tabular-nums px-2 py-1 rounded"
                    style={{ background: "rgba(34,32,31,.5)", color: "#fff" }}
                  >
                    {coordinates(hero)}
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between gap-3 px-2 pt-3 pb-1.5">
                <div className="min-w-0">
                  <h2 className="text-[20px] font-semibold leading-tight">{hero.destination_name}</h2>
                  <p className="text-[12.5px] mt-0.5" style={{ color: C.textMuted }}>
                    {dateRange(hero.start_date, hero.duration_days)}{themeLabels(hero) ? ` · ${themeLabels(hero)}` : ""}
                  </p>
                </div>
                {hero.approved_at ? (
                  <Stamp top="✓" bottom="confermato" />
                ) : votes[hero.id] && votes[hero.id].yes + votes[hero.id].maybe + votes[hero.id].no > 0 ? (
                  <Stamp
                    top={`${votes[hero.id].yes}/${votes[hero.id].yes + votes[hero.id].maybe + votes[hero.id].no}`}
                    bottom="sì"
                  />
                ) : null}
              </div>
            </Link>
          )}

          {others.length > 0 && (
            <>
              <SectionTitle title="I tuoi viaggi" href="/viaggio/i-miei-viaggi" link="Vedi tutti" />
              <div className="rounded-2xl" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
                {others.map((t, i) => (
                  <Link
                    key={t.id}
                    href={t.approved_at ? `/viaggi/${t.id}` : `/viaggio?id=${t.id}`}
                    className="flex items-center gap-3 p-2.5"
                    style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}
                  >
                    <Photo src={firstPhoto(t)} className="w-11 h-11 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold truncate">
                        {t.approved_at && <span style={{ color: C.accent }}>✓ </span>}
                        {t.destination_name}
                      </div>
                      <div className="text-[11.5px]" style={{ color: C.textMuted }}>
                        {t.duration_days} giorni · {voteText(votes[t.id])}
                      </div>
                    </div>
                    <Tally v={votes[t.id]} />
                  </Link>
                ))}
              </div>
            </>
          )}

          {trips.length > 0 && (
            <>
              <SectionTitle title="Archivio PDF" href="/viaggio/i-miei-viaggi" link="Tutti" />
              <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-1">
                {trips.slice(0, 8).map((t) => (
                  <a
                    key={t.id}
                    href={`/viaggio/diario/${t.id}`}
                    className="shrink-0 w-[124px] rounded-xl p-2.5"
                    style={{ background: C.bgElev, border: `1px solid ${C.border}` }}
                  >
                    <div className="h-[60px] rounded flex flex-col justify-center gap-1 px-2.5" style={{ background: C.accentSoft }}>
                      <i className="block h-[3px] rounded w-[70%]" style={{ background: C.accentSoft2 }} />
                      <i className="block h-[3px] rounded" style={{ background: C.accentSoft2 }} />
                      <i className="block h-[3px] rounded w-[55%]" style={{ background: C.accentSoft2 }} />
                    </div>
                    <div className="text-[12.5px] font-semibold mt-2 truncate">Diario {t.destination_name}</div>
                    <div className="text-[11px]" style={{ color: C.textMuted }}>{t.duration_days} giorni</div>
                  </a>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="flex justify-center gap-4 pt-8 text-[12px]" style={{ color: C.textMuted }}>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Termini</Link>
      </div>
    </AppPage>
  );
}

function SectionTitle({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="flex items-baseline justify-between pt-6 pb-2.5">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <Link href={href} className="text-[12px] font-semibold" style={{ color: C.accent }}>{link}</Link>
    </div>
  );
}

function Stamp({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span
      className="shrink-0 w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center text-center leading-none"
      style={{ border: `1.5px dashed ${C.accent}`, color: C.accent, transform: "rotate(-8deg)", fontFamily: "var(--font-display)" }}
    >
      <b className="text-[16px] font-bold">{top}</b>
      <span className="text-[7.5px] font-semibold uppercase tracking-[.1em] mt-1">{bottom}</span>
    </span>
  );
}
