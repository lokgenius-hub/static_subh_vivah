import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/actions";
import { BookOpen, Youtube, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Wedding Tips | VivahSthal",
  description:
    "Wedding planning tips, venue guides, decoration ideas, and expert advice for your dream Indian wedding. Stay updated with VivahSthal.",
  openGraph: {
    title: "Wedding Blog | VivahSthal",
    description: "Tips, guides and inspiration for your perfect wedding venue in Bihar and India.",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts(true);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <div className="bg-[var(--color-charcoal)] py-16 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-[var(--color-primary-light)]" />
          <span className="text-sm font-medium text-[var(--color-primary-light)] uppercase tracking-wider">
            VivahSthal Blog
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">
          Wedding <span className="text-gradient-primary">Inspiration</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm">
          Tips, guides and expert advice for planning your dream celebration across Bihar and India.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No posts published yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon for wedding tips and venue guides!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                  {/* Cover */}
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <BookOpen className="h-12 w-12" />
                      </div>
                    )}
                    {post.youtube_url && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-medium">
                        <Youtube className="h-3 w-3" /> Video
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {post.tags.slice(0, 3).map((t) => (
                          <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-medium">
                            <Tag className="h-2.5 w-2.5" />{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="font-bold text-gray-800 text-lg leading-snug mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                    )}

                    {post.published_at && (
                      <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.published_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
