import type { SVGProps } from "react";

// Small line icons that take the current text color
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const ChevronDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

// Thought bubble
export const ThinkIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M8 16a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17.6 8 4 4 0 0 1 17 16z" />
    <circle cx="6" cy="19.5" r="1.2" />
    <circle cx="3.5" cy="22" r="0.6" />
  </Icon>
);

// Clock: "too fast, take it slow"
export const SlowIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

// Broken heart
export const NoIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
    <path d="M12 7.4l-1.5 3 3 2-1.5 3" />
  </Icon>
);

// Three dots, for "more answers"
export const MoreIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Icon>
);
