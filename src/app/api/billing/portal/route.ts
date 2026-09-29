import { NextRequest, NextResponse } from "next/server";
import { supabaseForRequest } from "@/lib/supabaseServer";
import { billingEnabled, supabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripe, siteOrigin } from "@/lib/stripeServer";

/** Portale clienti di Stripe: annulla/riprendi l'abbonamento, cambia carta, scarica le ricevute. */
export async function POST(request: NextRequest) {
  try {
    if (!billingEnabled()) return NextResponse.json({ error: "I pagamenti non sono ancora attivi." }, { status: 503 });
    const { userId } = await supabaseForRequest(request);
    if (!userId) return NextResponse.json({ error: "Accedi per gestire l'abbonamento." }, { status: 401 });
    const { data: row } = await supabaseAdmin().from("user_billing").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
    if (!row?.stripe_customer_id) return NextResponse.json({ error: "Non hai ancora fatto acquisti." }, { status: 404 });
    const session = await getStripe().billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: `${siteOrigin(request)}/profilo`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Elly] Portale clienti:", err);
    return NextResponse.json({ error: "Non riesco ad aprire la gestione dell'abbonamento." }, { status: 500 });
  }
}
