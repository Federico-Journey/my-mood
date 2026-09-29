import { NextRequest, NextResponse } from "next/server";
import { supabaseForRequest } from "@/lib/supabaseServer";
import { billingEnabled, supabaseAdmin } from "@/lib/supabaseAdmin";
import type { BillingStatus } from "@/lib/billingConfig";

export const dynamic = "force-dynamic";

/** Saldo viaggi, viaggio gratuito e abbonamento di chi è loggato. */
export async function GET(request: NextRequest) {
  if (!billingEnabled()) return NextResponse.json({ enabled: false } satisfies BillingStatus);
  const { userId } = await supabaseForRequest(request);
  if (!userId) return NextResponse.json({ enabled: true, loggedIn: false } satisfies BillingStatus);
  const { data, error } = await supabaseAdmin().rpc("billing_summary", { p_user: userId });
  if (error || !data) {
    console.error("[Elly] billing_summary:", error);
    return NextResponse.json({ error: "Non riesco a leggere il tuo piano." }, { status: 500 });
  }
  return NextResponse.json({ enabled: true, loggedIn: true, ...data });
}
