/**
 * Landing.jsx — CRH / Addis HUB First-time visitor landing page
 * Route: / (or /welcome)
 *
 * 6 full-screen slides:
 *  0 · Welcome        — Hero intro + animated logo
 *  1 · Resources      — Discover community resources
 *  2 · Events         — Join and attend events
 *  3 · Contribute     — Share what you know
 *  4 · Founder        — Legacy, ambition, vision
 *  5 · Join           — CTA → /signup
 *
 * Navigation:
 *  · Next / Back buttons
 *  · Dot indicators
 *  · Keyboard ← →
 *  · Touch / swipe (mobile)
 *  · Skip → /signup at any time
 *  · Progress bar at top
 *
 * If user is already logged in → redirect to /resources
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import Logo from "../../components/Logo";

/* ─── tokens ──────────────────────────────────────────────────── */
const C = {
    bg: "#060606",
    s1bg: "#090c07",   // slide 1
    s2bg: "#070d0f",   // slide 2
    s3bg: "#09110ce8",   // slide 3
    s4bg: "#0d1412ec",   // slide 4
    s5bg: "#140f0bd7",   // slide 5 (founder)
    s6bg: "#040705",   // slide 6 (cta)
    card: "#111",
    b1: "#1A1A1A",
    b2: "#252525",
    gold: "#046032",
    goldL: "#0da157",
    goldD: "#046032",
    green: "#3DB070",
    greenD: "#1A6B3C",
    text: "#F0F0F0",
    textSec: "#858585",
    textMut: "#444",
    danger: "#99d94f",
    info: "#38815d",
};

