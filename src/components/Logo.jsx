/**
 * Logo.jsx — CRH / Addis HUB contextual logo component
 *
 * SETUP:
 *   Place your 24 SVGs from addis-hub-logo-system.zip into:
 *   public/logos/
 *   The component loads them via <img> and falls back to
 *   inline SVGs if the files are missing (handy during dev).
 *
 * USAGE:
 *   <Logo variant="nav" />
 *   <Logo variant="auth" />
 *   <Logo variant="mark" style={{ width: 24, height: 24 }} />
 *   <Logo variant="avatar" className="some-class" />
 */

const VARIANT_MAP = {
  /** Horizontal dark-mode logo — Nav / Header */
  nav:         { file: "04-primary-horizontal-fullcolor.svg",  w: 160, h: 40  },
  /** Stacked dark-mode logo — Footer */
  footer:      { file: "08-secondary-stacked-darkmode.svg",   w: 120, h: 64  },
  /** Stacked dark-mode logo — Login / Signup pages */
  auth:        { file: "08-secondary-stacked-darkmode.svg",   w: 140, h: 76  },
  /** Mark only (green) — badges, empty states */
  mark:        { file: "21-mark-only-green.svg",               w: 32,  h: 32  },
  /** Mark only (white) — dark surface accents */
  "mark-white":{ file: "23-mark-only-white.svg",              w: 32,  h: 32  },
  "mark-dark":{ file: "23-mark-only-white.svg",              w: 32,  h: 32  },
  /** App icon dark — PWA / app icon contexts */
  icon:        { file: "10-app-icon-512-dark.svg",             w: 48,  h: 48  },
  /** Profile avatar fallback */
  avatar:      { file: "18-profile-avatar-green.svg",          w: 40,  h: 40  },
};

// ─── Inline SVG fallbacks ─────────────────────────────────────────────────────
// These render when the public/logos/ files aren't present yet.
// Replace with your actual brand files once the zip is extracted.

const T = {
  gold:  "#C9941A",
  green: "#3DB070",
  greenD:"#1A6B3C",
  bg:    "#0E0E0E",
  white: "#FFFFFF",
};

/** Horizontal wordmark fallback (nav / footer / auth) */
function HorizontalMark({ width, height }) {
  return (
    <svg
      width={width} height={height}
      viewBox="0 0 320 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Addis HUB — City Resources Hub"
    >
      {/* Hexagon mark */}
      <g transform="translate(4,6)">
        {/* Outer hex */}
        <polygon
          points="24,2 44,13 44,35 24,46 4,35 4,13"
          fill="none"
          stroke={T.gold}
          strokeWidth="2"
        />
        {/* Inner hex */}
        <polygon
          points="24,10 36,17 36,31 24,38 12,31 12,17"
          fill={T.greenD}
          stroke={T.green}
          strokeWidth="1.5"
        />
        {/* Center dot */}
        <circle cx="24" cy="24" r="4" fill={T.gold} />
        {/* Spokes */}
        {[0,60,120,180,240,300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 24 + Math.cos(rad) * 10;
          const y2 = 24 + Math.sin(rad) * 10;
          return <line key={i} x1="24" y1="24" x2={x2} y2={y2} stroke={T.gold} strokeWidth="1" opacity="0.6" />;
        })}
      </g>

      {/* Wordmark */}
      <text
        x="62" y="28"
        fontFamily="'Sora', 'Syne', sans-serif"
        fontWeight="800"
        fontSize="20"
        letterSpacing="1"
        fill={T.white}
      >
        Addis
        <tspan fill={T.gold}>HUB</tspan>
      </text>

      {/* Tagline */}
      <text
        x="63" y="44"
        fontFamily="'DM Sans', sans-serif"
        fontWeight="400"
        fontSize="9"
        letterSpacing="2.5"
        fill={T.green}
        textAnchor="start"
      >
        CITY RESOURCES HUB
      </text>
    </svg>
  );
}

