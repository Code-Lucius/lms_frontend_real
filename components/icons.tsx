import { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, ...p });

export const IconGrid = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
);
export const IconDoc = (p: P) => (
  <svg {...base(p)}><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h6" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconBars = (p: P) => (
  <svg {...base(p)}><path d="M4 19V5M4 19h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const IconUserPlus = (p: P) => (
  <svg {...base(p)}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
);
export const IconCard = (p: P) => (
  <svg {...base(p)}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
);
export const IconTree = (p: P) => (
  <svg {...base(p)}><rect x="9" y="2" width="6" height="5" rx="1" /><rect x="3" y="17" width="6" height="5" rx="1" /><rect x="15" y="17" width="6" height="5" rx="1" /><path d="M12 7v4M6 17v-3h12v3" /></svg>
);
export const IconFolder = (p: P) => (
  <svg {...base(p)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const IconCheckSquare = (p: P) => (
  <svg {...base(p)}><path d="M9 11l3 3 8-8" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>
);
export const IconChevron = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="m9 18 6-6-6-6" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconAlert = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
);
export const IconLock = (p: P) => (
  <svg {...base({ strokeWidth: 1.7, ...p })}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);

export const Arch = ({ width = 120, height = 26, style }: { width?: number; height?: number; style?: React.CSSProperties }) => (
  <svg className="arch" width={width} height={height} viewBox="0 0 120 26" fill="none" style={style}>
    <path d="M2 25 V13 A58 58 0 0 1 118 13 V25" stroke="currentColor" strokeWidth={1.4} />
  </svg>
);