/* ─── icons ───────────────────────────────────────────────────── */
const Ico = ({ d, size = 20, color = "currentColor", fill = "none", style: s = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24"
        fill={fill} stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" style={s}>
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const I = {
    arrowR: "M5 12h14M12 5l7 7-7 7",
    arrowL: "M19 12H5M12 5l-7 7 7 7",
    skip: "M5 12h14M15 7l5 5-5 5M3 7l5 5-5 5",
    map: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
    calendar: ["M3 9h18", "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z", "M8 3v4", "M16 3v4"],
    users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    check: "M20 6L9 17l-5-5",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    plus: "M12 5v14M5 12h14",
    quote: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
};

/* ─── Illustration components (bespoke SVGs per slide) ─────────── */

/* Slide 0 — Addis city skyline + hex network */
function IllustrationWelcome() {
    return (
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 480, height: "auto" }}>
            <defs>
                <radialGradient id="wglow" cx="50%" cy="60%" r="55%">
                    <stop offset="0%" stopColor={C.gold} stopOpacity=".18" />
                    <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="wglowG" cx="50%" cy="60%" r="45%">
                    <stop offset="0%" stopColor={C.green} stopOpacity=".1" />
                    <stop offset="100%" stopColor={C.green} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="480" height="340" fill="url(#wglow)" />
            <rect width="480" height="340" fill="url(#wglowG)" />

            {/* Hex grid background */}
            {[0, 1, 2, 3, 4, 5, 6].map(row => [0, 1, 2, 3, 4, 5].map(col => {
                const x = col * 80 + (row % 2) * 40;
                const y = row * 46 - 30;
                return (
                    <polygon key={`${row}-${col}`}
                        points={`${x + 40},${y + 2} ${x + 76},${y + 22} ${x + 76},${y + 62} ${x + 40},${y + 82} ${x + 4},${y + 62} ${x + 4},${y + 22}`}
                        fill="none" stroke={C.gold} strokeWidth=".5" opacity=".12" />
                );
            }))}

            {/* City silhouette */}
            <g opacity=".9">
                {/* Background buildings */}
                <rect x="20" y="200" width="28" height="100" fill="#0E1A12" stroke={C.greenD} strokeWidth=".8" />
                <rect x="52" y="175" width="22" height="125" fill="#0D1810" stroke={C.greenD} strokeWidth=".8" />
                <rect x="78" y="210" width="18" height="90" fill="#0C1A11" stroke={C.greenD} strokeWidth=".8" />
                <rect x="100" y="185" width="32" height="115" fill="#0E1C12" stroke={C.greenD} strokeWidth=".8" />
                <rect x="136" y="165" width="25" height="135" fill="#0D1B10" stroke={C.greenD} strokeWidth=".8" />
                <rect x="340" y="190" width="30" height="110" fill="#0E1A12" stroke={C.greenD} strokeWidth=".8" />
                <rect x="374" y="170" width="24" height="130" fill="#0D1810" stroke={C.greenD} strokeWidth=".8" />
                <rect x="402" y="200" width="36" height="100" fill="#0E1C12" stroke={C.greenD} strokeWidth=".8" />
                <rect x="442" y="180" width="20" height="120" fill="#0D1B10" stroke={C.greenD} strokeWidth=".8" />

                {/* Main tall buildings */}
                <rect x="170" y="130" width="40" height="170" fill="#102014" stroke={C.green} strokeWidth="1" opacity=".9" />
                <rect x="214" y="90" width="52" height="210" fill="#0F1E12" stroke={C.green} strokeWidth="1.2" />
                <rect x="270" y="120" width="44" height="180" fill="#102014" stroke={C.green} strokeWidth="1" opacity=".9" />
                <rect x="318" y="155" width="30" height="145" fill="#0E1C12" stroke={C.greenD} strokeWidth=".8" />

                {/* Tower spire */}
                <polygon points="240,50 245,90 235,90" fill={C.gold} opacity=".9" />
                <line x1="240" y1="50" x2="240" y2="90" stroke={C.gold} strokeWidth="2" />

                {/* Windows */}
                {[170, 214, 270].map((bx, bi) => {
                    const bw = [40, 52, 44][bi];
                    return [0, 1, 2, 3, 4].map(row => [0, 1, 2].map(col => (
                        <rect key={`w${bi}${row}${col}`}
                            x={bx + 6 + col * (bw / 3)} y={140 + row * 22} width={8} height={12}
                            fill={Math.random() > .4 ? C.gold : "transparent"} opacity=".5" rx="1" />
                    )))
                })}

                {/* Ground line */}
                <line x1="0" y1="300" x2="480" y2="300" stroke={C.greenD} strokeWidth="1.5" opacity=".6" />
            </g>

            {/* Network nodes */}
            {[
                { x: 100, y: 120 }, { x: 200, y: 80 }, { x: 300, y: 110 }, { x: 380, y: 90 },
                { x: 60, y: 160 }, { x: 160, y: 60 }, { x: 420, y: 130 }, { x: 240, y: 40 },
            ].map((n, i) => (
                <g key={i}>
                    <circle cx={n.x} cy={n.y} r={4} fill={C.gold} opacity=".7" />
                    <circle cx={n.x} cy={n.y} r={10} fill="none" stroke={C.gold} strokeWidth=".8" opacity=".3" />
                </g>
            ))}
            {/* Network lines */}
            {[[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [3, 6], [1, 7], [2, 7]].map(([a, b], i) => {
                const pts = [{ x: 100, y: 120 }, { x: 200, y: 80 }, { x: 300, y: 110 }, { x: 380, y: 90 }, { x: 60, y: 160 }, { x: 160, y: 60 }, { x: 420, y: 130 }, { x: 240, y: 40 }];
                return <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke={C.gold} strokeWidth=".6" opacity=".25" />;
            })}

            {/* Central glow ring */}
            <circle cx="240" cy="200" r="80" fill="none" stroke={C.gold} strokeWidth=".8" opacity=".15" />
            <circle cx="240" cy="200" r="120" fill="none" stroke={C.gold} strokeWidth=".5" opacity=".08" />

            {/* Map pin */}
            <g transform="translate(220,140)">
                <path d="M20 0 C31 0 40 9 40 20 C40 34 20 55 20 55 C20 55 0 34 0 20 C0 9 9 0 20 0z" fill={C.gold} opacity=".9" />
                <circle cx="20" cy="20" r="9" fill={C.s1bg} />
                <circle cx="20" cy="20" r="5" fill={C.gold} />
            </g>
        </svg>
    );
}

/* Slide 1 — Resources: floating cards with map pins */
function IllustrationResources() {
    return (
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 480, height: "auto" }}>
            <defs>
                <radialGradient id="rglow" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor={C.info} stopOpacity=".12" />
                    <stop offset="100%" stopColor={C.info} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="480" height="340" fill="url(#rglow)" />

            {/* Map grid */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <line key={`h${i}`} x1="0" y1={i * 44} x2="480" y2={i * 44} stroke={C.info} strokeWidth=".4" opacity=".08" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <line key={`v${i}`} x1={i * 48} y1="0" x2={i * 48} y2="340" stroke={C.info} strokeWidth=".4" opacity=".08" />
            ))}

            {/* Map roads */}
            <path d="M0 170 Q120 150 240 170 Q360 190 480 170" stroke={C.info} strokeWidth="2" opacity=".15" fill="none" />
            <path d="M240 0 Q230 80 240 170 Q250 260 240 340" stroke={C.info} strokeWidth="2" opacity=".15" fill="none" />

            {/* Resource cards */}
            {[
                { x: 40, y: 60, cat: "Health", color: C.green, icon: "H", title: "Kirkos Health Center", delay: 0 },
                { x: 260, y: 40, cat: "Education", color: C.info, icon: "E", title: "Bole Public Library", delay: 0.15 },
                { x: 140, y: 200, cat: "Tech", color: C.gold, icon: "T", title: "Youth Makerspace", delay: 0.3 },
                { x: 330, y: 185, cat: "Sports", color: "#D4724A", icon: "S", title: "Meskel Square Park", delay: 0.45 },
                { x: 60, y: 265, cat: "Culture", color: "#9B6FD4", icon: "C", title: "National Museum", delay: 0.6 },
                { x: 360, y: 270, cat: "Legal", color: "#AF5B5B", icon: "L", title: "Youth Legal Aid", delay: 0.75 },
            ].map(({ x, y, cat, color, icon, title, delay }) => (
                <g key={title} style={{ animation: `cardFloat 3s ${delay}s ease-in-out infinite alternate` }}>
                    <rect x={x} y={y} width={120} height={56} rx="10" fill={C.card} stroke={color} strokeWidth="1" opacity=".95" />
                    <rect x={x} y={y} width={4} height={56} rx="2" fill={color} />
                    <rect x={x + 12} y={y + 10} width={20} height={20} rx="6" fill={`${color}22`} />
                    <text x={x + 22} y={y + 24} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{icon}</text>
                    <text x={x + 40} y={y + 22} fill={C.textSec} fontSize="8" fontWeight="600" letterSpacing=".8" textTransform="uppercase">{cat}</text>
                    <text x={x + 40} y={y + 36} fill={C.text} fontSize="10" fontWeight="600">{title.length > 16 ? title.slice(0, 15) + "…" : title}</text>
                    {/* Pin */}
                    <circle cx={x + 60} cy={y - 10} r="5" fill={color} opacity=".9" />
                    <line x1={x + 60} y1={y - 5} x2={x + 60} y2={y} stroke={color} strokeWidth="1.5" opacity=".6" />
                </g>
            ))}

            {/* Central location pulse */}
            <circle cx="240" cy="170" r="8" fill={C.gold} />
            <circle cx="240" cy="170" r="18" fill="none" stroke={C.gold} strokeWidth="2" opacity=".4" />
            <circle cx="240" cy="170" r="32" fill="none" stroke={C.gold} strokeWidth="1" opacity=".2" />
            <circle cx="240" cy="170" r="48" fill="none" stroke={C.gold} strokeWidth=".8" opacity=".1" />

            {/* Connection lines */}
            {[[100, 88], [320, 68], [200, 228], [390, 213], [120, 293], [420, 298]].map(([px, py], i) => (
                <line key={i} x1="240" y1="170" x2={px} y2={py} stroke={C.gold} strokeWidth=".8" opacity=".2" strokeDasharray="4,4" />
            ))}
        </svg>
    );
}

