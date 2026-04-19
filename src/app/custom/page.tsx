"use client";

import { useState, useEffect, useRef } from "react";
import { MOODS, type Plan, type PlanStep } from "@/lib/data";
import { searchVenues } from "@/lib/venues";
import type { Venue } from "@/types/database";
import NavBar from "@/components/NavBar";
import ShareCard from "@/components/ShareCard";

// ─── Tipi interni ─────────────────────────────────────────────────────────────

type CustomStep = {
  id: string;
  name: string;
  address: string;
  time: string;
  emoji: string;
  type: string;
  price: string;
  tip: string;
  venue_id?: string;
};

const DEFAULT_EMOJI = "📍";
const MAX_STEPS = 5;

const PRICE_OPTIONS = [
  { id: "low",    label: "€" },
  { id: "mid",    label: "€€" },
  { id: "high",   label: "€€€" },
  { id: "luxury", label: "€€€€" },
];

const TYPE_OPTIONS = [
  { id: "bar",          label: "Bar",        emoji: "🍺" },
  { id: "cocktail_bar", label: "Cocktail",   emoji: "🍸" },
  { id: "ristorante",   label: "Ristorante", emoji: "🍽️" },
  { id: "pizzeria",     label: "Pizzeria",   emoji: "🍕" },
  { id: "club",         label: "Club",       emoji: "🎵" },
  { id: "rooftop",      label: "Rooftop",    emoji: "🌆" },
  { id: "lounge",       label: "Lounge",     emoji: "🛋️" },
  { id: "altro",        label: "Altro",      emoji: "✨" },
];

function makeId() {
  return Math.random().toString(36).slice(2);
}

// ─── Modale aggiunta tappa ────────────────────────────────────────────────────

