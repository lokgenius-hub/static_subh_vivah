"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getVenues } from "@/lib/client-actions";
import { VenueCard } from "@/components/venue/venue-card";
import { Button } from "@/components/ui/button";
import type { Venue, VenueType, VenueSearchParams } from "@/lib/types";

const PAGE_SIZE = 12;

export function VenueListings({
  searchParams = {},
}: {
  searchParams?: Record<string, string>;
}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = venues.length < total;

  // Build filter params from searchParams
  const venueParams: VenueSearchParams = {
    city: searchParams.city,
    venue_type: searchParams.type as VenueType | undefined,
    capacity: searchParams.capacity ? Number(searchParams.capacity) : undefined,
    q: searchParams.q,
    limit: PAGE_SIZE,
  };

  // Reset and load page 1 whenever filters change
  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const result = await Promise.race([
        getVenues({ ...venueParams, page: 1 }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out — please try again.")), 12000)
        ),
      ]);
      setVenues(result.venues);
      setTotal(result.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load venues";
      setError(msg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.city, searchParams.type, searchParams.capacity, searchParams.q]);

  useEffect(() => { fetchFirstPage(); }, [fetchFirstPage]);

  // Load the next page and append results
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getVenues({ ...venueParams, page: nextPage });
      setVenues((prev) => [...prev, ...result.venues]);
      setTotal(result.total);
      setPage(nextPage);
    } catch {
      // silently fail for load-more — user can scroll again to retry
    } finally {
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, page, searchParams.city, searchParams.type, searchParams.capacity, searchParams.q]);

  // IntersectionObserver — trigger loadMore when sentinel scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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
        <Button onClick={fetchFirstPage} className="bg-[var(--color-primary)] text-white">
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
              Showing <span className="font-medium text-gray-800">{venues.length}</span>
              {total > venues.length && <> of <span className="font-medium text-gray-800">{total}</span></>} venues
              {searchParams.city && <> in <span className="font-medium text-gray-800">{searchParams.city}</span></>}
            </>
          ) : (
            <>
              Showing <span className="font-medium text-gray-800">{venues.length}</span>
              {total > venues.length && <> of <span className="font-medium text-gray-800">{total}</span></>} venues
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} />
            ))}
          </div>

          {/* Sentinel div — triggers IntersectionObserver to auto-load next page */}
          {hasMore && <div ref={sentinelRef} className="h-16" />}

          {/* Spinner shown while loading more */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
            </div>
          )}

          {/* All loaded indicator */}
          {!hasMore && venues.length > PAGE_SIZE && (
            <p className="text-center text-sm text-gray-400 py-8">
              All {total} venues loaded
            </p>
          )}
        </>
      )}
    </>
  );
}
