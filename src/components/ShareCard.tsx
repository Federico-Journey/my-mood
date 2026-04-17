"use client";

import { useState, useEffect } from "react";
import { MOODS, STEP_TYPE_COLORS, type Plan } from "@/lib/data";

type Props = {
  plan: Plan;
  mood: string;
  accentColor: string;
  onClose: () => void;
};

export default function ShareCard({ plan, mood, accentColor, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedMood = MOODS.find((m) => m.id === mood);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const shareText = [
    `\u{1F319} *my mood \u2014 ${plan.title}*`,
    `${selectedMood?.emoji} Mood: ${selectedMood?.label}`,
    `\u{1F4CD} Milano`,
    ``,
    ...plan.steps.map(
      (s) =>
        `${s.img} *${s.time}* \u2014 ${s.name}\n    \u{1F4CD} ${s.address}\n    \u{1F4B0} ${s.price}`
    ),
    ``,
    `\u2728 _Chi viene? Rispondete con_ \u{1F64B}`,
    ``,
    `\u{1F517} Creato con my mood`,
  ].join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleWhatsApp = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodId: mood,
          accentColor,
          planData: plan,
        }),
      });
      const json = await res.json();
      if (json.id) {
        const shareUrl = `${window.location.origin}/share/${json.id}`;
        const msg = `\u{1F319} *Ho trovato il piano perfetto per stasera!*\n\n\u{1F449} ${shareUrl}\n\n_${selectedMood?.emoji} ${selectedMood?.label} \u00B7 Milano_\n\nChi viene? \u{1F64B}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
      } else {
        // Fallback: testo plain
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
      }
    } catch {
      // Fallback: testo plain
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/[0.88] backdrop-blur-xl flex flex-col items-center justify-start p-5 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                   text-white text-xl flex items-center justify-center transition-colors"
      >
        {"\u2715"}
      </button>

      <p
        className="text-white/50 text-xs tracking-[2.5px] uppercase font-semibold mt-6 mb-4 transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        Anteprima Card
      </p>

      {/* The visual card */}
      <div
        className="w-full max-w-[360px] rounded-3xl overflow-hidden border transition-all duration-600 ease-out"
        style={{
          background: `linear-gradient(160deg, #16131f 0%, ${accentColor}10 50%, #16131f 100%)`,
          borderColor: `${accentColor}30`,
          transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
          opacity: visible ? 1 : 0,
          boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${accentColor}08`,
        }}
      >
        {/* Card header */}
        <div
          className="relative overflow-hidden px-6 pt-6 pb-5"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}06)`,
            borderBottom: `1px solid ${accentColor}15`,
          }}
        >
          <div className="flex items-center gap-2 mb-3.5">
            <span className="text-sm">{"\u{1F319}"}</span>
            <span className="text-white/35 text-[10px] tracking-[3px] uppercase font-bold">
              my mood
            </span>
          </div>
          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-1.5 leading-tight">
            {plan.title}
          </h2>
          <p className="text-white/[0.38] text-[13px] mb-3.5">{plan.subtitle}</p>
          <div className="flex gap-2 flex-wrap">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}40`,
                color: accentColor,
              }}
            >
              {selectedMood?.emoji} {selectedMood?.label}
            </span>
            <span className="rounded-full px-3 py-1 text-[11px] text-white/45 bg-white/5 border border-white/10">
              {"\u{1F4CD}"} Milano
            </span>
          </div>
        </div>

        {/* Card steps */}
        <div className="px-6 py-4">
          {plan.steps.map((step, i) => {
            const typeColor = STEP_TYPE_COLORS[step.type] || accentColor;
            return (
              <div
                key={i}
                className="flex gap-3.5 items-start"
                style={{
                  marginBottom: i < plan.steps.length - 1 ? "16px" : "0",
                  paddingBottom: i < plan.steps.length - 1 ? "16px" : "0",
                  borderBottom:
                    i < plan.steps.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: `${typeColor}12`,
                    border: `1px solid ${typeColor}22`,
                  }}
                >
                  {step.img}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-white text-[15px] font-bold truncate">
                      {step.name}
                    </span>
                    <span
                      className="text-[13px] font-bold opacity-80 shrink-0"
                      style={{ color: typeColor }}
                    >
                      {step.time}
                    </span>
                  </div>
                  <p className="text-white/[0.33] text-xs mt-0.5">
                    {"\u{1F4CD}"} {step.address} \u00B7 {"\u{1F4B0}"} {step.price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card CTA footer */}
        <div
          className="text-center px-6 py-4"
          style={{
            background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`,
            borderTop: `1px solid ${accentColor}12`,
          }}
        >
          <p className="text-white/75 text-[17px] font-bold mb-1">
            Chi viene? {"\u{1F64B}"}
          </p>
          <p className="text-white/[0.28] text-xs">
            Rispondi per confermare la tua presenza
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="w-full max-w-[360px] mt-5 flex flex-col gap-2.5 pb-8 transition-all duration-600 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transitionDelay: "0.15s",
        }}
      >
        {/* WhatsApp button */}
        <button
          onClick={handleWhatsApp}
          disabled={isSaving}
          className="w-full py-4 rounded-2xl text-white font-bold text-base
                     flex items-center justify-center gap-2.5
                     hover:scale-[1.02] active:scale-[0.98] transition-all
                     disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
          style={{
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            boxShadow: "0 4px 24px rgba(37,211,102,0.3)",
          }}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Creo il link...
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Invia su WhatsApp
            </>
          )}
        </button>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm
                     flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: copied ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)",
            border: copied
              ? "1px solid rgba(16,185,129,0.3)"
              : "1px solid rgba(255,255,255,0.1)",
            color: copied ? "#10B981" : "rgba(255,255,255,0.6)",
          }}
        >
          {copied ? "\u2713 Copiato negli appunti!" : "\u{1F4CB} Copia testo messaggio"}
        </button>

        <p className="text-white/[0.22] text-xs text-center mt-1 leading-relaxed">
          Invia la proposta nel gruppo e guarda chi ci sta {"\u{1F525}"}
        </p>
      </div>
    </div>
  );
}
