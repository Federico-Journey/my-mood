import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { shareId, voterName, response } = await req.json();

    if (!shareId || !voterName?.trim() || !["yes", "no", "maybe"].includes(response)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { error } = await supabase.from("plan_votes").insert({
      share_id: shareId,
      voter_name: voterName.trim().slice(0, 50),
      response,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
