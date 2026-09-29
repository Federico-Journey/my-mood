"use client";

/**
 * Foto di un luogo con l'attribuzione richiesta dalla fonte:
 * - foto Google (/api/places/photo?pid=...): mostriamo l'autore indicato da
 *   Google sotto l'immagine, come chiedono i termini d'uso;
 * - foto dell'archivio aperto (Wikimedia Commons): autore e licenza
 *   nel tooltip e nella sezione "Crediti" in fondo al viaggio.
 * Se l'immagine non esiste (luogo senza foto) il componente sparisce.
 */

import { useEffect, useState } from "react";
import { ELLY_COLORS } from "@/lib/travelData";

const C = ELLY_COLORS;

export default function PlacePhoto({
  src,
  alt,
  credit,
  className = "",
  captionClassName = "",
  overlay = false,
  onFail,
}: {
  src: string;
  alt: string;
  credit?: string | null;
  className?: string;
  captionClassName?: string;
  /** Didascalia sovrapposta all'immagine (per copertine a riquadro fisso). */
  overlay?: boolean;
  onFail?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const [author, setAuthor] = useState<string | null>(null);
  const isGoogle = src.startsWith("/api/places/photo?pid=");

  useEffect(() => {
    if (!isGoogle) return;
    let cancelled = false;
    fetch(`${src}&meta=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d?.author) setAuthor(d.author); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src, isGoogle]);

  if (failed) return null;

  return (
    <figure className={`shrink-0 m-0 ${overlay ? "relative w-full h-full" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        title={credit ?? (author ? `Foto: ${author} · Google` : undefined)}
        loading="lazy"
        onError={() => { setFailed(true); onFail?.(); }}
        className={`${className} object-cover`}
      />
      {isGoogle && author && (
        overlay ? (
          <figcaption
            className="absolute right-1.5 bottom-1.5 max-w-[70%] truncate text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: "rgba(34,32,31,.5)", color: "#fff" }}
          >
            © {author} · Google
          </figcaption>
        ) : (
          <figcaption className={`text-[9px] leading-tight mt-0.5 truncate ${captionClassName}`} style={{ color: C.textMuted }}>
            © {author}
          </figcaption>
        )
      )}
    </figure>
  );
}

/** Elenco dei crediti (foto e dati aperti) da mostrare in fondo a un viaggio. */
export function TripCredits({ activities, open = false }: { activities: { photo_credit?: string | null; source?: string | null }[]; open?: boolean }) {
  const credits = Array.from(new Set(activities.map((a) => a.photo_credit).filter(Boolean))) as string[];
  const usesOpenData = activities.some((a) => a.source === "elly");
  if (credits.length === 0 && !usesOpenData) return null;
  return (
    <details open={open} className="mt-8 text-[11.5px] leading-relaxed" style={{ color: C.textMuted }}>
      <summary className="cursor-pointer font-semibold">Crediti di foto e dati</summary>
      {usesOpenData && (
        <p className="mt-2">Dati sui luoghi: © OpenStreetMap contributors (ODbL) e Wikidata (CC0).</p>
      )}
      {credits.length > 0 && (
        <ul className="mt-1.5 list-disc pl-4">
          {credits.map((c) => <li key={c}>{c}</li>)}
        </ul>
      )}
    </details>
  );
}
