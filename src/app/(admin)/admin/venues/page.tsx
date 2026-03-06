"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllVenues } from "@/lib/client-actions";
import { AdminVenuesTable } from "./venues-table";
import type { Venue } from "@/lib/types";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<(Venue & { vendor?: { full_name?: string; email?: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQ, setFilterQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    const v = await getAllVenues({ status: filterStatus || undefined, q: filterQ || undefined });
    setVenues(v as (Venue & { vendor?: { full_name?: string; email?: string } | null })[]);
    setLoading(false);
  }, [filterQ, filterStatus]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const activeCount = venues.filter((v) => v.is_active).length;
  const inactiveCount = venues.filter((v) => !v.is_active).length;
  const featuredCount = venues.filter((v) => v.is_featured).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }

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
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={filterQ}
            onChange={(e) => setFilterQ(e.target.value)}
            placeholder="Search venues by name or city..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={fetchVenues}
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <AdminVenuesTable venues={venues as (Venue & { vendor?: { full_name?: string; email?: string } | null })[]} />
      </div>
    </div>
  );
}
