import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8
} as const;

export const Icons = {
  Overview: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M4 11.5 12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10.5V19h9v-8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Sites: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M7 7h12" strokeLinecap="round" />
      <path d="M7 12h12" strokeLinecap="round" />
      <path d="M7 17h12" strokeLinecap="round" />
      <circle cx="4" cy="7" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
  Health: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 11h3l1.5-3 2.5 6 1.5-3H19" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Analytics: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M4 18h16" strokeLinecap="round" />
      <path d="M7 15l4-4 3 3 4-6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  Search: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  ),
  Recs: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path
        d="M12 3 14.2 8l5.3.4-4 3.4 1.3 5.2L12 14l-4.8 3 1.3-5.2-4-3.4 5.3-.4L12 3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Settings: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path
        d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2l-.4-2.4h-4l-.4 2.4a7 7 0 0 0-2.1 1.2L5.3 5.9l-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.1 1.2l.4 2.4h4l.4-2.4a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5A7 7 0 0 0 19 12z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Bell: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path
        d="M6 8a6 6 0 0 1 12 0c0 6 2 6 2 8H4c0-2 2-2 2-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Bolt: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Link: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path
        d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.5-1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Shield: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Layers: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3 13 9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Plug: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M9 2v6" strokeLinecap="round" />
      <path d="M15 2v6" strokeLinecap="round" />
      <path d="M7 8h10v3a5 5 0 0 1-10 0V8z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16v6" strokeLinecap="round" />
    </svg>
  ),
  Check: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Arrow: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Sun: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  Moon: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Globe: (props: IconProps) => (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" strokeLinecap="round" />
      <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" strokeLinecap="round" />
    </svg>
  )
};