function AddStepModal({
  accentColor,
  onAdd,
  onClose,
}: {
  accentColor: string;
  onAdd: (step: CustomStep) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"search" | "manual">("search");

  // Ricerca DB
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Venue[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form manuale
  const [name, setName]       = useState("");
  const [address, setAddress] = useState("");
  const [time, setTime]       = useState("21:00");
  const [emoji, setEmoji]     = useState(DEFAULT_EMOJI);
  const [type, setType]       = useState("altro");
  const [price, setPrice]     = useState("mid");
  const [tip, setTip]         = useState("");

  // Stato condiviso: orario (usato anche per la venue trovata dal DB)
  const [dbTime, setDbTime]   = useState("21:00");

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearching(true);
      searchVenues(query)
        .then(setResults)
        .finally(() => setSearching(false));
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query]);

  const handleSelectFromDB = (venue: Venue) => {
    onAdd({
      id: makeId(),
      name: venue.name,
      address: venue.address,
      time: dbTime,
      emoji: venue.emoji || TYPE_OPTIONS.find(t => t.id === venue.type)?.emoji || DEFAULT_EMOJI,
      type: venue.type,
      price: venue.price_range,
      tip: venue.tips || "",
      venue_id: venue.id,
    });
  };

  const handleManualAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: makeId(),
      name: name.trim(),
      address: address.trim() || "Milano",
      time,
      emoji: emoji || DEFAULT_EMOJI,
      type,
      price,
      tip: tip.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "#09090f" }}>
      {/* Header modale */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <h2 className="text-white text-xl font-extrabold">Aggiungi tappa</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          ✕
        </button>
      </div>

      {/* Tab switch */}
      <div className="flex mx-5 mb-4 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.06)" }}>
        {(["search", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === t ? accentColor : "transparent",
              color: tab === t ? "#09090f" : "rgba(255,255,255,0.45)",
            }}
          >
            {t === "search" ? "🔍 Cerca nel DB" : "✏️ Inserisci manuale"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {tab === "search" ? (
          <>
            <input
              type="text"
              placeholder="Cerca un locale..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-white text-sm mb-3 outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />

            {/* Orario per la venue dal DB */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-white/40 text-xs">Orario</span>
              <input
                type="time"
                value={dbTime}
                onChange={e => setDbTime(e.target.value)}
                className="rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {searching && (
              <p className="text-white/30 text-sm text-center py-4">Cerco...</p>
            )}

            {!searching && query.trim() && results.length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">Nessun risultato</p>
            )}

            <div className="flex flex-col gap-2">
              {results.map(venue => (
                <button
                  key={venue.id}
                  onClick={() => handleSelectFromDB(venue)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.01] active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span className="text-2xl shrink-0">
                    {venue.emoji || TYPE_OPTIONS.find(t => t.id === venue.type)?.emoji || DEFAULT_EMOJI}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{venue.name}</p>
                    <p className="text-white/35 text-xs truncate">{venue.address}</p>
                  </div>
                  <span className="text-white/30 text-xs shrink-0">
                    {venue.price_range === "low" ? "€" : venue.price_range === "mid" ? "€€" : venue.price_range === "high" ? "€€€" : "€€€€"}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Emoji + nome */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🍕"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-14 rounded-xl px-3 py-3 text-center text-xl outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                maxLength={2}
              />
              <input
                type="text"
                placeholder="Nome locale *"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 rounded-xl px-4 py-3 text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Indirizzo */}
            <input
              type="text"
              placeholder="Indirizzo (opzionale)"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />

            {/* Orario */}
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-xs w-14">Orario</span>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="rounded-lg px-3 py-2 text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Tipo */}
            <div>
              <p className="text-white/40 text-xs mb-2">Tipo</p>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setType(opt.id)}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{
                      background: type === opt.id ? `${accentColor}22` : "rgba(255,255,255,0.05)",
                      border: type === opt.id ? `1.5px solid ${accentColor}55` : "1px solid rgba(255,255,255,0.08)",
                      color: type === opt.id ? accentColor : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prezzo */}
            <div>
              <p className="text-white/40 text-xs mb-2">Fascia prezzo</p>
              <div className="flex gap-2">
                {PRICE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPrice(opt.id)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: price === opt.id ? `${accentColor}22` : "rgba(255,255,255,0.05)",
                      border: price === opt.id ? `1.5px solid ${accentColor}55` : "1px solid rgba(255,255,255,0.08)",
                      color: price === opt.id ? accentColor : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tip opzionale */}
            <input
              type="text"
              placeholder="Consiglio (opzionale)"
              value={tip}
              onChange={e => setTip(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />

            <button
              onClick={handleManualAdd}
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl text-base font-bold mt-2 transition-all disabled:opacity-30"
              style={{ background: accentColor, color: "#09090f" }}
            >
              Aggiungi tappa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function CustomPage() {
  const [planTitle, setPlanTitle]       = useState("La mia serata 🔥");
  const [selectedMood, setSelectedMood] = useState(MOODS[0].id);
  const [steps, setSteps]               = useState<CustomStep[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);

  const activeMood   = MOODS.find(m => m.id === selectedMood)!;
  const accentColor  = activeMood.color;
  const canPreview   = steps.length >= 1;

  // Converti CustomStep[] → Plan per ShareCard
  const toPlan = (): Plan => ({
    title: planTitle || "La mia serata",
    subtitle: `${activeMood.emoji} Piano custom · Milano`,
    steps: steps.map(s => ({
      venue_id: s.venue_id,
      time: s.time,
      type: s.type,
      name: s.name,
      address: s.address,
      desc: s.tip || "",
      img: s.emoji,
      duration: "~1 ora",
      price: s.price === "low" ? "€" : s.price === "mid" ? "€€" : s.price === "high" ? "€€€" : "€€€€",
      tip: s.tip || "",
    } satisfies PlanStep)),
  });

  const handleAdd = (step: CustomStep) => {
    setSteps(prev => [...prev, step]);
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const handleTimeChange = (id: string, time: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, time } : s));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    setSteps(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (idx: number) => {
    setSteps(prev => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: "#09090f", color: "#F5F5F0" }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="pt-12 px-5 pb-4">
        <p className="text-white/40 text-[10px] tracking-[3px] uppercase font-semibold mb-1">
          Piano custom
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Costruisci la serata
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Scegli le tappe, condividi con gli amici
        </p>
      </div>

      {/* ── Titolo piano ─────────────────────────────────── */}
      <div className="px-5 mb-5">
        <input
          type="text"
          value={planTitle}
          onChange={e => setPlanTitle(e.target.value)}
          placeholder="Dai un nome alla serata..."
          className="w-full rounded-2xl px-4 py-3.5 text-white font-bold text-base outline-none"
          style={{
            background: `linear-gradient(135deg, ${accentColor}12, rgba(255,255,255,0.04))`,
            border: `1.5px solid ${accentColor}30`,
          }}
        />
      </div>

      {/* ── Mood picker ──────────────────────────────────── */}
      <div className="px-5 mb-2">
        <p className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-2">Mood & colore</p>
      </div>
      <div className="overflow-x-auto scrollbar-hide px-5 pb-4">
        <div className="flex gap-2 w-max">
          {MOODS.map(mood => {
            const active = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? `${mood.color}22` : "rgba(255,255,255,0.05)",
                  border: active ? `1.5px solid ${mood.color}60` : "1px solid rgba(255,255,255,0.07)",
                  color: active ? mood.color : "rgba(255,255,255,0.4)",
                }}
              >
                <span>{mood.emoji}</span>
                {mood.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lista tappe ──────────────────────────────────── */}
      <div className="px-5 mb-4">
        <p className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-3">
          Tappe · {steps.length}/{MAX_STEPS}
        </p>

        {steps.length === 0 && (
          <div
            className="rounded-2xl py-10 text-center"
            style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
          >
            <p className="text-4xl mb-2">🗺️</p>
            <p className="text-white/30 text-sm">Nessuna tappa ancora.</p>
            <p className="text-white/20 text-xs mt-0.5">Aggiungi almeno un posto per vedere l&apos;anteprima.</p>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="rounded-2xl px-4 py-3.5"
              style={{
                background: `linear-gradient(135deg, ${accentColor}0f, rgba(255,255,255,0.03))`,
                border: `1px solid ${accentColor}25`,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Emoji */}
                <span className="text-2xl shrink-0">{step.emoji}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[15px] truncate">{step.name}</p>
                  <p className="text-white/35 text-xs truncate">{step.address}</p>
                </div>

                {/* Orario editabile */}
                <input
                  type="time"
                  value={step.time}
                  onChange={e => handleTimeChange(step.id, e.target.value)}
                  className="text-xs font-bold rounded-lg px-2 py-1 outline-none shrink-0"
                  style={{
                    background: `${accentColor}18`,
                    border: `1px solid ${accentColor}35`,
                    color: accentColor,
                  }}
                  onClick={e => e.stopPropagation()}
                />
              </div>

              {/* Azioni riga */}
              <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {/* Su / giù */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-20"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === steps.length - 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-20"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    ↓
                  </button>
                </div>

                {/* Tipo + prezzo */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${accentColor}18`, color: accentColor }}
                  >
                    {TYPE_OPTIONS.find(t => t.id === step.type)?.label ?? step.type}
                  </span>
                  <span className="text-white/30 text-xs font-semibold">
                    {step.price === "low" ? "€" : step.price === "mid" ? "€€" : step.price === "high" ? "€€€" : "€€€€"}
                  </span>
                </div>

                {/* Elimina */}
                <button
                  onClick={() => handleRemove(step.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottone aggiungi tappa */}
        {steps.length < MAX_STEPS && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full mt-3 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1.5px dashed ${accentColor}50`,
              color: accentColor,
            }}
          >
            <span className="text-lg">+</span>
            Aggiungi tappa
          </button>
        )}
      </div>

      {/* ── CTA Anteprima ────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-20 pt-3 z-40"
        style={{ background: "linear-gradient(to top, #09090f 70%, transparent)" }}
      >
        <button
          onClick={() => setShowPreview(true)}
          disabled={!canPreview}
          className="w-full max-w-[420px] mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: canPreview
              ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
              : "rgba(255,255,255,0.08)",
            color: canPreview ? "#09090f" : "rgba(255,255,255,0.3)",
            boxShadow: canPreview ? `0 4px 24px ${accentColor}40` : "none",
          }}
        >
          ✨ Anteprima & Condividi
        </button>
      </div>

      {/* ── Modali ───────────────────────────────────────── */}
      {showAddModal && (
        <AddStepModal
          accentColor={accentColor}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showPreview && (
        <ShareCard
          plan={toPlan()}
          mood={selectedMood}
          accentColor={accentColor}
          onClose={() => setShowPreview(false)}
        />
      )}

      <NavBar />
    </div>
  );
}
