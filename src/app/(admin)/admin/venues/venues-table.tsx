"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, MapPin, Users, Star, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VenueAdminActions, VenueEditDrawer } from "./venue-admin-actions";
import { formatPrice } from "@/lib/utils";
import type { Venue } from "@/lib/types";

interface VenueRow extends Venue {
  vendor?: { full_name?: string; email?: string } | null;
}

export function AdminVenuesTable({ venues }: { venues: VenueRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (venues.length === 0) {
    return (
      <div className="p-12 text-center">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No venues found</p>
      </div>
    );
  }

  const editingVenue = venues.find((v) => v.id === editingId) ?? null;

  return (
    <div>
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
            {venues.map((venue) => (
              <tr
                key={venue.id}
                className={`transition-colors ${editingId === venue.id ? "bg-pink-50/40" : "hover:bg-gray-50/50"}`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {venue.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={venue.cover_image} alt={venue.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{venue.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {venue.city}, {venue.state}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium">{venue.vendor?.full_name || "N/A"}</p>
                  <p className="text-xs text-gray-400">{venue.vendor?.email || ""}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {venue.capacity_min}-{venue.capacity_max} guests
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formatPrice(venue.price_per_slot)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      {venue.rating > 0 ? venue.rating.toFixed(1) : "New"}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {venue.is_active ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-[10px]">Inactive</Badge>
                    )}
                    {venue.is_featured && (
                      <Badge variant="gold" className="text-[10px]">Featured</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <VenueAdminActions
                    venue={venue}
                    isEditing={editingId === venue.id}
                    onEditToggle={() => setEditingId(editingId === venue.id ? null : venue.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fixed full-screen edit modal */}
      <AnimatePresence>
        {editingVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setEditingId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl my-8"
            >
              <VenueEditDrawer
                venue={editingVenue}
                onClose={() => setEditingId(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
