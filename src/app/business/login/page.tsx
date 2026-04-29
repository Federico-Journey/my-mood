"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

const CATEGORIES = [
  "Bar", "Cocktail bar", "Ristorante", "Aperitivo", "Club / Discoteca",
  "Caffè", "Wine bar", "Lounge", "Rooftop", "Altro",
];

export default function BusinessLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Bar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError("Email o password non corretti."); setLoading(false); return; }

    // Controlla se ha già un business
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: biz } = await supabase.from("businesses").select("id").eq("owner_user_id", session.user.id).single();
    if (!biz) { setError("Nessun account business trovato. Registrati come venue."); setLoading(false); return; }
    router.push("/business/dashboard");
  };

  const handleSignUp = async () => {
    if (!businessName.trim()) { setError("Inserisci il nome del locale."); return; }
    setLoading(true); setError(null);

    // 1. Crea account utente
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/business/login` },
    });
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }

    // 2. Se confermato subito → crea business
    if (data.session) {
      const { error: bizErr } = await supabase.from("businesses").insert({
        owner_user_id: data.session.user.id,
        name: businessName.trim(),
        category,
      });
      if (bizErr) { setError(bizErr.message); setLoading(false); return; }
      router.push("/business/profilo");
    } else {
      setSuccess("Controlla la tua email per confermare l'account, poi accedi.");
    }
    setLoading(false);
  };

  const accent = "#8B5CF6";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#08060f", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌙</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#F5F5F0" }}>My Mood</div>
          <div style={{ fontSize: "11px", color: accent, fontWeight: 700, letterSpacing: "3px", marginTop: "2px" }}>PORTALE BUSINESS</div>
        </div>

        {/* Card */}
        <div style={{
          background: "#0d0b16", borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.07)", padding: "28px",
        }}>
          {/* Toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "3px", marginBottom: "24px" }}>
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }} style={{
                flex: 1, padding: "8px", borderRadius: "10px", border: "none",
                background: mode === m ? "rgba(139,92,246,0.2)" : "transparent",
                color: mode === m ? "#A78BFA" : "rgba(255,255,255,0.4)",
                fontSize: "13px", fontWeight: 700, cursor: "pointer",
              }}>
                {m === "signin" ? "Accedi" : "Registra venue"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mode === "signup" && (
              <>
                <input
                  placeholder="Nome del locale *"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  style={inputStyle}
                />
                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </>
            )}
            <input
              type="email" placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password" placeholder="Password (min. 6 caratteri)"
              value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />

            {error && <p style={{ color: "#F87171", fontSize: "12px", margin: 0 }}>{error}</p>}
            {success && <p style={{ color: "#34D399", fontSize: "12px", margin: 0 }}>{success}</p>}

            <button
              onClick={mode === "signin" ? handleSignIn : handleSignUp}
              disabled={loading || !email || password.length < 6}
              style={{
                padding: "13px", borderRadius: "12px", border: "none",
                background: `linear-gradient(135deg, ${accent}, #6D28D9)`,
                color: "white", fontSize: "14px", fontWeight: 700,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                marginTop: "4px",
              }}
            >
              {loading ? "…" : mode === "signin" ? "Accedi al portale" : "Crea account venue"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>
          Per supporto: info@mymoodapp.it
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "10px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
  color: "#F5F5F0", fontSize: "13px", outline: "none",
  boxSizing: "border-box",
};
