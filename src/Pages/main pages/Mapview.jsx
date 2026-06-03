/**
 * Mapview.jsx — Interactive Map Page
 * Route: /map
 *
 * FEATURES:
 *    Leaflet via CDN (no npm needed)
 *  CartoDB Voyager tiles (warm, dark-friendly)
 *   Marker clustering (Leaflet.markercluster)
 *  Resources (gold hexagon) + Events (green circle) markers
 *   Category + type filtering
 *   Card list ↔ map sync (click card → fly to marker, click marker → highlight card)
 *    Google Maps routing button (in card + popup)
 *   User geolocation + distance display
 *   Dark mode — full CRH design system
 *   Mobile responsive (map top / cards bottom)
 *  Debounced search, memoized filtering
 *  Real API: GET /resources + GET /events
 *
 * SETUP:
 *   No extra npm installs — Leaflet loads via CDN.
 *   Make sure Nav.jsx and api.js exist in their usual paths.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import Nav from "../../components/Nav";
import api from "../../api/api";
import BottomNav from "../../components/BottomNav";
import { FaLocationArrow , FaHome,  } from "react-icons/fa";
import { FiMapPin, FiRefreshCw } from "react-icons/fi";

/* ─── Design tokens ───────────────────────────────────────────── */
const T = {
  bg: "#0A0A0A", card: "#111111", card2: "#161616", card3: "#1B1B1B",
  b1: "#1E1E1E", b2: "#2A2A2A", b3: "#303030",
  gold: "#046032", goldL: "#046032", goldD: "#9A7010",
  green: "#3DB070", greenD: "#1A6B3C",
  danger: "#D94F4F", info: "#4A82D4", purple: "#9B6FD4",
  text: "#F2F2F2", text2: "#888888", text3: "#555555",
};

const CAT_COLORS = {
  Education: "#4A82D4", Health: "#3DB070", Technology: "#C9941A",
  Culture: "#9B6FD4", Sports: "#D4724A", Environment: "#5BAF6B",
  Legal: "#AF5B5B", Business: "#D4914A",
};

/* ─── Addis Ababa map config ──────────────────────────────────── */
const AA_CENTER  = [9.02, 38.75];
const AA_BOUNDS  = [[8.85, 38.65], [9.15, 38.90]];
const DEFAULT_ZOOM = 12;

const CATEGORIES = ["All","Education","Health","Technology","Culture","Sports","Environment","Legal","Business"];
const TYPES      = ["All","Resources","Events"];

/* ─── Coordinate parser ───────────────────────────────────────── */
function parseCoords(str) {
  if (!str) return null;
  const clean = str.replace(/[°NSEWnsew]/g, "").trim();
  const parts = clean.split(/[,\s]+/);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return [lat, lng];
    }
  }
  return null;
}

/* ─── Fallback: random within Addis Ababa ─────────────────────── */
function randAA() {
  return [
    parseFloat((8.85 + Math.random() * 0.30).toFixed(5)),
    parseFloat((38.65 + Math.random() * 0.25).toFixed(5)),
  ];
}

/* ─── Haversine distance (km) ─────────────────────────────────── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/* ─── Event status helper ─────────────────────────────────────── */
function eventStatus(ev) {
  const now = new Date();
  const rs = ev.registration_start ? new Date(ev.registration_start) : null;
  const re = ev.registration_end   ? new Date(ev.registration_end)   : null;
  if (rs && now < rs)                       return "upcoming";
  if (rs && re && now >= rs && now <= re)   return "open";
  if (re && now > re)                       return "ended";
  return "upcoming";
}

/* ─── Google Maps routing URL ─────────────────────────────────── */
const routeUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/* ─── Leaflet + MarkerCluster CDN loader (singleton promise) ──── */
let _leafletPromise = null;
function loadLeaflet() {
  if (_leafletPromise) return _leafletPromise;
  _leafletPromise = new Promise(resolve => {
    if (window.L && window.L.markerClusterGroup) { resolve(window.L); return; }

    const addCss = href => {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href;
      document.head.appendChild(l);
    };
    const addScript = (src, cb) => {
      const s = document.createElement("script");
      s.src = src; s.onload = cb;
      document.head.appendChild(s);
    };

    addCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    addCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css");
    addCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css");

    addScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", () => {
      addScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
        () => resolve(window.L));
    });
  });
  return _leafletPromise;
}

