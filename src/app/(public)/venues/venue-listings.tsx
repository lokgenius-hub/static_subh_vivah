import { getVenues } from "@/lib/actions";
import { VenueCard } from "@/components/venue/venue-card";
import type { VenueType, VenueSearchParams } from "@/lib/types";

export async function VenueListings({
  searchParams = {},
}: {
  searchParams?: Record<string, string>;
}) {
  const venueParams: VenueSearchParams = {
    city: searchParams.city,
    venue_type: searchParams.type as VenueType | undefined,
    capacity: searchParams.capacity ? Number(searchParams.capacity) : undefined,
    q: searchParams.q,
  };

  const { venues } = await getVenues(venueParams);
  const activeFilter = searchParams.city || searchParams.type || searchParams.q;

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
