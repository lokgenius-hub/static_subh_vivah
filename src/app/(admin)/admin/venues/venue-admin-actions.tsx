"use client";

import { useState } from "react";
import { toggleVenueStatus, toggleVenueFeatured, deleteVenue, updateVenue } from "@/lib/client-actions";
import { Eye, EyeOff, Star, StarOff, Trash2, Loader2, Pencil, X, CheckCircle2 } from "lucide-react";
import { VenueForm, type VenueFormSubmitArgs } from "@/components/venue/venue-form";
import type { Venue } from "@/lib/types";

interface Props {
  venue: Venue;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function VenueAdminActions({ venue, isEditing, onEditToggle }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleActive = async () => {
    setLoading("active");
    await toggleVenueStatus(venue.id, !venue.is_active);
    setLoading(null);
  };

  const handleToggleFeatured = async () => {
    setLoading("featured");
    await toggleVenueFeatured(venue.id, !venue.is_featured);
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;
    setLoading("delete");
    await deleteVenue(venue.id);
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit */}
      <button
        onClick={onEditToggle}
        title={isEditing ? "Close editor" : "Edit venue"}
        className={`p-1.5 rounded-lg transition-colors ${
          isEditing
            ? "text-[var(--color-primary)] bg-pink-50"
            : "text-blue-500 hover:bg-blue-50"
        }`}
      >
        {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
      </button>

        {/* Active toggle */}
        <button
          onClick={handleToggleActive}
          disabled={loading !== null}
          title={venue.is_active ? "Deactivate" : "Activate"}
          className={`p-1.5 rounded-lg transition-colors ${
            venue.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          {loading === "active" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : venue.is_active ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>

        {/* Featured toggle */}
        <button
          onClick={handleToggleFeatured}
          disabled={loading !== null}
          title={venue.is_featured ? "Remove Featured" : "Mark Featured"}
          className={`p-1.5 rounded-lg transition-colors ${
            venue.is_featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          {loading === "featured" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : venue.is_featured ? (
            <Star className="h-4 w-4 fill-amber-400" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={loading !== null}
          title="Delete venue"
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          {loading === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    );
  }

/**
 * Full-page edit drawer — rendered outside the table row so it
 * can span the full width without breaking table layout.
 */
export function VenueEditDrawer({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const [saveOk, setSaveOk] = useState(false);

  const handleUpdate = async ({ formData: fd, images, amenities, ytVideos, socialLinks }: VenueFormSubmitArgs) => {
    fd.set("amenities", JSON.stringify(amenities));
    fd.set("images", JSON.stringify(images));
    fd.set("youtube_videos", JSON.stringify(ytVideos));
    fd.set("social_links", JSON.stringify(socialLinks));
    if (images.length > 0) fd.set("cover_image", images[0]);
    const result = await updateVenue(venue.id, fd);
    if (!result.success) throw new Error(result.error ?? "Update failed");
    setSaveOk(true);
    setTimeout(() => { setSaveOk(false); onClose(); }, 2000);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-pink-200 shadow-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-50 to-white border-b border-pink-100">
        <div>
          <h3 className="font-semibold text-gray-800">Editing: {venue.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Super-admin full edit — all fields, images, map coordinates, socials</p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {saveOk && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Venue updated successfully!
        </div>
      )}

      <div className="p-6">
        <VenueForm
          initial={venue}
          onSubmit={handleUpdate}
          onCancel={onClose}
          submitLabel="Save All Changes"
        />
      </div>
    </div>
  );
}
