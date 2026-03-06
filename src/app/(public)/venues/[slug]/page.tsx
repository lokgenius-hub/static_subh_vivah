import { createClient } from "@supabase/supabase-js";
import VenueDetailClient from "./venue-detail-client";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
