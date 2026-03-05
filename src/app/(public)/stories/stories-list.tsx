"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Heart, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { SuccessStory } from "@/lib/types";

const demoStories: SuccessStory[] = [
  {
    id: "1", couple_name: "Priya & Rahul Sharma", slug: "priya-rahul-bhabua-wedding",
    location: "Bhabua", venue_name: "Kaimur Valley Lawns", event_date: "2025-11-15",
    story: "", excerpt: "A beautiful traditional wedding in Bhabua that blended Kaimur heritage with modern celebration.",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    images: [], youtube_url: null, is_published: true, published_at: "2025-12-01",
    created_at: "", updated_at: "",
  },
  {
    id: "2", couple_name: "Sneha & Amit Kumar", slug: "sneha-amit-sasaram-celebration",
    location: "Sasaram", venue_name: "Shershah Heritage Hall", event_date: "2025-12-20",
    story: "", excerpt: "A royal celebration at Sasaram's iconic heritage venue with 800+ guests.",
    cover_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    images: [], youtube_url: null, is_published: true, published_at: "2026-01-05",
    created_at: "", updated_at: "",
  },
  {
    id: "3", couple_name: "Ritu & Manish Verma", slug: "ritu-manish-mohania-garden",
    location: "Mohania", venue_name: "Mohania Garden Resort", event_date: "2026-01-10",
    story: "", excerpt: "An intimate garden wedding in Mohania that was beautiful and budget-friendly.",
    cover_image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80",
    images: [], youtube_url: null, is_published: true, published_at: "2026-02-01",
    created_at: "", updated_at: "",
  },
];

function StoryCard({ story, index }: { story: SuccessStory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <Link href={`/stories/${story.slug}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
          {/* Cover Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {story.cover_image ? (
              <Image
                src={story.cover_image}
                alt={story.couple_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                <Heart className="h-16 w-16 text-rose-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {story.youtube_url && (
              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Play className="h-3 w-3 fill-white" /> Video
              </div>
            )}
            <div className="absolute bottom-3 left-3">
              <p className="text-white font-bold text-lg">{story.couple_name}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {story.location}
              </span>
              {story.venue_name && (
                <span className="text-[var(--color-primary)] font-medium">
                  {story.venue_name}
                </span>
              )}
              {story.event_date && (
                <span className="flex items-center gap-1 ml-auto">
                  <Calendar className="h-3 w-3" />
                  {new Date(story.event_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            {story.excerpt && (
              <p className="text-sm text-gray-600 line-clamp-2">{story.excerpt}</p>
            )}

            <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] group-hover:gap-2 transition-all">
              Read Full Story <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function StoriesList({ stories }: { stories: SuccessStory[] }) {
  const display = stories.length > 0 ? stories : demoStories;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {display.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>

        {display.length === 0 && (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-rose-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">More stories coming soon!</p>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 mb-4">Want your story featured here?</p>
          <Link href="/venues">
            <Button size="lg">
              Start Your Journey <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
