"use client";

import { useEffect, useState, useCallback } from "react";
import { getVenues } from "@/lib/client-actions";
import { VenueCard } from "@/components/venue/venue-card";
import { Button } from "@/components/ui/button";
import type { Venue, VenueType, VenueSearchParams } from "@/lib/types";

export function VenueListings({
  searchParams = {},
}: {
  searchParams?: Record<string, string>;
}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    const venueParams: VenueSearchParams = {
      city: searchParams.city,
      venue_type: searchParams.type as VenueType | undefined,
      capacity: searchParams.capacity ? Number(searchParams.capacity) : undefined,
      q: searchParams.q,
    };
    try {
      // Race the fetch against a 12-second timeout
      const result = await Promise.race([
        getVenues(venueParams),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out — Supabase may be temporarily unreachable. Please try again.")), 12000)
        ),
      ]);
      setVenues(result.venues);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load venues";
      setError(msg);
      console.error("[VenueListings] getVenues failed:", msg);
    } finally {
      setLoading(false);
    }
  }, [searchParams.city, searchParams.type, searchParams.capacity, searchParams.q]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const activeFilter = searchParams.city || searchParams.type || searchParams.q;

  if (loading) {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-6">Loading venues...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Could not load venues</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{error}</p>
        <Button onClick={fetchVenues} className="bg-[var(--color-primary)] text-white">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {activeFilter ? (
            <>
              Showing <span className="font-medium text-gray-800">{venues.length}</span> venues
              {searchParams.city && <> in <span className="font-medium text-gray-800">{searchParams.city}</span></>}
            </>
          ) : (
            <>
              Showing <span className="font-medium text-gray-800">{venues.length}</span> venues
            </>
          )}
        </p>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-gray-500 mb-2">No venues found{searchParams.city ? ` in ${searchParams.city}` : ""}</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or check back soon — new venues are added regularly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
