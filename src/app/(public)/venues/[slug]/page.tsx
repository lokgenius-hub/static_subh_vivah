import { createClient } from "@supabase/supabase-js";
import VenueDetailClient from "./venue-detail-client";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvuxmnysvmebwpiupink.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dXhtbnlzdm1lYndwaXVwaW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjkxNzQsImV4cCI6MjA4ODAwNTE3NH0.hT0XA9KvGk-tEwOM2L1rNCddgDP55gOeNHFBQ6qMWRc";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("venues")
      .select("slug")
      .eq("is_active", true);

    const params = (data || [])
      .filter((v: { slug: string }) => !!v.slug)
      .map((v: { slug: string }) => ({ slug: v.slug }));

    // Always include demo slug
    if (!params.find((p) => p.slug === "kaimur-palace-banquet")) {
      params.push({ slug: "kaimur-palace-banquet" });
    }

    return params.length > 0 ? params : [{ slug: "kaimur-palace-banquet" }];
  } catch {
    return [{ slug: "kaimur-palace-banquet" }];
  }
}

export default function VenueDetailPage() {
  return <VenueDetailClient />;
}
