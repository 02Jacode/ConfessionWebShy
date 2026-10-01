import type { ReactNode } from "react";

type Props = {
  label: string;
  onClick: () => void;
  children: ReactNode;
  delay?: number;
};

// Shared look for the three clickable cards
export function CardShell({ label, onClick, children, delay = 0 }: Props) {
  return (
    <button
      onClick={onClick}
      className="fade-up group flex min-w-0 flex-col items-center justify-between gap-2 overflow-hidden rounded-2xl border border-petal/25 bg-white/80 px-4 py-4 sm:aspect-3/4 shadow-[0_12px_30px_-16px_rgba(179,18,46,0.45)] transition-all duration-300 hover:-translate-y-2 hover:border-petal/60 hover:shadow-[0_22px_40px_-16px_rgba(179,18,46,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hibiscus active:scale-95 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-5"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* zoom shrinks the drawings (and their layout box) on phones */}
      <div className="flex min-h-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 max-sm:h-32 max-sm:[zoom:0.85] sm:flex-1">
        {children}
      </div>
      <span className="font-script text-lg leading-tight text-hibiscus sm:text-2xl">{label}</span>    </button>
  );
}
