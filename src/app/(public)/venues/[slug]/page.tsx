import VenueDetailClient from "./venue-detail-client";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function VenueDetailPage() {
  return <VenueDetailClient />;
}
