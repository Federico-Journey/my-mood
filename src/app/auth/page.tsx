"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
type Mode = "signin" | "signup";

const MILAN_PHOTO = "https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?q=80&w=800&auto=format&fit=crop";

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

  const accent = "#8B5CF6";

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
    const redirectTo = `${window.location.origin}/auth`;
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: "" },
        emailRedirectTo: redirectTo,
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
      // Email già confermata (es. login silenzioso) → vai alla home
      router.push("/");
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setResendLoading(false);
    setResendDone(true);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
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

  // Dopo login email: controlla onboarding
  const handlePostLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", session.user.id)
      .single();
    if (!prof || !prof.onboarding_complete) {
      router.push("/onboarding");
    } else {
      router.push("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") handleEmailSignIn();
    else handleEmailSignUp();
  };

  const canSubmit = email.length > 0 && password.length >= 6;


  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: '"DM Sans", sans-serif' }}>

      {/* Background photo */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${MILAN_PHOTO})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        filter: "brightness(0.55) saturate(0.8)",
      }} />

      {/* Gradient overlay — dark from bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(9,9,15,0.35) 0%, rgba(9,9,15,0.6) 40%, rgba(9,9,15,0.92) 70%, #09090f 100%)",
      }} />

      {/* Stars overlay */}
      {[
        { x: 10, y: 8 }, { x: 30, y: 5 }, { x: 65, y: 12 }, { x: 80, y: 7 }, { x: 90, y: 15 },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: "2px", height: "2px", borderRadius: "50%",
          background: "white", opacity: 0.6,
          animation: `twinkle ${3.5 + i * 0.5}s ease-in-out ${i * 0.7}s infinite alternate`,
        }} />
      ))}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 0 env(safe-area-inset-bottom, 0px)",
      }}>

        {/* Hello Mooder! — top area */}
        <div style={{ position: "absolute", top: "12%", left: 0, right: 0, textAlign: "center", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "18px" }}>🌙</span>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
              my mood
            </span>
          </div>
          <h1 style={{
            fontSize: "38px", fontWeight: 900, color: "#F5F5F0",
            letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0,
            textShadow: "0 2px 20px rgba(0,0,0,0.6)",
          }}>
            Hello Mooder!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginTop: "10px", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            Le serate migliori iniziano da un mood
          </p>
        </div>

        {/* Bottom card */}
        <div style={{
          background: "rgba(9,9,15,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px 28px 0 0",
          padding: "28px 24px 40px",
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
        }}>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "4px", marginBottom: "24px" }}>
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccessMsg(null); setShowEmailForm(false); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "14px", fontWeight: 600,
                  background: mode === m ? "#8B5CF6" : "transparent",
                  color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
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
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#4ade80", fontSize: "14px", lineHeight: 1.6, textAlign: "center",
              }}>
                ✉️ {successMsg}
              </div>
              <button
                onClick={handleResendEmail}
                disabled={resendLoading || resendDone}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px", border: "none", cursor: resendDone ? "default" : "pointer",
                  background: resendDone ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.05)",
                  color: resendDone ? "#4ade80" : "rgba(255,255,255,0.45)",
                  fontSize: "13px", fontFamily: "inherit", opacity: resendLoading ? 0.6 : 1,
                }}
              >
                {resendDone ? "✓ Email rinviata!" : resendLoading ? "Invio..." : "Non hai ricevuto l'email? Rinvia"}
              </button>
              <button
                onClick={() => { setMode("signin"); setSuccessMsg(null); setResendDone(false); setShowEmailForm(true); }}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer",
                  background: "#8B5CF6", color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "inherit",
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

              {/* Apple */}
              <button onClick={handleApple} disabled={loading} style={{ ...socialBtnStyle, marginTop: "10px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continua con Apple
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>oppure</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* Email toggle */}
              {!showEmailForm ? (
                <button onClick={() => setShowEmailForm(true)} style={{
                  width: "100%", padding: "13px", borderRadius: "12px", cursor: "pointer",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)", fontSize: "14px", fontFamily: "inherit",
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
                  {error && <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>{error}</p>}
                  <button type="submit" disabled={!canSubmit || loading} style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    background: canSubmit ? accent : "rgba(255,255,255,0.06)",
                    color: canSubmit ? "#fff" : "rgba(255,255,255,0.3)",
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
            <p style={{ marginTop: "16px", fontSize: "11px", color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.6 }}>
              Registrandoti accetti i{" "}
              <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Termini di Servizio</a>
              {" "}e la{" "}
              <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Privacy Policy</a>
            </p>
          )}

          {/* Skip */}
          {!successMsg && (
            <button
              onClick={() => router.push("/genera")}
              style={{
                marginTop: "20px",
                width: "100%",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.28)",
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
      </div>
    </main>
  );
}

const socialBtnStyle: React.CSSProperties = {
  width: "100%", padding: "14px", borderRadius: "12px",
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
  color: "#F5F5F0", fontSize: "15px", fontWeight: 500, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "12px", marginBottom: "10px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#F5F5F0", fontSize: "15px", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box",
};
