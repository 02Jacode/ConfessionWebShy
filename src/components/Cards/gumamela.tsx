import { Hibiscus } from "../Hibiscus";
import { CardShell } from "./CardShell";

type Props = {
  onClick: () => void;
  delay?: number;
};

export function GumamelaCard({ onClick, delay }: Props) {
  return (
    <CardShell label="Gumamela" onClick={onClick} delay={delay}>
      <Hibiscus size={130} />
    </CardShell>
  );
}
