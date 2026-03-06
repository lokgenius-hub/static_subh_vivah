"use client";

import { useEffect, useState } from "react";
import { getFeaturedVenues } from "@/lib/client-actions";
import { VenueCard } from "@/components/venue/venue-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import type { Venue } from "@/lib/types";

export function FeaturedVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedVenues().then((v) => { setVenues(v); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no venues in DB, show a call-to-action instead of broken demo cards
  if (venues.length === 0) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <Heart className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-4 fill-[var(--color-primary)]/20" />
          <h2 className="text-2xl font-extrabold text-[var(--color-charcoal)] mb-3">
            Featured Venues Coming Soon
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We&apos;re adding the best wedding venues in Bhabua, Sasaram &amp; Kaimur. Check back soon!
          </p>
          <Link href="/enquiry">
            <Button className="bg-gradient-primary text-white">
              Send Enquiry <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-[var(--color-primary)] fill-[var(--color-primary)]/30" />
              <span className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                Handpicked for You
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)]">
              Featured <span className="text-gradient-primary">Venues</span>
            </h2>
            <p className="mt-2 text-gray-500">Top-rated wedding venues in Kaimur &amp; Rohtas district</p>
          </div>
          <Link href="/venues" className="hidden sm:block">
            <Button variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/venues">
            <Button className="bg-gradient-primary text-white shadow-lg">
              View All Venues <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
