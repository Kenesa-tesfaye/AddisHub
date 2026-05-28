import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router";
import { logout, setUser } from "../../store/authSlice";
import { getUser, updateUser, changePassword, deleteUser } from "../../api/auth";
import api from "../../api/api";
import defaultImage from "../../assets/main.png";
import { createResource, createEvent, deleteResource, deleteEvent } from "../../api/resources";
import Nav from "../../components/Nav";
import { FaPlus } from "react-icons/fa";
import BottomNav from "../../components/BottomNav";

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "#0A0A0A",
  card: "#111111",
  card2: "#161616",
  border: "#1E1E1E",
  border2: "#2A2A2A",
  gold: "#046032",
  goldH: "#1c944e",
  green: "#3DB070",
  greenD: "#1A6B3C",
  textPri: "#FFFFFF",
  textSec: "#888888",
  textMut: "#555555",
  danger: "#E05252",
  info: "#5289E0",
};

// ─── Icon primitives ─────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={d} />
  </svg>
);

const ICONS = {
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  check: "M20 6L9 17l-5-5",
  close: "M18 6L6 18M6 6l12 12",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  calendar: "M3 9h18M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z M8 3v4 M16 3v4",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8h.01 M12 12v4",
  arrowL: "M19 12H5M12 5l-7 7 7 7",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHLY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const RESOURCE_ANALYTICS = { views: [42, 78, 95, 134, 202, 284], likes: [8, 14, 19, 28, 38, 47] };
const EVENT_ANALYTICS = { registered: [0, 45, 120, 220, 289, 312], capacity: [500, 500, 500, 500, 500, 500] };

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color = T.gold, height = 40, width = 120 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "hidden" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        if (i !== data.length - 1) return null;
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 6) - 3;
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, label, color = T.gold }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{
              width: "100%", borderRadius: 3,
              height: `${(v / max) * 44}px`,
              background: i === data.length - 1 ? color : `${color}55`,
              transition: "height 0.4s ease",
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {MONTHLY_LABELS.map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: T.textMut }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    active: { color: T.green, bg: `${T.green}18`, label: "Active" },
    pending: { color: T.gold, bg: `${T.gold}18`, label: "Pending" },
    upcoming: { color: T.info, bg: `${T.info}18`, label: "Upcoming" },
    registration_period: { color: T.green, bg: `${T.green}18`, label: "Open Reg" },
    ended: { color: T.textMut, bg: `${T.textMut}18`, label: "Ended" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
      color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 20,
      border: `1px solid ${s.color}33`,
    }}>{s.label}</span>
  );
}

// ─── Category chip ────────────────────────────────────────────────────────────
function Chip({ label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase",
      color: T.gold, background: `${T.gold}14`, padding: "3px 10px", borderRadius: 20,
    }}>{label}</span>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "", multiline = false, rows = 3, showPassword, onToggle }) {
  const [focused, setFocused] = useState(false);
  const s = {
    wrapper: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: "uppercase", letterSpacing: 1 },
    inputWrap: {
      position: "relative",
      borderRadius: 10, border: `1px solid ${focused ? T.gold + "66" : T.border2}`,
      background: T.card, transition: "border 0.2s",
    },
    input: {
      width: "100%", boxSizing: "border-box",
      background: "transparent", border: "none", outline: "none",
      color: T.textPri, fontSize: 14, padding: "10px 14px",
      paddingRight: type === "password" ? 44 : 14,
      fontFamily: "DM Sans, sans-serif", resize: multiline ? "vertical" : "none",
    },
  };
  return (
    <div style={s.wrapper}>
      {label && <label style={s.label}>{label}</label>}
      <div style={s.inputWrap}>
        {multiline
          ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={{ ...s.input }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          : <input type={type === "password" ? (showPassword ? "text" : "password") : type}
            value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={s.input}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        }
        {type === "password" && (
          <button onClick={onToggle} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: T.textSec, padding: 2,
          }}>
            <Icon d={showPassword ? ICONS.eyeOff : ICONS.eye} size={16} color={T.textSec} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", size = "md", icon, style: ext = {}, disabled = false }) {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
    transition: "all 0.2s", opacity: disabled ? 0.5 : 1,
    padding: size === "sm" ? "6px 14px" : size === "lg" ? "14px 28px" : "10px 20px",
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
  };
  const variants = {
    primary: { background: hov ? T.goldH : T.gold, color: "#000" },
    ghost: { background: hov ? `${T.gold}14` : "transparent", color: T.gold, border: `1px solid ${T.gold}44` },
    danger: { background: hov ? "#c04040" : `${T.danger}18`, color: T.danger, border: `1px solid ${T.danger}33` },
    green: { background: hov ? "#2DA060" : T.green, color: "#000" },
    subtle: { background: hov ? T.card2 : "transparent", color: T.textSec, border: `1px solid ${T.border2}` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...ext }}>
      {icon && <Icon d={ICONS[icon]} size={14} color="currentColor" />}
      {children}
    </button>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, children }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        backdropFilter: open ? "blur(4px)" : "none",      
        zIndex: 99,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s, backdrop-filter 0.3s",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(520px, 95vw)",
        background: T.card, borderLeft: `1px solid ${T.border2}`, zIndex: 100,
        transform: open ? "translateX(0)" : "translateX(105%)",  
        visibility: open ? "visible" : "hidden",  
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        overflowY: "auto", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, background: T.card, zIndex: 1,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.textPri, fontFamily: "Syne, sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSec, padding: 4, borderRadius: 8 }}>
            <Icon d={ICONS.close} size={20} color={T.textSec} />
          </button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>{children}</div>
      </div>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        backdropFilter: open ? "blur(6px)" : "none", zIndex: 99,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.95)",
        width: "min(560px, 94vw)", maxHeight: "90vh",
        background: T.card, borderRadius: 20, border: `1px solid ${T.border2}`,
        zIndex: 100, overflowY: "auto",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, background: T.card,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.textPri, fontFamily: "Syne, sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSec, padding: 4 }}>
            <Icon d={ICONS.close} size={20} color={T.textSec} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color = T.textSec }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Icon d={ICONS[icon]} size={13} color={color} />
      <span style={{ fontSize: 13, color, fontWeight: 600 }}>{value}</span>
      <span style={{ fontSize: 12, color: T.textMut }}>{label}</span>
    </div>
  );
}

