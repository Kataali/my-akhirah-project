"use client";

import { useRef, useState } from "react";

interface PhotoUploaderProps {
  name?: string;
  defaultUrls?: string[];
  folder?: string;
}

export function PhotoUploader({
  name = "photos_urls",
  defaultUrls = [],
  folder = "reports",
}: PhotoUploaderProps) {
  const [textValue, setTextValue] = useState<string>(defaultUrls.join("\n"));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsedUrls = textValue
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("folder", folder);
      Array.from(selectedFiles).forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photos.");
      }

      const newUrls: string[] = data.urls || [];
      if (newUrls.length > 0) {
        setTextValue((prev) => {
          const trimmed = prev.trim();
          return trimmed
            ? `${trimmed}\n${newUrls.join("\n")}`
            : newUrls.join("\n");
        });
      }
    } catch (err: any) {
      setUploadError(err.message || "Error uploading files.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveUrl = (indexToRemove: number) => {
    const updated = parsedUrls.filter((_, idx) => idx !== indexToRemove);
    setTextValue(updated.join("\n"));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="label mb-0">Photos</label>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            {isUploading ? "Uploading to Supabase..." : "+ Upload Photos"}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {uploadError}
        </div>
      )}

      {parsedUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {parsedUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-video overflow-hidden rounded-lg border border-earth-200 bg-earth-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Uploaded photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveUrl(index)}
                title="Remove photo"
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white opacity-90 hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <textarea
          name={name}
          rows={3}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          className="input resize-none font-mono text-xs"
          placeholder={
            "Click '+ Upload Photos' above or paste public image URLs here (one per line)"
          }
        />
        <p className="text-xs text-earth-400 mt-1">
          Choose files above to automatically upload to your{" "}
          <span className="font-medium text-earth-600">My Akhirah Project</span>{" "}
          bucket and insert their URLs, or paste URLs manually.
        </p>
      </div>
    </div>
  );
}

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  folder?: string;
}

export function CoverImageUploader({
  value,
  onChange,
  error,
  folder = "campaigns",
}: CoverImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("folder", folder);
      formData.append("files", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      if (data.urls?.[0]) {
        onChange(data.urls[0]);
      }
    } catch (err: any) {
      setUploadError(err.message || "Error uploading file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="label mb-0">Cover image</label>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            {isUploading ? "Uploading..." : "Upload Cover Image"}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {uploadError}
        </div>
      )}

      {value && (
        <div className="relative h-36 w-full max-w-[240px] overflow-hidden rounded-lg border border-earth-200 bg-earth-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            title="Clear cover image"
            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      <input
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className={`input ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <p className="text-xs text-earth-400">
        Upload an image directly to Supabase Storage or paste a public image URL.
      </p>
    </div>
  );
}

