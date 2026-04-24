"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NATIONALITIES = [
  "Italiana", "Americana", "Britannica", "Francese", "Tedesca", "Spagnola",
  "Portoghese", "Brasiliana", "Argentina", "Cinese", "Giapponese", "Indiana",
  "Australiana", "Canadese", "Olandese", "Belga", "Svizzera", "Svedese",
  "Norvegese", "Danese", "Polacca", "Russa", "Turca", "Messicana", "Altra",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [nazionalita, setNazionalita] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.push("/auth"); return; }
      setUserId(session.user.id);
      // Pre-fill name from OAuth metadata
      const meta = session.user.user_metadata;
      if (meta?.full_name) {
        const parts = (meta.full_name as string).split(" ");
        setNome(parts[0] || "");
        setCognome(parts.slice(1).join(" ") || "");
      }
    });
  }, [router]);

  const canGoNext = nome.trim().length > 0 && cognome.trim().length > 0 && dataNascita.length > 0 && nazionalita.length > 0;
  const canFinish = termsAccepted && privacyAccepted;

  const handleFinish = async () => {
    if (!userId || !canFinish) return;
    setLoading(true);
    await supabase.from("profiles").upsert({
      id: userId,
      name: `${nome} ${cognome}`.trim(),
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    });
    router.push("/");
  };

  return (
    <main style={{
      minHeight: "100vh", background: "#09090f", color: "#F5F5F0",
      fontFamily: '"DM Sans", sans-serif',
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 24px",
    }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: "440px", paddingTop: "60px", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "32px" }}>
          <span style={{ fontSize: "14px" }}>🌙</span>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
            my mood
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              flex: 1, height: "3px", borderRadius: "3px",
              background: step >= s ? "#8B5CF6" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
              boxShadow: step >= s ? "0 0 8px rgba(139,92,246,0.6)" : "none",
            }} />
          ))}
        </div>

        {step === 1 ? (
          <>
            <p style={{ color: "#A78BFA", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
              Passo 1 di 2
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              Crea il tuo profilo
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 32px", lineHeight: 1.5 }}>
              Dicci qualcosa su di te per personalizzare l'esperienza
            </p>

            <FieldLabel>Nome</FieldLabel>
            <input type="text" placeholder="es. Marco" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />

            <FieldLabel>Cognome</FieldLabel>
            <input type="text" placeholder="es. Rossi" value={cognome} onChange={(e) => setCognome(e.target.value)} style={inputStyle} />

            <FieldLabel>Data di nascita</FieldLabel>
            <input type="date" value={dataNascita} onChange={(e) => setDataNascita(e.target.value)}
              max={new Date(Date.now() - 13 * 365.25 * 24 * 3600000).toISOString().split("T")[0]}
              style={{ ...inputStyle, colorScheme: "dark" }} />

            <FieldLabel>Nazionalità</FieldLabel>
            <select value={nazionalita} onChange={(e) => setNazionalita(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}>
              <option value="">Seleziona...</option>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            <button onClick={() => setStep(2)} disabled={!canGoNext} style={{
              width: "100%", padding: "16px", borderRadius: "14px", border: "none",
              background: canGoNext ? "linear-gradient(135deg, #8B5CF6, #6D28D9)" : "rgba(255,255,255,0.06)",
              color: canGoNext ? "#fff" : "rgba(255,255,255,0.25)",
              fontSize: "16px", fontWeight: 700, cursor: canGoNext ? "pointer" : "default",
              fontFamily: "inherit", marginTop: "8px",
              boxShadow: canGoNext ? "0 4px 20px rgba(139,92,246,0.4)" : "none",
              transition: "all 0.2s",
            }}>
              Continua →
            </button>
          </>
        ) : (
          <>
            <p style={{ color: "#A78BFA", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
              Passo 2 di 2
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              Termini & Privacy
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 32px", lineHeight: 1.5 }}>
              Per completare la registrazione, accetta i nostri termini
            </p>

            {/* Terms box */}
            <div style={{
              borderRadius: "16px", padding: "18px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "12px",
            }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "14px", cursor: "pointer" }}>
                <div onClick={() => setTermsAccepted(!termsAccepted)} style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                  background: termsAccepted ? "#8B5CF6" : "transparent",
                  border: `2px solid ${termsAccepted ? "#8B5CF6" : "rgba(255,255,255,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", cursor: "pointer",
                }}>
                  {termsAccepted && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.5 }}>
                  Ho letto e accetto i{" "}
                  <a href="/terms" target="_blank" style={{ color: "#A78BFA", textDecoration: "underline" }}>Termini di Servizio</a>
                </span>
              </label>
            </div>

            {/* Privacy box */}
            <div style={{
              borderRadius: "16px", padding: "18px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "32px",
            }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "14px", cursor: "pointer" }}>
                <div onClick={() => setPrivacyAccepted(!privacyAccepted)} style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                  background: privacyAccepted ? "#8B5CF6" : "transparent",
                  border: `2px solid ${privacyAccepted ? "#8B5CF6" : "rgba(255,255,255,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", cursor: "pointer",
                }}>
                  {privacyAccepted && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.5 }}>
                  Ho letto e accetto la{" "}
                  <a href="/privacy" target="_blank" style={{ color: "#A78BFA", textDecoration: "underline" }}>Informativa sulla Privacy</a>
                </span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(1)} style={{
                padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
                fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
                ← Indietro
              </button>
              <button onClick={handleFinish} disabled={!canFinish || loading} style={{
                flex: 1, padding: "16px", borderRadius: "14px", border: "none",
                background: canFinish ? "linear-gradient(135deg, #8B5CF6, #6D28D9)" : "rgba(255,255,255,0.06)",
                color: canFinish ? "#fff" : "rgba(255,255,255,0.25)",
                fontSize: "16px", fontWeight: 700, cursor: canFinish ? "pointer" : "default",
                fontFamily: "inherit", opacity: loading ? 0.6 : 1,
                boxShadow: canFinish ? "0 4px 20px rgba(139,92,246,0.4)" : "none",
                transition: "all 0.2s",
              }}>
                {loading ? "Salvataggio..." : "Entra in my mood 🌙"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: "block", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px",
      textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px",
    }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "12px", marginBottom: "18px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#F5F5F0", fontSize: "15px", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box", appearance: "none",
};
