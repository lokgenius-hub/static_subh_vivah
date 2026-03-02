"use client";

import { useState } from "react";
import { toggleVenueStatus, toggleVenueFeatured, deleteVenue } from "@/lib/actions";
import { Eye, EyeOff, Star, StarOff, Trash2, Loader2 } from "lucide-react";

interface Props {
  venueId: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function VenueAdminActions({ venueId, isActive, isFeatured }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleActive = async () => {
    setLoading("active");
    await toggleVenueStatus(venueId, !isActive);
    setLoading(null);
  };

  const handleToggleFeatured = async () => {
    setLoading("featured");
    await toggleVenueFeatured(venueId, !isFeatured);
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;
    setLoading("delete");
    await deleteVenue(venueId);
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggleActive}
        disabled={loading !== null}
        title={isActive ? "Deactivate" : "Activate"}
        className={`p-1.5 rounded-lg transition-colors ${
          isActive
            ? "text-green-600 hover:bg-green-50"
            : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        {loading === "active" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={handleToggleFeatured}
        disabled={loading !== null}
        title={isFeatured ? "Remove Featured" : "Mark Featured"}
        className={`p-1.5 rounded-lg transition-colors ${
          isFeatured
            ? "text-amber-500 hover:bg-amber-50"
            : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        {loading === "featured" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFeatured ? (
          <Star className="h-4 w-4 fill-amber-400" />
        ) : (
          <StarOff className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading !== null}
        title="Delete venue"
        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        {loading === "delete" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
