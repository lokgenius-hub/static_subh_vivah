import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSuccessStoryBySlug, getSuccessStories } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Heart, ArrowRight, ArrowLeft, Youtube } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);
  if (!story) return { title: "Story Not Found" };

  return {
    title: `${story.couple_name} — Wedding Story | VivahSthal`,
    description: story.excerpt || `Read the beautiful wedding story of ${story.couple_name} from ${story.location}`,
    openGraph: {
      title: `${story.couple_name} — Wedding at ${story.venue_name || story.location}`,
      description: story.excerpt || undefined,
      images: story.cover_image ? [{ url: story.cover_image }] : undefined,
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);

  if (!story) notFound();

  const allStories = await getSuccessStories();
  const otherStories = allStories.filter(s => s.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Hero */}
      <div className="relative h-[50vh] lg:h-[60vh]">
        {story.cover_image ? (
          <Image
            src={story.cover_image}
            alt={story.couple_name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-200 to-amber-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <Link href="/stories" className="inline-flex items-center gap-1 text-white/70 text-sm hover:text-white mb-3">
              <ArrowLeft className="h-4 w-4" /> All Stories
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="gold">Love Story</Badge>
              {story.venue_name && (
                <Badge className="bg-white/20 text-white backdrop-blur-sm">{story.venue_name}</Badge>
              )}
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2">
              {story.couple_name}
            </h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {story.location}
              </span>
              {story.event_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(story.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* YouTube Video */}
        {story.youtube_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-10 shadow-lg">
            <iframe
              src={story.youtube_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              title={`${story.couple_name} wedding video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}

        {/* Story Content */}
        <article className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
          <div
            className="prose prose-lg max-w-none prose-headings:text-[var(--color-charcoal)] prose-a:text-[var(--color-primary)]"
            dangerouslySetInnerHTML={{ __html: story.story }}
          />
        </article>

        {/* Image Gallery */}
        {story.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {story.images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                <Image src={img} alt={`${story.couple_name} photo ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* CTA Card */}
        <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-2xl p-8 text-center border border-[var(--color-primary)]/10">
          <Heart className="h-10 w-10 text-[var(--color-accent)] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">
            Plan Your Dream Wedding
          </h3>
          <p className="text-gray-500 mb-6">
            Let VivahSthal help you create your own beautiful love story in {story.location}.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/venues">
              <Button size="lg">
                Find Venues <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button size="lg" variant="outline">
                View Packages
              </Button>
            </Link>
          </div>
        </div>

        {/* Other Stories */}
        {otherStories.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-[var(--color-charcoal)] mb-6">More Love Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherStories.map((s) => (
                <Link key={s.slug} href={`/stories/${s.slug}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[16/10]">
                      {s.cover_image ? (
                        <Image src={s.cover_image} alt={s.couple_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-rose-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-[var(--color-charcoal)]">{s.couple_name}</p>
                      <p className="text-xs text-gray-500">{s.location}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
