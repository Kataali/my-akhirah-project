"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface ImpactPhotoGalleryProps {
  photos: string[];
  title?: string;
}

export default function ImpactPhotoGallery({
  photos,
  title = "Impact photo",
}: ImpactPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev + 1) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, closeLightbox, showPrev, showNext]);

  if (!photos || photos.length === 0) return null;

  const visiblePhotos = photos.slice(0, 4);
  const remainingCount = photos.length - visiblePhotos.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {visiblePhotos.map((url, i) => {
          const isLastWithMore = i === 3 && remainingCount > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`group relative rounded-xl overflow-hidden bg-earth-100 text-left focus:outline-none focus:ring-2 focus:ring-earth-400 ${
                i === 0 ? "col-span-2 h-56 sm:h-64" : "h-36 sm:h-40"
              }`}
            >
              <Image
                src={url}
                alt={`${title} - photo ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/60 p-2 text-white">
                  <Expand size={16} />
                </span>
              </div>
              {isLastWithMore && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="font-display text-lg font-bold text-white">
                    +{remainingCount} more
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close photo viewer"
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 transition-colors"
          >
            <X size={22} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 transition-colors"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-4xl h-[75vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={photos[activeIndex]}
                alt={`${title} - photo ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <p className="mt-3 text-xs text-white/80 font-medium">
              {activeIndex + 1} / {photos.length} · {title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
