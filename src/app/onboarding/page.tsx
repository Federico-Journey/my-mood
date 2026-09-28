"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import { CompassIcon } from "@/components/EllyIcons";

const C = ELLY_COLORS;

const NATIONALITIES = [
  "Italiana", "Americana", "Britannica", "Francese", "Tedesca", "Spagnola",
  "Portoghese", "Brasiliana", "Argentina", "Cinese", "Giapponese", "Indiana",
  "Australiana", "Canadese", "Olandese", "Belga", "Svizzera", "Svedese",
  "Norvegese", "Danese", "Polacca", "Russa", "Turca", "Messicana", "Altra",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [nazionalita, setNazionalita] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const getRedirectParam = () => new URLSearchParams(window.location.search).get("redirect");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        const redirectParam = getRedirectParam();
        router.push(redirectParam ? `/auth?redirect=${encodeURIComponent(redirectParam)}` : "/auth");
        return;
      }
      setUserId(session.user.id);
      // Pre-compila nome/cognome se disponibili dai dati OAuth (es. Google)
      const meta = session.user.user_metadata;
      if (meta?.full_name) {
        const parts = (meta.full_name as string).split(" ");
        setNome(parts[0] || "");
        setCognome(parts.slice(1).join(" ") || "");
      }
    });
  }, [router]);

  const canFinish = nome.trim().length > 0 && cognome.trim().length > 0 && dataNascita.length > 0 && nazionalita.length > 0;

  const handleFinish = async () => {
    if (!userId || !canFinish) return;
    setLoading(true);
    await supabase.from("profiles").upsert({
      id: userId,
      name: `${nome} ${cognome}`.trim(),
      cognome,
      data_nascita: dataNascita,
      nazionalita,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    });
    setLoading(false);
    const redirectParam = getRedirectParam();
    router.push(redirectParam || "/viaggio");
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: C.bg, color: C.text, fontFamily: '"DM Sans", sans-serif' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
        rel="stylesheet"
      />

      <div style={{ position: "absolute", top: -50, right: -70, width: 260, height: 260, color: C.accent, opacity: 0.07, pointerEvents: "none" }}>
        <CompassIcon size={260} />
      </div>

      <div style={{
        position: "relative", zIndex: 1, minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        maxWidth: "460px", margin: "0 auto",
        padding: "72px 24px calc(env(safe-area-inset-bottom, 0px) + 40px)",
      }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: C.accent, margin: "0 0 12px" }}>
            Elly
          </p>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 600,
            fontSize: "32px", letterSpacing: "-0.01em", lineHeight: 1.15,
            color: C.text, margin: "0 0 10px",
          }}>
            Crea il tuo profilo
          </h1>
          <p style={{ color: C.textMuted, fontSize: "14px", lineHeight: 1.5 }}>
            Ci servono un paio di informazioni prima di iniziare a pianificare
          </p>
        </div>

        <div style={{
          background: C.bgElev, border: `1.3px solid ${C.border}`,
          borderRadius: "24px", padding: "24px 22px 26px",
        }}>
          <FieldLabel>Nome</FieldLabel>
          <input type="text" placeholder="es. Federico" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />

          <FieldLabel>Cognome</FieldLabel>
          <input type="text" placeholder="es. Pugliese" value={cognome} onChange={(e) => setCognome(e.target.value)} style={inputStyle} />

          <FieldLabel>Data di nascita</FieldLabel>
          <input
            type="date"
            value={dataNascita}
            onChange={(e) => setDataNascita(e.target.value)}
            max={new Date(Date.now() - 16 * 365.25 * 24 * 3600000).toISOString().split("T")[0]}
            style={inputStyle}
          />

          <FieldLabel>Nazionalità</FieldLabel>
          <select value={nazionalita} onChange={(e) => setNazionalita(e.target.value)} style={{ ...inputStyle, marginBottom: "18px" }}>
            <option value="">Seleziona...</option>
            {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>

          <button onClick={handleFinish} disabled={!canFinish || loading} style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            background: canFinish ? C.accent : C.disabledBg,
            color: canFinish ? "#fff" : C.disabledText,
            fontSize: "15px", fontWeight: 600, cursor: canFinish ? "pointer" : "default",
            fontFamily: "inherit", opacity: loading ? 0.6 : 1,
          }}>
            {loading ? "Salvataggio..." : "Continua →"}
          </button>
        </div>
      </div>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1px",
      textTransform: "uppercase", color: C.textMuted, marginBottom: "8px",
    }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "12px", marginBottom: "16px",
  background: C.bg, border: `1px solid ${C.border}`,
  color: C.text, fontSize: "15px", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box",
};