/* Slide 2 — Events: calendar + crowd */
function IllustrationEvents() {
    return (
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 480, height: "auto" }}>
            <defs>
                <radialGradient id="eglow" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor={C.green} stopOpacity=".15" />
                    <stop offset="100%" stopColor={C.green} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="480" height="340" fill="url(#eglow)" />

            {/* Stage / venue */}
            <ellipse cx="240" cy="290" rx="200" ry="30" fill={C.greenD} opacity=".25" />
            <rect x="140" y="200" width="200" height="90" rx="4" fill="#0F1E12" stroke={C.green} strokeWidth="1.5" />
            <rect x="155" y="215" width="170" height="60" rx="2" fill={C.greenD} opacity=".3" />
            {/* Stage lights */}
            {[170, 240, 310].map((lx, i) => (
                <g key={i}>
                    <circle cx={lx} cy="212" r="5" fill={C.gold} opacity=".9" />
                    <path d={`M${lx} 215 L${lx - 20} 270 L${lx + 20} 270z`} fill={C.gold} opacity=".06" />
                </g>
            ))}
            {/* Screen */}
            <rect x="175" y="220" width="130" height="50" rx="3" fill="#1A3020" />
            <text x="240" y="240" textAnchor="middle" fill={C.green} fontSize="10" fontWeight="700" opacity=".8">ADDIS TECH</text>
            <text x="240" y="255" textAnchor="middle" fill={C.gold} fontSize="8" opacity=".7">SUMMIT 2026</text>

            {/* Crowd silhouettes */}
            {[
                { x: 90, h: 55, w: 20, c: "#0E1E10" },
                { x: 115, h: 65, w: 22, c: "#0F2012" },
                { x: 142, h: 50, w: 18, c: "#0D1C0F" },
                { x: 164, h: 70, w: 24, c: "#0E1E10" },
                { x: 192, h: 58, w: 20, c: "#0F2012" },
                { x: 216, h: 72, w: 22, c: "#0D1C0F" },
                { x: 246, h: 55, w: 20, c: "#0E1E10" },
                { x: 271, h: 68, w: 22, c: "#0F2012" },
                { x: 296, h: 53, w: 18, c: "#0D1C0F" },
                { x: 318, h: 70, w: 24, c: "#0E1E10" },
                { x: 346, h: 60, w: 20, c: "#0F2012" },
                { x: 370, h: 65, w: 22, c: "#0D1C0F" },
            ].map(({ x, h, w, c }, i) => (
                <g key={i}>
                    <rect x={x} y={200 - h} width={w} height={h} rx="9" fill={c} stroke={C.greenD} strokeWidth=".8" />
                    <circle cx={x + w / 2} cy={200 - h - 10} r={w / 3} fill={c} stroke={C.greenD} strokeWidth=".8" />
                </g>
            ))}

            {/* Floating event cards */}
            <g transform="translate(20, 30)">
                <rect width="130" height="70" rx="10" fill={C.card} stroke={C.gold} strokeWidth="1" />
                <rect width="130" height="22" rx="10" fill={C.gold} opacity=".2" />
                <text x="10" y="15" fill={C.gold} fontSize="9" fontWeight="700">📅 JUL 15, 2026</text>
                <text x="10" y="35" fill={C.text} fontSize="11" fontWeight="700">Addis Tech Summit</text>
                <text x="10" y="50" fill={C.textSec} fontSize="9">Radisson Blu · Free</text>
                <rect x="80" y="54" width="40" height="12" rx="6" fill={C.gold} opacity=".85" />
                <text x="100" y="63" textAnchor="middle" fill="#000" fontSize="8" fontWeight="700">Register</text>
            </g>

            <g transform="translate(330, 20)">
                <rect width="130" height="70" rx="10" fill={C.card} stroke={C.green} strokeWidth="1" />
                <rect width="130" height="22" rx="10" fill={C.green} opacity=".18" />
                <text x="10" y="15" fill={C.green} fontSize="9" fontWeight="700">📅 JUN 20, 2026</text>
                <text x="10" y="35" fill={C.text} fontSize="11" fontWeight="700">Heritage Arts Fest</text>
                <text x="10" y="50" fill={C.textSec} fontSize="9">National Museum · 50 ETB</text>
                <rect x="68" y="54" width="52" height="12" rx="6" fill={C.green} opacity=".85" />
                <text x="94" y="63" textAnchor="middle" fill="#000" fontSize="8" fontWeight="700">Open Reg</text>
            </g>

            {/* Floating sparkles */}
            {[[80, 130], [200, 50], [360, 110], [440, 60], [40, 200], [440, 170]].map(([sx, sy], i) => (
                <g key={i} opacity=".6">
                    <circle cx={sx} cy={sy} r="2" fill={C.gold} />
                    <line x1={sx - 5} y1={sy} x2={sx + 5} y2={sy} stroke={C.gold} strokeWidth=".8" />
                    <line x1={sx} y1={sy - 5} x2={sx} y2={sy + 5} stroke={C.gold} strokeWidth=".8" />
                </g>
            ))}
        </svg>
    );
}

