/**
 * Struttura e mattoncini comuni alle pagine legali (Privacy e Termini):
 * intestazione, titoli di sezione, paragrafi, elenchi, tabella e definizioni.
 * Nessuno stato: sono semplici componenti di presentazione.
 */

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ELLY_COLORS } from "@/lib/travelData";

const C = ELLY_COLORS;

export const LEGAL = {
  version: "1.1",
  updated: "29 settembre 2026",
  ownerName: "Federico Pugliese",
  email: "info@planwithelly.com",
  site: "planwithelly.com",
} as const;

export function LegalLayout({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro?: string;
  current: "privacy" | "terms";
  children: ReactNode;
}) {
  return (
    <main style={{ minHeight: "100vh", background: C.paper, color: C.text, fontFamily: "var(--font-body)" }}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: C.textMuted, textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
          ← Elly
        </Link>
        <span style={{ color: C.border, fontSize: "14px" }}>/</span>
        <span style={{ color: C.text, fontSize: "14px" }}>{title}</span>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 120px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 6vw, 38px)", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        <p style={{ color: C.textMuted, fontSize: "14px", marginBottom: intro ? "10px" : "40px" }}>
          Versione {LEGAL.version} — aggiornata il {LEGAL.updated}
        </p>
        {intro && <p style={{ color: C.textMuted, fontSize: "13px", marginBottom: "40px" }}>{intro}</p>}

        {children}

        <nav
          aria-label="Altre pagine legali"
          style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "48px", paddingTop: "20px", borderTop: `1px solid ${C.border}`, fontSize: "14px" }}
        >
          {current !== "privacy" && <Link href="/privacy" style={{ color: C.accent, fontWeight: 600 }}>Informativa sulla privacy</Link>}
          {current !== "terms" && <Link href="/terms" style={{ color: C.accent, fontWeight: 600 }}>Termini di servizio</Link>}
          <a href={`mailto:${LEGAL.email}`} style={{ color: C.textMuted }}>{LEGAL.email}</a>
        </nav>
      </div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: "38px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "14px", color: C.text }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p style={{ color: C.textMuted, lineHeight: 1.75, marginBottom: "14px", fontSize: "15px" }}>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul style={{ paddingLeft: "20px", lineHeight: 1.8, color: C.textMuted, fontSize: "15px", marginBottom: "14px" }}>{children}</ul>;
}

export function Mail({ children }: { children?: ReactNode }) {
  return (
    <a href={`mailto:${LEGAL.email}`} style={{ color: C.accent }}>
      {children ?? LEGAL.email}
    </a>
  );
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
      {children}
    </a>
  );
}

export type FeatureRow = { feature: string; data: string; basis: string; retention: string };

export function FeatureTable({ rows }: { rows: FeatureRow[] }) {
  const th: CSSProperties = {
    textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase", color: C.textMuted,
    borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
  };
  const td: CSSProperties = {
    padding: "12px", color: C.textMuted, verticalAlign: "top", lineHeight: 1.6,
    fontSize: "13px", borderBottom: `1px solid ${C.border}`, minWidth: "130px",
  };
  return (
    <div style={{ overflowX: "auto", marginBottom: "14px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            <th style={th}>Cosa fai</th>
            <th style={th}>Dati trattati</th>
            <th style={th}>Base giuridica</th>
            <th style={th}>Conservazione</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <td style={{ ...td, color: C.text, fontWeight: 600 }}>{row.feature}</td>
              <td style={td}>{row.data}</td>
              <td style={td}>{row.basis}</td>
              <td style={td}>{row.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DefinitionList({ items }: { items: [string, string][] }) {
  return (
    <dl style={{ marginBottom: "14px" }}>
      {items.map(([term, def]) => (
        <div
          key={term}
          style={{ display: "grid", gridTemplateColumns: "minmax(110px, 160px) 1fr", gap: "8px 16px", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: "15px" }}
        >
          <dt style={{ color: C.accent, fontWeight: 600, alignSelf: "start" }}>{term}</dt>
          <dd style={{ color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{def}</dd>
        </div>
      ))}
    </dl>
  );
}
