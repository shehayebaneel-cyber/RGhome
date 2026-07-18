// Vector art for RG Home — brand logo, category icons, appliance illustrations.
// Placeholder illustrations until real product photos are supplied.

export function Logo({ light = false }: { light?: boolean }) {
  const stroke = light ? "#fff" : "var(--navy)";
  return (
    <svg className="mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill={light ? "transparent" : "#fff"} stroke={stroke} strokeWidth="1.5" />
      <path d="M12 25 L24 14 L36 25" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 20.5 V16 h3 v7" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="24" y="32.5" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="12" fontWeight="800" fill={stroke}>
        RG
      </text>
    </svg>
  );
}

const ICONS: Record<string, JSX.Element> = {
  ac: (
    <>
      <rect x="3" y="5" width="18" height="8" rx="2" />
      <path d="M6 17c0 1.5 1 1.5 1 3M11 17c0 1.5 1 1.5 1 3M16 17c0 1.5 1 1.5 1 3" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  oven: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 9h16" />
      <circle cx="8" cy="6" r="1" />
      <circle cx="12" cy="15" r="3" />
    </>
  ),
  fridge: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M6 9h12M10 5v1M10 13v3" />
    </>
  ),
  wash: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <circle cx="8" cy="6" r="1" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z" />
      <path d="M16 9h2.5a2 2 0 0 1 0 4H16M7 4v1M10 4v1M13 4v1" />
    </>
  ),
  small: (
    <>
      <path d="M7 3h10l-1 7H8z" />
      <path d="M12 10v6M9 20h6" />
    </>
  ),
};

export function CatIcon({ slug }: { slug: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {ICONS[slug] || ICONS.small}
    </svg>
  );
}

const ART: Record<string, JSX.Element> = {
  ac: (
    <>
      <rect x="14" y="18" width="92" height="40" rx="7" fill="var(--card)" />
      <line x1="14" y1="40" x2="106" y2="40" opacity=".4" />
      <rect x="78" y="44" width="20" height="7" rx="3.5" fill="var(--blue)" stroke="none" />
    </>
  ),
  tv: (
    <>
      <rect x="12" y="14" width="96" height="54" rx="6" fill="var(--card)" />
      <path d="M48 76h24M60 68v8" />
    </>
  ),
  oven: (
    <>
      <rect x="24" y="14" width="72" height="60" rx="7" fill="var(--card)" />
      <path d="M24 32h72" />
      <circle cx="60" cy="52" r="12" />
      <circle cx="34" cy="23" r="2" />
      <circle cx="44" cy="23" r="2" />
    </>
  ),
  fridge: (
    <>
      <rect x="38" y="10" width="44" height="70" rx="6" fill="var(--card)" />
      <path d="M38 36h44" />
      <path d="M46 22v6M46 44v8" />
    </>
  ),
  wash: (
    <>
      <rect x="34" y="12" width="52" height="66" rx="6" fill="var(--card)" />
      <path d="M34 32h52" />
      <circle cx="60" cy="54" r="14" />
      <circle cx="44" cy="22" r="2" />
    </>
  ),
  coffee: (
    <>
      <path d="M28 34h44v14a20 20 0 0 1-20 20h-4a20 20 0 0 1-20-20z" fill="var(--card)" />
      <path d="M72 38h9a7 7 0 0 1 0 14h-9M40 22v4M50 22v4M60 22v4" />
    </>
  ),
  small: (
    <>
      <path d="M40 20h34l-4 26H44z" fill="var(--card)" />
      <path d="M57 46v18M46 70h22" />
    </>
  ),
};

export function ApplianceArt({ slug }: { slug: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="3">
      {ART[slug] || ART.small}
    </svg>
  );
}
