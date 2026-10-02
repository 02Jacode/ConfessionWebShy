import type { ReactNode } from "react";

type Props = {
  label: string;
  onClick: () => void;
  children: ReactNode;
  delay?: number;
};

// Shared look for the three clickable cards.
// Bigger screens: a portrait card (unchanged). Phones only (max-sm:): a compact
// row with the drawing, the name and an arrow.
export function CardShell({ label, onClick, children, delay = 0 }: Props) {
  return (
    <button
      onClick={onClick}
      className="fade-up group flex min-w-0 flex-col items-center justify-between gap-2 overflow-hidden rounded-2xl border border-petal/25 bg-white/80 px-4 py-4 shadow-[0_12px_30px_-16px_rgba(179,18,46,0.45)] transition-all duration-300 hover:-translate-y-2 hover:border-petal/60 hover:shadow-[0_22px_40px_-16px_rgba(179,18,46,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hibiscus active:scale-95 max-sm:flex-row max-sm:justify-start max-sm:gap-4 max-sm:py-3 max-sm:text-left sm:aspect-3/4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-5"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Phones: zoom shrinks the drawing and its box (176x144 becomes about 97x79) */}
      <div className="flex min-h-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 max-sm:h-36 max-sm:w-44 max-sm:shrink-0 max-sm:[zoom:0.55] sm:flex-1">
        {children}
      </div>
      <span className="font-script text-lg leading-tight text-hibiscus max-sm:flex-1 max-sm:text-2xl sm:text-2xl">
        {label}
      </span>
      <span aria-hidden="true" className="text-2xl text-petal/60 sm:hidden">
        ›
      </span>
    </button>
  );
}