/* Slide 3 — Contribute: network / sharing */
function IllustrationContribute() {
    const nodes = [
        { x: 240, y: 170, r: 18, main: true },
        { x: 120, y: 90, r: 12 }, { x: 360, y: 90, r: 12 },
        { x: 100, y: 220, r: 10 }, { x: 380, y: 220, r: 10 },
        { x: 200, y: 290, r: 10 }, { x: 280, y: 290, r: 10 },
        { x: 60, y: 150, r: 8 }, { x: 420, y: 150, r: 8 },
        { x: 170, y: 50, r: 7 }, { x: 310, y: 50, r: 7 },
    ];
    return (
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 480, height: "auto" }}>
            <defs>
                <radialGradient id="cglow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={C.gold} stopOpacity=".14" />
                    <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="480" height="340" fill="url(#cglow)" />

            {/* Edge connections */}
            {[[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 9], [2, 8], [2, 10], [3, 7], [4, 8], [5, 6]].map(([a, b], i) => (
                <line key={i}
                    x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
                    stroke={C.gold} strokeWidth="1" opacity=".2" strokeDasharray="5,5" />
            ))}

            {/* Orbit rings around center */}
            <circle cx="240" cy="170" r="75" fill="none" stroke={C.gold} strokeWidth=".8" opacity=".12" strokeDasharray="8,6" />
            <circle cx="240" cy="170" r="130" fill="none" stroke={C.gold} strokeWidth=".6" opacity=".07" strokeDasharray="6,8" />

            {/* Nodes */}
            {nodes.map((n, i) => (
                <g key={i}>
                    <circle cx={n.x} cy={n.y} r={n.r + 6} fill={n.main ? `${C.gold}18` : `${C.green}10`} opacity={n.main ? .9 : .6} />
                    <circle cx={n.x} cy={n.y} r={n.r} fill={n.main ? C.gold : C.card}
                        stroke={n.main ? C.goldL : C.green} strokeWidth={n.main ? 2 : 1.2} />
                    {n.main && (
                        <>
                            <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#000" fontSize="13" fontWeight="800">+</text>
                        </>
                    )}
                    {!n.main && (
                        <circle cx={n.x} cy={n.y} r={n.r * .45} fill={C.green} opacity=".7" />
                    )}
                </g>
            ))}

            {/* Upload arrows on edges */}
            {[[150, 130], [330, 130], [160, 240], [310, 240]].map(([ax, ay], i) => (
                <g key={i} transform={`translate(${ax},${ay})`}>
                    <circle r="14" fill={C.card} stroke={C.gold} strokeWidth="1" opacity=".8" />
                    <path d="M0 5 L0 -2 M-4 2 L0 -3 L4 2" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
            ))}

            {/* Floating resource snippets */}
            <g transform="translate(30,40)">
                <rect width="100" height="36" rx="8" fill={C.card} stroke={C.green} strokeWidth=".8" />
                <circle cx="16" cy="18" r="8" fill={`${C.green}25`} />
                <text x="16" y="22" textAnchor="middle" fill={C.green} fontSize="9" fontWeight="700">H</text>
                <text x="32" y="15" fill={C.textSec} fontSize="7" fontWeight="600">HEALTH</text>
                <text x="32" y="27" fill={C.text} fontSize="9" fontWeight="600">New clinic</text>
            </g>
            <g transform="translate(355,260)">
                <rect width="100" height="36" rx="8" fill={C.card} stroke={C.info} strokeWidth=".8" />
                <circle cx="16" cy="18" r="8" fill={`${C.info}25`} />
                <text x="16" y="22" textAnchor="middle" fill={C.info} fontSize="9" fontWeight="700">E</text>
                <text x="32" y="15" fill={C.textSec} fontSize="7" fontWeight="600">EDUCATION</text>
                <text x="32" y="27" fill={C.text} fontSize="9" fontWeight="600">Free classes</text>
            </g>
            <g transform="translate(360,30)">
                <rect width="100" height="36" rx="8" fill={C.card} stroke={C.gold} strokeWidth=".8" />
                <circle cx="16" cy="18" r="8" fill={`${C.gold}25`} />
                <text x="16" y="22" textAnchor="middle" fill={C.gold} fontSize="9" fontWeight="700">T</text>
                <text x="32" y="15" fill={C.textSec} fontSize="7" fontWeight="600">TECH</text>
                <text x="32" y="27" fill={C.text} fontSize="9" fontWeight="600">Makerspace</text>
            </g>
            <g transform="translate(20,260)">
                <rect width="100" height="36" rx="8" fill={C.card} stroke={"#9B6FD4"} strokeWidth=".8" />
                <circle cx="16" cy="18" r="8" fill={"#9B6FD420"} />
                <text x="16" y="22" textAnchor="middle" fill={"#9B6FD4"} fontSize="9" fontWeight="700">C</text>
                <text x="32" y="15" fill={C.textSec} fontSize="7" fontWeight="600">CULTURE</text>
                <text x="32" y="27" fill={C.text} fontSize="9" fontWeight="600">Heritage site</text>
            </g>
        </svg>
    );
}

