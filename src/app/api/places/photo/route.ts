import { NextRequest, NextResponse } from "next/server";
import { logCostEvent } from "@/lib/costTracking";
import { GOOGLE_PLACE_PHOTO_USD_PER_CALL } from "@/lib/pricing";

/**
 * Foto dei luoghi da Google, recuperate AL MOMENTO (le regole Google non
 * permettono di salvare i riferimenti alle foto, che tra l'altro scadono).
 *
 * - ?pid=<place id>        → immagine (Place Details "solo foto", gratuito,
 *                            + Place Photos, 7 $ ogni 1.000 con 1.000 gratis al mese)
 * - ?pid=<place id>&meta=1 → JSON con l'autore della foto, da mostrare sotto
 *                            l'immagine come richiesto da Google (nessun costo)
 * - ?ref=<photo_reference> → vecchi viaggi creati con la vecchia API
 *
 * Il browser non vede mai la nostra chiave: parla solo con questa route.
 */

async function firstPhoto(pid: string, apiKey: string) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "photos" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const p = data.photos?.[0];
  if (!p?.name) return null;
  const author = p.authorAttributions?.[0];
  return {
    name: p.name as string,
    author: (author?.displayName as string | undefined) ?? null,
    authorUri: (author?.uri as string | undefined) ?? null,
  };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const pid = sp.get("pid");
  const ref = sp.get("ref");
  const width = Math.min(Number(sp.get("w") ?? "800") || 800, 1600);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || (!pid && !ref)) return new NextResponse(null, { status: 404 });

  try {
    let imageRes: Response;

    if (pid) {
      const photo = await firstPhoto(pid, apiKey);
      if (!photo) {
        return sp.get("meta")
          ? NextResponse.json({ author: null }, { headers: { "Cache-Control": "private, max-age=3600" } })
          : new NextResponse(null, { status: 404 });
      }
      if (sp.get("meta")) {
        return NextResponse.json(
          { author: photo.author, authorUri: photo.authorUri },
          { headers: { "Cache-Control": "private, max-age=3600" } }
        );
      }
      imageRes = await fetch(
        `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=${width}&key=${apiKey}`
      );
    } else {
      imageRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&photo_reference=${encodeURIComponent(ref!)}&key=${apiKey}`
      );
    }

    if (!imageRes.ok || !imageRes.body) return new NextResponse(null, { status: 502 });

    // Unica vera chiamata a pagamento: il download della foto.
    void logCostEvent({
      costCenter: "google_places",
      description: "Foto luogo (Place Photo)",
      quantity: 1,
      unit: "api_call",
      amountUsd: GOOGLE_PLACE_PHOTO_USD_PER_CALL,
    });

    const buffer = await imageRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": imageRes.headers.get("content-type") ?? "image/jpeg",
        // Solo nel browser di chi guarda, per un giorno: niente copie
        // condivise sul nostro CDN (regole Google sui contenuti).
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[Elly] Errore nel recupero foto Google Places:", err);
    return new NextResponse(null, { status: 502 });
  }
}
