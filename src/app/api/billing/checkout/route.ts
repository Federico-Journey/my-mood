import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseForRequest } from "@/lib/supabaseServer";
import { billingEnabled, supabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripe, priceIdFor, PRICE_LOOKUP, siteOrigin } from "@/lib/stripeServer";
import { CHECKOUT_CONSENT_TEXT } from "@/lib/billingConfig";

/**
 * Crea la pagina di pagamento di Stripe (Checkout) per un viaggio singolo o per
 * l'abbonamento mensile e restituisce l'indirizzo a cui mandare l'utente.
 * I dati della carta li gestisce solo Stripe: da noi non passano mai.
 */
export async function POST(request: NextRequest) {
  try {
    if (!billingEnabled()) return NextResponse.json({ error: "I pagamenti non sono ancora attivi." }, { status: 503 });
    const { userId } = await supabaseForRequest(request);
    if (!userId) return NextResponse.json({ error: "Accedi per acquistare." }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { plan?: string; quantity?: number };
    if (body.plan !== "trip" && body.plan !== "monthly") return NextResponse.json({ error: "Piano non valido." }, { status: 400 });

    const admin = supabaseAdmin();
    const stripe = getStripe();

    if (body.plan === "monthly") {
      const { data: summary } = await admin.rpc("billing_summary", { p_user: userId });
      if (summary?.subscription?.active) {
        return NextResponse.json({ error: "Hai già un abbonamento attivo: puoi gestirlo dal Profilo." }, { status: 409 });
      }
    }

    // Cliente Stripe: uno per utente, creato al primo acquisto.
    const { data: row } = await admin.from("user_billing").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
    let customer: string | null = row?.stripe_customer_id ?? null;
    if (!customer) {
      const { data: u } = await admin.auth.admin.getUserById(userId);
      const created = await stripe.customers.create(
        { email: u.user?.email ?? undefined, metadata: { user_id: userId } },
        { idempotencyKey: `elly-customer-${userId}` }, // un doppio clic non crea due clienti
      );
      customer = created.id;
      await admin.rpc("set_stripe_customer", { p_user: userId, p_customer: customer });
    }

    const origin = siteOrigin(request);
    const common: Stripe.Checkout.SessionCreateParams = {
      customer,
      client_reference_id: userId,
      locale: "it",
      allow_promotion_codes: true,
      metadata: { user_id: userId, plan: body.plan },
      custom_text: { submit: { message: CHECKOUT_CONSENT_TEXT } },
      success_url: `${origin}/profilo?pagamento=ok`,
      cancel_url: `${origin}/prezzi?pagamento=annullato`,
    };

    let session: Stripe.Checkout.Session;
    if (body.plan === "trip") {
      const qty = Math.min(10, Math.max(1, Math.floor(body.quantity ?? 1)));
      session = await stripe.checkout.sessions.create({
        ...common,
        mode: "payment",
        // Fattura/ricevuta PDF anche per i viaggi singoli (per gli abbonamenti la crea Stripe da sola).
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: "Elly — viaggi completi",
            metadata: { user_id: userId },
            ...(process.env.STRIPE_INVOICE_FOOTER ? { footer: process.env.STRIPE_INVOICE_FOOTER } : {}),
          },
        },
        payment_intent_data: { description: "Elly — viaggio completo", metadata: { user_id: userId } },
        line_items: [{ price: await priceIdFor(PRICE_LOOKUP.trip), quantity: qty, adjustable_quantity: { enabled: true, minimum: 1, maximum: 10 } }],
      });
    } else {
      session = await stripe.checkout.sessions.create({
        ...common,
        mode: "subscription",
        line_items: [{ price: await priceIdFor(PRICE_LOOKUP.monthly), quantity: 1 }],
        subscription_data: { description: "Elly — abbonamento mensile", metadata: { user_id: userId } },
      });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Elly] Checkout:", err);
    return NextResponse.json({ error: "Non riesco ad aprire il pagamento. Riprova tra poco." }, { status: 500 });
  }
}
