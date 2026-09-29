"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import AppPage from "@/components/AppPage";
import { ListRow, ListSection } from "@/components/SettingsList";

const C = ELLY_COLORS;
const CONTACT_EMAIL = "info@planwithelly.com";

export default function ImpostazioniPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).maybeSingle();
        setIsAdmin(!!data?.is_admin);
      }
      setLoaded(true);
    });
  }, []);

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(CONTACT_EMAIL); setCopied(true); } catch { /* copia non disponibile */ }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AppPage>
      <h1 className="text-[26px] font-medium pt-5">Impostazioni</h1>

      {loaded && (
        <ListSection title="Account">
          {email ? (
            <>
              <ListRow first label="Email" value={email} />
              <ListRow label="Notifiche" soon />
              <ListRow label="Esci" onClick={signOut} danger />
            </>
          ) : (
            <ListRow first label="Accedi o registrati" href="/auth?redirect=/impostazioni" />
          )}
        </ListSection>
      )}

      {isAdmin && (
        <ListSection title="Gestione">
          <ListRow first label="Costi e ricavi" href="/admin/report" />
          <ListRow label="Archivio della prova" href="/admin/prova" />
        </ListSection>
      )}

      <ListSection title="Informazioni">
        <ListRow first label="Privacy" href="/privacy" />
        <ListRow label="Termini di servizio" href="/terms" />
        <ListRow label="Contatti" value={copied ? "Copiata" : CONTACT_EMAIL} onClick={copyEmail} />
      </ListSection>

      <p className="text-center text-[12px] pt-8" style={{ color: C.textMuted }}>
        Scrivici a <span className="select-all font-semibold">{CONTACT_EMAIL}</span> · <Link href="/" className="underline">planwithelly.com</Link>
      </p>
    </AppPage>
  );
}
