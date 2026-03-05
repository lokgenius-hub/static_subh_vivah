"use client";

import { MapPin, ExternalLink, Navigation } from "lucide-react";

interface VenueMapProps {
  latitude: number | null;
  longitude: number | null;
  venueName: string;
  address: string;
}

export function VenueMap({ latitude, longitude, venueName, address }: VenueMapProps) {
  // Build Google Maps embed URL
  const hasCoords = latitude && longitude;
  const query = hasCoords
    ? `${latitude},${longitude}`
    : encodeURIComponent(`${venueName}, ${address}`);

  const embedUrl = hasCoords
    ? `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${query}`;

  // Fallback: use search-based embed (no API key needed)
  const searchEmbedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${venueName}, ${address}`)}`;

  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${venueName}, ${address}`)}`;

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[var(--color-primary)]" /> Location
      </h2>

      {/* Map Embed */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-4">
        <iframe
          src={searchEmbedUrl}
          title={`Map of ${venueName}`}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Address + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          {address}
        </p>
        <div className="flex gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            <Navigation className="h-3 w-3" /> Get Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> Open in Maps
          </a>
        </div>
      </div>

      {hasCoords && (
        <p className="text-xs text-gray-400 mt-2">
          Coordinates: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
        </p>
      )}
    </section>
  );
}
