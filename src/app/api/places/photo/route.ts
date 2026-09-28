import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy verso Google Places Photo API.
 *
 * Il browser non chiama mai direttamente Google con la nostra chiave (che
 * altrimenti sarebbe visibile a chiunque apra gli strumenti sviluppatore):
 * passa solo il "photo_reference" (un token opaco, non una credenziale) a
 * questa route, che scarica l'immagine lato server con la chiave segreta e
 * la restituisce così com'è.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const width = request.nextUrl.searchParams.get("w") ?? "800";

  if (!ref) {
    return new NextResponse(null, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${encodeURIComponent(width)}&photo_reference=${encodeURIComponent(ref)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      return new NextResponse(null, { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        // La stessa foto non cambia: cache lunga lato browser/CDN, così non
        // richiamiamo Google Places ogni volta che si riapre la pagina.
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (err) {
    console.error("[Elly] Errore nel proxy foto Google Places:", err);
    return new NextResponse(null, { status: 502 });
  }
}
