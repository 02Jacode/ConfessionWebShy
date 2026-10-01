import { Hibiscus } from "./Hibiscus";

const FUR = "#c98b5a";
const FUR_DARK = "#a86c3f";
const CREAM = "#f6dfc0";
const NOSE = "#4a2a1a";

type Props = {
  size?: number;
  className?: string;
};

// A teddy bear hugging a gumamela, with a small one tucked by its ear
export function TeddyBear({ size = 200, className }: Props) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: size, height: size * 1.1 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Ears */}
        <circle cx="56" cy="46" r="23" fill={FUR} />
        <circle cx="144" cy="46" r="23" fill={FUR} />
        <circle cx="56" cy="46" r="12" fill="#eab391" />
        <circle cx="144" cy="46" r="12" fill="#eab391" />

        {/* Feet */}
        <ellipse cx="64" cy="202" rx="22" ry="15" fill={FUR_DARK} />
        <ellipse cx="136" cy="202" rx="22" ry="15" fill={FUR_DARK} />
        <ellipse cx="64" cy="204" rx="11" ry="8" fill={CREAM} />
        <ellipse cx="136" cy="204" rx="11" ry="8" fill={CREAM} />

        {/* Body */}
        <ellipse cx="100" cy="160" rx="50" ry="50" fill={FUR} />
        <ellipse cx="100" cy="166" rx="31" ry="34" fill={CREAM} />

        {/* Stem and leaves of the held gumamela */}
        <path d="M100 156 L100 196" stroke="#2f6b3a" strokeWidth="5" strokeLinecap="round" />
        <path d="M100 190 C 112 184, 122 186, 126 194 C 116 198, 106 197, 100 190 Z" fill="#3c8a4a" />
        <path d="M100 186 C 88 180, 78 182, 74 190 C 84 194, 94 193, 100 186 Z" fill="#2f6b3a" />

        {/* Arms hugging the stem */}
        <ellipse cx="70" cy="158" rx="14" ry="29" fill={FUR_DARK} transform="rotate(-38 70 158)" />
        <ellipse cx="130" cy="158" rx="14" ry="29" fill={FUR_DARK} transform="rotate(38 130 158)" />

        {/* Head */}
        <circle cx="100" cy="78" r="54" fill={FUR} />
        <ellipse cx="100" cy="96" rx="23" ry="18" fill={CREAM} />
        <ellipse cx="100" cy="88" rx="8.5" ry="6" fill={NOSE} />
        <path
          d="M100 94 L100 100 M100 100 Q 93 107 87 101 M100 100 Q 107 107 113 101"
          stroke={NOSE}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes */}
        <circle cx="79" cy="72" r="5.5" fill={NOSE} />
        <circle cx="121" cy="72" r="5.5" fill={NOSE} />
        <circle cx="81" cy="70" r="1.8" fill="#fff" />
        <circle cx="123" cy="70" r="1.8" fill="#fff" />

        {/* Blush */}
        <circle cx="66" cy="92" r="9" fill="#ff8a98" opacity="0.5" />
        <circle cx="134" cy="92" r="9" fill="#ff8a98" opacity="0.5" />
      </svg>

      {/* Gumamela held at the chest */}
      <div className="absolute" style={{ left: "50%", top: "66%", translate: "-50% -50%" }}>
        <Hibiscus size={size * 0.44} />
      </div>

      {/* Small gumamela by the ear */}
      <div className="absolute" style={{ left: "74%", top: "17%", translate: "-50% -50%" }}>
        <Hibiscus size={size * 0.27} variant="pink" style={{ rotate: "20deg" }} />
      </div>
    </div>
  );
}