// ─── Resource card (profile version) ─────────────────────────────────────────
function ResourceCard({ item, onDetail, onDelete }) {
  const [hov, setHov] = useState(false);
  const catColors = { Education: "#5289E0", Health: T.green, Technology: T.gold, Culture: "#B05DE0", Sports: "#E07050" };
  const cc = catColors[item.category] || T.gold;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? T.card2 : T.card, border: `1px solid ${hov ? T.border2 : T.border}`,
        borderRadius: 16, padding: 20, cursor: "pointer",
        transition: "all 0.2s", transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.4)` : "none",
      }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label={item.category} />
          <Badge status={item.status || 'active'} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={e => { e.stopPropagation(); onDetail(item); }}
            style={{ background: `${T.gold}14`, border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.gold, fontSize: 11, fontWeight: 600 }}>
            Details
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id); }}
            style={{ background: `${T.danger}14`, border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: T.danger }}>
            <Icon d={ICONS.trash} size={12} color={T.danger} />
          </button>
        </div>
      </div>
      {/* Title */}
      <div style={{ fontSize: 15, fontWeight: 700, color: T.textPri, fontFamily: "Syne, sans-serif", marginBottom: 6, lineHeight: 1.3 }}>
        {item.title}
      </div>
      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
        <Icon d={ICONS.map} size={12} color={T.textMut} />
        <span style={{ fontSize: 12, color: T.textMut }}>{item.location}</span>
      </div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <StatPill icon="eye" value={item.view_count} label="views" color={cc} />
        <StatPill icon="heart" value={item.like_count} label="likes" color={T.danger} />
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: T.textMut }}>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Event card (profile version) ────────────────────────────────────────────
function EventCard({ item, onDetail, onDelete }) {
  const [hov, setHov] = useState(false);
  const status = item.status || item.event_type || 'pending';
  const registered = item.registered || 0;
  const capacity = item.capacity || 1;
  const pct = Math.round((registered / capacity) * 100);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? T.card2 : T.card, border: `1px solid ${hov ? T.border2 : T.border}`,
        borderRadius: 16, padding: 20, cursor: "pointer",
        transition: "all 0.2s", transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.4)` : "none",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label={item.category} />
          <Badge status={status} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={e => { e.stopPropagation(); onDetail(item); }}
            style={{ background: `${T.gold}14`, border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.gold, fontSize: 11, fontWeight: 600 }}>
            Details
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id); }}
            style={{ background: `${T.danger}14`, border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: T.danger }}>
            <Icon d={ICONS.trash} size={12} color={T.danger} />
          </button>
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.textPri, fontFamily: "Syne, sans-serif", marginBottom: 6, lineHeight: 1.3 }}>
        {item.title}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.calendar} size={12} color={T.textMut} />
          <span style={{ fontSize: 12, color: T.textMut }}>{new Date(item.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.map} size={12} color={T.textMut} />
          <span style={{ fontSize: 12, color: T.textMut }}>{item.location}</span>
        </div>
      </div>
      {/* Capacity bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: T.textMut }}>Registrations</span>
          <span style={{ fontSize: 11, color: T.textSec, fontWeight: 600 }}>{item.registered}/{item.capacity} ({pct}%)</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: T.border2, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: pct >= 90 ? T.danger : pct >= 60 ? T.gold : T.green, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 12, color: item.entry_fee === 0 ? T.green : T.gold, fontWeight: 600 }}>
          {item.entry_fee === 0 ? "Free Entry" : `${item.entry_fee} ETB`}
        </span>
      </div>
    </div>
  );
}

// ─── Resource Detail content ──────────────────────────────────────────────────
function ResourceDetail({ item }) {
  if (!item) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Image placeholder */}
      <div style={{ borderRadius: 12, overflow: "hidden", background: T.card2, height: 160, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}` }}>
        <Icon d={ICONS.upload} size={32} color={T.textMut} />
      </div>
      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Category", value: item.category },
          { label: "Location", value: item.location },
          { label: "Status", value: item.status },
          { label: "Added", value: new Date(item.created_at).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: T.card2, borderRadius: 10, padding: 12, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: T.textPri, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
      {/* Description */}
      <div>
        <div style={{ fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Description</div>
        <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, margin: 0 }}>{item.description}</p>
      </div>
      {/* Analytics */}
      <div style={{ background: T.card2, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Performance Analytics</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.gold, fontFamily: "Syne, sans-serif" }}>{item.view_count}</div>
            <div style={{ fontSize: 11, color: T.textMut }}>Total Views</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.danger, fontFamily: "Syne, sans-serif" }}>{item.like_count}</div>
            <div style={{ fontSize: 11, color: T.textMut }}>Total Likes</div>
          </div>
        </div>
        <BarChart data={RESOURCE_ANALYTICS.views} label="Monthly views" color={T.gold} />
      </div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" icon="edit" style={{ flex: 1, justifyContent: "center" }}>Edit Resource</Btn>
        <Btn variant="danger" icon="trash" style={{ flex: 1, justifyContent: "center" }}>Delete</Btn>
      </div>
    </div>
  );
}

// ─── Event Detail content ─────────────────────────────────────────────────────
function EventDetail({ item }) {
  if (!item) return null;
  const pct = Math.round((item.registered / item.capacity) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ borderRadius: 12, overflow: "hidden", background: T.card2, height: 160, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}` }}>
        <Icon d={ICONS.calendar} size={32} color={T.textMut} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Category", value: item.category },
          { label: "Location", value: item.location },
          { label: "Date", value: new Date(item.event_date).toLocaleDateString() },
          { label: "Entry Fee", value: item.entry_fee === 0 ? "Free" : `${item.entry_fee} ETB` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: T.card2, borderRadius: 10, padding: 12, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: T.textPri, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, margin: 0 }}>{item.description}</p>
      {/* Registration analytics */}
      <div style={{ background: T.card2, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Registration Analytics</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: T.textSec }}>Capacity filled</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 90 ? T.danger : T.gold }}>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: T.border2, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 8, background: pct >= 90 ? T.danger : T.gold, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: T.textMut }}>{item.registered} registered</span>
            <span style={{ fontSize: 11, color: T.textMut }}>{item.capacity} capacity</span>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <BarChart data={EVENT_ANALYTICS.registered} label="Registrations over time" color={T.green} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" icon="edit" style={{ flex: 1, justifyContent: "center" }}>Edit Event</Btn>
        <Btn variant="danger" icon="trash" style={{ flex: 1, justifyContent: "center" }}>Delete</Btn>
      </div>
    </div>
  );
}

