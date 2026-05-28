/**
 * Nav.jsx — CRH / Addis HUB main navigation
 * Appears on every page via App.jsx layout or per-page import.
 *
 * Features:
 *  - Logo (Logo.jsx)
 *  - Desktop links: Home · Resources · Events · Map
 *  - Auth-aware: shows Login/Sign Up or avatar + dropdown when logged in
 *  - Admin badge when role === 'admin'
 *  - Mobile hamburger with full-screen drawer
 *  - Scroll-aware: slight glass blur after 20px scroll
 *  - Active link highlight based on current path
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import Logo from "./Logo";
import "./Nav.css";

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",      path: "/" },
  { label: "Resources", path: "/resources" },
  { label: "Events",    path: "/resources?tab=events" },
  { label: "Map",       path: "/map" },
];

// ─── Icon primitives ──────────────────────────────────────────────────────────
const Ico = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  menu:    "M3 12h18M3 6h18M3 18h18",
  close:   "M18 6L6 18M6 6l12 12",
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chevron: "M6 9l6 6 6-6",
};

// ─── User avatar ──────────────────────────────────────────────────────────────
function Avatar({ user, size = 34 }) {
  const initials = (user?.name || user?.email || "U")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="nav-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {user?.image
        ? <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        : initials
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Nav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const user      = useSelector(s => s.auth.user);
  const isLoggedIn = !!user;
  const isAdmin    = user?.role === "admin";

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className={`crh-nav${scrolled ? " crh-nav--scrolled" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="crh-nav__inner">

          {/* ── Logo ── */}
          <Link to="/" className="crh-nav__logo" aria-label="Addis HUB — Home">
            <Logo variant="nav" />
          </Link>

          {/* ── Desktop links ── */}
          <ul className="crh-nav__links" role="list">
            {NAV_LINKS.map(({ label, path }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`crh-nav__link${isActive(path) ? " crh-nav__link--active" : ""}`}
                >
                  {label}
                  {isActive(path) && <span className="crh-nav__dot" aria-hidden="true" />}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link to="/admin" className={`crh-nav__link crh-nav__link--admin${isActive("/admin") ? " crh-nav__link--active" : ""}`}>
                  <Ico d={ICONS.shield} size={13} />
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* ── Desktop auth ── */}
          <div className="crh-nav__auth">
            {isLoggedIn ? (
              <div className="crh-nav__user-menu" ref={dropRef}>
                <button
                  className={`crh-nav__user-btn${dropOpen ? " crh-nav__user-btn--open" : ""}`}
                  onClick={() => setDropOpen(p => !p)}
                  aria-haspopup="true"
                  aria-expanded={dropOpen}
                >
                  <Avatar user={user} />
                  <span className="crh-nav__user-name">{user?.name?.split(" ")[0] || "Profile"}</span>
                  <span className={`crh-nav__chevron${dropOpen ? " crh-nav__chevron--up" : ""}`}>
                    <Ico d={ICONS.chevron} size={14} />
                  </span>
                </button>

                {/* Dropdown */}
                <div className={`crh-nav__dropdown${dropOpen ? " crh-nav__dropdown--open" : ""}`} role="menu">
                  {/* User info header */}
                  <div className="crh-nav__drop-header">
                    <Avatar user={user} size={40} />
                    <div>
                      <div className="crh-nav__drop-name">{user?.name || "User"}</div>
                      <div className="crh-nav__drop-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="crh-nav__drop-divider" />
                  <Link to="/profile" className="crh-nav__drop-item" role="menuitem" onClick={() => setDropOpen(false)}>
                    <Ico d={ICONS.user} size={15} />
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="crh-nav__drop-item crh-nav__drop-item--admin" role="menuitem" onClick={() => setDropOpen(false)}>
                      <Ico d={ICONS.shield} size={15} />
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="crh-nav__drop-divider" />
                  <button className="crh-nav__drop-item crh-nav__drop-item--danger" role="menuitem" onClick={handleLogout}>
                    <Ico d={ICONS.logout} size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="crh-nav__auth-btns">
                <Link to="/login" className="crh-nav__btn crh-nav__btn--ghost">Log In</Link>
                <Link to="/signup" className="crh-nav__btn crh-nav__btn--primary">Sign Up</Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className={`crh-nav__hamburger${mobileOpen ? " crh-nav__hamburger--open" : ""}`}
            onClick={() => setMobileOpen(p => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <Ico d={mobileOpen ? ICONS.close : ICONS.menu} size={22} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <>
        {/* Backdrop */}
        <div
          className={`crh-nav__backdrop${mobileOpen ? " crh-nav__backdrop--open" : ""}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div className={`crh-nav__drawer${mobileOpen ? " crh-nav__drawer--open" : ""}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">

          {/* Drawer header */}
          <div className="crh-nav__drawer-header">
            <Logo variant="nav" style={{ width: 130, height: 34 }} />
            <button className="crh-nav__drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <Ico d={ICONS.close} size={20} />
            </button>
          </div>

          {/* Drawer user card */}
          {isLoggedIn && (
            <div className="crh-nav__drawer-user">
              <Avatar user={user} size={44} />
              <div>
                <div className="crh-nav__drawer-user-name">{user?.name || "User"}</div>
                <div className="crh-nav__drawer-user-email">{user?.email}</div>
              </div>
              {isAdmin && <span className="crh-nav__admin-badge">Admin</span>}
            </div>
          )}

          {/* Drawer links */}
          <ul className="crh-nav__drawer-links" role="list">
            {NAV_LINKS.map(({ label, path }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`crh-nav__drawer-link${isActive(path) ? " crh-nav__drawer-link--active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            {isLoggedIn && (
              <li>
                <Link to="/profile" className="crh-nav__drawer-link" onClick={() => setMobileOpen(false)}>
                  My Profile
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="/admin" className="crh-nav__drawer-link crh-nav__drawer-link--admin" onClick={() => setMobileOpen(false)}>
                  <Ico d={ICONS.shield} size={15} />
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Drawer auth */}
          <div className="crh-nav__drawer-footer">
            {isLoggedIn ? (
              <button className="crh-nav__btn crh-nav__btn--danger-full" onClick={handleLogout}>
                <Ico d={ICONS.logout} size={16} />
                Sign Out
              </button>
            ) : (
              <div className="crh-nav__drawer-auth-btns">
                <Link to="/login" className="crh-nav__btn crh-nav__btn--ghost-full" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link to="/signup" className="crh-nav__btn crh-nav__btn--primary-full" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    </>
  );
}
