import { TeddyBear } from "../TeddyBear";
import { CardShell } from "./CardShell";

type Props = {
  onClick: () => void;
  delay?: number;
};

export function TeddyBearCard({ onClick, delay }: Props) {
  return (
    <CardShell label="Teddy Bear" onClick={onClick} delay={delay}>
      <TeddyBear size={120} />
    </CardShell>
  );
}
