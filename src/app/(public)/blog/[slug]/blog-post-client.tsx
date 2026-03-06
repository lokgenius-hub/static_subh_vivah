"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/client-actions";
import { ArrowLeft, Calendar, Tag, Youtube } from "lucide-react";
import type { BlogPost } from "@/lib/types";

export default function BlogPostClient() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBlogPostBySlug(slug).then((p) => { setPost(p); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }

  if (!post || !post.is_published) {
    return <div className="min-h-screen flex flex-col items-center justify-center"><h1 className="text-2xl font-bold mb-2">Post Not Found</h1></div>;
  }

  const embedUrl = post.youtube_url
    ? post.youtube_url
        .replace("watch?v=", "embed/")
        .replace("youtu.be/", "youtube.com/embed/")
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {post.cover_image && (
        <div className="relative h-[45vh] lg:h-[55vh]">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/blog" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> All Posts
        </Link>

        <div className="mb-8">
          {post.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {post.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-medium">
                  <Tag className="h-3 w-3" /> {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-charcoal)] leading-tight mb-4">{post.title}</h1>

          {post.excerpt && <p className="text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>}

          {post.published_at && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
        </div>

        {embedUrl && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <Youtube className="h-4 w-4 text-red-500" /> Watch the Video
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe src={embedUrl} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
            </div>
          </div>
        )}

        {post.content && (
          <div className="prose prose-lg max-w-none prose-headings:text-[var(--color-charcoal)] prose-a:text-[var(--color-primary)] prose-img:rounded-xl prose-p:text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
        )}

        <div className="mt-12 p-8 bg-gradient-to-r from-[var(--color-primary)] to-amber-600 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Find Your Dream Venue</h3>
          <p className="text-amber-100 mb-5 text-sm">Browse hundreds of handpicked wedding venues across Bihar and India</p>
          <Link href="/venues" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-xl hover:bg-amber-50 transition-colors">
            Explore Venues →
          </Link>
        </div>
      </div>
    </div>
  );
}
