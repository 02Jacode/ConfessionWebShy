import { useId, type CSSProperties } from "react";

const PETAL =
  "M100 100 C 78 88, 50 62, 52 36 C 54 16, 74 6, 88 14 C 94 6, 106 6, 112 14 C 126 6, 146 16, 148 36 C 150 62, 122 88, 100 100 Z";

const PALETTES = {
  red: ["#5c0716", "#a10f2b", "#e8364f", "#ff8a98"],
  pink: ["#8c1236", "#d8406a", "#f58aa6", "#ffd0dc"],
  coral: ["#8a1c10", "#d9452b", "#f7835e", "#ffc4a8"],
} as const;

type Props = {
  size?: number;
  variant?: keyof typeof PALETTES;
  className?: string;
  style?: CSSProperties;
};

export function Hibiscus({ size = 160, variant = "red", className, style }: Props) {
  const id = useId().replace(/:/g, "");
  const [c0, c1, c2, c3] = PALETTES[variant];

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`g${id}`} cx="100" cy="100" r="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c0} />
          <stop offset="22%" stopColor={c1} />
          <stop offset="62%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </radialGradient>
      </defs>

      {[0, 72, 144, 216, 288].map((r) => (
        <g key={r} transform={`rotate(${r} 100 100)`}>
          <path d={PETAL} fill={`url(#g${id})`} stroke={c1} strokeOpacity={0.35} strokeWidth={1.2} />
          <path
            d="M100 96 C 97 70, 90 48, 80 30 M100 96 C 100 70, 100 45, 100 22 M100 96 C 103 70, 110 48, 120 30"
            stroke={c0}
            strokeOpacity={0.25}
            strokeWidth={1}
            fill="none"
          />
        </g>
      ))}

      <circle cx="100" cy="100" r="11" fill={c0} />

      {/* Stamen column with pollen and the five red stigma tips */}
      <path
        d="M100 100 C 108 82, 118 64, 130 46"
        stroke="#fbe3b0"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      {[
        [112, 72],
        [117, 64],
        [109, 66],
        [121, 58],
        [124, 53],
        [116, 56],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#f4c542" />
      ))}
      {[
        [130, 40],
        [136, 44],
        [134, 51],
        [126, 44],
        [131, 46],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} fill={c1} />
      ))}
    </svg>
  );
}
