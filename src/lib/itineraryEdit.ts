/**
 * Piccoli helper per l'editing manuale del piano (rinomina, drag and drop):
 * ricalcolo degli orari di un giorno dopo che le attività sono state
 * riordinate o spostate da un altro giorno.
 */

import type { ItineraryActivity, ItineraryDay } from "./tripGenerator";

function timeToMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

function minutesToTime(mins: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(mins)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Riassegna gli orari delle attività di un giorno nel nuovo ordine, distribuendole
 * nello stesso arco di tempo che il giorno occupava già (dal suo orario più
 * presto al più tardi). Così l'ordine resta sempre cronologico dopo un
 * riordino o dopo che un'attività arriva da un altro giorno — senza bisogno
 * di conoscere gli orari di inizio/cena scelti in fase di generazione.
 */
export function recomputeDayTimes(activities: ItineraryActivity[]): ItineraryActivity[] {
  if (activities.length === 0) return activities;
  const known = activities.map((a) => timeToMinutes(a.time)).filter((t): t is number => t !== null);

  if (activities.length === 1) {
    return [{ ...activities[0], time: minutesToTime(known[0] ?? 9 * 60) }];
  }

  const fallbackStart = 9 * 60;
  const minGapMinutes = 45;
  let start = known.length ? Math.min(...known) : fallbackStart;
  let end = known.length > 1 ? Math.max(...known) : start + (activities.length - 1) * 90;
  if (end - start < minGapMinutes * (activities.length - 1)) {
    end = start + minGapMinutes * (activities.length - 1);
  }
  const span = end - start;

  return activities.map((act, i) => ({
    ...act,
    time: minutesToTime(start + Math.round((span * i) / (activities.length - 1))),
  }));
}

export function recomputeDay(day: ItineraryDay): ItineraryDay {
  return { ...day, activities: recomputeDayTimes(day.activities) };
}