/** Stacked mark fallback (auth / footer) */
function StackedMark({ width, height }) {
  const scale = width / 120;
  return (
    <svg
      width={width} height={height}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Addis HUB"
    >
      {/* Hex */}
      <g transform="translate(36,4)">
        <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="none" stroke={T.gold} strokeWidth="2" />
        <polygon points="24,10 36,17 36,31 24,38 12,31 12,17" fill={T.greenD} stroke={T.green} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="4" fill={T.gold} />
        {[0,60,120,180,240,300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i} x1="24" y1="24" x2={24 + Math.cos(rad)*10} y2={24 + Math.sin(rad)*10} stroke={T.gold} strokeWidth="1" opacity="0.6" />;
        })}
      </g>
      {/* Wordmark */}
      <text x="60" y="68" fontFamily="'Sora','Syne',sans-serif" fontWeight="800" fontSize="18" letterSpacing="0.5" fill={T.white} textAnchor="middle">
        Addis<tspan fill={T.gold}>HUB</tspan>
      </text>
      {/* Tagline */}
      <text x="60" y="83" fontFamily="'DM Sans',sans-serif" fontWeight="400" fontSize="7.5" letterSpacing="2" fill={T.green} textAnchor="middle">
        CITY RESOURCES HUB
      </text>
    </svg>
  );
}

/** Mark-only fallback */
function MarkOnly({ width, height, color = T.gold }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="CRH mark">
      <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="none" stroke={color} strokeWidth="2" />
      <polygon points="24,10 36,17 36,31 24,38 12,31 12,17" fill={T.greenD} stroke={T.green} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="5" fill={color} />
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return <line key={i} x1="24" y1="24" x2={24+Math.cos(rad)*11} y2={24+Math.sin(rad)*11} stroke={color} strokeWidth="1.5" opacity="0.7" />;
      })}
    </svg>
  );
}

/** Avatar fallback */
function AvatarMark({ width, height }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" fill={T.greenD} stroke={T.gold} strokeWidth="2" />
      <polygon points="24,8 38,16 38,32 24,40 10,32 10,16" fill="none" stroke={T.gold} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="5" fill={T.gold} />
    </svg>
  );
}

// ─── Fallback router ──────────────────────────────────────────────────────────
function FallbackSVG({ variant, width, height }) {
  switch (variant) {
    case "nav":          return <HorizontalMark width={width} height={height} />;
    case "footer":
    case "auth":         return <StackedMark width={width} height={height} />;
    case "mark":         return <MarkOnly width={width} height={height} color={T.green} />;
    case "mark-white":   return <MarkOnly width={width} height={height} color={T.white} />;
    case "icon":         return <MarkOnly width={width} height={height} color={T.gold} />;
    case "avatar":       return <AvatarMark width={width} height={height} />;
    default:             return <HorizontalMark width={width} height={height} />;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Logo({ variant = "nav", style = {}, className = "" }) {
  const config = VARIANT_MAP[variant] || VARIANT_MAP.nav;
  const { file, w, h } = config;

  // Apply any explicit width/height overrides from style prop
  const resolvedW = style.width  ?? w;
  const resolvedH = style.height ?? h;

  const mergedStyle = {
    display: "block",
    flexShrink: 0,
    ...style,
    width:  resolvedW,
    height: resolvedH,
  };

  return (
    <span
      className={`crh-logo crh-logo--${variant} ${className}`}
      style={{ display: "inline-flex", alignItems: "center", ...mergedStyle }}
      aria-label="Addis HUB logo"
    >
      {/*
        Primary: load from public/logos/.
        If the file 404s, onError swaps to the inline SVG fallback.
        Comment out the <img> and uncomment <FallbackSVG> to always use inline SVGs.
      */}
      <img
        src={`/logos/${file}`}
        alt=""
        width={resolvedW}
        height={resolvedH}
        draggable={false}
        style={{ width: resolvedW, height: resolvedH, display: "block", objectFit: "contain" }}
        onError={e => {
          // Swap to inline SVG fallback — no console noise after first load
          e.target.style.display = "none";
          const fallback = e.target.nextSibling;
          if (fallback) fallback.style.display = "block";
        }}
      />
      {/* Inline SVG fallback — hidden by default, shown on img 404 */}
      <span style={{ display: "none" }}>
        <FallbackSVG variant={variant} width={resolvedW} height={resolvedH} />
      </span>
    </span>
  );
}
