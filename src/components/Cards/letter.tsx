import { Hibiscus } from "../Hibiscus";
import { CardShell } from "./CardShell";

type Props = {
  onClick: () => void;
  delay?: number;
};

// Envelope sealed with a small gumamela
export function Envelope({ size = 150 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size * 0.7 }} aria-hidden="true">
      <svg viewBox="0 0 200 140" width="100%" height="100%">
        <rect x="6" y="10" width="188" height="124" rx="12" fill="#fff4ea" stroke="#e8364f" strokeOpacity="0.45" strokeWidth="3" />
        <path d="M8 130 L78 72 M192 130 L122 72" stroke="#e8364f" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M8 16 L100 88 L192 16"
          fill="#ffe3e3"
          stroke="#e8364f"
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute" style={{ left: "50%", top: "60%", translate: "-50% -50%" }}>
        <Hibiscus size={size * 0.34} />
      </div>
    </div>
  );
}

export function LetterCard({ onClick, delay }: Props) {
  return (
    <CardShell label="Letter" onClick={onClick} delay={delay}>
      <Envelope size={150} />
    </CardShell>
  );
}
