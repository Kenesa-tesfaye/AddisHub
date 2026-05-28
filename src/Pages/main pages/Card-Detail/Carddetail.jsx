/**
 * Carddetail.jsx — Resource detail page
 * Route: /resources/:id
 *
 * REAL API CALLS:
 *   GET    /resources/:id          → fetch resource (also increments view count once per user)
 *   PUT    /resources/:id          → update title / description / category / location / pictures
 *   DELETE /resources/:id          → delete resource
 *   POST   /resources/:id/like     → like
 *   POST   /resources/:id/unlike   → unlike
 *   GET    /auth/:id               → load author profile
 *
 * PICTURES FORMAT (stored as text[] in Supabase):
 *   Each element is a JSON string: '{"url":"https://…","caption":"My caption"}'
 *   parsePic() / stringifyPic() handle serialisation transparently.
 *
 * OWNER = currentUser.id === resource.user_id  OR  role === 'admin'
 *   Owner  → inline editing, settings drawer, per-tile image controls, add-photo tile
 *   Viewer → like, bookmark, share, report, view-on-map, author card
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import Nav from "../../../components/Nav";
import api from "../../../api/api";
import BottomNav from "../../../components/BottomNav";

/* ─── tokens ──────────────────────────────────────────────────── */
const T = {
  bg: "#090909", surface: "#0E0E0E", card: "#111",
  card2: "#161616", card3: "#1B1B1B",
  b1: "#1A1A1A", b2: "#252525", b3: "#303030",
  gold: "#046032", goldL: "#046032cc", goldD: "#046032",
  green: "#3DB070", greenD: "#1A6B3C",
  text: "#F2F2F2", textSec: "#7C7C7C", textMut: "#444",
  danger: "#D94F4F", info: "#4A82D4",
};

const CAT_COLOR = {
  Education: "#4A82D4", Health: "#3DB070", Technology: "#C9941A",
  Culture: "#9B6FD4", Sports: "#D4724A", Environment: "#5BAF6B",
  Legal: "#AF5B5B", Business: "#D4914A",
};
const catColor = c => CAT_COLOR[c] || T.gold;

/* ─── picture helpers ─────────────────────────────────────────── */
const parsePic = raw => {
  if (!raw) return { url: "", caption: "" };
  if (typeof raw === "object") return { url: raw.url || "", caption: raw.caption || "" };
  try { return JSON.parse(raw); } catch { return { url: raw, caption: "" }; }
};
const stringifyPic = obj => JSON.stringify({ url: obj.url || "", caption: obj.caption || "" });

/* ─── SVG icon ────────────────────────────────────────────────── */
const Ico = ({ d, size = 18, color = "currentColor", fill = "none", style: s = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={s}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const I = {
  arrowL: "M19 12H5M12 5l-7 7 7 7",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  check: "M20 6L9 17l-5-5",
  close: "M18 6L6 18M6 6l12 12",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  share: ["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "M16 6l-4-4-4 4", "M12 2v13"],
  flag: ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", "M4 22v-7"],
  map: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  plus: "M12 5v14M5 12h14",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"],
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  alert: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  enlarge: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  penLine: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  tag: ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"],
  spinner: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

/* ─── micro components ─────────────────────────────────────────── */
function Chip({ label }) {
  const c = catColor(label);
  return <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", color: c, background: `${c}16`, border: `1px solid ${c}28` }}>{label}</span>;
}

function Btn({ children, onClick, variant = "primary", size = "md", icon, full = false, disabled = false, style: ext = {} }) {
  const [h, sH] = useState(false);
  const pad = { sm: "7px 14px", md: "10px 20px", lg: "13px 28px" }[size];
  const fs = { sm: 12, md: 13, lg: 14 }[size];
  const V = {
    primary: { bg: h ? T.goldL : T.gold, color: "#000", border: "none" },
    ghost: { bg: h ? `${T.gold}14` : "transparent", color: T.gold, border: `1px solid ${T.gold}40` },
    dark: { bg: h ? T.card2 : T.card3, color: T.text, border: `1px solid ${T.b2}` },
    danger: { bg: h ? `${T.danger}28` : `${T.danger}14`, color: T.danger, border: `1px solid ${T.danger}35` },
    subtle: { bg: h ? T.card2 : "transparent", color: T.textSec, border: `1px solid ${T.b3}` },
    green: { bg: h ? "#2FA060" : T.green, color: "#000", border: "none" },
  };
  const v = V[variant] || V.primary;
  return (
    <button onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)} onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: pad, borderRadius: 10, fontFamily: "DM Sans,sans-serif", fontWeight: 600, fontSize: fs, cursor: disabled ? "not-allowed" : "pointer", transition: "all .18s", opacity: disabled ? .5 : 1, border: v.border, background: v.bg, color: v.color, width: full ? "100%" : "auto", ...ext }}>
      {icon && <Ico d={I[icon]} size={fs + 1} color={v.color} />}
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", multiline = false, rows = 3 }) {
  const [f, sF] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <div style={{ borderRadius: 10, border: `1px solid ${f ? T.gold + "60" : T.b2}`, background: T.card, transition: "border .2s" }}>
        {multiline
          ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 14, padding: "10px 14px", fontFamily: "DM Sans,sans-serif", resize: "vertical" }}
            onFocus={() => sF(true)} onBlur={() => sF(false)} />
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 14, padding: "10px 14px", fontFamily: "DM Sans,sans-serif" }}
            onFocus={() => sF(true)} onBlur={() => sF(false)} />
        }
      </div>
    </div>
  );
}

