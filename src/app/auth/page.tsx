"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ELLY_COLORS } from "@/lib/travelData";
import { CompassIcon } from "@/components/EllyIcons";

type Mode = "signin" | "signup";

const C = ELLY_COLORS;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const getRedirectParam = () => new URLSearchParams(window.location.search).get("redirect");

  const handleEmailSignIn = async () => {
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      if (err.message === "Invalid login credentials") {
        setError("Email o password non corretti.");
      } else if (err.message.toLowerCase().includes("email not confirmed")) {
        setError("Devi confermare la tua email prima di accedere. Controlla la casella di posta (anche lo spam).");
      } else {
        setError(err.message);
      }
    } else {
      await handlePostLogin();
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true); setError(null);
    const redirectParam = getRedirectParam();
    const emailRedirectTo = redirectParam
      ? `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectParam)}`
      : `${window.location.origin}/auth`;
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: "" },
        emailRedirectTo,
      },
    });
    setLoading(false);
    if (err) {
      if (err.message.toLowerCase().includes("already registered") || err.message.toLowerCase().includes("already in use")) {
        setError("Questa email è già registrata. Prova ad accedere.");
      } else if (err.message.toLowerCase().includes("rate limit")) {
        setError("Troppe richieste. Aspetta qualche minuto e riprova.");
      } else {
        setError(err.message);
      }
    } else if (data.user && !data.user.confirmed_at) {
      // Nuova registrazione — email di conferma inviata
      setSuccessMsg("Controlla la tua email per confermare l'account, poi torna qui per accedere. Controlla anche lo spam.");
    } else {
      // Email gia' confermata (es. login silenzioso): passiamo dal check onboarding
      await handlePostLogin();
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setResendLoading(false);
    setResendDone(true);
  };

  // Intercetta il callback OAuth (Google) quando torna su /auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await handlePostLogin();
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    // Portiamo con noi ?redirect=..., altrimenti dopo il giro su Google
    // l'utente arrivato da Elly finirebbe nel flusso delle serate.
    const redirectParam = getRedirectParam();
    const redirectTo = redirectParam
      ? `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectParam)}`
      : `${window.location.origin}/auth`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: `${window.location.origin}/` },
      });
    } catch {
      setError("Apple Sign-In non ancora configurato.");
      setLoading(false);
    }
  };

  // Dopo login: controlliamo sempre che il profilo sia completo (nome,
  // cognome, data di nascita, nazionalita'). Se non lo e', si passa
  // dall'onboarding portandoci dietro l'eventuale redirect verso Elly.
  const handlePostLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const redirectParam = getRedirectParam();

    const { data: prof } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", session.user.id)
      .single();

    if (!prof || !prof.onboarding_complete) {
      router.push(redirectParam ? `/onboarding?redirect=${encodeURIComponent(redirectParam)}` : "/onboarding");
      return;
    }

    router.push(redirectParam || "/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") handleEmailSignIn();
    else handleEmailSignUp();
  };

  const handleSkip = () => {
    const redirectParam = getRedirectParam();
    router.push(redirectParam && redirectParam.startsWith("/viaggio") ? "/viaggio" : "/genera");
  };

  const canSubmit = email.length > 0 && password.length >= 6;

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: C.bg, color: C.text, fontFamily: '"DM Sans", sans-serif' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
        rel="stylesheet"
      />

      {/* Decorazione minimale, coerente con le altre schermate Elly */}
      <div style={{ position: "absolute", top: -50, right: -70, width: 260, height: 260, color: C.accent, opacity: 0.07, pointerEvents: "none" }}>
        <CompassIcon size={260} />
      </div>

      <div style={{
        position: "relative", zIndex: 1, minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        maxWidth: "460px", margin: "0 auto",
        padding: "72px 24px calc(env(safe-area-inset-bottom, 0px) + 40px)",
      }}>

        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: C.accent, margin: "0 0 12px" }}>
            Elly
          </p>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 600,
            fontSize: "32px", letterSpacing: "-0.01em", lineHeight: 1.15,
            color: C.text, margin: "0 0 10px",
          }}>
            Bentornato
          </h1>
          <p style={{ color: C.textMuted, fontSize: "14px", lineHeight: 1.5 }}>
            Accedi per salvare e condividere i tuoi viaggi con il gruppo
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: C.bgElev, border: `1.3px solid ${C.border}`,
          borderRadius: "24px", padding: "24px 22px 26px",
        }}>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "4px", background: C.bg, borderRadius: "14px", padding: "4px", marginBottom: "22px" }}>
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccessMsg(null); setShowEmailForm(false); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "14px", fontWeight: 600,
                  background: mode === m ? C.accent : "transparent",
                  color: mode === m ? "#fff" : C.textMuted,
                  transition: "all 0.2s",
                }}>
                {m === "signin" ? "Accedi" : "Registrati"}
              </button>
            ))}
          </div>

          {successMsg ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                padding: "16px", borderRadius: "14px",
                background: "rgba(61,110,84,0.10)", border: "1px solid rgba(61,110,84,0.3)",
                color: "#3D6E54", fontSize: "14px", lineHeight: 1.6, textAlign: "center",
              }}>
                ✉️ {successMsg}
              </div>
              <button
                onClick={handleResendEmail}
                disabled={resendLoading || resendDone}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px", border: "none", cursor: resendDone ? "default" : "pointer",
                  background: resendDone ? "rgba(61,110,84,0.08)" : C.bg,
                  color: resendDone ? "#3D6E54" : C.textMuted,
                  fontSize: "13px", fontFamily: "inherit", opacity: resendLoading ? 0.6 : 1,
                }}
              >
                {resendDone ? "✓ Email rinviata!" : resendLoading ? "Invio..." : "Non hai ricevuto l'email? Rinvia"}
              </button>
              <button
                onClick={() => { setMode("signin"); setSuccessMsg(null); setResendDone(false); setShowEmailForm(true); }}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer",
                  background: C.accent, color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "inherit",
                }}
              >
                Torna ad Accedi
              </button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button onClick={handleGoogle} disabled={loading} style={socialBtnStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continua con Google
              </button>

              {/* Apple — coming soon */}
              <div style={{ ...socialBtnStyle, marginTop: "10px", opacity: 0.4, cursor: "not-allowed", position: "relative", userSelect: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continua con Apple
                <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: C.textMuted, background: C.bg, padding: "2px 8px", borderRadius: "6px" }}>
                  SOON
                </span>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", background: C.border }} />
                <span style={{ color: C.textMuted, fontSize: "12px" }}>oppure</span>
                <div style={{ flex: 1, height: "1px", background: C.border }} />
              </div>

              {/* Email toggle */}
              {!showEmailForm ? (
                <button onClick={() => setShowEmailForm(true)} style={{
                  width: "100%", padding: "13px", borderRadius: "12px", cursor: "pointer",
                  background: C.bg, border: `1px solid ${C.border}`,
                  color: C.textMuted, fontSize: "14px", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Continua con Email
                </button>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                  <input type="password" placeholder="Password (min. 6 caratteri)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                  {error && <p style={{ color: "#B3435A", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>{error}</p>}
                  <button type="submit" disabled={!canSubmit || loading} style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    background: canSubmit ? C.accent : C.disabledBg,
                    color: canSubmit ? "#fff" : C.disabledText,
                    fontSize: "15px", fontWeight: 600, cursor: canSubmit ? "pointer" : "default",
                    fontFamily: "inherit", opacity: loading ? 0.6 : 1,
                  }}>
                    {loading ? "Caricamento..." : mode === "signin" ? "Accedi" : "Crea account"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Terms notice for signup */}
          {mode === "signup" && !successMsg && (
            <p style={{ marginTop: "16px", fontSize: "11px", color: C.textMuted, textAlign: "center", lineHeight: 1.6 }}>
              Registrandoti accetti i{" "}
              <a href="/terms" style={{ color: C.text, textDecoration: "underline" }}>Termini di Servizio</a>
              {" "}e la{" "}
              <a href="/privacy" style={{ color: C.text, textDecoration: "underline" }}>Privacy Policy</a>
            </p>
          )}
        </div>

        {/* Skip */}
        {!successMsg && (
          <button
            onClick={handleSkip}
            style={{
              marginTop: "18px",
              width: "100%",
              background: "none",
              border: "none",
              color: C.textMuted,
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "8px",
            }}
          >
            Continua senza account →
          </button>
        )}
      </div>
    </main>
  );
}

const socialBtnStyle: React.CSSProperties = {
  width: "100%", padding: "14px", borderRadius: "12px",
  background: C.bg, border: `1px solid ${C.border}`,
  color: C.text, fontSize: "15px", fontWeight: 500, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "12px", marginBottom: "10px",
  background: C.bg, border: `1px solid ${C.border}`,
  color: C.text, fontSize: "15px", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box",
};
