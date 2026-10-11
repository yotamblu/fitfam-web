type IconProps = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const HomeIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
  </svg>
);
export const RoadIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" />
  </svg>
);
export const UserIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} strokeWidth={3}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const LockIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const PlayIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} fill="currentColor" stroke="none">
    <path d="M8 5v14l11-7z" />
  </svg>
);
export const FlagIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 21V4m0 0h12l-2 4 2 4H5" />
  </svg>
);
export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const FlameIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} fill="currentColor" stroke="none">
    <path d="M12 2c.6 3.2-1.2 4.9-2.7 6.7C7.7 10.6 6 12.4 6 15.2 6 18.9 8.7 22 12 22s6-3.1 6-6.8c0-2.2-1-3.9-2.2-5.2-.3 1.3-1 2.2-1.9 2.6.5-3-.4-6.9-1.9-10.6z" />
  </svg>
);
export const BoltIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} fill="currentColor" stroke="none">
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </svg>
);
export const StarIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} fill="currentColor" stroke="none">
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);
export const TrophyIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
  </svg>
);
export const LogoutIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
