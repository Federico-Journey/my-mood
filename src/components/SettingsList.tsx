"use client";

/** Elenchi a righe usati da Impostazioni e Profilo. */

import Link from "next/link";
import type { ReactNode } from "react";
import { ELLY_COLORS } from "@/lib/travelData";

const C = ELLY_COLORS;

export function ListSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-6">
      <h2 className="text-[11.5px] font-semibold uppercase tracking-[.1em] mb-2 px-1" style={{ color: C.textMuted, fontFamily: "var(--font-body)", letterSpacing: "0.1em" }}>
        {title}
      </h2>
      <ul className="rounded-2xl overflow-hidden" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
        {children}
      </ul>
    </section>
  );
}

type RowProps = {
  label: string;
  value?: ReactNode;
  href?: string;
  onClick?: () => void;
  soon?: boolean;
  danger?: boolean;
  first?: boolean;
};

export function ListRow({ label, value, href, onClick, soon, danger, first }: RowProps) {
  const inner = (
    <>
      <span className="text-[14.5px] font-medium" style={{ color: danger ? C.accent : C.text }}>{label}</span>
      <span className="flex items-center gap-2 text-[13px] min-w-0" style={{ color: C.textMuted }}>
        {value && <span className="truncate">{value}</span>}
        {soon && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[.08em] px-2 py-0.5 rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
            In arrivo
          </span>
        )}
        {(href || onClick) && !soon && <span aria-hidden="true">›</span>}
      </span>
    </>
  );
  const cls = "flex items-center justify-between gap-3 px-4 py-3.5 w-full text-left";
  const style = { borderTop: first ? "none" : `1px solid ${C.border}` };
  return (
    <li style={style}>
      {href && !soon ? (
        <Link href={href} className={cls}>{inner}</Link>
      ) : onClick && !soon ? (
        <button onClick={onClick} className={cls}>{inner}</button>
      ) : (
        <div className={cls}>{inner}</div>
      )}
    </li>
  );
}