/* ─── Drawer ───────────────────────────────────────────────────── */
function Drawer({ open, onClose, title, children }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", backdropFilter: "blur(5px)", zIndex: 199, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .3s" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(270px,60vw)", background: T.card, borderLeft: `1px solid ${T.b2}`, zIndex: 200, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .36s cubic-bezier(.4,0,.2,1)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${T.b1}`, position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "Syne,sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, color: T.textSec }}><Ico d={I.close} size={20} color={T.textSec} /></button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>{children}</div>
      </div>
    </>
  );
}

/* ─── Modal ────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", backdropFilter: "blur(8px)", zIndex: 299, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .25s" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(.94)", width: "min(520px,95vw)", maxHeight: "92vh", background: T.card, borderRadius: 20, border: `1px solid ${T.b2}`, zIndex: 300, overflowY: "auto", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "all .26s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${T.b1}`, position: "sticky", top: 0, background: T.card }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "Syne,sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Ico d={I.close} size={18} color={T.textSec} /></button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </>
  );
}

/* ─── Toast ────────────────────────────────────────────────────── */
function Toast({ msg, type = "info", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const col = { info: T.gold, success: T.green, error: T.danger }[type] || T.gold;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: T.card, border: `1px solid ${col}44`, borderLeft: `3px solid ${col}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,.65)", fontFamily: "DM Sans,sans-serif", fontSize: 13, color: T.text, animation: "toastIn .25s ease both", maxWidth: 320 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />{msg}
    </div>
  );
}

/* ─── Confirm modal ────────────────────────────────────────────── */
function Confirm({ open, title, body, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, marginBottom: 24 }}>{body}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="subtle" onClick={onCancel} full>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm} disabled={loading} full>{loading ? "Deleting…" : "Yes, Delete"}</Btn>
      </div>
    </Modal>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
function Skel({ w = "100%", h = 16, br = 8 }) {
  return <div style={{ width: w, height: h, borderRadius: br, background: `linear-gradient(90deg,${T.card2} 25%,${T.card3} 50%,${T.card2} 75%)`, backgroundSize: "200% 100%", animation: "cdSkel 1.5s ease infinite" }} />;
}

/* ─── Lightbox ─────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => { setIdx(startIndex); }, [startIndex]);
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(p => Math.min(p + 1, images.length - 1));
      if (e.key === "ArrowLeft") setIdx(p => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [images.length, onClose]);
  if (!images.length) return null;
  const img = images[idx];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.97)", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,.1)", border: "none", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Ico d={I.close} size={20} color="#fff" />
      </button>
      <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "rgba(255,255,255,.4)", letterSpacing: 2 }}>{idx + 1} / {images.length}</div>
      <div style={{ width: "min(680px,92vw)", aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", background: T.card2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {img.url
          ? <img src={img.url} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Ico d={I.camera} size={48} color={T.textMut} />
        }
      </div>
      {img.caption && (
        <div style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,.75)", maxWidth: 480, textAlign: "center", lineHeight: 1.65, padding: "0 20px" }}>{img.caption}</div>
      )}
      {idx > 0 && (
        <button onClick={() => setIdx(p => p - 1)} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.1)", border: "none", borderRadius: "50%", width: 46, height: 46, fontSize: 22, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
      )}
      {idx < images.length - 1 && (
        <button onClick={() => setIdx(p => p + 1)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.1)", border: "none", borderRadius: "50%", width: 46, height: 46, fontSize: 22, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      )}
      <div style={{ position: "absolute", bottom: 22, display: "flex", gap: 7 }}>
        {images.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, background: i === idx ? T.gold : "rgba(255,255,255,.22)", transition: "all .2s", cursor: "pointer" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Image tile ───────────────────────────────────────────────── */
const TILE_PALS = [
  ["#0B1A10", "#3DB07020"], ["#190E00", "#C9941A20"], ["#0B1120", "#4A82D420"],
  ["#190A0A", "#D94F4F20"], ["#100B1A", "#9B6FD420"], ["#0B1A12", "#5BAF6B20"],
];

function ImageTile({ img, index, isOwner, onView, onDelete, onEditCaption }) {
  const [h, sH] = useState(false);
  const pal = TILE_PALS[index % TILE_PALS.length];
  const hasCaption = !!img.caption;
 
  return (
    <div
      onMouseEnter={() => sH(true)}
      onMouseLeave={() => sH(false)}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        background: `radial-gradient(circle at 30% 30%,${pal[1]},${pal[0]})`,
        border: `1px solid ${h ? T.b3 : T.b1}`,
        transition: "all .2s",
        transform: h ? "scale(1.025)" : "scale(1)",
        boxShadow: h ? "0 10px 36px rgba(0,0,0,.7)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image area */}
      <div
        style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", flexShrink: 0 }}
        onClick={() => onView(index)}
      >
        {img.url
          ? <img src={img.url} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s", transform: h ? "scale(1.05)" : "scale(1)" }}/>
          : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Ico d={I.camera} size={26} color={T.textMut}/>
              <span style={{ fontSize: 9, color: T.textMut, letterSpacing: .5 }}>No image</span>
            </div>
        }
        {/* Enlarge icon */}
        <div style={{ position: "absolute", top: 7, left: 7, opacity: h ? 1 : 0, transition: "opacity .2s" }}>
          <div style={{ background: "rgba(0,0,0,.6)", borderRadius: 6, padding: "3px 5px", display: "flex" }}>
            <Ico d={I.enlarge} size={11} color="#fff"/>
          </div>
        </div>
        {/* Owner controls */}
        {isOwner && h && (
          <div style={{ position: "absolute", top: 7, right: 7, display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={e => { e.stopPropagation(); onEditCaption(img, index); }}
              style={{ background: "rgba(0,0,0,.72)", border: "none", borderRadius: 6, padding: "5px 7px", cursor: "pointer", display: "flex" }}
              title="Edit caption"
            >
              <Ico d={I.penLine} size={11} color={T.gold}/>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(index); }}
              style={{ background: "rgba(0,0,0,.72)", border: "none", borderRadius: 6, padding: "5px 7px", cursor: "pointer", display: "flex" }}
              title="Delete photo"
            >
              <Ico d={I.trash} size={11} color={T.danger}/>
            </button>
          </div>
        )}
      </div>
 
      {/* Caption strip — always visible if caption exists */}
      {hasCaption && (
        <div
          onClick={() => onView(index)}
          style={{
            padding: "8px 10px",
            background: T.card2,
            borderTop: `1px solid ${T.b1}`,
            minHeight: 34,
          }}
        >
          <p style={{
            fontSize: 11,
            color: T.textSec,
            lineHeight: 1.45,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {img.caption}
          </p>
        </div>
      )}
 
      {/* "No caption" hint for owner on hover */}
      {!hasCaption && isOwner && h && (
        <div
          onClick={e => { e.stopPropagation(); onEditCaption(img, index); }}
          style={{
            padding: "7px 10px",
            background: T.card2,
            borderTop: `1px solid ${T.b1}`,
            cursor: "pointer",
          }}
        >
          <p style={{ fontSize: 10, color: T.textMut, margin: 0, fontStyle: "italic" }}>
            + Add caption
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Add-photo tile (last slot, owner only) ────────────────────── */
function AddPhotoTile({ onClick }) {
  const [h, sH] = useState(false);
  return (
    <div onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)} onClick={onClick}
      style={{ aspectRatio: "1/1", borderRadius: 12, border: `2px dashed ${h ? T.gold : T.b3}`, background: h ? `${T.gold}08` : T.card2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transition: "all .2s", transform: h ? "scale(1.02)" : "scale(1)" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: h ? `${T.gold}18` : T.b2, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${h ? T.gold : T.b3}`, transition: "all .2s" }}>
        <Ico d={I.plus} size={20} color={h ? T.gold : T.textMut} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: h ? T.gold : T.textSec }}>Add Photo</div>
        <div style={{ fontSize: 10, color: T.textMut, marginTop: 2 }}>+ caption</div>
      </div>
    </div>
  );
}

