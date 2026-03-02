"use client";

/**
 * ImageUploader
 * ─────────────
 * Lets a vendor add up to MAX_IMAGES images for their venue.
 *
 * Each image can be added ONE AT A TIME via:
 *   • Drag-and-drop / click-to-browse a local file
 *   • Paste / type a public image URL
 *
 * Usage:
 *   <ImageUploader onChange={(urls) => setImages(urls)} />
 *
 * The parent receives a plain string[] of public URLs every time
 * the list changes.  Pass the final list to your server action.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Link2, Trash2, UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 5;
const BUCKET = "venue-images";

type InputMode = "file" | "url";

interface ImageItem {
  url: string;
  preview: string;
  isUploading?: boolean;
  justUploaded?: boolean;
  error?: string;
}

interface Props {
  onChange: (urls: string[]) => void;
  initialImages?: string[];
}

export default function ImageUploader({ onChange, initialImages }: Props) {
  const [images, setImages] = useState<ImageItem[]>(
    (initialImages ?? []).map((url) => ({ url, preview: url }))
  );
  const [mode, setMode] = useState<InputMode>("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Notify parent whenever images settle (after state update, not during)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const urls = images
      .filter((i) => !i.isUploading && !i.error)
      .map((i) => i.url);
    onChangeRef.current(urls);
  }, [images]);

  const canAdd = images.length < MAX_IMAGES;

  // ── File upload to Supabase Storage ──────────────────────

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    const placeholder: ImageItem = { url: "", preview, isUploading: true };

    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) return prev;
      return [...prev, placeholder];
    });

    const markError = (msg: string) => {
      setImages((prev) =>
        prev.map((img) =>
          img.preview === preview ? { ...img, isUploading: false, error: msg } : img
        )
      );
      setStatusMsg({ type: "error", text: msg });
      setTimeout(() => setStatusMsg(null), 6000);
    };

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Race upload against a 15s timeout so it never spins forever
      const uploadPromise = supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      const result = await Promise.race([
        uploadPromise,
        new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: "Upload timed out" } }), 15000)
        ),
      ]);

      if (result.error) {
        const msg = result.error.message ?? "";
        if (msg.includes("not found") || msg.includes("Bucket") || msg.includes("bucket")) {
          markError("Storage bucket not found. Create 'venue-images' in Supabase → Storage.");
        } else if (msg.includes("timed out")) {
          markError("Upload timed out. Check your connection or use URL mode.");
        } else if (msg.includes("SSL") || msg.includes("handshake")) {
          markError("Server SSL error. Try again later or use URL mode.");
        } else {
          markError("Upload failed: " + msg);
        }
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      setImages((prev) =>
        prev.map((img) =>
          img.preview === preview
            ? { url: data.publicUrl, preview, isUploading: false, justUploaded: true }
            : img
        )
      );
      setStatusMsg({ type: "success", text: "Image uploaded successfully!" });
      setTimeout(() => setStatusMsg(null), 3000);
      setTimeout(() => {
        setImages((prev) =>
          prev.map((img) =>
            img.preview === preview ? { ...img, justUploaded: false } : img
          )
        );
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", msg);
      markError(msg.includes("fetch") || msg.includes("network")
        ? "Cannot reach server. Check connection or use URL mode."
        : "Upload failed. Try URL mode instead.");
    }
  }, []);

  // ── URL add ───────────────────────────────────────────────

  const addUrl = () => {
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL.");
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setUrlError("Invalid URL. Must start with http:// or https://");
      return;
    }
    if (images.some((i) => i.url === trimmed)) {
      setUrlError("This URL is already added.");
      return;
    }
    const item: ImageItem = { url: trimmed, preview: trimmed };
    setImages((prev) => [...prev, item]);
    setUrlInput("");
  };

  // ── Remove ────────────────────────────────────────────────

  const remove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Drag handlers ─────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Venue Images
          <span className="ml-2 text-xs text-gray-400 font-normal">
            ({images.length}/{MAX_IMAGES})
          </span>
        </label>

        {/* Mode toggle */}
        <div className="flex text-xs rounded-lg overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
              mode === "file"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <UploadCloud className="h-3 w-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
              mode === "url"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Link2 className="h-3 w-3" />
            URL
          </button>
        </div>
      </div>

      {/* ── File drag-drop zone ── */}
      {mode === "file" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => canAdd && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-colors ${
            !canAdd
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              : dragOver
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-gray-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
          }`}
        >
          <ImagePlus className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {canAdd ? "Drag & drop an image here" : "Maximum 5 images reached"}
            </p>
            {canAdd && (
              <p className="text-xs text-gray-400 mt-0.5">
                or click to browse · PNG, JPG, WEBP · max 5 MB
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* ── URL input ── */}
      {mode === "url" && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
              disabled={!canAdd}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={addUrl}
              disabled={!canAdd}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Add
            </button>
          </div>
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          <p className="text-xs text-gray-400">
            Tip: you can use Google Drive share links, Cloudinary, ImgBB, or any direct image URL.
          </p>
        </div>
      )}

      {/* ── Preview grid ── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Venue image ${i + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Uploading overlay */}
              {img.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}

              {/* Just-uploaded success overlay */}
              {img.justUploaded && !img.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-600/60 text-white transition-opacity">
                  <CheckCircle2 className="h-8 w-8 drop-shadow" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/70 text-white text-xs p-2 text-center">
                  <X className="h-4 w-4 mb-1" />
                  {img.error}
                </div>
              )}

              {/* Cover badge on first image */}
              {i === 0 && !img.isUploading && !img.error && !img.justUploaded && (
                <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status message */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <X className="h-4 w-4 shrink-0" />
          )}
          {statusMsg.text}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          The <strong>first image</strong> will be used as the cover photo.
          {images.length < MAX_IMAGES && ` You can add ${MAX_IMAGES - images.length} more.`}
        </p>
      )}
    </div>
  );
}
