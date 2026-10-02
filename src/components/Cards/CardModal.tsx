"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // A slightly bigger box, used for the photo popups
  wide?: boolean;
  // Show the "← Back" button under the content
  showBack?: boolean;
};

export function CardModal({ title, onClose, children, wide = false, showBack = true }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-deep/40 px-3 py-6 backdrop-blur-sm sm:px-4 sm:py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`bloom-soft relative flex max-h-full w-full ${wide ? "max-w-xl" : "max-w-md"} flex-col items-center gap-4 overflow-y-auto overscroll-contain rounded-3xl border border-petal/25 bg-cream px-4 py-8 text-center shadow-2xl sm:rounded-4xl sm:px-6 sm:py-10`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-10 w-10 sm:right-4 sm:top-4 items-center justify-center rounded-full bg-blush text-lg text-hibiscus transition-colors hover:bg-petal hover:text-white"
        >
          ✕
        </button>
        <h2 className="px-10 font-script text-3xl text-hibiscus sm:text-4xl">{title}</h2>
        {children}
        {showBack && (
          <button
            onClick={onClose}
            className="mt-2 flex items-center gap-1.5 rounded-full border border-petal/30 bg-white/80 px-5 py-2 text-sm font-semibold text-muted transition-colors hover:border-hibiscus hover:text-hibiscus"
          >
            <span aria-hidden="true">←</span> Back
          </button>
        )}
      </div>
    </div>
  );
}
