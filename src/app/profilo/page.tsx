"use client";

/**
 * Profilo di Elly: dati dell'account, pagamenti (in arrivo, verranno
 * collegati quando sara' definito il prezzo per viaggio), uscita ed
 * eliminazione dell'account (funzione "delete_my_account" nel database,
 * vedi supabase/account_deletion.sql).
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

  // Eliminazione account: due passaggi (spiegazione + parola di conferma).
  const [deleteStep, setDeleteStep] = useState<"closed" | "confirm" | "done">("closed");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const CONFIRM_WORD = "ELIMINA";

  const closeDelete = () => {
    if (deleting) return;
    setDeleteStep("closed");
    setConfirmText("");
    setDeleteError(null);
  };

  const deleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== CONFIRM_WORD || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setDeleting(false);
      setDeleteError("Non sono riuscito a eliminare l'account. Riprova tra poco o scrivici a info@planwithelly.com.");
      return;
    }
    // L'utente non esiste piu': puliamo solo la sessione salvata nel browser.
    await supabase.auth.signOut({ scope: "local" });
    setDeleting(false);
    setDeleteStep("done");
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
            <ListRow label="Elimina account" onClick={() => setDeleteStep("confirm")} danger />
          </ListSection>
        </>
      )}
      {deleteStep !== "closed" && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-4"
          style={{ background: "rgba(34,32,31,.5)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Elimina account"
          onClick={deleteStep === "confirm" ? closeDelete : undefined}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl p-5"
            style={{ background: C.bgElev, border: `1px solid ${C.border}`, marginBottom: "env(safe-area-inset-bottom, 0px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {deleteStep === "confirm" ? (
              <>
                <h2 className="text-[19px] font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>Eliminare il tuo account?</h2>
                <p className="text-[13.5px] leading-relaxed mb-2" style={{ color: C.textMuted }}>
                  Verranno cancellati in modo definitivo il tuo profilo, tutti i tuoi viaggi (salvati e confermati), le liste di
                  prenotazione, le notifiche e i link di condivisione con i relativi voti. Chi ha ricevuto un tuo link non
                  potrà più aprirlo.
                </p>
                <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: C.textMuted }}>
                  <strong style={{ color: C.text }}>Non si può annullare.</strong> Se hai effettuato pagamenti, le ricevute
                  restano conservate per gli obblighi fiscali, ma scollegate dal tuo account.
                </p>
                <label className="block text-[12.5px] font-semibold mb-1.5" htmlFor="confirm-delete">
                  Per confermare scrivi {CONFIRM_WORD}
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={deleting}
                  className="w-full rounded-xl px-4 py-3 text-[15px] outline-none mb-3"
                  style={{ background: C.bg, border: `1.3px solid ${C.border}`, color: C.text }}
                />
                {deleteError && <p className="text-[12.5px] mb-3" style={{ color: C.accent }}>{deleteError}</p>}
                <div className="flex gap-2.5">
                  <button
                    onClick={closeDelete}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl font-bold text-[14px]"
                    style={{ background: C.bg, border: `1.3px solid ${C.border}`, color: C.text }}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={deleting || confirmText.trim().toUpperCase() !== CONFIRM_WORD}
                    className="flex-1 py-3 rounded-xl font-bold text-[14px]"
                    style={{
                      background: confirmText.trim().toUpperCase() === CONFIRM_WORD ? C.accent : C.disabledBg,
                      color: confirmText.trim().toUpperCase() === CONFIRM_WORD ? "#fff" : C.disabledText,
                    }}
                  >
                    {deleting ? "Elimino…" : "Elimina definitivamente"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[19px] font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>Account eliminato</h2>
                <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: C.textMuted }}>
                  Abbiamo cancellato il tuo account e i dati collegati. Grazie per aver provato Elly: se vorrai tornare, ti basta
                  registrarti di nuovo.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-3 rounded-xl font-bold text-[14px]"
                  style={{ background: C.accent, color: "#fff" }}
                >
                  Torna alla home
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AppPage>
  );
}
