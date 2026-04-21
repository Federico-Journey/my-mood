"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const accent = "#8B5CF6";

  // ─── Email sign-in ────────────────────────────────────────────
  const handleEmailSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Email o password non corretti"
          : err.message
      );
    } else {
      router.push("/");
    }
  };

  // ─── Email sign-up ────────────────────────────────────────────
  const handleEmailSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (err) {
      if (err.message.includes("already registered")) {
        setError("Questa email è già registrata. Prova ad accedere.");
      } else {
        setError(err.message);
      }
    } else {
      setSuccessMsg(
        "Controlla la tua email per confermare l'account, poi torna qui per accedere."
      );
    }
  };

  // ─── Google OAuth ─────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") handleEmailSignIn();
    else handleEmailSignUp();
  };

  const canSubmit =
    mode === "signin"
      ? email.length > 0 && password.length >= 6
      : email.length > 0 && password.length >= 6 && name.length > 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0D0D",
        color: "#F5F5F0",
        fontFamily: '"DM Sans", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header con glow */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow sottile */}
        <div
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "120px",
            background: "radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            position: "relative",
          }}
        >
          <span style={{ fontSize: "13px" }}>🌙</span>
          <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>my mood</span>
        </Link>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          maxWidth: "400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Logo/icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1))",
            border: "1px solid rgba(139,92,246,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            marginBottom: "20px",
          }}
        >
          🌙
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {mode === "signin" ? "Bentornato" : "Crea il tuo profilo"}
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "14px",
            marginBottom: "32px",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          {mode === "signin"
            ? "Accedi per salvare i tuoi piani e votare con gli amici"
            : "Un account per salvare, condividere e votare i piani serata"}
        </p>

        {/* Success message */}
        {successMsg && (
          <div
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#4ade80",
              fontSize: "14px",
              lineHeight: "1.5",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#F5F5F0",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continua con Google
        </button>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            margin: "24px 0",
          }}
        >
          <div
            style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}
          />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>
            oppure
          </span>
          <div
            style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}
          />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Il tuo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password (min. 6 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <p
              style={{
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              backgroundColor: canSubmit ? accent : "rgba(255,255,255,0.06)",
              border: "none",
              color: canSubmit ? "#fff" : "rgba(255,255,255,0.3)",
              fontSize: "15px",
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "default",
              fontFamily: "inherit",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Caricamento..."
              : mode === "signin"
                ? "Accedi"
                : "Crea account"}
          </button>
        </form>

        {/* Toggle mode */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {mode === "signin" ? "Non hai un account? " : "Hai già un account? "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setSuccessMsg(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: accent,
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {mode === "signin" ? "Registrati" : "Accedi"}
          </button>
        </p>

        {/* Legal notice — visibile solo in signup */}
        {mode === "signup" && (
          <p
            style={{
              marginTop: "20px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              lineHeight: "1.6",
            }}
          >
            Registrandoti accetti i nostri{" "}
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Termini di Servizio
            </Link>{" "}
            e la nostra{" "}
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Informativa sulla Privacy
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  );
}

/* ─── Shared input style ──────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#F5F5F0",
  fontSize: "15px",
  marginBottom: "12px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