/* Slide 4 — Founder: portrait + quote elements */
function IllustrationFounder() {
    return (
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 480, height: "auto" }}>
            <defs>
                <radialGradient id="fglow" cx="35%" cy="40%" r="60%">
                    <stop offset="0%" stopColor={C.gold} stopOpacity=".2" />
                    <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
                </radialGradient>
                <clipPath id="fcircle"><circle cx="160" cy="170" r="100" /></clipPath>
            </defs>
            <rect width="480" height="340" fill="url(#fglow)" />

            {/* Ethiopian-inspired pattern background */}
            {[0, 1, 2, 3, 4, 5].map(row => [0, 1, 2, 3, 4].map(col => {
                const x = col * 100 - 20, y = row * 58 - 30;
                return <polygon key={`${row}${col}`}
                    points={`${x + 50},${y} ${x + 96},${y + 28} ${x + 96},${y + 84} ${x + 50},${y + 112} ${x + 4},${y + 84} ${x + 4},${y + 28}`}
                    fill="none" stroke={C.goldD} strokeWidth=".6" opacity=".18" />;
            }))}

            {/* Portrait circle */}
            <circle cx="160" cy="170" r="105" fill={C.goldD} opacity=".18" />
            <circle cx="160" cy="170" r="100" fill="#0F1A0A" stroke={C.gold} strokeWidth="2" />

            {/* Stylised person silhouette */}
            <circle cx="160" cy="135" r="34" fill="#1A2E14" />
            <path d="M85 270 C85 230 115 210 160 210 C205 210 235 230 235 270" fill="#1A2E14" />
            {/* Face highlight */}
            <circle cx="160" cy="133" r="28" fill="#223820" opacity=".8" />
            <ellipse cx="149" cy="128" rx="5" ry="6" fill={C.greenD} opacity=".9" />
            <ellipse cx="171" cy="128" rx="5" ry="6" fill={C.greenD} opacity=".9" />
            <path d="M150 148 Q160 155 170 148" stroke={C.green} strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Graduation cap hint */}
            <rect x="134" y="103" width="52" height="6" rx="1" fill={C.gold} opacity=".6" />
            <polygon points="160,90 145,107 175,107" fill={C.gold} opacity=".5" />
            <line x1="176" y1="107" x2="185" y2="120" stroke={C.gold} strokeWidth="1.5" opacity=".6" />
            <circle cx="185" cy="123" r="4" fill={C.gold} opacity=".7" />

            {/* Achievement medals */}
            {[{ x: 60, y: 60, label: "2020" }, { x: 240, y: 55, label: "2023" }, { x: 270, y: 140, label: "2026" }].map(({ x, y, label }, i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r="20" fill={C.card} stroke={C.gold} strokeWidth="1.2" />
                    <text x={x} y={y + 4} textAnchor="middle" fill={C.gold} fontSize="8" fontWeight="700">{label}</text>
                </g>
            ))}
            {/* Connection lines to founder */}
            {[[60, 60], [240, 55], [270, 140]].map(([px, py], i) => (
                <line key={i} x1={px} y1={py} x2="160" y2="170" stroke={C.gold} strokeWidth=".8" opacity=".25" strokeDasharray="4,4" />
            ))}

            {/* Addis HUB logo mark right side */}
            <g transform="translate(330,120)">
                <polygon points="50,4 90,26 90,70 50,92 10,70 10,26" fill="none" stroke={C.gold} strokeWidth="2" />
                <polygon points="50,20 72,32 72,56 50,68 28,56 28,32" fill={C.greenD} stroke={C.green} strokeWidth="1.5" />
                <circle cx="50" cy="44" r="8" fill={C.gold} />
                {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const r = (deg * Math.PI) / 180;
                    return <line key={i} x1="50" y1="44" x2={50 + Math.cos(r) * 18} y2={44 + Math.sin(r) * 18} stroke={C.gold} strokeWidth="1.2" opacity=".65" />;
                })}
            </g>

            {/* Vision label */}
            <rect x="295" y="230" width="160" height="60" rx="10" fill={C.card} stroke={C.gold} strokeWidth="1" />
            <text x="375" y="252" textAnchor="middle" fill={C.gold} fontSize="9" fontWeight="700" letterSpacing="1">FOUNDER'S VISION</text>
            <text x="375" y="268" textAnchor="middle" fill={C.textSec} fontSize="8">Connecting communities</text>
            <text x="375" y="281" textAnchor="middle" fill={C.textSec} fontSize="8">across Addis Ababa</text>

            {/* Stars */}
            {[[60, 250], [90, 295], [430, 90], [450, 200], [30, 180]].map(([sx, sy], i) => (
                <circle key={i} cx={sx} cy={sy} r={1.5} fill={C.gold} opacity={.5 + i * .1} />
            ))}
        </svg>
    );
}

/* Slide 5 — CTA: sunrise city */
function IllustrationCTA() {
    return (
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 480, height: "auto" }}>
            <defs>
                <radialGradient id="sunglow" cx="50%" cy="70%" r="70%">
                    <stop offset="0%" stopColor={C.gold} stopOpacity=".35" />
                    <stop offset="50%" stopColor={C.green} stopOpacity=".1" />
                    <stop offset="100%" stopColor={C.green} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="suninner" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={C.goldL} stopOpacity="1" />
                    <stop offset="100%" stopColor={C.gold} stopOpacity=".8" />
                </radialGradient>
            </defs>
            <rect width="480" height="340" fill="url(#sunglow)" />

            {/* Horizon glow */}
            <ellipse cx="240" cy="220" rx="260" ry="60" fill={C.gold} opacity=".12" />

            {/* Sun rays */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const len = 80 + i % 3 * 20;
                return (
                    <line key={i}
                        x1={240 + Math.cos(rad) * 38} y1={220 + Math.sin(rad) * 38}
                        x2={240 + Math.cos(rad) * (38 + len)} y2={220 + Math.sin(rad) * (38 + len)}
                        stroke={C.gold} strokeWidth={i % 4 === 0 ? 1.5 : 0.6} opacity={i % 4 === 0 ? .35 : .15}
                        strokeLinecap="round" />
                );
            })}

            {/* Sun */}
            <circle cx="240" cy="220" r="44" fill={C.gold} opacity=".18" />
            <circle cx="240" cy="220" r="32" fill="url(#suninner)" />
            <circle cx="240" cy="220" r="22" fill={C.goldL} opacity=".6" />

            {/* City silhouette (dark against glow) */}
            {[
                [20, 260, 30, 80], [55, 275, 22, 65], [80, 255, 36, 85], [120, 265, 26, 75],
                [152, 250, 44, 90], [200, 260, 30, 80], [235, 240, 52, 100], [292, 255, 40, 85],
                [337, 265, 28, 75], [370, 250, 38, 90], [412, 260, 32, 80], [448, 270, 20, 70],
            ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#060E08" rx="2" />
            ))}

            {/* Ground */}
            <rect x="0" y="310" width="480" height="30" fill="#060E08" />

            {/* People silhouettes */}
            {[130, 200, 270, 340].map((px, i) => (
                <g key={i}>
                    <circle cx={px} cy={272} r={9} fill="#060E08" />
                    <rect x={px - 6} y={281} width={12} height={22} rx={4} fill="#060E08" />
                    {i === 1 && <path d={`M${px - 10} 292 L${px - 6} 303`} stroke="#060E08" strokeWidth="3" strokeLinecap="round" />}
                    {i === 2 && <path d={`M${px + 10} 292 L${px + 6} 303`} stroke="#060E08" strokeWidth="3" strokeLinecap="round" />}
                </g>
            ))}

            {/* Floating cards */}
            <g transform="translate(30, 40)">
                <rect width="110" height="50" rx="10" fill={C.card} stroke={C.gold} strokeWidth="1" opacity=".9" />
                <text x="55" y="22" textAnchor="middle" fill={C.gold} fontSize="18">🌟</text>
                <text x="55" y="40" textAnchor="middle" fill={C.text} fontSize="9" fontWeight="600">Join 2,400+ members</text>
            </g>
            <g transform="translate(345, 30)">
                <rect width="110" height="50" rx="10" fill={C.card} stroke={C.green} strokeWidth="1" opacity=".9" />
                <text x="55" y="22" textAnchor="middle" fill={C.green} fontSize="18">🚀</text>
                <text x="55" y="40" textAnchor="middle" fill={C.text} fontSize="9" fontWeight="600">Free to join today</text>
            </g>
            <g transform="translate(180, 20)">
                <rect width="120" height="50" rx="10" fill={C.card} stroke={C.info} strokeWidth="1" opacity=".9" />
                <text x="60" y="22" textAnchor="middle" fill={C.info} fontSize="18">🤝</text>
                <text x="60" y="40" textAnchor="middle" fill={C.text} fontSize="9" fontWeight="600">Build a better city</text>
            </g>
        </svg>
    );
}

