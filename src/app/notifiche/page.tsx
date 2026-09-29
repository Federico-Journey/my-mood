"use client";

/**
 * Notifiche in-app. Le notifiche di voto le crea il database (vedi
 * supabase/notifications.sql); qui le leggiamo, le segniamo come lette
 * quando l'utente le apre e permettiamo di eliminarle.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import AppPage from "@/components/AppPage";
import { BellIcon } from "@/components/EllyIcons";

const C = ELLY_COLORS;

type Notification = {
  id: string;
  type: "vote" | "bacheca" | "reminder";
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<Notification["type"], string> = {
  vote: "Voto",
  bacheca: "Bacheca",
  reminder: "Promemoria",
};

function timeAgo(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "adesso";
  if (min < 60) return `${min} min fa`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ${h === 1 ? "ora" : "ore"} fa`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} ${d === 1 ? "giorno" : "giorni"} fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

const notifyChanged = () => window.dispatchEvent(new Event("elly:notifications-changed"));

export default function NotifichePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "guest" | "ready">("loading");
  const [items, setItems] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setStatus("guest"); return; }
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as Notification[]);
    setStatus("ready");
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: n.read_at ?? now } : n)));
    await supabase.from("notifications").update({ read_at: now }).in("id", ids);
    notifyChanged();
  };

  const open = async (n: Notification) => {
    if (!n.read_at) await markRead([n.id]);
    if (n.link) router.push(n.link);
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
    notifyChanged();
  };

  const unreadIds = items.filter((n) => !n.read_at).map((n) => n.id);

  return (
    <AppPage>
      <div className="flex items-end justify-between pt-5 mb-5">
        <h1 className="text-[26px] font-medium">Notifiche</h1>
        {unreadIds.length > 0 && (
          <button onClick={() => markRead(unreadIds)} className="text-[12.5px] font-semibold pb-1" style={{ color: C.accent }}>
            Segna tutte come lette
          </button>
        )}
      </div>

      {status === "loading" && (
        <p className="text-[14px] text-center pt-10" style={{ color: C.textMuted }}>Un attimo…</p>
      )}

      {status === "guest" && (
        <div className="rounded-2xl p-6 text-center" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <p className="text-[15px] font-semibold mb-1.5">Accedi per vedere le notifiche</p>
          <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: C.textMuted }}>
            Ti avvisiamo quando qualcuno del gruppo vota un tuo viaggio.
          </p>
          <Link href="/auth?redirect=/notifiche" className="inline-block px-5 py-3 rounded-xl font-bold text-[14px]" style={{ background: C.accent, color: "#fff" }}>
            Accedi
          </Link>
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <div className="rounded-2xl p-6 text-center" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: C.accentSoft, color: C.accent }}>
            <BellIcon size={20} />
          </div>
          <p className="text-[15px] font-semibold mb-1.5">Nessuna notifica</p>
          <p className="text-[13.5px] leading-relaxed" style={{ color: C.textMuted }}>
            Quando qualcuno vota un tuo viaggio salvato, lo vedrai qui. Presto anche i nuovi articoli in Bacheca e i promemoria prima della partenza.
          </p>
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          {items.map((n, i) => (
            <div key={n.id} className="flex items-stretch" style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
              <button onClick={() => open(n)} className="flex-1 min-w-0 text-left flex gap-3 px-4 py-3.5">
                <span
                  className="mt-[7px] w-2 h-2 rounded-full shrink-0"
                  style={{ background: n.read_at ? "transparent" : C.accent }}
                  aria-label={n.read_at ? "letta" : "non letta"}
                />
                <span className="min-w-0">
                  <span className="block text-[14px] leading-snug" style={{ fontWeight: n.read_at ? 500 : 700 }}>{n.title}</span>
                  {n.body && <span className="block text-[12.5px] mt-0.5 truncate" style={{ color: C.textMuted }}>{n.body}</span>}
                  <span className="block text-[11px] mt-1 uppercase tracking-[.06em]" style={{ color: C.textMuted }}>
                    {TYPE_LABEL[n.type]} · {timeAgo(n.created_at)}
                  </span>
                </span>
              </button>
              <button onClick={() => remove(n.id)} aria-label="Elimina notifica" className="px-4 text-[18px]" style={{ color: C.disabledText }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </AppPage>
  );
}
