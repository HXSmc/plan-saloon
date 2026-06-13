// Single inline-SVG icon set — replaces the emoji glyphs that shipped with the
// first draft. Stroke-based, inherits currentColor, sized via the `size` prop.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const Scissors = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6" cy="6" r="2.6" />
    <circle cx="6" cy="18" r="2.6" />
    <path d="M8.2 7.6 20 18M8.2 16.4 20 6M13.4 12.3l1.2 1" />
  </svg>
);

export const Beard = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 3.5v6a5 5 0 0 0 10 0v-6" />
    <path d="M7 9.5c-1.8 1-2.5 3-2 5 .7 3.2 3.5 6 7 6s6.3-2.8 7-6c.5-2-.2-4-2-5" />
    <path d="M10 14.5c.5.7 1.2 1 2 1s1.5-.3 2-1" />
  </svg>
);

export const Razor = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20 14.5 9.5" />
    <path d="m13 8 3 3 5-5-3-3-5 5Z" />
    <path d="m15.5 5.5 3 3" />
  </svg>
);

export const Combo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="5.2" cy="5.2" r="2" />
    <circle cx="5.2" cy="13" r="2" />
    <path d="M6.8 6.4 14 12.6M6.8 11.8 14 5.6" />
    <path d="m13 15 3 3 5-5-2.2-2.2" />
  </svg>
);

export const Kid = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9" r="4.5" />
    <path d="M12 4.5c.3-1.2 1.2-2 2.5-2M5 21c1.2-3 3.8-4.5 7-4.5s5.8 1.5 7 4.5" />
  </svg>
);

export const Calendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8 2.8V7M16 2.8V7" />
  </svg>
);

export const Clock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const Users = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c.8-3.2 3-5 6-5s5.2 1.8 6 5" />
    <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M17.8 15.3c1.7.7 2.8 2.3 3.2 4.7" />
  </svg>
);

export const Chart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4v16h16" />
    <path d="M8 16v-5M12 16V8M16 16v-3" />
  </svg>
);

export const Grid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const X = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const Globe = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.3 3.5 5.2 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.2-3.5-8.5s1.2-6.2 3.5-8.5Z" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 13 4.5 4.5L19 7" />
  </svg>
);

export const ChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m14.5 6-6 6 6 6" />
  </svg>
);

export const ChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const Plus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Phone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  </svg>
);

export const MapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const Star = (p: IconProps) => (
  <svg {...base({ ...p, fill: "currentColor", strokeWidth: 0 })}>
    <path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.4 1.1 6.3L12 17.3l-5.7 2.9 1.1-6.3L2.8 9.5l6.4-.9L12 2.8Z" />
  </svg>
);

export const Undo = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8.5 5 4 9.5 8.5 14" />
    <path d="M4 9.5h10a6 6 0 0 1 0 12h-3" />
  </svg>
);

export const Bolt = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 2.5 4.5 13.5H11L9.5 21.5 18.5 10H12l1-7.5Z" />
  </svg>
);

/** Direction-aware "continue" arrow: renders → in LTR, ← in RTL via CSS flip. */
export const ArrowNext = (p: IconProps) => (
  <svg {...base({ ...p, className: `rtl:-scale-x-100 ${p.className ?? ""}` })}>
    <path d="M4 12h16m-6-6 6 6-6 6" />
  </svg>
);

const SERVICE_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  scissors: Scissors,
  beard: Beard,
  combo: Combo,
  razor: Razor,
  kid: Kid,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICONS);

/** Renders a service's icon by key; legacy emoji values render as text. */
export function ServiceIcon({
  icon,
  size = 22,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const Cmp = SERVICE_ICONS[icon];
  if (Cmp) return <Cmp size={size} className={className} />;
  return (
    <span className={className} style={{ fontSize: size * 0.9 }} aria-hidden>
      {icon}
    </span>
  );
}
