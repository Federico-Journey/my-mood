import ShareTripClient from "./ShareTripClient";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { GeneratedTrip } from "@/lib/tripGenerator";

type Props = { params: Promise<{ id: string }> };

export default async function ShareTripPage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await supabase.from("shared_trips").select("*").eq("id", id).single();
  if (error || !data) notFound();

  const { data: votes } = await supabase
    .from("trip_votes")
    .select("voter_name, response")
    .eq("share_id", id)
    .order("created_at", { ascending: true });

  return (
    <ShareTripClient
      shareId={id}
      trip={data.trip_data as GeneratedTrip}
      themeAccent={(data.theme_accent as string) || "#7A3348"}
      initialVotes={votes ?? []}
    />
  );
}