/* ─── Slide data ───────────────────────────────────────────────── */
const SLIDES = [
    {
        id: "welcome",
        bg: C.s1bg,
        accent: C.gold,
        tag: "Welcome",
        headline: ["Addis HUB —", "Where Community", "Comes Alive"],
        body: "Addis Ababa's first digital hub connecting residents with the health centers, libraries, events, and services that make city life better. Built by the community, for the community.",
        pills: [
            { label: "2,400+ Members", color: C.gold },
            { label: "850+ Resources", color: C.green },
            { label: "10 Subcities", color: C.info },
        ],
        Illustration: IllustrationWelcome,
    },
    {
        id: "resources",
        bg: C.s2bg,
        accent: C.info,
        tag: "Discover",
        headline: ["Every Resource in", "Addis Ababa,", "At Your Fingertips"],
        body: "Search and filter hundreds of verified community resources — health centers, public libraries, youth makerspaces, legal aid offices, parks, and more — all mapped and reviewed by real Addis residents.",
        features: [
            { icon: "map", label: "Location-based filtering" },
            { icon: "shield", label: "Community-verified listings" },
            { icon: "trending", label: "Live view & like counts" },
        ],
        Illustration: IllustrationResources,
    },
    {
        id: "events",
        bg: C.s3bg,
        accent: C.green,
        tag: "Events",
        headline: ["Stay Connected.", "Join Events That", "Shape the City"],
        body: "From tech summits and heritage festivals to community marathons and free workshops — register for events happening across Addis Ababa and never miss what matters in your neighbourhood.",
        features: [
            { icon: "calendar", label: "One-click registration" },
            { icon: "users", label: "Capacity & attendee tracking" },
            { icon: "star", label: "Free and paid events" },
        ],
        Illustration: IllustrationEvents,
    },
    {
        id: "contribute",
        bg: C.s4bg,
        accent: C.gold,
        tag: "Contribute",
        headline: ["Your Knowledge", "Helps Thousands of", "Neighbours"],
        body: "You know your city best. Add the resources your community relies on — health posts, community centres, study spots — and help residents across Addis discover what's already around them.",
        features: [
            { icon: "plus", label: "Add resources in under 2 min" },
            { icon: "heart", label: "Like and bookmark favourites" },
            { icon: "globe", label: "Share with your community" },
        ],
        Illustration: IllustrationContribute,
    },
    {
        id: "founder",
        bg: C.s5bg,
        accent: C.gold,
        tag: "Our Story",
        headline: ["Founded on the", "Belief That Cities", "Work for Everyone"],
        quote: "Addis Ababa is one of Africa's fastest-growing cities. Yet finding a health centre, a library, or a community event still depends on who you know. Addis HUB changes that.",
        founderName: "CRH Founding Team",
        founderRole: "City Resources Hub · Addis Ababa, 2026",
        legacy: [
            "Launched in 2026 to bridge the information gap for Addis residents",
            "Partnered with local NGOs, subcity offices, and youth organisations",
            "Vision: every resident, regardless of neighbourhood, gets equal access",
            "Ambition: expand the model to all major Ethiopian cities by 2028",
        ],
        Illustration: IllustrationFounder,
    },
    {
        id: "cta",
        bg: C.s6bg,
        accent: C.gold,
        tag: "Join Us",
        headline: ["Be Part of the", "Change Addis", "Needs"],
        body: "Join thousands of residents who are already discovering resources, attending events, and making Addis Ababa more connected. It's free. It takes 30 seconds.",
        cta: true,
        Illustration: IllustrationCTA,
    },
];

/* ─── Logo mark ───────────────────────────────────────────────── */
function LogoMark({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="none" stroke={C.gold} strokeWidth="2" />
            <polygon points="24,10 36,17 36,31 24,38 12,31 12,17" fill={C.greenD} stroke={C.green} strokeWidth="1.5" />
            <circle cx="24" cy="24" r="4.5" fill={C.gold} />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const r = (deg * Math.PI) / 180;
                return <line key={i} x1="24" y1="24" x2={24 + Math.cos(r) * 11} y2={24 + Math.sin(r) * 11} stroke={C.gold} strokeWidth="1.4" opacity=".7" />;
            })}
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
    const navigate = useNavigate();
    const authUser = useSelector(s => s.auth?.user);


