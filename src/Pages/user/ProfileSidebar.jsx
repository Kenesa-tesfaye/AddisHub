/**
 * ProfileSidebar.jsx — Fully Responsive
 * 
 * Desktop: Sticky sidebar (220px)
 * Tablet: Sticky sidebar narrower (200px)
 * Mobile: Drawer with hamburger toggle button
 */

import { useState, useEffect } from "react";
import "./sidebar-responsive.css";

/* ─── Icon ──────────────────────────────────────────────────── */
const Icon = ({ d, size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  tag       : "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  calendar  : ["M3 9h18","M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z","M8 3v4","M16 3v4"],
  chart     : "M18 20V10M12 20V4M6 20v-6",
  plus      : "M12 5v14M5 12h14",
  lock      : ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  bell      : "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  check     : "M20 6L9 17l-5-5",
  alert     : ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  star      : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  menu      : "M3 6h18 M3 12h18 M3 18h18",
  close     : "M18 6L6 18M6 6l12 12",
};

/* ─── Theme ──────────────────────────────────────────────────── */
const T = {
  bg      : "#0A0A0A",
  card    : "#111111",
  card2   : "#161616",
  border  : "#1E1E1E",
  border2 : "#2A2A2A",
  gold    : "#C9941A",
  goldH   : "#E0A820",
  green   : "#3DB070",
  text    : "#FFFFFF",
  textSec : "#888888",
  textMut : "#555555",
};

/* ─── Sidebar Item ───────────────────────────────────────────── */
function SideItem({ icon, label, active, onClick, badge }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      className={`pf-sidebar-item ${active ? "active" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "fl",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: active ? `${T.gold}14` : hov ? `${T.border}66` : "transparent",
        color: active ? T.gold : hov ? T.text : T.textSec,
        transition: "all .15s",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <Icon d={IC[icon]} size={16} color={active ? T.gold : hov ? T.text : T.textSec} />
      <span className="pf-sidebar-item-label" style={{ flex: 1 }}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="pf-sidebar-item-badge"
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#000",
            background: T.gold,
            borderRadius: 10,
            padding: "1px 7px",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE PROFILE SIDEBAR COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProfileSidebar({
  activeSection,
  setActiveSection,
  settingsSub,
  setSettingsSub,
  resourceCount = 0,
  eventCount = 0,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* ── Detect mobile ── */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Lock body scroll when sidebar is open ── */
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("sidebar-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    };
  }, [isMobile, sidebarOpen]);

  /* ── Content sections ── */
  const SECTIONS = [
    { id: "resources", icon: "tag", label: "My Resources", badge: resourceCount },
    { id: "events", icon: "calendar", label: "My Events", badge: eventCount },
    { id: "analytics", icon: "chart", label: "Analytics" },
    { id: "add-resource", icon: "plus", label: "Add Resource" },
    { id: "add-event", icon: "star", label: "Add Event" },
  ];

  /* ── Account settings ── */
  const SETTINGS = [
    { id: "security", icon: "lock", label: "Password & Security" },
    { id: "notifications", icon: "bell", label: "Notifications" },
    { id: "setup", icon: "check", label: "Account Setup" },
    { id: "danger", icon: "alert", label: "Danger Zone" },
  ];

  /* ── Handle section click ── */
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile) setSidebarOpen(false);
  };

  /* ── Handle settings click ── */
  const handleSettingsClick = (settingId) => {
    setActiveSection("settings");
    setSettingsSub(settingId);
    if (isMobile) setSidebarOpen(false);
  };

  /* ── Close sidebar on Escape ── */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobile, sidebarOpen]);

  return (
    <>
      {/* ── Mobile Overlay ── */}
      {isMobile && (
        <div
          className={`pf-sidebar-overlay ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`pf-sidebar ${sidebarOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Profile navigation"
      >
        {/* ── Mobile Header ── */}
        {isMobile && (
          <div className="pf-sidebar-header">
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "Syne, sans-serif" }}>
              Menu
            </span>
            <button
              className="pf-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              title="Close"
            >
              <Icon d={IC.close} size={18} color={T.textSec} />
            </button>
          </div>
        )}

        {/* ── Content Section ── */}
        <div className="pf-sidebar-section" style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}` }}>
          <div className="pf-sidebar-label">Content</div>
          {SECTIONS.map((s) => (
            <SideItem
              key={s.id}
              icon={s.icon}
              label={s.label}
              badge={s.badge}
              active={activeSection === s.id && s.id !== "add-resource" && s.id !== "add-event"}
              onClick={() => handleSectionClick(s.id)}
            />
          ))}
        </div>

        {/* ── Account Section ── */}
        <div className="pf-sidebar-section" style={{ padding: "12px 10px" }}>
          <div className="pf-sidebar-label">Account</div>
          {SETTINGS.map((s) => (
            <SideItem
              key={s.id}
              icon={s.icon}
              label={s.label}
              active={activeSection === "settings" && settingsSub === s.id}
              onClick={() => handleSettingsClick(s.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Mobile Hamburger Button ── */}
      {isMobile && (
        <button
          className="pf-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          title="Menu"
        >
          <Icon d={sidebarOpen ? IC.close : IC.menu} size={24} color="#000" />
        </button>
      )}
    </>
  );
}

