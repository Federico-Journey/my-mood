"use client";

/**
 * Profilo di Elly: dati dell'account, pagamenti (in arrivo, verranno
 * collegati quando sara' definito il prezzo per viaggio) e uscita.
 * Sostituisce il vecchio profilo di My Mood (mood preferiti, budget...).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import AppPage from "@/components/AppPage";
import { ListRow, ListSection } from "@/components/SettingsList";

const C = ELLY_COLORS;

export default function ProfiloPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "guest" | "ready">("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [tripCount, setTripCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setStatus("guest"); return; }
      setEmail(session.user.email ?? "");
      const [{ data: profile }, { data: trips }] = await Promise.all([
        supabase.from("profiles").select("name, avatar_url").eq("id", session.user.id).maybeSingle(),
        supabase.from("trips").select("id, approved_at").eq("user_id", session.user.id),
      ]);
      setName(profile?.name || null);
      setAvatar(profile?.avatar_url || null);
      setTripCount(trips?.length ?? 0);
      setApprovedCount((trips ?? []).filter((t) => t.approved_at).length);
      setStatus("ready");
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <AppPage>
      {status === "guest" && (
        <div className="pt-10 text-center">
          <h1 className="text-[26px] font-medium mb-2">Il tuo profilo</h1>
          <p className="text-[14px] mb-6" style={{ color: C.textMuted }}>Accedi per salvare i viaggi e gestire il tuo account.</p>
          <Link href="/auth?redirect=/profilo" className="inline-block px-7 py-3.5 rounded-xl font-bold text-[14px]" style={{ background: C.accent, color: "#fff" }}>
            Accedi
          </Link>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="flex items-center gap-4 pt-6">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-[24px] font-semibold"
                style={{ background: C.accentSoft, color: C.accent, fontFamily: "var(--font-display)" }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[22px] font-medium leading-tight truncate">{name || "Il tuo profilo"}</h1>
              <p className="text-[13px] truncate" style={{ color: C.textMuted }}>{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-5">
            {[
              [tripCount, tripCount === 1 ? "viaggio pianificato" : "viaggi pianificati"],
              [approvedCount, approvedCount === 1 ? "viaggio confermato" : "viaggi confermati"],
            ].map(([n, l]) => (
              <div key={String(l)} className="rounded-2xl px-4 py-3" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
                <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{n}</div>
                <div className="text-[12px]" style={{ color: C.textMuted }}>{l}</div>
              </div>
            ))}
          </div>

          <ListSection title="Account">
            <ListRow first label="Foto profilo" soon />
            <ListRow label="Nome" value={name || "—"} />
          </ListSection>

          <ListSection title="Pagamenti">
            <ListRow first label="Metodi di pagamento" soon />
            <ListRow label="Spese per viaggio" soon />
          </ListSection>

          <ListSection title="Sessione">
            <ListRow first label="Esci" onClick={signOut} danger />
            <ListRow label="Elimina account" soon />
          </ListSection>
        </>
      )}
    </AppPage>
  );
}
