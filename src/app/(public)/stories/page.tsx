"use client";

import { useEffect, useState } from "react";
import { getSuccessStories } from "@/lib/client-actions";
import { StoriesList } from "./stories-list";
import type { SuccessStory } from "@/lib/types";

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuccessStories().then((s) => { setStories(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[var(--color-charcoal)] to-[#2D1B69] pt-24 pb-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-1/4 w-80 h-80 bg-rose-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-widest mb-3">
            Real Weddings, Real Joy
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">
            Success <span className="text-gradient-primary">Stories</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Every wedding we help plan becomes a beautiful story. Read about real couples
            from Bhabua, Sasaram &amp; the Kaimur region who celebrated with VivahSthal.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 animate-pulse bg-gray-100" />
      ) : (
        <StoriesList stories={stories} />
      )}
    </div>
  );
}