// ─── Analytics tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ resources = [], events = [] }) {
  const [selectedAnalytic, setSelectedAnalytic] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const makeSparkline = (value) => {
    const base = Math.max(0, Math.round(value / 6));
    return [base, Math.round(base * 1.6), Math.round(base * 2.6), Math.round(base * 3.9), Math.round(base * 4.7), value];
  };

  const resourceItems = resources.map((resource) => ({
    id: `res-${resource.id}`,
    title: resource.title,
    type: 'resource',
    views: resource.view_count || 0,
    likes: resource.like_count || 0,
    trend: resource.view_count ? `${Math.round(((resource.like_count || 0) / resource.view_count) * 100)}%` : '0%',
    color: T.gold,
    spark: makeSparkline(resource.view_count || 0),
  }));

  const eventItems = events.map((event) => {
    const registered = event.registered || 0;
    const capacity = event.capacity || 1;
    return {
      id: `evt-${event.id}`,
      title: event.title,
      type: 'event',
      views: registered,
      likes: 0,
      trend: `${Math.round((registered / capacity) * 100)}%`,
      color: T.green,
      spark: makeSparkline(registered),
    };
  });

  const items = [...resourceItems, ...eventItems];
  const totalViews = resources.reduce((sum, resource) => sum + (resource.view_count || 0), 0);
  const totalLikes = resources.reduce((sum, resource) => sum + (resource.like_count || 0), 0);
  const totalRegistrations = events.reduce((sum, event) => sum + (event.registered || 0), 0);
  const totalResources = resources.length;
  const totalEvents = events.length;

  const summaryCards = [
    { label: 'Total Views', value: totalViews, icon: 'eye', color: T.gold },
    { label: 'Total Likes', value: totalLikes, icon: 'heart', color: T.danger },
    { label: 'Registrations', value: totalRegistrations, icon: 'user', color: T.green },
    { label: 'Your Resources', value: totalResources, icon: 'tag', color: T.info },
  ];

  const selectedAnalyticDetails = selectedAnalytic ? (
    selectedAnalytic.type === 'event'
      ? [
        { label: 'Registered', value: selectedAnalytic.views },
        { label: 'Peak registration', value: `${selectedAnalytic.trend}` },
        { label: 'Expected capacity', value: `${events.find((evt) => `evt-${evt.id}` === selectedAnalytic.id)?.capacity || 0}` },
      ]
      : [
        { label: 'Average views/week', value: Math.round(selectedAnalytic.views / 4) },
        { label: 'Like rate', value: `${selectedAnalytic.likes > 0 ? Math.round((selectedAnalytic.likes / Math.max(1, selectedAnalytic.views)) * 100) : 0}%` },
        { label: 'Resources total', value: totalResources },
      ]
  ) : [];

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24, paddingRight: 10}}>
        {summaryCards.map((s) => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 28, height: 32, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS[s.icon]} size={15} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.textPri, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMut, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: T.textMut, border: `1px solid ${T.border}`, borderRadius: 16, background: T.card }}>
          <Icon d={ICONS.chart} size={40} color={T.textMut} />
          <div style={{ marginTop: 12, fontSize: 14 }}>No analytics data available yet. Add resources or create events to see performance metrics.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} onClick={() => { setSelectedAnalytic(item); setDrawerOpen(true); }}
              style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'border 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.border2)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: item.color, background: `${item.color}18`, padding: '2px 8px', borderRadius: 10 }}>{item.type}</span>
                    <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>{item.trend}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.textPri, fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                    <StatPill icon='eye' value={item.views} label='' color={T.textSec} />
                    {item.likes > 0 && <StatPill icon='heart' value={item.likes} label='' color={T.textSec} />}
                  </div>
                </div>
                <Sparkline data={item.spark} color={item.color} width={90} height={36} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedAnalytic?.title || ''}>
        {selectedAnalytic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: T.card2, borderRadius: 12, padding: 16, textAlign: 'center', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: selectedAnalytic.color, fontFamily: 'Syne, sans-serif' }}>{selectedAnalytic.views}</div>
                <div style={{ fontSize: 11, color: T.textMut, marginTop: 4 }}>{selectedAnalytic.type === 'event' ? 'Total Registrations' : 'Total Views'}</div>
              </div>
              <div style={{ background: T.card2, borderRadius: 12, padding: 16, textAlign: 'center', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.green, fontFamily: 'Syne, sans-serif' }}>{selectedAnalytic.trend}</div>
                <div style={{ fontSize: 11, color: T.textMut, marginTop: 4 }}>Current Rate</div>
              </div>
            </div>
            <BarChart data={selectedAnalytic.spark} label={selectedAnalytic.type === 'event' ? 'Registrations over time' : 'Views over time'} color={selectedAnalytic.color} />
            {selectedAnalytic.type === 'resource' && (
              <BarChart data={makeSparkline(selectedAnalytic.likes)} label='Likes over time' color={T.danger} />
            )}
            <div style={{ background: T.card2, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Engagement Summary</div>
              {selectedAnalyticDetails.map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.textSec }}>{label}</span>
                  <span style={{ fontSize: 13, color: T.textPri, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ─── Add Resource form ────────────────────────────────────────────────────────
function AddResourceForm({ onClose, onCreated }) {
  const userId = useSelector((s) => s.auth.user?.id);
  const [form, setForm] = useState({ title: "", category: "", location: "", description: "", image_url: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cats = ["Education", "Health", "Technology", "Culture", "Sports", "Environment"];
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.location.trim()) {
      setError("Title, category, and location are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const created = await createResource({
        ...form,
        user_id: userId,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create resource.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Resource Title" value={form.title} onChange={f("title")} placeholder="e.g. Bole Community Library" />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${form.category === c ? T.gold : T.border2}`,
                background: form.category === c ? `${T.gold}18` : T.card2,
                color: form.category === c ? T.gold : T.textSec,
                transition: "all 0.15s",
              }}>{c}</button>
          ))}
        </div>
      </div>
      <Field label="Location (Subcity / Area)" value={form.location} onChange={f("location")} placeholder="e.g. Kirkos, Addis Ababa" />
      <Field label="Image URL" value={form.image_url} onChange={f("image_url")} placeholder="Optional: https://" />
      <Field label="Description" value={form.description} onChange={f("description")} placeholder="Briefly describe the resource..." multiline rows={4} />
      {error && <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn variant="subtle" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={loading || !form.title || !form.category} style={{ flex: 2, justifyContent: "center" }}>
          {loading ? "Submitting..." : "Submit Resource"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Add Event form ───────────────────────────────────────────────────────────
function AddEventForm({ onClose, onCreated }) {
  const userId = useSelector((s) => s.auth.user?.id);
  const [form, setForm] = useState({ title: "", category: "", location: "", description: "", event_date: "", capacity: "", entry_fee: "0" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cats = ["Technology", "Culture", "Sports", "Education", "Health", "Business"];
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.location.trim() || !form.event_date) {
      setError("Title, category, location, and date are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const created = await createEvent({
        ...form,
        user_id: userId,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create event.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Event Title" value={form.title} onChange={f("title")} placeholder="e.g. Addis Tech Summit 2026" />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${form.category === c ? T.gold : T.border2}`, background: form.category === c ? `${T.gold}18` : T.card2, color: form.category === c ? T.gold : T.textSec, transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <Field label="Location" value={form.location} onChange={f("location")} placeholder="e.g. Radisson Blu, Bole" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Event Date" value={form.event_date} onChange={f("event_date")} type="date" />
        <Field label="Capacity" value={form.capacity} onChange={f("capacity")} type="number" placeholder="500" />
      </div>
      <Field label="Entry Fee (ETB, 0 = free)" value={form.entry_fee} onChange={f("entry_fee")} type="number" placeholder="0" />
      <Field label="Description" value={form.description} onChange={f("description")} placeholder="Describe your event..." multiline rows={3} />
      {error && <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn variant="subtle" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
        <Btn variant="green" onClick={handleSubmit}
          disabled={loading || !form.title || !form.category || !form.event_date}
          style={{ flex: 2, justifyContent: "center" }}>
          {loading ? "Submitting..." : "Create Event"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────
function SettingsPanel({ sub }) {
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });
  const [pw, setPw] = useState({ cur: "", new: "", con: "" });
  const [pwStatus, setPwStatus] = useState("");
  const [notif, setNotif] = useState({ email: true, events: true, resources: false, digest: true });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((s) => s.auth.user?.id);

  const handlePasswordUpdate = async () => {
    setPwStatus("");
    if (!pw.cur || !pw.new || pw.new !== pw.con) {
      setPwStatus("Please make sure your passwords match.");
      return;
    }

    try {
      await changePassword(userId, pw.cur, pw.new);
      setPw({ cur: "", new: "", con: "" });
      setPwStatus("Password changed successfully.");
    } catch (err) {
      setPwStatus(err.response?.data?.message || "Unable to change password.");
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser(userId);
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error('Unable to delete account:', err);
    }
  };

  if (sub === "security") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ padding: "16px 20px", borderRadius: 12, background: `${T.info}10`, border: `1px solid ${T.info}30` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Icon d={ICONS.shield} size={16} color={T.info} style={{ marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: 2 }}>Account Security</div>
            <div style={{ fontSize: 12, color: T.textSec }}>Your account is secured with JWT authentication. Change your password regularly.</div>
          </div>
        </div>
      </div>
      <Field label="Current Password" value={pw.cur} onChange={v => setPw(p => ({ ...p, cur: v }))} type="password" showPassword={showPw.cur} onToggle={() => setShowPw(p => ({ ...p, cur: !p.cur }))} />
      <Field label="New Password" value={pw.new} onChange={v => setPw(p => ({ ...p, new: v }))} type="password" showPassword={showPw.new} onToggle={() => setShowPw(p => ({ ...p, new: !p.new }))} />
      <Field label="Confirm New Password" value={pw.con} onChange={v => setPw(p => ({ ...p, con: v }))} type="password" showPassword={showPw.con} onToggle={() => setShowPw(p => ({ ...p, con: !p.con }))} />
      {pwStatus && <div style={{ color: pwStatus.includes('successfully') ? T.green : T.danger, fontSize: 12 }}>{pwStatus}</div>}
      <Btn variant="primary" icon="lock" onClick={handlePasswordUpdate} disabled={!pw.cur || !pw.new || pw.new !== pw.con}>Update Password</Btn>
    </div>
  );

  if (sub === "notifications") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Object.entries({ email: "Email notifications", events: "New event alerts", resources: "Resource updates", digest: "Weekly digest" }).map(([key, label]) => (
        <div key={key} onClick={() => setNotif(p => ({ ...p, [key]: !p[key] }))}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, background: T.card2, border: `1px solid ${T.border}`, cursor: "pointer" }}>
          <span style={{ fontSize: 14, color: T.textPri }}>{label}</span>
          <div style={{ width: 40, height: 22, borderRadius: 11, background: notif[key] ? T.gold : T.border2, position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: notif[key] ? 21 : 3, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left 0.2s" }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (sub === "danger") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "16px 20px", borderRadius: 12, background: `${T.danger}10`, border: `1px solid ${T.danger}30` }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Icon d={ICONS.alert} size={16} color={T.danger} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>
            Deleting your account is <strong style={{ color: T.textPri }}>permanent</strong> and cannot be undone. All your resources, events, and analytics will be removed.
          </div>
        </div>
      </div>
      <Btn variant="subtle" onClick={() => { dispatch(logout()); navigate("/login"); }} icon="logout">Sign Out of All Devices</Btn>
      <Btn variant="danger" icon="trash" onClick={handleDeleteAccount}>Delete My Account</Btn>
    </div>
  );

  return null;
}

// ─── Account Setup checklist ──────────────────────────────────────────────────
function SetupChecklist({ user, resources = [] }) {
  const steps = [
    { label: "Complete your profile", done: !!(user?.name && user?.bio), icon: "user" },
    { label: "Upload a profile photo", done: !!user?.image, icon: "camera" },
    { label: "Add your first resource", done: resources.length > 0, icon: "tag" },
    { label: "Register for an event", done: false, icon: "calendar" },
    { label: "Get 10 views on a resource", done: resources.some(r => (r.view_count || 0) >= 10), icon: "eye" },
    { label: "Receive your first like", done: resources.some(r => (r.like_count || 0) > 0), icon: "heart" },
  ];
  const done = steps.filter(s => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>{done}/{steps.length} completed</span>
          <span style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: T.border2, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${T.greenD}, ${T.gold})`, borderRadius: 6, transition: "width 0.5s" }} />
        </div>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: s.done ? `${T.green}0A` : T.card2, border: `1px solid ${s.done ? T.green + "30" : T.border}`, transition: "all 0.2s" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: s.done ? `${T.green}20` : T.border, flexShrink: 0 }}>
            {s.done
              ? <Icon d={ICONS.check} size={13} color={T.green} />
              : <Icon d={ICONS[s.icon]} size={13} color={T.textMut} />
            }
          </div>
          <span style={{ fontSize: 13, color: s.done ? T.textSec : T.textPri, textDecoration: s.done ? "line-through" : "none" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function SideItem({ icon, label, active, onClick, badge }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
        background: active ? `${T.gold}14` : hov ? `${T.border}66` : "transparent",
        color: active ? T.gold : hov ? T.textPri : T.textSec,
        transition: "all 0.15s",
      }}>
      
      <Icon d={ICONS[icon]} size={16} color={active ? T.gold : hov ? T.textPri : T.textSec} />
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 10, fontWeight: 700, color: "#000", background: T.gold, borderRadius: 10, padding: "1px 7px" }}>{badge}</span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Profile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handler = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);
  const authUser = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const user = profile || authUser || {
    name: "",
    email: "",
    bio: "",
    image: null,
    role: "User",
  };

  const userId = authUser?.id || authUser?.sub || null;

  // ─ State
  const [activeSection, setActiveSection] = useState("resources");
  const [settingsSub, setSettingsSub] = useState("security");
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // Profile editing
  const [editName, setEditName] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [favourites, setFavourites] = useState([]);










  useEffect(() => {
    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    let active = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await getUser(userId);
        if (!active) return;
        setProfile(response);
        setDraftName(response.name || "");
        setDraftBio(response.bio || "");
      } catch (err) {
        console.error("Unable to load profile:", err);
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, [userId]);




  useEffect(() => {
    const onResize = () => { if (!isMobile) setSidebarOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);




  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (profile) {
      setDraftName(profile.name || "");
      setDraftBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
  if (!user?.id) return;
 
  let alive = true;
 setLoadingProfile(true);
 
  (async () => {
    try {
      const [resData, evData] = await Promise.all([
        api.get('/resources'),
        api.get('/events'),
      ]);
 
      if (!alive) return;
 
      // Filter user's own resources
      const userResources = (resData.data || []).filter(r => r.user_id === user.id);
      
      // Filter user's own events
      const userEvents = (evData.data || []).filter(e => e.user_id === user.id);
      
      // ✅ FIX: Get favourite/bookmarked resources
      const favResources = (resData.data || []).filter(r => 
        user.favourite_resources?.includes(r.id)
      );
 
      setResources(userResources);
      setEvents(userEvents);
      setFavourites(favResources);
    } catch (err) {
      console.error(err);
    } finally {
      if (alive) setLoadingProfile(false);
    }
  })();
 
  return () => { alive = false; };
}, [user?.id, user?.favourite_resources]);

 /* ─── Helper: compress image via Canvas ──────────────────────
   Resizes to maxSize × maxSize and re-encodes as JPEG at given quality.
   Typical avatar: 250px / 0.8 quality → ~15–40 KB base64
─────────────────────────────────────────────────────────────── */
const compressImage = (file, maxSize = 250, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const img    = new Image();
    const objUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Keep aspect ratio
      const ratio  = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const width  = Math.round(img.width  * ratio);
      const height = Math.round(img.height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(objUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objUrl;
  });


/* ─── handleAvatarChange ─────────────────────────────────────
   Replace your entire existing handleAvatarChange with this.
─────────────────────────────────────────────────────────────── */
const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate type
  if (!file.type.startsWith("image/")) {
    setAvatarError("Please select an image file.");
    return;
  }

  // Validate raw file size (10 MB max before compression)
  if (file.size > 10 * 1024 * 1024) {
    setAvatarError("Image must be under 10 MB.");
    return;
  }

  setAvatarError("");
  setAvatarLoading(true);

  try {
    // 1. Compress → small base64 JPEG (~15–40 KB)
    const base64 = await compressImage(file, 250, 0.8);

    // 2. Show instant preview
    setAvatarPreview(base64);

    // 3. Save to backend (now well under 1 MB)
    const updated = await updateUser(userId, { image: base64 });

    // 4. Sync local state + Redux
    setProfile(prev => ({ ...prev, ...updated }));
    dispatch(setUser({ image: base64 }));
    setAvatarPreview(null); // profile state now has the real image

  } catch (err) {
    console.error("Avatar upload failed:", err);
    setAvatarError(
      err.response?.status === 413
        ? "Image still too large — try a smaller file."
        : "Upload failed. Try again."
    );
    setAvatarPreview(null);
  } finally {
    setAvatarLoading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  }
};

  const saveName = async () => {
    setSaveError("");
    if (draftName.trim() === (user.name || "").trim()) {
      setEditName(false);
      return;
    }
    if (!draftName.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUser(userId, { name: draftName.trim() });
      setProfile(prev => ({ ...prev, ...updated }));
      dispatch(setUser({ name: updated.name || draftName.trim() }));
      setEditName(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Unable to update name.");
    } finally {
      setSaving(false);
    }
  };

  const saveBio = async () => {
    setSaveError("");
    if (draftBio.trim() === (user.bio || "").trim()) {
      setEditBio(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUser(userId, { bio: draftBio.trim() });
      setProfile(prev => ({ ...prev, ...updated }));
      dispatch(setUser({ bio: updated.bio || draftBio.trim() }));
      setEditBio(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Unable to update bio.");
    } finally {
      setSaving(false);
    }
  };

  // Resources
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceDrawer, setResourceDrawer] = useState(false);
  const [addResourceModal, setAddResourceModal] = useState(false);

  // Events
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDrawer, setEventDrawer] = useState(false);
  const [addEventModal, setAddEventModal] = useState(false);

  // Sidebar mobile

  const SECTIONS = [
    { id: "resources", icon: "tag", label: "My Resources", badge: resources.length },
    { id: "events", icon: "calendar", label: "My Events", badge: events.length },
    { id: "analytics", icon: "chart", label: "Analytics" },
    { id: "add-resource", icon: "plus", label: "Add Resource" },
    { id: "add-event", icon: "star", label: "Add Event" },
    { id: "favourites", icon: "bookmark", label: "Saved", badge: "favouriteCount" }, 
  ];
  const SETTINGS_SECTIONS = [
    { id: "security", icon: "lock", label: "Password & Security" },
    { id: "notifications", icon: "activity", label: "Notifications" },
    { id: "setup", icon: "check", label: "Account Setup" },
    { id: "danger", icon: "alert", label: "Danger Zone" },
  ];

  const handleSectionClick = (id) => {
    if (id === "add-resource") { setAddResourceModal(true); return; }
    if (id === "add-event") { setAddEventModal(true); return; }
    setActiveSection(id);
    setSidebarOpen(false);
  };

  const handleDeleteResource = async (id) => {
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Unable to delete resource:", err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Unable to delete event:", err);
    }
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loadingProfile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: T.bg, color: T.textSec }}>
        Loading your profile...
      </div>
    );
  }

  // ─ Cover gradient based on role
  const coverGrad = `linear-gradient(135deg, #0D1F0F 0%, #111 40%, #1A120A 100%)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html,body { overflow-x: hidden; max-width: 100%; }
        body { background: ${T.bg}; color: ${T.textPri}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.card}; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 4px; }
        textarea { font-family: 'DM Sans', sans-serif !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .profile-section { animation: fadeUp 0.3s ease both; }
        @media (max-width: 768px) {
          .profile-layout { flex-direction: column !important; }
          .profile-sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(-100%); transition: transform 0.3s; width: 260px !important; }
          .profile-sidebar.open { transform: translateX(0) !important; }
          .profile-main { padding: 16px !important; }
        }
      `}</style>

      

      <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 0 ,overflowX: "hidden"}}>

        {/* ── COVER + AVATAR ── */}
        <div style={{ position: "relative", height: 200, background: coverGrad, overflow: "hidden" }}>
          {/* Decorative grid */}
          <svg style={{ position: "absolute", inset: 0, opacity: 0.06 }} width="100%" height="200">
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Gold line accent */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}, ${T.green}, transparent)` }} />
          {/* Role badge */}
          <div style={{ position: "absolute", top: 16, right: 20 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: T.gold, background: `${T.gold}18`, border: `1px solid ${T.gold}33`, padding: "5px 14px", borderRadius: 20 }}>
              {user.role || "Contributor"}
            </span>
          </div>
        </div>

        {/* ── AVATAR + NAME/BIO ── */}
        <div style={{ maxWidth: 1200, margin: "-30px auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -52, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div
              style={{ position: "relative", flexShrink: 0 }}
              onMouseEnter={() => setHoverAvatar(true)}
              onMouseLeave={() => setHoverAvatar(false)}
            >
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />

              {/* Avatar circle */}
              <div
                onClick={() => !avatarLoading && avatarInputRef.current?.click()}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  border: `3px solid ${avatarLoading ? T.textMut : T.gold}`,
                  background: user.image || avatarPreview
                    ? "none"
                    : `linear-gradient(135deg, ${T.greenD}, ${T.gold})`,
                  overflow: "hidden",
                  boxShadow: `0 0 0 4px ${T.bg}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "Syne, sans-serif",
                  cursor: avatarLoading ? "not-allowed" : "pointer",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  position: "relative",
                }}
              >
                {/* Image — preview takes priority over saved image */}
                {(avatarPreview || user.image) && (
                  <img
                    src={avatarPreview || user.image}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}

                {/* Fallback initial */}
                {!avatarPreview && !user.image && (user.name || "U")[0].toUpperCase()}

                {/* Hover / loading overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: avatarLoading ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.65)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  opacity: hoverAvatar || avatarLoading ? 1 : 0,
                  transition: "opacity 0.2s",
                  zIndex: 10,
                  flexDirection: "column",
                  gap: 4,
                }}>
                  {avatarLoading
                    ? (
                      /* Spinner */
                      <div style={{
                        width: 22,
                        height: 22,
                        border: `2px solid ${T.gold}44`,
                        borderTop: `2px solid ${T.gold}`,
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                    )
                    : (
                      <>
                        <Icon d={ICONS.camera} size={20} color="#fff" />
                        <div style={{ fontSize: 9, color: "#fff", fontWeight: 600, letterSpacing: 0.5 }}>
                          Change
                        </div>
                      </>
                    )
                  }
                </div>
              </div>

              {/* Error message under avatar */}
              {avatarError && (
                <div style={{
                  position: "absolute",
                  top: "110%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  color: T.danger,
                  background: T.card,
                  border: `1px solid ${T.danger}44`,
                  borderRadius: 8,
                  padding: "4px 10px",
                  zIndex: 20,
                }}>
                  {avatarError}
                </div>
              )}
            </div>


            {/* Name + bio + meta */}
            <div style={{ flex: 1, minWidth: 200, paddingBottom: 4, zIndex: '10' }}>
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {editName ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                    <input
                      autoFocus value={draftName} onChange={e => setDraftName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditName(false); }}
                      style={{
                        background: T.card2, border: `1px solid ${T.gold}66`, borderRadius: 8,
                        color: T.textPri, fontSize: 22, fontWeight: 700, fontFamily: "Syne, sans-serif",
                        padding: "4px 10px", outline: "none", width: "min(280px, 100%)",
                      }} />
                    <button onClick={saveName} style={{ background: `${T.gold}18`, border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", color: T.gold, fontSize: 12, fontWeight: 600 }}>Save</button>
                    <button onClick={() => setEditName(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}>
                      <Icon d={ICONS.close} size={14} color={T.textMut} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                    onClick={() => { setDraftName(user.name || ""); setEditName(true); }}
                    title="Click to edit name">
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: T.textPri, fontFamily: "Syne, sans-serif", lineHeight: 1.2 }}>{draftName || user.name}</h1>
                    <Icon d={ICONS.edit} size={14} color={T.textMut} />
                  </div>
                )}
              </div>
              {/* Bio */}
              <div style={{ marginBottom: 8 }}>
                {editBio ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <textarea
                      autoFocus value={draftBio} onChange={e => setDraftBio(e.target.value)} rows={2}
                      style={{
                        background: T.card2, border: `1px solid ${T.gold}55`, borderRadius: 8,
                        color: T.textSec, fontSize: 13, padding: "8px 12px", outline: "none",
                        resize: "vertical", width: "min(480px, 100%)", fontFamily: "DM Sans, sans-serif",
                      }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveBio} style={{ background: `${T.gold}18`, border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", color: T.gold, fontSize: 12, fontWeight: 600 }}>Save</button>
                      <button onClick={() => setEditBio(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, fontSize: 12 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer", maxWidth: 480 }}
                    onClick={() => { setDraftBio(user.bio || ""); setEditBio(true); }}
                    title="Click to edit bio">
                    <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, flex: 1 }}>{draftBio || user.bio || "Add a bio..."}</p>
                    <Icon d={ICONS.edit} size={12} color={T.textMut} style={{ marginTop: 4, flexShrink: 0 }} />
                  </div>
                )}
              </div>
              {saveError && <div style={{ color: T.danger, fontSize: 12, marginBottom: 10 }}>{saveError}</div>}
              {/* Email */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={ICONS.link} size={12} color={T.textMut} />
                <span style={{ fontSize: 12, color: T.textMut }}>{user.email}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 20, paddingBottom: 4 }}>
              {[
                { label: "Resources", value: resources.length, color: T.gold },
                { label: "Events", value: events.length, color: T.green },
                { label: "Total Views", value: resources.reduce((a, r) => a + (r.view_count || 0), 0), color: T.info },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "Syne, sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: T.textMut, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN LAYOUT ── */}
          <div className="profile-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingBottom: 48 }}>

            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(5px)",
                zIndex: 48,
                opacity: sidebarOpen ? 1 : 0,
                pointerEvents: sidebarOpen ? "auto" : "none",
                transition: "opacity 0.3s ease",
              }}
            />



            {/* ── SIDEBAR ── */}
            <aside
              style={{
                // ─ shared ─────────────────────────────────────
                background: T.card,
                border: `1px solid ${T.border}`,
                overflowY: "auto",
                flexShrink: 0,
                // ─ desktop: sticky in flow ────────────────────
                ...((!isMobile)
                  ? {
                    width: 220,
                    borderRadius: 16,
                    position: "sticky",
                    top: 80,
                    maxHeight: "calc(100vh - 100px)",
                  }
                  : {
                    // ─ mobile: fixed drawer from left ─────────
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "min(280px, 85vw)",
                    borderRadius: "0 16px 16px 0",
                    zIndex: 53,
                    transform: sidebarOpen ? "translateX(0)" : "translateX(-105%)",
                    transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                    maxHeight: "100vh",
                  }),
              }}
            >
              {/* Mobile header with close button */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 12px",
                borderBottom: `1px solid ${T.border}`,
                position: "sticky",
                top: 0,
                background: T.card,
                zIndex: 1,
              }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.textMut,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontFamily: "Syne, sans-serif",
                }}>
                  Navigation
                </span>
                {/* ← CLOSE BUTTON */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                  style={{
                    background: `${T.gold}18`,
                    border: `1px solid ${T.gold}40`,
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: T.gold,
                    fontSize: 15,
                    lineHeight: 1,
                    transition: "all .2s",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Content nav */}
              <div style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1.5, padding: "4px 6px 8px" }}>
                  Content
                </div>
                {SECTIONS.map(s => (
                  <SideItem
                    key={s.id}
                    icon={s.icon}
                    label={s.label}
                    badge={s.badge}
                    active={activeSection === s.id && s.id !== "add-resource" && s.id !== "add-event"}
                    onClick={() => { handleSectionClick(s.id); setSidebarOpen(false); }}
                  />
                ))}
              </div>

              {/* Account nav */}
              <div style={{ padding: "12px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1.5, padding: "4px 6px 8px" }}>
                  Account
                </div>
                {SETTINGS_SECTIONS.map(s => (
                  <SideItem
                    key={s.id}
                    icon={s.icon}
                    label={s.label}
                    active={activeSection === "settings" && settingsSub === s.id}
                    onClick={() => { setActiveSection("settings"); setSettingsSub(s.id); setSidebarOpen(false); }}
                  />
                ))}
              </div>
            </aside>

            {/* ── HAMBURGER FAB (mobile only, opens sidebar) ── */}
            <button
              onClick={() => setSidebarOpen(p => !p)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              style={{
                position: "fixed",
                top: 43,
                left: 20,          // left side to match left-drawer
                zIndex: 50,
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldH})`,
                border: "none",
                cursor: "pointer",
                display: window.innerWidth >= 768 ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 20px rgba(23, 121, 67, 0.45)`,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {/* Animated hamburger → X */}
              <div style={{ width: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  sidebarOpen ? { transform: "rotate(45deg) translate(4px,4px)" } : {},
                  sidebarOpen ? { opacity: 0, transform: "scaleX(0)" } : {},
                  sidebarOpen ? { transform: "rotate(-45deg) translate(4px,-4px)" } : {},
                ].map((extra, i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      width: i === 2 && !sidebarOpen ? "65%" : "100%",
                      height: 2,
                      borderRadius: 2,
                      background: "#000",
                      transition: "all 0.3s ease",
                      ...extra,
                    }}
                  />
                ))}
              </div>
            </button>



            {/* ── MAIN CONTENT ── */}
            <main className="profile-main profile-section" style={{ flex: 1, minWidth: 0 }}>

              {/* Section header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: T.textPri, fontFamily: "Syne, sans-serif" }}>
                    {activeSection === "resources" && "My Resources"}
                    {activeSection === "events" && "My Events"}
                    {activeSection === "analytics" && "Analytics Overview"}
                    {activeSection === "settings" && {
                      security: "Password & Security", notifications: "Notifications",
                      setup: "Account Setup", danger: "Danger Zone",
                    }[settingsSub]}
                  </h2>
                  <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>
                    {activeSection === "resources" && `${resources.length} resources added`}
                    {activeSection === "events" && `${events.length} events created`}
                    {activeSection === "analytics" && "Your content performance at a glance"}
                    {activeSection === "settings" && "Manage your account preferences"}
                  </div>
                </div>

                  {activeSection === "favourites" && (
                    <div>
                      <div style={{ marginBottom: 24 }}>
                        <h2 style={{
                          fontSize: 20,
                          fontWeight: 700,
                          margin: "0 0 8px",
                          fontFamily: "Syne,sans-serif",
                          color: T.textPri,
                        }}>
                          Saved Resources
                        </h2>
                        <p style={{
                          fontSize: 13,
                          color: T.textSec,
                          margin: 0,
                        }}>
                          Resources you've bookmarked and liked
                        </p>
                      </div>
                  
                      {loadingProfile ? (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                          gap: 16,
                        }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                              height: 240,
                              background: T.card2,
                              borderRadius: 12,
                              animation: "pulse 2s infinite",
                            }} />
                          ))}
                        </div>
                      ) : favourites.length === 0 ? (
                        <div style={{
                          textAlign: "center",
                          padding: "60px 20px",
                          background: T.card,
                          borderRadius: 14,
                          border: `1px solid ${T.border}`,
                        }}>
                          <svg width={48} height={48} viewBox="0 0 24 24" fill="none"
                            stroke={T.textMut} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                            style={{ margin: "0 auto 16px", display: "block" }}>
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                          <p style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: T.textPri,
                            marginBottom: 4,
                          }}>
                            No saved resources yet
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: T.textMut,
                            margin: 0,
                          }}>
                            Bookmark resources to save them here
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                          gap: 16,
                        }}>
                          {favourites.map((res) => (
                            <div key={res.id} style={{
                              background: T.card,
                              borderRadius: 12,
                              overflow: "hidden",
                              border: `1px solid ${T.border}`,
                              cursor: "pointer",
                              transition: "all .2s",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = T.gold;
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = T.border;
                                e.currentTarget.style.transform = "none";
                              }}>
                              {/* Image */}
                              <div style={{
                                width: "100%",
                                height: 120,
                                background: T.card2,
                                overflow: "hidden",
                              }}>
                                <img src={res.image_url || defaultImage} alt={res.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onError={e => { e.target.src = defaultImage; }}
                                />
                              </div>
                  
                              {/* Content */}
                              <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column" }}>
                                <h4 style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  margin: "0 0 6px",
                                  color: T.textPri,
                                  fontFamily: "Syne,sans-serif",
                                }}>
                                  {res.title}
                                </h4>
                                <p style={{
                                  fontSize: 11,
                                  color: T.textMut,
                                  margin: 0,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  flex: 1,
                                }}>
                                  {res.description}
                                </p>
                                <Link to={`/resources/${res.id}`} style={{
                                  fontSize: 11,
                                  color: T.gold,
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  marginTop: 8,
                                }}>
                                  View →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}



                {activeSection === "resources" && (
                  <Btn variant="primary" icon="plus" size="sm" onClick={() => setAddResourceModal(true)}></Btn>
                )}
                {activeSection === "events" && (
                  <Btn variant="green" icon="plus" size="sm" onClick={() => setAddEventModal(true)}></Btn>
                )}
              </div>

              {/* ─ Resources Tab */}
              {activeSection === "resources" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {resources.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMut }}>
                      <Icon d={ICONS.tag} size={40} color={T.textMut} />
                      <div style={{ marginTop: 12, fontSize: 14 }}>No resources yet</div>
                      <Btn variant="primary" icon="plus" size="sm" onClick={() => setAddResourceModal(true)} style={{ marginTop: 16 }}>Add your first resource</Btn>
                    </div>
                  ) : resources.map(r => (
                    <ResourceCard key={r.id} item={r}
                      onDetail={item => { setSelectedResource(item); setResourceDrawer(true); }}
                      onDelete={handleDeleteResource} />
                  ))}
                </div>
              )}

              {/* ─ Events Tab */}
              {activeSection === "events" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {events.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMut }}>
                      <Icon d={ICONS.calendar} size={40} color={T.textMut} />
                      <div style={{ marginTop: 12, fontSize: 14 }}>No events yet</div>
                      <Btn variant="green" icon="plus" size="sm" onClick={() => setAddEventModal(true)} style={{ marginTop: 16 }}>Create your first event</Btn>
                    </div>
                  ) : events.map(e => (
                    <EventCard key={e.id} item={e}
                      onDetail={item => { setSelectedEvent(item); setEventDrawer(true); }}
                      onDelete={handleDeleteEvent} />
                  ))}
                </div>
              )}

              {/* ─ Analytics Tab */}
              {activeSection === "analytics" && <AnalyticsTab resources={resources} events={events} />}

              {/* ─ Settings */}
              {activeSection === "settings" && (
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
                  {settingsSub === "setup"
                    ? <SetupChecklist user={user} resources={resources} />
                    : <SettingsPanel sub={settingsSub} />
                  }
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ── DRAWERS ── */}
      <Drawer open={resourceDrawer} onClose={() => setResourceDrawer(false)} title={selectedResource?.title || "Resource Details"}>
        <ResourceDetail item={selectedResource} />
      </Drawer>
      <Drawer open={eventDrawer} onClose={() => setEventDrawer(false)} title={selectedEvent?.title || "Event Details"}>
        <EventDetail item={selectedEvent} />
      </Drawer>

      {/* ── MODALS ── */}
      <Modal open={addResourceModal} onClose={() => setAddResourceModal(false)} title="Add New Resource">
        <AddResourceForm
          onClose={() => setAddResourceModal(false)}
          onCreated={(resource) => setResources((prev) => [resource, ...(prev || [])])}
        />
      </Modal>
      <Modal open={addEventModal} onClose={() => setAddEventModal(false)} title="Create New Event">
        <AddEventForm
          onClose={() => setAddEventModal(false)}
          onCreated={(event) => setEvents((prev) => [event, ...(prev || [])])}
        />
      </Modal>

      <BottomNav active="profile" />
    </>
  );
}