/* ─── Add-photo modal content ──────────────────────────────────── */
function AddPhotoContent({ onAdd, onClose }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Compress image via Canvas (same approach as avatar upload)
  const compressImage = (file, maxSize = 800, quality = 0.82) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objUrl);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error("Load failed")); };
      img.src = objUrl;
    });

  const pick = file => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10 MB."); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!preview) return;
    setSaving(true);
    setError("");
    try {
      // Re-compress from the data URL by drawing it onto canvas
      const img = new Image();
      img.src = preview;
      const base64 = await new Promise((resolve, reject) => {
        img.onload = () => {
          const maxSize = 800;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
      });

      onAdd({ url: base64, caption: caption.trim() });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        style={{ borderRadius: 14, border: `2px dashed ${dragging ? T.gold : preview ? T.green : T.b3}`, background: preview ? "transparent" : dragging ? `${T.gold}08` : T.card2, cursor: "pointer", overflow: "hidden", minHeight: 210, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
        {preview
          ? <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }} />
          : <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.b2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Ico d={I.upload} size={22} color={T.textMut} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.textSec, marginBottom: 4 }}>Drop photo here</div>
            <div style={{ fontSize: 11, color: T.textMut }}>or click to browse · PNG, JPG up to 10 MB</div>
          </div>
        }
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => pick(e.target.files[0])} />
      </div>

      {preview && (
        <button onClick={() => { setPreview(null); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, fontSize: 12, textAlign: "left", padding: 0 }}>
          ✕ Remove photo
        </button>
      )}

      {/* Caption */}
      <div>
        <label style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Caption</label>
        <textarea value={caption} onChange={e => setCaption(e.target.value.slice(0, 220))} placeholder="Write a caption…" rows={3}
          style={{ width: "100%", background: T.card2, border: `1px solid ${T.b2}`, borderRadius: 10, color: T.text, fontSize: 14, padding: "10px 14px", outline: "none", fontFamily: "DM Sans,sans-serif", resize: "none", boxSizing: "border-box" }} />
        <div style={{ textAlign: "right", fontSize: 10, color: T.textMut, marginTop: 3 }}>{caption.length}/220</div>
      </div>

      {error && <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="subtle" onClick={onClose} full>Cancel</Btn>
        <Btn variant="primary" onClick={submit} disabled={saving || !preview} style={{ flex: 2, justifyContent: "center" }}>
          {saving ? "Uploading…" : "Post Photo"}
        </Btn>
      </div>
    </div>
  );
}