/* ─── Custom SVG marker icons ─────────────────────────────────── */
function makeIcon(L, type, color, selected) {
  const s  = selected ? 38 : 28;
  const sw = selected ? 2.5 : 1.5;

 const hexSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 40 40">
    <defs>
      <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.7"/>
      </filter>
    </defs>
    <polygon points="20,2 37,11 37,29 20,38 3,29 3,11"
      fill="${color}" fill-opacity="${selected ? 1 : 0.92}"
      stroke="white" stroke-width="${sw}" filter="url(#sh)"/>
    <circle cx="20" cy="20" r="5.5" fill="white" fill-opacity="0.95"/>
  </svg>`;

const circleSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 40 40">
    <defs>
      <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.7"/>
      </filter>
    </defs>
    <circle cx="20" cy="20" r="17"
      fill="${color}" fill-opacity="${selected ? 1 : 0.92}"
      stroke="white" stroke-width="${sw}" filter="url(#sh)"/>
    <circle cx="20" cy="20" r="5.5" fill="white" fill-opacity="0.95"/>
  </svg>`;

  const html = type === "event" ? circleSvg : hexSvg;
  return L.divIcon({
    html,
    className: "",
    iconSize:   [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor:[0, -(s / 2 + 4)],
  });
}

/* ─── Popup HTML (dark-themed, routing button) ────────────────── */
function popupHtml(item) {
  const isEv  = !!item._isEvent;
  const color = isEv ? T.green : (CAT_COLORS[item.category] || T.gold);
  const stat  = isEv ? eventStatus(item) : null;
  const statC = { upcoming: T.info, open: T.green, ended: T.text3 };

  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:210px;max-width:270px;color:${T.text}">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;flex-wrap:wrap">
        <span style="background:${color}22;color:${color};border:1px solid ${color}44;
          border-radius:4px;padding:2px 8px;font-size:9px;font-weight:700;
          letter-spacing:.8px;text-transform:uppercase">
          ${item.category || (isEv ? "Event" : "Resource")}
        </span>
        ${stat ? `<span style="font-size:9px;font-weight:700;color:${statC[stat]};text-transform:uppercase">● ${stat}</span>` : ""}
      </div>

      <div style="font-size:13px;font-weight:700;line-height:1.3;margin-bottom:5px">${item.title || "—"}</div>

      ${item.location ? `
        <div style="font-size:11px;color:${T.text2};margin-bottom:5px">📍 ${item.location}</div>` : ""}

      ${item.description ? `
        <div style="font-size:11px;color:${T.text3};line-height:1.5;margin-bottom:9px;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          ${item.description}
        </div>` : ""}

      ${isEv && item.event_date ? `
        <div style="font-size:10px;color:${T.text2};margin-bottom:4px">
          📅 ${new Date(item.event_date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
        </div>` : ""}

      ${isEv && item.entry_fee !== undefined ? `
        <div style="font-size:10px;color:${item.entry_fee > 0 ? T.gold : T.green};margin-bottom:9px">
          ${item.entry_fee > 0 ? item.entry_fee + " ETB" : "Free entry"}
        </div>` : ""}

      <a href="${routeUrl(item._lat, item._lng)}" target="_blank" rel="noopener"
        style="display:flex;align-items:center;justify-content:center;gap:5px;
          background:${T.gold};color:#000;border-radius:8px;padding:8px 12px;
          font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;
          width:100%;box-sizing:border-box;margin-bottom:1px">
        🗺 Go for Routing
      </a>
    </div>`;
}

/* ─── Debounce ────────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function Mapview() {
  const navigate = useNavigate();

  /* refs */
  const mapDivRef       = useRef(null);
  const mapRef          = useRef(null);
  const clusterRef      = useRef(null);
  const markersRef      = useRef({});      // { id: L.Marker }
  const cardListRef     = useRef(null);
  const cardEls         = useRef({});

  /* state */
  const [leafletReady,  setLeafletReady]  = useState(false);
  const [resources,     setResources]     = useState([]);
  const [events,        setEvents]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [selectedId,    setSelectedId]    = useState(null);
  const [typeFilter,    setTypeFilter]    = useState("All");
  const [catFilter,     setCatFilter]     = useState("All");
  const [rawSearch,     setRawSearch]     = useState("");
  const [userLoc,       setUserLoc]       = useState(null); // [lat, lng]
  const [mobileTab,     setMobileTab]     = useState("map"); // "map" | "list"
  const searchQuery = useDebounce(rawSearch, 300);

  /* ── Load Leaflet ───────────────────────────────────────────── */
  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true));
  }, []);

  /* ── Geolocation ────────────────────────────────────────────── */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserLoc([p.coords.latitude, p.coords.longitude]),
      () => {},
      { timeout: 6000, maximumAge: 60000 }
    );
  }, []);

  /* ── Fetch data ─────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [rData, eData] = await Promise.all([
          api.get("/resources").then(r => r.data || []),
          api.get("/events").then(r => r.data || []),
        ]);
        if (!alive) return;

        const attach = (arr, isEvent) => arr.map(item => {
          const [lat, lng] = parseCoords(item.map_location) || randAA();
          return { ...item, _lat: lat, _lng: lng, _isEvent: isEvent };
        });

        setResources(attach(rData, false));
        setEvents(attach(eData, true));
      } catch (e) {
        if (alive) setError("Failed to load map data.");
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ── Init Leaflet map ───────────────────────────────────────── */
  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || mapRef.current) return;
    const L = window.L;

    const map = L.map(mapDivRef.current, {
      center: AA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      preferCanvas: true,
      maxBounds: L.latLngBounds(
        L.latLng(AA_BOUNDS[0]),
        L.latLng(AA_BOUNDS[1])
      ).pad(0.5),
    });

    /* CartoDB Voyager tiles — warm, eye-friendly, dark-compatible */
   L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { attribution: "© OpenStreetMap contributors © CARTO", subdomains: "abcd", maxZoom: 19 }
).addTo(map);

    /* Zoom control */
    L.control.zoom({ position: "topright" }).addTo(map);

    /* Marker cluster group */
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 55,
      iconCreateFunction: cg => {
        const n = cg.getChildCount();
        return L.divIcon({
          html: `<div style="background:${T.gold};color:#000;border-radius:50%;width:34px;
            height:34px;display:flex;align-items:center;justify-content:center;
            font-weight:800;font-size:12px;border:2px solid #fff;
            box-shadow:0 2px 10px rgba(0,0,0,.5)">${n}</div>`,
          className: "",
          iconSize: [34, 34],
        });
      },
    });

    map.addLayer(cluster);
    mapRef.current     = map;
    clusterRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current     = null;
      clusterRef.current = null;
    };
  }, [leafletReady]);

  /* ── Filtered items (memoized) ──────────────────────────────── */
  const allItems = useMemo(() => {
    let items = [];
    if (typeFilter !== "Events")    items = [...items, ...resources];
    if (typeFilter !== "Resources") items = [...items, ...events];
    if (catFilter !== "All")
      items = items.filter(i => i.category === catFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.title?.toLowerCase().includes(q)       ||
        i.description?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [resources, events, typeFilter, catFilter, searchQuery]);

  /* ── Add / refresh markers ──────────────────────────────────── */
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !clusterRef.current) return;
    const L = window.L;

    clusterRef.current.clearLayers();
    markersRef.current = {};

    allItems.forEach(item => {
      if (!item._lat || !item._lng) return;
      const isEv   = !!item._isEvent;
      const color  = isEv ? T.green : (CAT_COLORS[item.category] || T.gold);
      const isSel  = item.id === selectedId;

      const marker = L.marker([item._lat, item._lng], {
        icon: makeIcon(L, isEv ? "event" : "resource", color, isSel),
        title: item.title,
      });

      marker.bindPopup(popupHtml(item), {
        className: "crh-popup",
        maxWidth: 300,
        closeButton: true,
        autoPanPadding: [20, 80],
      });

      marker.on("click", () => {
        setSelectedId(item.id);
        scrollCard(item.id);
      });

      clusterRef.current.addLayer(marker);
      markersRef.current[item.id] = marker;
    });
  }, [allItems, leafletReady, selectedId]);

  /* ── Fly to selected ────────────────────────────────────────── */
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const item = allItems.find(i => i.id === selectedId);
    if (!item) return;
    mapRef.current.flyTo([item._lat, item._lng], 15, { animate: true, duration: 0.75 });
    setTimeout(() => markersRef.current[selectedId]?.openPopup(), 800);
  }, [selectedId]);

  /* ── Scroll card into view ──────────────────────────────────── */
  const scrollCard = useCallback(id => {
    cardEls.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  /* ── Invalidate map size on resize ─────────────────────────── */
  useEffect(() => {
    const h = () => setTimeout(() => mapRef.current?.invalidateSize(), 200);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── Fly to user location ───────────────────────────────────── */
  const goToMyLocation = useCallback(() => {
    if (userLoc) {
      mapRef.current?.flyTo(userLoc, 15, { animate: true, duration: 0.8 });
    } else {
      navigator.geolocation?.getCurrentPosition(p => {
        const loc = [p.coords.latitude, p.coords.longitude];
        setUserLoc(loc);
        mapRef.current?.flyTo(loc, 15);
      });
    }
  }, [userLoc]);

  /* ── Reset map view ─────────────────────────────────────────── */
  const resetView = useCallback(() => {
    mapRef.current?.flyTo(AA_CENTER, DEFAULT_ZOOM, { animate: true, duration: 0.8 });
    setSelectedId(null);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        html,body { height:100%; }
        body { background:${T.bg}; color:${T.text}; font-family:'DM Sans',sans-serif; }

        /* ── Leaflet popup dark skin ── */
        .crh-popup .leaflet-popup-content-wrapper {
          background:${T.card2}!important; border:1px solid ${T.b2}!important;
          border-radius:14px!important; box-shadow:0 10px 40px rgba(0,0,0,.7)!important;
          padding:0!important;
        }
        .crh-popup .leaflet-popup-content { margin:14px!important; }
        .crh-popup .leaflet-popup-tip-container { display:none; }
        .crh-popup .leaflet-popup-close-button {
          color:${T.text2}!important; font-size:20px!important; top:6px!important; right:8px!important;
        }
        .crh-popup .leaflet-popup-close-button:hover { color:${T.text}!important; }

        /* ── Cluster ── */
        .marker-cluster-small,.marker-cluster-medium,.marker-cluster-large { background:transparent!important; }
        .marker-cluster-small div,.marker-cluster-medium div,.marker-cluster-large div {
          background:${T.gold}!important; color:#000!important;
        }

        /* ── Map tile dim for dark mode ── */
        .leaflet-tile-pane { filter: contrast(1.03) saturate(1); }


          /* ── Custom Zoom Control ── */
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
            border-radius: 12px !important;
            overflow: hidden;
          }
          .leaflet-control-zoom-in,
          .leaflet-control-zoom-out {
            width: 40px !important;
            height: 40px !important;
            line-height: 40px !important;
            background: #111111 !important;
            color: #046032 !important;
            font-size: 20px !important;
            font-weight: 300 !important;
            border: none !important;
            border-bottom: 1px solid #1E1E1E !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 0.15s, color 0.15s !important;
            font-family: 'DM Sans', sans-serif !important;
          }
          .leaflet-control-zoom-out {
            border-bottom: none !important;
          }
          .leaflet-control-zoom-in:hover,
          .leaflet-control-zoom-out:hover {
            background: #046032 !important;
            color: #000000 !important;
          }


        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:${T.bg}; }
        ::-webkit-scrollbar-thumb { background:${T.b3}; border-radius:2px; }

        /* ── Animations ── */
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes popIn   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }

        .crh-card        { transition:transform .18s, box-shadow .18s, border-color .18s; cursor:pointer; }
        .crh-card:hover  { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.4); }
        .crh-card.sel    { animation:popIn .15s ease; }

        /* ── Responsive ── */
        @media (max-width:768px) {
          .crh-layout   { flex-direction:column!important;padding-bottom:49px; }
          .crh-sidebar  { width:100%!important; height:60vh!important; border-left:none!important; border-top:1px solid ${T.b1}!important; }
          .crh-mapwrap  { height:${`calc(100vh - 64px - 46px - 46vh)`}!important; min-height:240px; }
        }
        @media (min-width:769px) {
          .mobile-only  { display:none!important; }
        }
      `}</style>


      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:T.b1, overflow:"hidden" }}>

        {/* ══ FILTER BAR ══════════════════════════════════════════ */}
        <div style={{ background:T.card, borderBottom:`1px solid ${T.b1}`, padding:"5px 7px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", zIndex:10, flexShrink:0 }}>

          {/* Search */}
          <div style={{ position:"relative", flex:"1 1 180px", maxWidth:260 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"
              style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={rawSearch}
              onChange={e => setRawSearch(e.target.value)}
              placeholder="Search…"
              style={{ width:"100%", background:T.card2, border:`1px solid ${T.b2}`, color:T.text, borderRadius:9, padding:"7px 10px 7px 30px", fontSize:12, outline:"none", fontFamily:"DM Sans,sans-serif" }}
            />
          </div>

          {/* Type chips */}
          <div style={{ display:"flex", gap:4 }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding:"5px 12px", borderRadius:8, fontSize:10, fontWeight:600, cursor:"pointer",
                border:`1px solid ${typeFilter===t ? T.gold : T.b2}`,
                background: typeFilter===t ? `${T.gold}22` : "transparent",
                color: typeFilter===t ? T.gold : T.text2,
                transition:"all .15s", fontFamily:"DM Sans,sans-serif",
              }}>{t}</button>
            ))}
          </div>

          {/* Category chips (scrollable) */}
          <div style={{ display:"flex", gap:4, overflowX:"auto", flex:"1 1 auto" ,
            paddingBottom:4, marginLeft:4, scrollbarWidth:"thin", scrollbarColor:`${T.b2} transparent`
          }}>
            {CATEGORIES.map(c => {
              const col = CAT_COLORS[c] || T.gold;
              const act = catFilter === c;
              return (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  padding:"4px 13px", borderRadius:20, fontSize:7, fontWeight:600, cursor:"pointer", 
                  border:`1px solid ${act ? col : T.b2}`,
                  background: act ? `${col}22` : "transparent",
                  color: act ? col : T.text2,
                  whiteSpace:"nowrap", transition:"all .15s", fontFamily:"DM Sans,sans-serif",
                }}>{c}</button>
              );
            })}
          </div>

          {/* Reset + count */}
          <div style={{ display:"flex", gap:8, alignItems:"center", marginLeft:"auto" }}>
            <button onClick={resetView} style={{ background:"transparent", border:`1px solid ${T.b2}`, borderRadius:8, padding:"5px 10px", color:T.text2, fontSize:11, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
              Reset
            </button>
            <span style={{ fontSize:11, color:T.text3, whiteSpace:"nowrap" }}>
              {allItems.length} locations
            </span>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="mobile-only" style={{ display:"flex", background:T.card2, borderBottom:`1px solid ${T.b1}`, flexShrink:0 }}>
          {["map","list"].map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)} style={{
              flex:1, padding:"10px 0", background:"transparent",
              border:"none", borderBottom:`2px solid ${mobileTab===tab ? T.gold : "transparent"}`,
              color: mobileTab===tab ? T.gold : T.text2,
              fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans,sans-serif",
            }}>
              {tab === "map" ? " Map" : " List"}
            </button>
          ))}
        </div>

        {/* ══ MAIN LAYOUT ═════════════════════════════════════════ */}
        <div className="crh-layout" style={{ display:"flex", flex:1, overflow:"hidden" }}>

          {/* ── MAP ─────────────────────────────────────────────── */}
          <div className="crh-mapwrap"
            style={{
              flex:1, position:"relative", overflow:"hidden",
              display: mobileTab === "list" ? "none" : "block",
            }}>
            <div ref={mapDivRef} style={{ width:"100%", height:"100%" }} />

            {/* Loading overlay */}
            {loading && (
              <div style={{ position:"absolute", inset:0, background:`${T.bg}dd`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, zIndex:500 }}>
                <div style={{ width:40, height:40, border:`3px solid ${T.b2}`, borderTop:`3px solid ${T.gold}`, borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
                <div style={{ fontSize:13, color:T.text2 }}>Loading map data…</div>
              </div>
            )}

            {/* Error overlay */}
            {error && (
              <div style={{ position:"absolute", inset:0, background:`${T.bg}dd`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, zIndex:500 }}>
                <div style={{ fontSize:14, color:T.danger }}>{error}</div>
                <button onClick={() => window.location.reload()} style={{ background:T.gold, color:"#000", border:"none", borderRadius:8, padding:"8px 22px", fontWeight:700, cursor:"pointer" }}>
                  Retry
                </button>
              </div>
            )}

            {/* My Location button */}
            <button onClick={goToMyLocation} title="My location" style={{
              position:"absolute", bottom:80, right:10, zIndex:400,
              background:T.card, border:`1px solid ${T.b2}`, borderRadius:10,
              width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", boxShadow:"0 2px 10px rgba(0,0,0,.4)", fontSize:18,
            }}> <FiMapPin color="#046032" /></button>

            {/* Reset view button */}
            <button onClick={resetView} title="Reset view" style={{
              position:"absolute", bottom:34, right:10, zIndex:400,
              background:T.card, border:`1px solid ${T.b2}`, borderRadius:10,
              width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", boxShadow:"0 2px 10px rgba(0,0,0,.4)", fontSize:16,
            }}><FiRefreshCw color="#046032" /></button>

            {/* Legend */}
            <div style={{
              position:"absolute", bottom:16, left:12, zIndex:400,
              background:`${T.card}ee`, border:`1px solid ${T.b2}`, borderRadius:10,
              padding:"8px 12px", display:"flex", gap:14,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <svg width="14" height="14" viewBox="0 0 40 40"><polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill={T.gold} stroke="white" strokeWidth="1.5"/></svg>
                <span style={{ fontSize:10, color:T.text2 }}>Resource</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <svg width="14" height="14" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill={T.green} stroke="white" strokeWidth="1.5"/></svg>
                <span style={{ fontSize:10, color:T.text2 }}>Event</span>
              </div>
            </div>
          </div>

          {/* ── CARD SIDEBAR ────────────────────────────────────── */}
          <div className="crh-sidebar"
            style={{
              width:330, background:T.card, borderLeft:`1px solid ${T.b1}`,
              display: mobileTab === "map" ? "none" : "flex",
              flexDirection:"column", overflow:"hidden", flexShrink:0,
            }}
            /* Override display:none on desktop */
            ref={el => { if (el && window.innerWidth >= 769) el.style.display = "flex"; }}
          >
            {/* Sidebar header */}
            <div style={{ padding:"13px 14px", borderBottom:`1px solid ${T.b1}`, flexShrink:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.text }}>
                {allItems.length > 0 ? `${allItems.length} Locations Found` : "No Locations"}
              </div>
              <div style={{ fontSize:10, color:T.text2, marginTop:2 }}>
                Click a card to fly to it on the map
              </div>
            </div>

            {/* Cards */}
            <div ref={cardListRef} style={{ flex:1, overflowY:"auto", padding:"8px 8px" }}>
              {!loading && allItems.length === 0 && (
                <div style={{ textAlign:"center", padding:"48px 20px", color:T.text3 }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🗺</div>
                  <div style={{ fontSize:13 }}>No locations match your filters</div>
                  <button onClick={() => { setTypeFilter("All"); setCatFilter("All"); setRawSearch(""); }}
                    style={{ marginTop:14, background:T.gold, color:"#000", border:"none", borderRadius:8, padding:"7px 18px", fontWeight:700, cursor:"pointer", fontSize:12 }}>
                    Clear Filters
                  </button>
                </div>
              )}

              {allItems.map(item => (
                <MapCard
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  userLoc={userLoc}
                  elRef={el => { if (el) cardEls.current[item.id] = el; }}
                  onSelect={() => {
                    setSelectedId(item.id);
                    if (window.innerWidth < 769) setMobileTab("map");
                  }}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />

    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAP CARD
══════════════════════════════════════════════════════════════════ */
function MapCard({ item, selected, userLoc, elRef, onSelect, navigate }) {
  const isEv  = !!item._isEvent;
  const color = isEv ? T.green : (CAT_COLORS[item.category] || T.gold);
  const stat  = isEv ? eventStatus(item) : null;
  const statC = { upcoming: T.info, open: T.green, ended: T.text3 };
  const dist  = userLoc ? haversine(userLoc[0], userLoc[1], item._lat, item._lng) : null;

  return (
    <div
      ref={elRef}
      className={`crh-card${selected ? " sel" : ""}`}
      onClick={onSelect}
      style={{
        background:   selected ? `${color}0E` : T.card2,
        border:       `1px solid ${selected ? color : T.b1}`,
        borderRadius: 12,
        padding:      13,
        marginBottom: 7,
        animation:    "fadeUp .18s ease both",
      }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", flex:1 }}>
          <span style={{
            background:`${color}22`, color, border:`1px solid ${color}44`,
            borderRadius:4, padding:"2px 7px", fontSize:9, fontWeight:700,
            letterSpacing:".8px", textTransform:"uppercase",
          }}>
            {item.category || (isEv ? "Event" : "Resource")}
          </span>
          {stat && (
            <span style={{ fontSize:9, fontWeight:700, color:statC[stat], textTransform:"uppercase", letterSpacing:".5px" }}>
              ● {stat}
            </span>
          )}
        </div>
        {dist !== null && (
          <span style={{ fontSize:10, color:T.text3, flexShrink:0, marginLeft:6 }}>
            {fmtDist(dist)}
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.3, marginBottom:4 }}>
        {item.title}
      </div>

      {/* Location */}
      {item.location && (
        <div style={{ fontSize:11, color:T.text2, marginBottom:5, display:"flex", alignItems:"center", gap:4 }}>
          <span>📍</span> {item.location}
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div style={{
          fontSize:11, color:T.text3, lineHeight:1.5, marginBottom:9,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {item.description}
        </div>
      )}

      {/* Event meta */}
      {isEv && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", fontSize:10, color:T.text2, marginBottom:8 }}>
          {item.event_date && (
            <span>📅 {new Date(item.event_date).toLocaleDateString("en-GB",{ day:"numeric", month:"short", year:"numeric" })}</span>
          )}
          {item.capacity && (
            <span>👥 {item.registrations || 0}/{item.capacity}</span>
          )}
          {item.entry_fee !== undefined && (
            <span style={{ color: item.entry_fee > 0 ? T.gold : T.green }}>
              {item.entry_fee > 0 ? `${item.entry_fee} ETB` : "Free"}
            </span>
          )}
        </div>
      )}

      {/* Resource likes/views */}
      {!isEv && (
        <div style={{ display:"flex", gap:10, fontSize:10, color:T.text3, marginBottom:8 }}>
          {item.view_count  !== undefined && <span>👁 {item.view_count}</span>}
          {item.like_count  !== undefined && <span>❤ {item.like_count}</span>}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:"flex", gap:6 }}>
        {/* Routing */}
        <a
          href={routeUrl(item._lat, item._lng)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            background:T.gold, color:"#000", borderRadius:8, padding:"7px 10px",
            fontSize:11, fontWeight:700, textDecoration:"none", transition:"background .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.goldL}
          onMouseLeave={e => e.currentTarget.style.background = T.gold}
        >
          🗺 Go for Routing
        </a>

        {/* View detail */}
        <button
          onClick={e => {
            e.stopPropagation();
            navigate(isEv ? `/events/${item.id}` : `/resources/${item.id}`);
          }}
          style={{
            padding:"7px 12px", borderRadius:8, background:"transparent",
            border:`1px solid ${T.b2}`, color:T.text2, fontSize:11, fontWeight:600,
            cursor:"pointer", fontFamily:"DM Sans,sans-serif", transition:"all .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.b2;  e.currentTarget.style.color = T.text2; }}
        >
          View
        </button>
      </div>

    </div>

  );
}