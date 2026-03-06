"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchFilters } from "@/components/venue/search-filters";
import { VenueListings } from "./venue-listings";

function VenuesPageInner() {
  const searchParams = useSearchParams();
  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => { obj[k] = v; });
    return obj;
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--color-charcoal)] to-[var(--color-charcoal)]/90 pt-12 pb-8 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Find Your Perfect <span className="text-gradient-primary">Venue</span>
          </h1>
          <p className="text-gray-400 mb-6">
            Browse 20+ verified wedding venues in Bhabua, Sasaram &amp; Kaimur
          </p>
          <SearchFilters variant="hero" />
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <VenueListings searchParams={params} />
      </div>
    </div>
  );
}

export default function VenuesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" /></div>}>
      <VenuesPageInner />
    </Suspense>
  );
}
