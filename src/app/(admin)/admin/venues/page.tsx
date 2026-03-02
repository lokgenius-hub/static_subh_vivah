import { getAllVenues } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Star, IndianRupee } from "lucide-react";
import { VenueAdminActions } from "./venue-admin-actions";

export const metadata = {
  title: "Venue Management | VivahSthal Admin",
};

export default async function AdminVenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const venues = await getAllVenues({ status: params.status, q: params.q });

  const activeCount = venues.filter((v: Record<string, unknown>) => v.is_active).length;
  const inactiveCount = venues.filter((v: Record<string, unknown>) => !v.is_active).length;
  const featuredCount = venues.filter((v: Record<string, unknown>) => v.is_featured).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">All Venues</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review, approve, and manage all venue listings
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", count: venues.length, color: "bg-gray-100 text-gray-800" },
          { label: "Active", count: activeCount, color: "bg-green-100 text-green-800" },
          { label: "Inactive", count: inactiveCount, color: "bg-red-100 text-red-800" },
          { label: "Featured", count: featuredCount, color: "bg-amber-100 text-amber-800" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold">{s.count}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs ${s.color}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <form className="flex-1 flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={params.q || ""}
            placeholder="Search venues by name or city..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <select
            name="status"
            defaultValue={params.status || ""}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {venues.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No venues found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {venues.map((venue: Record<string, unknown>) => {
                  const vendor = venue.vendor as Record<string, unknown> | null;
                  return (
                    <tr key={venue.id as string} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {venue.cover_image ? (
                              <img
                                src={venue.cover_image as string}
                                alt={venue.name as string}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{venue.name as string}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {venue.city as string}, {venue.state as string}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium">{vendor?.full_name as string || "N/A"}</p>
                        <p className="text-xs text-gray-400">{vendor?.email as string || ""}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {venue.capacity_min as number}-{venue.capacity_max as number} guests
                          </div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {formatPrice(venue.price_per_slot as number)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400" />
                            {(venue.rating as number) > 0 ? (venue.rating as number).toFixed(1) : "New"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {(venue.is_active as boolean) ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">Inactive</Badge>
                          )}
                          {(venue.is_featured as boolean) ? (
                            <Badge variant="gold" className="text-[10px]">Featured</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <VenueAdminActions
                          venueId={venue.id as string}
                          isActive={venue.is_active as boolean}
                          isFeatured={venue.is_featured as boolean}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
