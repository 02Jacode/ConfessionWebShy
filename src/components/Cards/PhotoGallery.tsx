"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Photo = {
  src: string;
  // Compliment shown under the photo when it is opened big
  caption: string;
};

type Props = {
  photos: Photo[];
  alt: string;
};

// Small landscape polaroids, slightly tilted, inside a card's popup.
// Tapping one opens it big, with its compliment underneath.
export function PhotoGallery({ photos, alt }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-5 px-1 sm:grid-cols-2">
        {photos.map(({ src }, i) => (
          <button
            key={src}
            onClick={() => setOpenIndex(i)}
            aria-label={`Open ${alt} photo ${i + 1}`}
            className={`fade-up cursor-zoom-in rounded-xl bg-white p-2 pb-6 shadow-md shadow-hibiscus/20 transition-all duration-300 hover:rotate-0 hover:scale-105 active:scale-95 ${
              i % 2 ? "rotate-2" : "-rotate-2"
            }`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`${alt} photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 85vw, 260px"
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photo={photos[openIndex]}
          alt={`${alt} photo ${openIndex + 1}`}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

function Lightbox({ photo, alt, onClose }: { photo: Photo; alt: string; onClose: () => void }) {
  const { src, caption } = photo;
  // Escape closes only the photo, not the card popup behind it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  // Rendered on <body> so the popup's scrolling and animation can't clip it
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="photo-backdrop fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-deep/70 p-4 backdrop-blur-md"
    >
      <div className="photo-pop relative flex h-[72dvh] w-full sm:h-[80dvh] max-w-3xl flex-col rounded-2xl bg-white p-2 shadow-2xl sm:p-3">
        <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-xl">
          <Image src={src} alt={alt} fill sizes="(max-width: 768px) 95vw, 768px" className="object-contain" />
          {/* A soft light sweeping across the photo once */}
          <span aria-hidden="true" className="photo-shine pointer-events-none absolute inset-0" />
        </div>
        {caption && (
          <p
            className="fade-up px-8 pb-2 pt-3 text-center font-script text-xl leading-snug text-hibiscus sm:pb-3 sm:pt-4 sm:text-3xl"
            style={{ animationDelay: "0.3s" }}
          >
            {caption}
          </p>
        )}
        <span aria-hidden="true" className="photo-heart pointer-events-none absolute bottom-1 right-3 text-xl sm:bottom-2 sm:text-2xl">
          💗
        </span>
      </div>

      <button
        onClick={onClose}
        aria-label="Close photo"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-hibiscus shadow-md transition-colors hover:bg-petal hover:text-white"
      >
        ✕
      </button>
    </div>,
    document.body,
  );
}
