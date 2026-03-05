"use client";

/**
 * VenueForm — shared between partner and admin. Handles create & edit.
 */
import { useState } from "react";
import { Plus, X, Youtube, Instagram, Facebook, Twitter, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import ImageUploader from "@/components/venue/image-uploader";
import { CITIES, VENUE_TYPES, AMENITIES } from "@/lib/constants";
import type { Venue } from "@/lib/types";

export interface VenueFormSubmitArgs {
  formData: FormData;
  images: string[];
  amenities: string[];
  ytVideos: string[];
  socialLinks: Record<string, string>;
}

interface Props {
  initial?: Venue;
  onSubmit: (args: VenueFormSubmitArgs) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function VenueForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [ytVideos, setYtVideos] = useState<string[]>(
    initial?.youtube_videos?.length ? initial.youtube_videos : [""]
  );
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    instagram: initial?.social_links?.instagram ?? "",
    facebook: initial?.social_links?.facebook ?? "",
    twitter: initial?.social_links?.twitter ?? "",
    youtube: initial?.social_links?.youtube ?? "",
    whatsapp: initial?.social_links?.whatsapp ?? "",
  });

  const addYtVideo = () => setYtVideos((p) => [...p, ""]);
  const removeYtVideo = (i: number) => setYtVideos((p) => p.filter((_, idx) => idx !== i));
  const updateYtVideo = (i: number, val: string) =>
    setYtVideos((p) => p.map((v, idx) => (idx === i ? val : v)));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await onSubmit({ formData: fd, images, amenities, ytVideos: ytVideos.filter(Boolean), socialLinks });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input name="name" label="Venue Name" placeholder="e.g. Royal Palace Banquet" defaultValue={initial?.name} required />
        <Select
          name="venue_type"
          label="Venue Type"
          options={VENUE_TYPES.map((v) => ({ value: v.value, label: v.label }))}
          placeholder="Select type"
          defaultValue={initial?.venue_type}
        />
        <Select
          name="city"
          label="City"
          options={CITIES.map((c) => ({ value: c, label: c }))}
          placeholder="Select city"
          defaultValue={initial?.city}
        />
        <Input name="state" label="State" defaultValue={initial?.state ?? "Bihar"} />
        <Input name="address" label="Address" placeholder="Full address" className="sm:col-span-2" defaultValue={initial?.address} required />
        <Input name="pincode" label="Pincode" placeholder="e.g. 821101" defaultValue={initial?.pincode ?? ""} />
        <Input name="latitude" label="Latitude (Google Maps)" type="number" step="any" placeholder="e.g. 25.0392" defaultValue={initial?.latitude?.toString() ?? ""} />
        <Input name="longitude" label="Longitude (Google Maps)" type="number" step="any" placeholder="e.g. 83.6082" defaultValue={initial?.longitude?.toString() ?? ""} />
        <Input name="capacity_min" label="Min Capacity" type="number" placeholder="50" defaultValue={initial?.capacity_min?.toString()} />
        <Input name="capacity_max" label="Max Capacity" type="number" placeholder="500" defaultValue={initial?.capacity_max?.toString()} />
        <Input name="price_per_slot" label="Price per Slot (Rs)" type="number" placeholder="250000" defaultValue={initial?.price_per_slot?.toString()} required />
        <Input name="price_per_plate" label="Price per Plate (Rs)" type="number" placeholder="800" defaultValue={initial?.price_per_plate?.toString() ?? ""} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          placeholder="Describe your venue..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() =>
                setAmenities((prev) =>
                  prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                amenities.includes(a)
                  ? "bg-gradient-gold text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <ImageUploader initialImages={initial?.images ?? []} onChange={setImages} />

      {/* YouTube Videos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube Videos <span className="text-xs text-gray-400">(walkthrough, highlights, etc.)</span>
        </label>
        <div className="space-y-2">
          {ytVideos.map((url, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1 relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateYtVideo(i, e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              {ytVideos.length > 1 && (
                <button type="button" onClick={() => removeYtVideo(i)} className="px-2 text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addYtVideo}
          className="mt-2 flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add another video
        </button>
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Social Media Links</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourvenue" },
            { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourvenue" },
            { key: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/yourvenue" },
            { key: "youtube", label: "YouTube Channel", icon: Youtube, placeholder: "https://youtube.com/@yourvenue" },
            { key: "whatsapp", label: "WhatsApp Number", icon: Phone, placeholder: "91XXXXXXXXXX" },
          ] as { key: string; label: string; icon: React.FC<{ className?: string }>; placeholder: string }[]).map(
            ({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={key === "whatsapp" ? "tel" : "url"}
                  value={socialLinks[key] ?? ""}
                  onChange={(e) => setSocialLinks((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  aria-label={label}
                  className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