const markSeenAndGo = (path) => {
  localStorage.setItem("crh_landing_seen", "1");
  navigate(path);
};

    /* Redirect logged-in users */
    useEffect(() => {
  if (authUser?.id) {
    navigate('/resources', { replace: true });
  }
}, [authUser]);

    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState(-1);
    const [dir, setDir] = useState(1);   // 1=forward, -1=back
    const [animating, setAnimating] = useState(false);
    const touchStartX = useRef(null);
    const autoRef = useRef(null);

    const total = SLIDES.length;
    const slide = SLIDES[current];

    const go = useCallback((nextIdx, direction = 1) => {
        if (animating || nextIdx === current) return;
        setDir(direction);
        setPrev(current);
        setAnimating(true);
        setTimeout(() => {
            setCurrent(nextIdx);
            setPrev(-1);
            setAnimating(false);
        }, 420);
    }, [animating, current]);

    const next = () => {
        if (current < total - 1) go(current + 1, 1);
        else markSeenAndGo("/signup");  // ← was navigate("/signup")
    };
    const back = () => {
        if (current > 0) go(current - 1, -1);
    };

    /* Keyboard */
    useEffect(() => {
        const h = e => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") back();
            if (e.key === "Escape") markSeenAndGo("/signup");
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [current, animating]); // eslint-disable-line

    /* Swipe */
    const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = e => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) { dx < 0 ? next() : back(); }
        touchStartX.current = null;
    };

    const isLast = current === total - 1;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:0}

        @keyframes slideInRight{from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:none}}
        @keyframes slideInLeft {from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}
        @keyframes slideOutRight{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-60px)}}
        @keyframes slideOutLeft {from{opacity:1;transform:none}to{opacity:0;transform:translateX(60px)}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes cardFloat{0%{transform:translateY(0)}100%{transform:translateY(-10px)}}
        @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes shimmer {0%{background-position:200% 50%}100%{background-position:-200% 50%}}
        @keyframes dotPop  {0%{transform:scale(1)}50%{transform:scale(1.5)}100%{transform:scale(1)}}
        @keyframes rotate  {to{transform:rotate(360deg)}}

        .sl-in-fwd  {animation:slideInRight .42s cubic-bezier(.4,0,.2,1) both}
        .sl-in-back {animation:slideInLeft  .42s cubic-bezier(.4,0,.2,1) both}
        .sl-out-fwd {animation:slideOutRight .42s cubic-bezier(.4,0,.2,1) both;position:absolute;inset:0}
        .sl-out-back{animation:slideOutLeft  .42s cubic-bezier(.4,0,.2,1) both;position:absolute;inset:0}
        .fade-tag   {animation:fadeUp .4s .1s ease both}
        .fade-h1    {animation:fadeUp .4s .2s ease both}
        .fade-body  {animation:fadeUp .4s .3s ease both}
        .fade-feat  {animation:fadeUp .4s .4s ease both}
        .fade-cta   {animation:fadeUp .4s .5s ease both}

        /* Responsive */
        @media(max-width:860px){
          .ld-inner{flex-direction:column!important;overflow-y:auto!important}
          .ld-left {flex:none!important;width:100%!important;min-height:auto!important;padding:28px 20px 20px!important;justify-content:flex-start!important;gap:16px!important}
          .ld-right{flex:none!important;width:100%!important;height:260px!important;padding:0 20px 20px!important}
          .ld-headline{font-size:clamp(24px,6vw,40px)!important}
          html,body{overflow:auto!important}
        }
        @media(max-width:480px){
          .ld-left{padding:24px 16px 16px!important}
          .ld-headline{font-size:28px!important}
          .ld-nav-btn span{display:none}
          .ld-dots{gap:6px!important}
        }
      `}</style>

            <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: slide.bg, transition: "background .5s ease", overflow: "hidden" }}
                onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

                {/* ── TOP BAR ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", zIndex: 10, flexShrink: 0 }}>
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Logo variant="mark" size={30} />
                        <div>
                            <div style={{ fontFamily: "Sora,Syne,sans-serif", fontWeight: 800, fontSize: 16, color: C.text, lineHeight: 1 }}>
                                Addis<span style={{ color: C.gold }}>HUB</span>
                            </div>
                            <div style={{ fontSize: 7.5, color: C.green, letterSpacing: 2.2, textTransform: "uppercase" }}>City Resources Hub</div>
                        </div>
                    </div>

                    {/* Skip + Login */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        
                        <button onClick={() => markSeenAndGo("/signup")}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 20, border: `1px solid ${C.gold}40`, background: `${C.gold}12`, color: C.gold, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans,sans-serif", transition: "all .2s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}24`; e.currentTarget.style.borderColor = C.gold; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${C.gold}12`; e.currentTarget.style.borderColor = `${C.gold}40`; }}>
                            Get started <Ico d={I.skip} size={13} color={C.gold} />
                        </button>
                    </div>
                </div>

                {/* ── PROGRESS BAR ── */}
                <div style={{ height: 2, background: C.b1, flexShrink: 0, zIndex: 10 }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg,${C.gold},${C.green})`, width: `${((current + 1) / total) * 100}%`, transition: "width .45s cubic-bezier(.4,0,.2,1)" }} />
                </div>

                {/* ── SLIDE AREA ── */}
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                    <div key={current}
                        className={!animating ? "" : dir > 0 ? "sl-in-fwd" : "sl-in-back"}
                        style={{ position: "absolute", inset: 0, display: "flex" }}>
                        <div className="ld-inner" style={{ width: "100%", height: "100%", display: "flex", alignItems: "stretch" }}>

                            {/* LEFT: content */}
                            <div className="ld-left" style={{ flex: "0 0 50%", width: "50%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 52px", gap: 0 }}>

                                {/* Tag pill */}
                                <div className="fade-tag" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: `${slide.accent}18`, border: `1px solid ${slide.accent}35`, marginBottom: 20, alignSelf: "flex-start" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: slide.accent, animation: "pulse 2s ease infinite" }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: slide.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>{slide.tag}</span>
                                </div>

                                {/* Headline */}
                                <h1 className="ld-headline fade-h1" style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "clamp(26px,3.5vw,48px)", lineHeight: 1.15, color: C.text, marginBottom: 20 }}>
                                    {slide.headline.map((line, i) => (
                                        <span key={i} style={{ display: "block", color: i === 2 ? slide.accent : C.text }}>
                                            {line}
                                        </span>
                                    ))}
                                </h1>

                                {/* Body / quote */}
                                {slide.body && (
                                    <p className="fade-body" style={{ fontSize: "clamp(13px,1.4vw,15px)", color: C.textSec, lineHeight: 1.8, maxWidth: 460, marginBottom: 24 }}>
                                        {slide.body}
                                    </p>
                                )}

                                {slide.quote && (
                                    <div className="fade-body" style={{ marginBottom: 22, padding: "16px 20px", borderRadius: 12, background: `${C.gold}0C`, border: `1px solid ${C.gold}28`, borderLeft: `3px solid ${C.gold}`, position: "relative" }}>
                                        <Ico d={I.quote} size={16} color={C.gold} style={{ opacity: .4, marginBottom: 6, display: "block" }} />
                                        <p style={{ fontSize: "clamp(12px,1.3vw,14px)", color: C.textSec, lineHeight: 1.8, fontStyle: "italic" }}>{slide.quote}</p>
                                        <div style={{ marginTop: 12 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{slide.founderName}</div>
                                            <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>{slide.founderRole}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Features list */}
                                {slide.features && (
                                    <div className="fade-feat" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                                        {slide.features.map(({ icon, label }) => (
                                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${slide.accent}18`, border: `1px solid ${slide.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Ico d={I[icon]} size={14} color={slide.accent} />
                                                </div>
                                                <span style={{ fontSize: "clamp(12px,1.3vw,14px)", color: C.textSec }}>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Founder legacy list */}
                                {slide.legacy && (
                                    <div className="fade-feat" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                                        {slide.legacy.map((item, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${C.gold}18`, border: `1px solid ${C.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                                    <Ico d={I.check} size={10} color={C.gold} />
                                                </div>
                                                <span style={{ fontSize: "clamp(11px,1.2vw,13px)", color: C.textSec, lineHeight: 1.6 }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pills (slide 0) */}
                                {slide.pills && (
                                    <div className="fade-feat" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                                        {slide.pills.map(({ label, color }) => (
                                            <div key={label} style={{ padding: "5px 12px", borderRadius: 20, background: `${color}14`, border: `1px solid ${color}35`, fontSize: 12, fontWeight: 600, color }}>
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* CTA (last slide) */}
                                {slide.cta && (
                                    <div className="fade-cta" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        <button onClick={() => markSeenAndGo("/signup")}
                                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px 36px", borderRadius: 14, border: "none", background: `linear-gradient(90deg,${C.gold},${C.goldL})`, color: "#000", fontFamily: "DM Sans,sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", alignSelf: "flex-start", boxShadow: `0 8px 28px ${C.gold}40`, transition: "all .2s", letterSpacing: .3 }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 36px ${C.gold}55`; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 8px 28px ${C.gold}40`; }}>
                                            Create Free Account <Ico d={I.arrowR} size={18} color="#000" />
                                        </button>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Link to="/login" style={{ fontSize: 13, color: C.textSec, textDecoration: "none", fontWeight: 500 }}>
                                                Already have an account? <span style={{ color: C.gold, fontWeight: 600 }}>Sign in →</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT: illustration */}
                            <div className="ld-right" style={{ flex: "0 0 50%", width: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 40px 28px 20px" }}>
                                <slide.Illustration />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM NAV ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", flexShrink: 0, zIndex: 10 }}>

                    {/* Back button */}
                    <button onClick={back} disabled={current === 0}
                        className="ld-nav-btn"
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.b2}`, background: "transparent", color: current === 0 ? C.textMut : C.textSec, fontSize: 13, fontWeight: 600, cursor: current === 0 ? "default" : "pointer", fontFamily: "DM Sans,sans-serif", transition: "all .18s", opacity: current === 0 ? .35 : 1 }}
                        onMouseEnter={e => { if (current > 0) { e.currentTarget.style.borderColor = C.b3; e.currentTarget.style.color = C.text; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.color = C.textSec; }}>
                        <Ico d={I.arrowL} size={15} /> <span>Back</span>
                    </button>

                    {/* Dot indicators */}
                    <div className="ld-dots" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {SLIDES.map((_, i) => (
                            <button key={i} onClick={() => go(i, i > current ? 1 : -1)}
                                style={{
                                    width: i === current ? 24 : 7,
                                    height: 7,
                                    borderRadius: 4,
                                    background: i === current ? slide.accent : C.b3,
                                    border: "none", cursor: "pointer", padding: 0,
                                    transition: "all .3s cubic-bezier(.4,0,.2,1)",
                                    boxShadow: i === current ? `0 0 8px ${slide.accent}60` : "none",
                                }}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next / Create Account button */}
                    <button onClick={next}
                        className="ld-nav-btn"
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 12, border: "none", background: isLast ? `linear-gradient(90deg,${C.gold},${C.goldL})` : `${slide.accent}20`, color: isLast ? "#000" : slide.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans,sans-serif", transition: "all .2s", boxShadow: isLast ? `0 4px 16px ${C.gold}40` : "none" }}
                        onMouseEnter={e => { if (!isLast) { e.currentTarget.style.background = `${slide.accent}30`; } else { e.currentTarget.style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={e => { if (!isLast) { e.currentTarget.style.background = `${slide.accent}20`; } else { e.currentTarget.style.transform = "none"; } }}>
                        <span>{isLast ? "Create Account" : "Next"}</span>
                        <Ico d={I.arrowR} size={15} color={isLast ? "#000" : slide.accent} />
                    </button>
                </div>
            </div>
        </>
    );
}