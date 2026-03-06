import StoryDetailClient from "./story-detail-client";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function StoryDetailPage() {
  return <StoryDetailClient />;
}
