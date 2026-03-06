"use client";

import { useEffect, useState } from "react";
import { getVenues } from "@/lib/client-actions";
import { VenueCard } from "@/components/venue/venue-card";
import type { Venue, VenueType, VenueSearchParams } from "@/lib/types";

export function VenueListings({
  searchParams = {},
}: {
  searchParams?: Record<string, string>;
}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const venueParams: VenueSearchParams = {
      city: searchParams.city,
      venue_type: searchParams.type as VenueType | undefined,
      capacity: searchParams.capacity ? Number(searchParams.capacity) : undefined,
      q: searchParams.q,
    };
    getVenues(venueParams).then(({ venues: v }) => { setVenues(v); setLoading(false); }).catch(() => setLoading(false));
  }, [searchParams.city, searchParams.type, searchParams.capacity, searchParams.q]);

  const activeFilter = searchParams.city || searchParams.type || searchParams.q;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
        ))}
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
