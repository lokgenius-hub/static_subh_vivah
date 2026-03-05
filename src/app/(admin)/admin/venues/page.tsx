import { getAllVenues } from "@/lib/actions";
import { AdminVenuesTable } from "./venues-table";
import type { Venue } from "@/lib/types";

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
        <AdminVenuesTable venues={venues as (Venue & { vendor?: { full_name?: string; email?: string } | null })[]} />
      </div>
    </div>
  );
}
