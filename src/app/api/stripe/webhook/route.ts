import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripe } from "@/lib/stripeServer";

export const dynamic = "force-dynamic";

/**
 * Webhook di Stripe: è Stripe stesso a dirci "questo pagamento è andato a buon fine".
 * Ogni messaggio è firmato: senza la firma giusta (STRIPE_WEBHOOK_SECRET) lo scartiamo, così
 * nessuno può accreditarsi viaggi a mano. Gli accrediti sono "idempotenti": se Stripe ripete lo
 * stesso messaggio (succede) i viaggi non vengono contati due volte.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook non configurato" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckout(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await revokeForCharge(stripe, event.data.object as Stripe.Charge, false);
        break;
      case "charge.dispute.closed": {
        // Contestazione persa: è come un rimborso totale.
        const dispute = event.data.object as Stripe.Dispute;
        if (dispute.status === "lost") await revokeForCharge(stripe, dispute.charge, true);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break; // altri eventi: ignorati
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    // 500 => Stripe riprova più tardi (l'elaborazione è sicura da ripetere).
    console.error(`[Elly] Webhook ${event.type}:`, err);
    return NextResponse.json({ error: "Errore di elaborazione" }, { status: 500 });
  }
}

async function userForCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin().from("user_billing").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
  return data?.user_id ?? null;
}

const customerId = (c: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null =>
  !c ? null : typeof c === "string" ? c : c.id;

async function handleCheckout(stripe: Stripe, session: Stripe.Checkout.Session) {
  const admin = supabaseAdmin();
  const cust = customerId(session.customer);
  const userId = session.metadata?.user_id || session.client_reference_id || (cust ? await userForCustomer(cust) : null);
  if (!userId) throw new Error(`Checkout ${session.id} senza utente`);
  if (cust) await admin.rpc("set_stripe_customer", { p_user: userId, p_customer: cust });

  if (session.mode === "payment") {
    if (session.payment_status !== "paid") return; // pagamento in attesa (es. bonifico): arriverà async_payment_succeeded
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
    const qty = items.data.reduce((n, li) => n + (li.quantity ?? 0), 0);
    if (qty < 1) throw new Error(`Checkout ${session.id} senza viaggi`);
    const { error } = await admin.rpc("grant_credits", { p_user: userId, p_qty: qty, p_ref: session.id });
    if (error) throw error;
  } else if (session.mode === "subscription" && session.subscription) {
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    await syncSubscription(await stripe.subscriptions.retrieve(subId), userId);
  }
}

async function syncSubscription(sub: Stripe.Subscription, knownUser?: string) {
  const cust = customerId(sub.customer);
  const userId = knownUser || sub.metadata?.user_id || (cust ? await userForCustomer(cust) : null);
  if (!userId) throw new Error(`Abbonamento ${sub.id} senza utente`);
  // Nelle versioni recenti dell'API il periodo di fatturazione è sull'elemento dell'abbonamento.
  const item = sub.items.data[0];
  const iso = (t?: number) => (t ? new Date(t * 1000).toISOString() : null);
  const { error } = await supabaseAdmin().rpc("upsert_subscription", {
    p_user: userId,
    p_sub: sub.id,
    p_status: sub.status,
    p_start: iso(item?.current_period_start),
    p_end: iso(item?.current_period_end),
    p_cancel: sub.cancel_at_period_end,
  });
  if (error) throw error;
}

/**
 * Rimborso (o contestazione persa) di un acquisto di viaggi: togliamo i crediti corrispondenti.
 * Rimborso parziale = quota proporzionale (arrotondata per difetto a favore del cliente).
 * I viaggi già generati non si possono "ritirare": se i crediti sono già stati usati, la parte
 * non recuperabile finisce nei log. I rimborsi degli abbonamenti non toccano i crediti.
 */
async function revokeForCharge(stripe: Stripe, chargeRef: string | Stripe.Charge, full: boolean) {
  const charge = typeof chargeRef === "string" ? await stripe.charges.retrieve(chargeRef) : chargeRef;
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return;
  const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 1 });
  const session = sessions.data[0];
  if (!session || session.mode !== "payment") return; // non è un acquisto di viaggi singoli
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) return;
  const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
  const qty = items.data.reduce((n, li) => n + (li.quantity ?? 0), 0);
  if (qty < 1 || charge.amount < 1) return;
  const target = full || charge.amount_refunded >= charge.amount ? qty : Math.floor((qty * charge.amount_refunded) / charge.amount);
  const { data, error } = await supabaseAdmin().rpc("revoke_credits", { p_user: userId, p_ref: session.id, p_target: target });
  if (error) throw error;
  if (data?.shortfall > 0) {
    console.warn(`[Elly] Rimborso ${charge.id}: ${data.shortfall} crediti già usati, non recuperabili (utente ${userId}).`);
  }
}