/* ─── Edit caption modal ───────────────────────────────────────── */
function EditCaptionContent({ img, onSave, onClose }) {
  const [caption, setCaption] = useState(img?.caption || "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {img?.url && <img src={img.url} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 180, objectFit: "cover" }} />}
      <div>
        <label style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Caption</label>
        <textarea value={caption} onChange={e => setCaption(e.target.value.slice(0, 220))} rows={3}
          style={{ width: "100%", background: T.card2, border: `1px solid ${T.b2}`, borderRadius: 10, color: T.text, fontSize: 14, padding: "10px 14px", outline: "none", fontFamily: "DM Sans,sans-serif", resize: "none", boxSizing: "border-box" }} />
        <div style={{ textAlign: "right", fontSize: 10, color: T.textMut, marginTop: 3 }}>{caption.length}/220</div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="subtle" onClick={onClose} full>Cancel</Btn>
        <Btn variant="primary" onClick={() => { onSave(caption.trim()); onClose(); }} full>Save Caption</Btn>
      </div>
    </div>
  );
}

/* ─── Settings drawer content ──────────────────────────────────── */
function SettingsContent({ resource, onSave, onDelete, onClose }) {
  const CATS = ["Education", "Health", "Technology", "Culture", "Sports", "Environment", "Legal", "Business"];
  const [cat, setCat] = useState(resource.category || "");
  const [loc, setLoc] = useState(resource.location || "");
  const [mloc, setMloc] = useState(resource.map_location || "");
  const [imgUrl, setImgUrl] = useState(resource.image_url || "");
  const [vis, setVis] = useState("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError(""); setSaving(true);
    try { await onSave({ category: cat, location: loc, map_location: mloc, image_url: imgUrl }); onClose(); }
    catch (e) { setError(e.response?.data?.message || "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Category */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${cat === c ? T.gold : T.b3}`, background: cat === c ? `${T.gold}16` : T.card2, color: cat === c ? T.gold : T.textSec, transition: "all .15s" }}>{c}
            </button>
          ))}
        </div>
      </div>

      <Field label="Location" value={loc} onChange={setLoc} placeholder="e.g. Kirkos, Addis Ababa" />
      <Field label="Map Coordinates" value={mloc} onChange={setMloc} placeholder="e.g. 9.0107° N, 38.7612° E" />
      <Field label="Cover Image URL" value={imgUrl} onChange={setImgUrl} placeholder="https://…" />

      {/* Visibility */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Visibility</div>
        {[{ v: "public", ic: I.globe, l: "Public", d: "Visible to all users" }, { v: "private", ic: I.lock, l: "Private", d: "Only visible to you" }].map(opt => (
          <div key={opt.v} onClick={() => setVis(opt.v)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${vis === opt.v ? T.gold + "55" : T.b1}`, background: vis === opt.v ? `${T.gold}08` : T.card2, cursor: "pointer", marginBottom: 8, transition: "all .15s" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: vis === opt.v ? `${T.gold}18` : T.b2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Ico d={opt.ic} size={14} color={vis === opt.v ? T.gold : T.textMut} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: vis === opt.v ? T.text : T.textSec }}>{opt.l}</div>
              <div style={{ fontSize: 11, color: T.textMut, marginTop: 1 }}>{opt.d}</div>
            </div>
            {vis === opt.v && <Ico d={I.check} size={15} color={T.gold} />}
          </div>
        ))}
      </div>

      {error && <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>}
      <Btn variant="primary" onClick={save} disabled={saving} full size="lg">{saving ? "Saving…" : "Save Changes"}</Btn>

      {/* Danger zone */}
      <div style={{ borderTop: `1px solid ${T.b1}`, paddingTop: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Danger Zone</div>
        <div style={{ padding: "13px 16px", borderRadius: 12, background: `${T.danger}08`, border: `1px solid ${T.danger}22`, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Ico d={I.alert} size={14} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.65, margin: 0 }}>Deleting this resource is permanent. All analytics, likes, and photos will be lost.</p>
          </div>
        </div>
        <Btn variant="danger" icon="trash" onClick={onDelete} full>Delete Resource</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function Carddetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(s => s.auth.user);

  /* ── State ── */
  const [resource, setResource] = useState(null);
  const [author, setAuthor] = useState(null);
  const [images, setImages] = useState([]);   // [{ url, caption }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  /* owner inline editing */
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const viewTrackedRef = useRef(false);

  // Restore liked state from localStorage (keyed per user+resource)
  const [displayViewCount, setDisplayViewCount] = useState(0);

  // Check if bookmarked — load user's favourite_resources
  


  const [draftDesc, setDraftDesc] = useState("");
  const [saving, setSaving] = useState(false);

  /* modals/drawers */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [editCaptionData, setEditCaptionData] = useState(null); // { img, index }
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Helpers ── */
  const showToast = (msg, type = "info") => setToast({ msg, type });

 useEffect(() => {
  viewTrackedRef.current = false; // reset only when resource id changes
}, [id]);

useEffect(() => {
  if (!id) return;
  let alive = true;

  (async () => {
    setLoading(true);
    setError("");
    try {
      const userId = currentUser?.id;

      // localStorage key — permanent dedup for auth users
      const viewedKey = userId ? `crh_viewed_${userId}_${id}` : null;
      const alreadySeen = viewedKey ? !!localStorage.getItem(viewedKey) : false;

      // shouldCount = true only when:
      // 1. userId exists (logged in)
      // 2. not already seen in localStorage
      // 3. not already fired this render cycle
      const shouldCount = !!userId && !alreadySeen && !viewTrackedRef.current;

      // only lock the ref when we actually have a userId
      // so guest→user transition still gets counted
      if (userId) viewTrackedRef.current = true;

      const url = `/resources/${id}${shouldCount ? `?userId=${userId}` : ""}`;
      const { data } = await api.get(url);
      if (!alive) return;

      setResource(data);
      setLikeCount(data.like_count || 0);
      setImages((data.pictures || []).map(parsePic));
      setDraftTitle(data.title || "");
      setDraftDesc(data.description || "");

      // optimistic display count
      if (shouldCount) {
        setDisplayViewCount((data.view_count || 0) + 1);
        localStorage.setItem(viewedKey, "1"); // remember forever
      } else {
        setDisplayViewCount(data.view_count || 0);
      }

      // liked state
      const likedKey = `crh_liked_${userId}_${data.id}`;
      setLiked(localStorage.getItem(likedKey) === "true");

      // bookmarked state
      if (userId) {
        try {
          const { data: userData } = await api.get(`/auth/${userId}`);
          if (alive) setBookmarked((userData?.favourite_resources || []).includes(data.id));
        } catch {}
      }

      // author
      if (data.user_id) {
        try {
          const { data: aData } = await api.get(`/auth/${data.user_id}`);
          if (alive) setAuthor(aData);
        } catch {}
      }

    } catch (err) {
      if (alive) setError("Resource not found or failed to load.");
      console.error(err);
    } finally {
      if (alive) setLoading(false);
    }
  })();

  return () => { alive = false; };
}, [id, currentUser]);
  /* ── Ownership ── */
  const isOwner = !!(currentUser && resource && (currentUser.id === resource.user_id || currentUser.role === "admin"));

  /* ── Like/unlike ── */
  const handleLike = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (liking) return;
    setLiking(true);
    const likedKey = `crh_liked_${currentUser.id}_${id}`;
    try {
      if (liked) {
        await api.post(`/resources/${id}/unlike`);
        setLiked(false);
        setLikeCount(p => p - 1);
        localStorage.setItem(likedKey, "false");
      } else {
        await api.post(`/resources/${id}/like`);
        setLiked(true);
        setLikeCount(p => p + 1);
        localStorage.setItem(likedKey, "true");
      }
    } catch {
      showToast("Like failed", "error");
    } finally {
      setLiking(false);
    }
  };


  const handleBookmark = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (bookmarking) return;
    setBookmarking(true);
    try {
      // Load current favourites
      const { data: userData } = await api.get(`/auth/${currentUser.id}`);
      const existing = userData?.favourite_resources || [];
      const resourceId = resource.id;

      let updated;
      if (bookmarked) {
        updated = existing.filter(fid => fid !== resourceId);
      } else {
        updated = [...existing, resourceId];
      }

      await api.put(`/auth/${currentUser.id}`, { favourite_resources: updated });
      setBookmarked(!bookmarked);
      showToast(bookmarked ? "Removed from saved" : "Saved to bookmarks", "success");
    } catch {
      showToast("Bookmark failed", "error");
    } finally {
      setBookmarking(false);
    }
  };


  const handleShare = async () => {
    const url = window.location.href;
    const title = resource?.title || "Check this resource";
    const text = `${title} — found on Addis HUB`;

    // Try native share sheet first (mobile / modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // User cancelled — don't fall through to clipboard
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      showToast("Link copied to clipboard!", "success");
    } catch {
      // Last resort: legacy execCommand
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showToast("Link copied!", "success");
    }
  };


  /* ── Save title ── */
  const saveTitle = async () => {
    const t = draftTitle.trim();
    if (!t || t === resource.title) { setEditTitle(false); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/resources/${id}`, { title: t });
      setResource(p => ({ ...p, ...data })); setEditTitle(false);
      showToast("Title updated", "success");
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  /* ── Save description ── */
  const saveDesc = async () => {
    const d = draftDesc.trim();
    setSaving(true);
    try {
      const { data } = await api.put(`/resources/${id}`, { description: d });
      setResource(p => ({ ...p, ...data })); setEditDesc(false);
      showToast("Description updated", "success");
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  /* ── Save images to backend ── */
  const persistImages = useCallback(async (newImages) => {
    try {
      await api.put(`/resources/${id}`, { pictures: newImages.map(stringifyPic) });
    } catch { showToast("Photo sync failed", "error"); }
  }, [id]);

  /* ── Add photo ── */
  const handleAddPhoto = (newImg) => {
    const updated = [...images, newImg];
    setImages(updated);
    persistImages(updated);
  };

  /* ── Delete photo ── */
  const handleDeletePhoto = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    persistImages(updated);
    showToast("Photo removed", "success");
  };

  /* ── Edit caption ── */
  const handleSaveCaption = (index, caption) => {
    const updated = images.map((img, i) => i === index ? { ...img, caption } : img);
    setImages(updated);
    persistImages(updated);
    showToast("Caption saved", "success");
  };

  /* ── Settings save ── */
  const handleSettingsSave = async (updates) => {
    const { data } = await api.put(`/resources/${id}`, updates);
    setResource(p => ({ ...p, ...data }));
    showToast("Settings saved", "success");
  };

  /* ── Delete resource ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/resources/${id}`);
      showToast("Resource deleted", "success");
      setTimeout(() => navigate("/resources"), 1200);
    } catch { showToast("Delete failed", "error"); setDeleting(false); }
  };

  /* ─────────── LOADING ─────────── */
  if (loading) return (
    <>
      <Nav />
      <div style={{ paddingTop: 64, minHeight: "100vh", background: T.bg }}>
        <div style={{ height: "min(340px,52vw)", background: T.card2 }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", display: "flex", gap: 24 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            <Skel w="60%" h={30} br={8} /><Skel w="100%" h={14} /><Skel w="90%" h={14} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 12 }}>
              {[0, 1, 2, 3, 4, 5].map(i => <div key={i} style={{ aspectRatio: "1/1", borderRadius: 12, overflow: "hidden" }}><Skel h="100%" br={0} /></div>)}
            </div>
          </div>
          <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
            <Skel h={180} br={14} /><Skel h={120} br={14} /><Skel h={100} br={14} />
          </div>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Nav />
      <div style={{ paddingTop: 64, minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <Ico d={I.alert} size={44} color={T.textMut} />
        <p style={{ color: T.textSec, fontSize: 14 }}>{error}</p>
        <Btn variant="ghost" onClick={() => navigate(-1)} icon="arrowL">Go Back</Btn>
      </div>
    </>
  );
  if (!resource) return null;

  const cc = catColor(resource?.category);

  /* ─────────── RENDER ─────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.b3};border-radius:4px}
        textarea,input{font-family:'DM Sans',sans-serif!important}
        @keyframes cdFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes cdSkel{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes toastIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
        .cd-fade{animation:cdFadeUp .32s ease both}
        /* RESPONSIVE */
        @media(max-width:860px){
          .cd-layout{flex-direction:column!important}
          .cd-sidebar{width:100%!important;position:static!important}
          .cd-img-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:480px){
          .cd-layout{gap:14px!important}
          .cd-img-grid{grid-template-columns:repeat(2,1fr)!important;gap:7px!important}
          .cd-hero{height:220px!important}
          .cd-info-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <Nav />

      <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 64 }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div className="cd-hero" style={{ position: "relative", height: "min(380px,52vw)", background: T.card2, overflow: "hidden" }}>
          {/* colour glow */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 40%,${cc}20,${T.bg} 70%)` }} />
          {resource.image_url
            ? <img src={resource.image_url} alt={resource.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
              <Ico d={I.camera} size={48} color={T.textMut} />
              <span style={{ fontSize: 12, color: T.textMut }}>No cover photo</span>
              {isOwner && <button onClick={() => setSettingsOpen(true)} style={{ marginTop: 4, background: `${T.gold}14`, border: `1px solid ${T.gold}44`, borderRadius: 8, padding: "6px 16px", cursor: "pointer", color: T.gold, fontSize: 12, fontWeight: 600, fontFamily: "DM Sans,sans-serif" }}>+ Add cover URL in Settings</button>}
            </div>
          }
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${cc},${T.green},transparent)` }} />

          {/* back */}
          <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,.58)", backdropFilter: "blur(10px)", border: `1px solid ${T.b2}`, borderRadius: 10, padding: "7px 14px", cursor: "pointer", color: T.text, display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, fontFamily: "DM Sans,sans-serif" }}>
            <Ico d={I.arrowL} size={14} color={T.text} />Back
          </button>

          {/* owner top-right controls */}
          {isOwner && (
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
              <button onClick={() => setSettingsOpen(true)} style={{ background: "rgba(0,0,0,.58)", backdropFilter: "blur(10px)", border: `1px solid ${T.b2}`, borderRadius: 10, padding: "7px 14px", cursor: "pointer", color: T.text, display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, fontFamily: "DM Sans,sans-serif" }}>
                <Ico d={I.settings} size={14} color={T.gold} />Settings
              </button>
            </div>
          )}
        </div>

        {/* ── CONTENT ──────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div className="cd-layout" style={{ display: "flex", gap: 26, paddingTop: 28, paddingBottom: 60, alignItems: "flex-start" }}>

            {/* ── LEFT: main ── */}
            <div className="cd-fade" style={{ flex: 1, minWidth: 0 }}>

              {/* chips */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <Chip label={resource.category} />
                {isOwner && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, background: `${T.gold}14`, border: `1px solid ${T.gold}30`, padding: "3px 9px", borderRadius: 20 }}>Your Resource</span>
                )}
              </div>

              {/* ── TITLE (inline editable) ── */}
              {editTitle ? (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                  <textarea autoFocus value={draftTitle} onChange={e => setDraftTitle(e.target.value)} rows={2}
                    onKeyDown={e => { if (e.key === "Escape") setEditTitle(false); }}
                    style={{ flex: 1, background: T.card2, border: `1px solid ${T.gold}60`, borderRadius: 10, color: T.text, fontSize: 24, fontWeight: 800, fontFamily: "Syne,sans-serif", padding: "8px 12px", outline: "none", resize: "none", lineHeight: 1.25, maxWidth: '50%' }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Btn variant="primary" onClick={saveTitle} disabled={saving} size="sm">{saving ? "…" : "Save"}</Btn>
                    <Btn variant="subtle" onClick={() => setEditTitle(false)} size="sm">Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text, fontFamily: "Syne,sans-serif", lineHeight: 1.25, flex: 1 }}>{resource.title}</h1>
                  {isOwner && (
                    <button onClick={() => { setDraftTitle(resource.title || ""); setEditTitle(true); }} title="Edit title"
                      style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, padding: "4px", marginTop: 6, borderRadius: 6, flexShrink: 0 }}>
                      <Ico d={I.edit} size={15} color={T.textMut} />
                    </button>
                  )}
                </div>
              )}

              {/* meta row */}
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 22 }}>
                {resource.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: T.textSec }}>
                    <Ico d={I.map} size={13} color={cc} />{resource.location}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: T.textSec }}>
                 <Ico d={I.eye} size={13} color={T.textMut} />{displayViewCount.toLocaleString()} views
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: T.textSec }}>
                  <Ico d={I.heart} size={13} color={T.danger} />{likeCount.toLocaleString()} likes
                </span>
                {resource.created_at && (
                  <span style={{ fontSize: 12, color: T.textMut }}>
                    Added {new Date(resource.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>

              {/* ── DESCRIPTION (inline editable) ── */}
              <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 16, padding: 20, marginBottom: 26, maxWidth: '80%' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1 }}>About this resource</span>
                  {isOwner && !editDesc && (
                    <button onClick={() => { setDraftDesc(resource.description || ""); setEditDesc(true); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, padding: 2 }}>
                      <Ico d={I.edit} size={14} color={T.textMut} />
                    </button>
                  )}
                </div>
                {editDesc ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: '80%' }}>
                    <textarea autoFocus value={draftDesc} onChange={e => setDraftDesc(e.target.value)} rows={5}
                      style={{ maxWidth: "70%", background: T.card2, border: `1px solid ${T.gold}50`, borderRadius: 10, color: T.text, fontSize: 14, padding: "10px 12px", outline: "none", resize: "vertical", fontFamily: "DM Sans,sans-serif", boxSizing: "border-box", lineHeight: 1.7 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="primary" onClick={saveDesc} disabled={saving} size="sm">{saving ? "…" : "Save"}</Btn>
                      <Btn variant="subtle" onClick={() => setEditDesc(false)} size="sm">Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.8, margin: 0 }}>
                    {resource.description || <span style={{ fontStyle: "italic", color: T.textMut }}>No description yet.{isOwner ? " Click the pencil to add one." : ""}</span>}
                  </p>
                )}
              </div>

              {/* ── PHOTO GRID ── */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "Syne,sans-serif" }}>Photos</div>
                    <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{images.length} photo{images.length !== 1 ? "s" : ""}</div>
                  </div>
                  {isOwner && (
                    <Btn variant="ghost" icon="camera" size="sm" onClick={() => setAddPhotoOpen(true)}>Add Photo</Btn>
                  )}
                </div>

                {images.length === 0 && !isOwner ? (
                  <div style={{ textAlign: "center", padding: "36px 20px", background: T.card, border: `1px solid ${T.b1}`, borderRadius: 14 }}>
                    <Ico d={I.camera} size={32} color={T.textMut} />
                    <div style={{ fontSize: 13, color: T.textMut, marginTop: 10 }}>No photos yet</div>
                  </div>
                ) : (
                  <div className="cd-img-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                    }}>
                    {images.map((img, i) => (
                      <ImageTile key={i} img={img} index={i} isOwner={isOwner}
                        onView={idx => setLightboxIdx(idx)}
                        onDelete={handleDeletePhoto}
                        onEditCaption={(img, index) => setEditCaptionData({ img, index })} />
                    ))}
                    {/* ── ADD TILE — always last, owner only ── */}
                    {isOwner && <AddPhotoTile onClick={() => setAddPhotoOpen(true)} />}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="cd-sidebar" style={{ width: 290, flexShrink: 0, position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Action card */}
              <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 16, padding: 18 }}>
                {isOwner ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Manage</div>
                    <Btn variant="ghost" icon="edit" full onClick={() => { setDraftTitle(resource.title || ""); setEditTitle(true); }}>Edit Title</Btn>
                    <Btn variant="ghost" icon="edit" full onClick={() => { setDraftDesc(resource.description || ""); setEditDesc(true); }}>Edit Description</Btn>
                    <Btn variant="dark" icon="camera" full onClick={() => setAddPhotoOpen(true)}>Add Photo</Btn>
                    <div style={{ height: 1, background: T.b1 }} />
                    <Btn variant="primary" icon="settings" full onClick={() => setSettingsOpen(true)}>Resource Settings</Btn>
                    <Btn variant="danger" icon="trash" full onClick={() => setConfirmDelete(true)}>Delete Resource</Btn>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Like button */}
                    <button onClick={handleLike} disabled={liking}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 10, border: `1px solid ${liked ? T.danger + "55" : T.b3}`, background: liked ? `${T.danger}14` : "transparent", cursor: "pointer", fontFamily: "DM Sans,sans-serif", fontWeight: 600, fontSize: 13, color: liked ? T.danger : T.textSec, transition: "all .2s", width: "100%" }}>
                      <Ico d={I.heart} size={15} color={liked ? T.danger : T.textSec} fill={liked ? T.danger : "none"} />
                      {liked ? "Liked" : "Like"} · {likeCount.toLocaleString()}
                    </button>
                    {/* Bookmark */}
                    <button onClick={handleBookmark} disabled={bookmarking}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 10, border: `1px solid ${bookmarked ? T.gold + "55" : T.b3}`, background: bookmarked ? `${T.gold}10` : "transparent", cursor: bookmarking ? "not-allowed" : "pointer", fontFamily: "DM Sans,sans-serif", fontWeight: 600, fontSize: 13, color: bookmarked ? T.gold : T.textSec, transition: "all .2s", width: "100%", opacity: bookmarking ? 0.6 : 1 }}>
                      <Ico d={I.bookmark} size={15} color={bookmarked ? T.gold : T.textSec} fill={bookmarked ? T.gold : "none"} />
                      {bookmarking ? "Saving…" : bookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                    <Btn variant="ghost" icon="share" full onClick={handleShare}>Share</Btn>
                    <Btn variant="green" icon="map" full size="lg">View on Map</Btn>
                    <div style={{ height: 1, background: T.b1 }} />
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, fontSize: 12, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontFamily: "DM Sans,sans-serif" }}>
                      <Ico d={I.flag} size={12} color={T.textMut} />Report this resource
                    </button>
                  </div>
                )}
              </div>

              {/* Location card */}
              {(resource.location || resource.map_location) && (
                <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Location</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cc}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ico d={I.map} size={14} color={cc} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{resource.location}</div>
                      {resource.map_location && <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{resource.map_location}</div>}
                    </div>
                  </div>
                  {/* map placeholder */}
                  <div style={{ borderRadius: 10, height: 110, background: `radial-gradient(circle at 50% 60%,${cc}18,${T.bg})`, border: `1px solid ${T.b1}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                    <Ico d={I.map} size={22} color={T.textMut} /><span style={{ fontSize: 11, color: T.textMut }}>Map preview</span>
                  </div>
                  <Link to="/map" style={{ textDecoration: "none" }}>
                    <Btn variant="subtle" icon="map" size="sm" full style={{ marginTop: 10 }}>Open Full Map</Btn>
                  </Link>
                </div>
              )}

              {/* Author card */}
              {author && (
                <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                    {isOwner ? "Your Profile" : "Posted by"}
                  </div>
                  <Link to={isOwner ? "/profile" : `/User-view?userId=${author.id}`} style={{ textDecoration: "none", display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${T.greenD},${T.goldD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "Syne,sans-serif", flexShrink: 0, border: `2px solid ${T.gold}40`, overflow: "hidden" }}>
                      {author.image
                        ? <img src={author.image} alt={author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (author.name || "?")[0].toUpperCase()
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "Syne,sans-serif" }}>{author.name || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: T.textMut, marginTop: 1 }}>{author.email || ""}</div>
                    </div>
                  </Link>
                  {author.bio && <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6, margin: "0 0 12px" }}>{author.bio}</p>}
                  {!isOwner && (
                    <Link to={`/User-view?userId=${author.id}`} style={{ textDecoration: "none" }}>
                      <Btn variant="subtle" icon="user" size="sm" full>View Profile</Btn>
                    </Link>
                  )}
                </div>
              )}

              {/* Quick stats card */}
              <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Stats</div>
                <div className="cd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { l: "Views", v: displayViewCount.toLocaleString(), c: T.info },
                    { l: "Likes", v: likeCount.toLocaleString(), c: T.danger },
                    { l: "Photos", v: images.length, c: T.green },
                    { l: "Category", v: resource.category || "—", c: cc },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: T.card2, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.b1}` }}>
                      <div style={{ fontSize: 10, color: T.textMut, textTransform: "uppercase", letterSpacing: .8, marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "Syne,sans-serif" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxIdx >= 0 && images.length > 0 && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(-1)} />
      )}

      {/* ── OWNER: Settings drawer ── */}
      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Resource Settings">
        {resource && (
          <SettingsContent
            resource={resource}
            onSave={handleSettingsSave}
            onDelete={() => { setSettingsOpen(false); setConfirmDelete(true); }}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </Drawer>

      {/* ── OWNER: Add photo modal ── */}
      <Modal open={addPhotoOpen} onClose={() => setAddPhotoOpen(false)} title="Add Photo">
        <AddPhotoContent onAdd={handleAddPhoto} onClose={() => setAddPhotoOpen(false)} />
      </Modal>

      {/* ── OWNER: Edit caption modal ── */}
      <Modal open={!!editCaptionData} onClose={() => setEditCaptionData(null)} title="Edit Caption">
        {editCaptionData && (
          <EditCaptionContent
            img={editCaptionData.img}
            onSave={caption => handleSaveCaption(editCaptionData.index, caption)}
            onClose={() => setEditCaptionData(null)}
          />
        )}
      </Modal>

      {/* ── Confirm delete ── */}
      <Confirm
        open={confirmDelete}
        title="Delete Resource?"
        body={`"${resource?.title}" will be permanently removed. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />

      <BottomNav active="" />

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}