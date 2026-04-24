"use client";

import { useState } from "react";
import Link from "next/link";
import { MOODS, STEP_TYPE_COLORS, type Plan } from "@/lib/data";

type Vote = { voter_name: string; response: string };

type Props = {
  shareId: string;
  plan: Plan;
  moodId: string;
  accentColor: string;
  initialVotes: Vote[];
};

const RESPONSE_OPTIONS = [
  { value: "yes",   emoji: "🙋", label: "Ci sono!" },
  { value: "maybe", emoji: "🤔", label: "Forse" },
  { value: "no",    emoji: "😔", label: "Non posso" },
];

export default function SharePageClient({ shareId, plan, moodId, accentColor, initialVotes }: Props) {
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [voterName, setVoterName] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedMood = MOODS.find((m) => m.id === moodId);

  const handleVote = async () => {
    if (!voterName.trim() || !selectedResponse) return;
    setSubmitting(true);
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId, voterName: voterName.trim(), response: selectedResponse }),
    });
    if (res.ok) {
      setVotes((prev) => [...prev, { voter_name: voterName.trim(), response: selectedResponse }]);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const yesVotes   = votes.filter((v) => v.response === "yes");
  const maybeVotes = votes.filter((v) => v.response === "maybe");
  const noVotes    = votes.filter((v) => v.response === "no");

  return (
    <main style={{
      minHeight: "100vh", background: "#09090f", color: "#F5F5F0",
      fontFamily: '"DM Sans", sans-serif',
      padding: "32px 20px 60px",
    }}>
      {/* Fixed glow */}
      <div style={{
        position: "fixed", top: "-30vh", left: "50%", transform: "translateX(-50%)",
        width: "500px", height: "500px", borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "420px", margin: "0 auto" }}>

        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <span style={{ fontSize: "16px" }}>🌙</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "3px", fontWeight: 700, textTransform: "uppercase" }}>
            my mood
          </span>
        </div>

        {/* Plan title */}
        <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 8px" }}>
          {plan.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "14px", margin: "0 0 16px", lineHeight: 1.5 }}>
          {plan.subtitle}
        </p>

        {/* Mood + city tags */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          <span style={{ borderRadius: "100px", padding: "5px 12px", fontSize: "12px", fontWeight: 700, background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor }}>
            {selectedMood?.emoji} {selectedMood?.label}
          </span>
          <span style={{ borderRadius: "100px", padding: "5px 12px", fontSize: "12px", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            📍 Milano
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: `linear-gradient(to right, ${accentColor}30, transparent)`, marginBottom: "20px" }} />

        {/* Plan steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
          {plan.steps.map((step, i) => {
            const typeColor = STEP_TYPE_COLORS[step.type] || accentColor;
            const inner = (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", background: `${typeColor}14`, border: `1px solid ${typeColor}25`, flexShrink: 0 }}>
                  {step.img}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>{step.name}</span>
                    <span style={{ color: typeColor, fontWeight: 700, fontSize: "11px", flexShrink: 0, opacity: 0.85 }}>{step.time}</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: 0 }}>📍 {step.address} · 💰 {step.price}</p>
                </div>
              </div>
            );
            const cardStyle = {
              borderRadius: "16px", padding: "14px 16px",
              background: `linear-gradient(135deg, ${typeColor}08, rgba(255,255,255,0.02))`,
              border: `1px solid ${typeColor}20`,
              display: "block", textDecoration: "none",
            } as React.CSSProperties;
            return step.venue_id
              ? <Link key={i} href={`/venue/${step.venue_id}`} style={cardStyle}>{inner}</Link>
              : <div key={i} style={cardStyle}>{inner}</div>;
          })}
        </div>

        {/* ─── RSVP section ─────────────────────────────────── */}
        <div style={{
          borderRadius: "20px", padding: "20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "24px",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Chi viene? 🙋
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: "0 0 18px" }}>
            Fai sapere se ci sei!
          </p>

          {/* Vote summary */}
          {votes.length > 0 && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
              <VoteCount emoji="🙋" count={yesVotes.length} color="#22c55e" names={yesVotes.map(v => v.voter_name)} />
              <VoteCount emoji="🤔" count={maybeVotes.length} color="#f59e0b" names={maybeVotes.map(v => v.voter_name)} />
              <VoteCount emoji="😔" count={noVotes.length} color="#ef4444" names={noVotes.map(v => v.voter_name)} />
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: "center", padding: "16px", borderRadius: "12px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "15px", margin: 0 }}>
                {selectedResponse === "yes" ? "🎉 Ottimo, ci sei!" : selectedResponse === "maybe" ? "🤔 Ok, forse ci sei!" : "😔 Peccato, la prossima!"}
              </p>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Il tuo nome"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "10px", marginBottom: "12px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F5F5F0", fontSize: "14px", outline: "none", fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {RESPONSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedResponse(opt.value)}
                    style={{
                      flex: 1, padding: "12px 6px", borderRadius: "12px", border: "none", cursor: "pointer",
                      background: selectedResponse === opt.value
                        ? (opt.value === "yes" ? "rgba(34,197,94,0.2)" : opt.value === "maybe" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)")
                        : "rgba(255,255,255,0.04)",
                      borderWidth: "1.5px", borderStyle: "solid",
                      borderColor: selectedResponse === opt.value
                        ? (opt.value === "yes" ? "rgba(34,197,94,0.5)" : opt.value === "maybe" ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.5)")
                        : "rgba(255,255,255,0.08)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                      transition: "all 0.2s", fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{opt.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleVote}
                disabled={!voterName.trim() || !selectedResponse || submitting}
                style={{
                  width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                  background: voterName.trim() && selectedResponse ? `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` : "rgba(255,255,255,0.06)",
                  color: voterName.trim() && selectedResponse ? "#fff" : "rgba(255,255,255,0.25)",
                  fontSize: "15px", fontWeight: 700, cursor: voterName.trim() && selectedResponse ? "pointer" : "default",
                  fontFamily: "inherit", opacity: submitting ? 0.6 : 1,
                  boxShadow: voterName.trim() && selectedResponse ? `0 4px 20px ${accentColor}40` : "none",
                }}
              >
                {submitting ? "Invio..." : "Invia risposta"}
              </button>
            </>
          )}
        </div>

        {/* CTA */}
        <a href="https://my-mood-eight.vercel.app" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          width: "100%", padding: "16px", borderRadius: "18px",
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
          boxShadow: `0 4px 28px ${accentColor}35`,
          color: "#fff", fontWeight: 700, fontSize: "16px", textDecoration: "none",
          boxSizing: "border-box",
        }}>
          🌙 Genera il tuo piano
        </a>

        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>
          my-mood.app
        </p>
      </div>
    </main>
  );
}

function VoteCount({ emoji, count, color, names }: { emoji: string; count: number; color: string; names: string[] }) {
  if (count === 0) return null;
  return (
    <div style={{ flex: 1, borderRadius: "10px", padding: "10px 8px", background: `${color}10`, border: `1px solid ${color}25`, textAlign: "center" }}>
      <p style={{ fontSize: "20px", margin: "0 0 2px" }}>{emoji}</p>
      <p style={{ color, fontWeight: 800, fontSize: "18px", margin: "0 0 2px" }}>{count}</p>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {names.slice(0, 2).join(", ")}{names.length > 2 ? ` +${names.length - 2}` : ""}
      </p>
    </div>
  );
}
