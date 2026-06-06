 
import { useState, useEffect, useCallback, useRef } from "react";

// ─── API config — edit these if your backend uses different paths ─────────────
const API = "https://crh-backend-production.up.railway.app";

// Route map: change singular→plural here if your NestJS controllers differ
const ROUTES = {
  users:     "/users",
  resources: "/resources",
  events:    "/events",
};

// Dev-only: log the actual URLs being called so you can verify in the console
if (import.meta.env.DEV) {
  console.log("[AdminPanel] API base:", API);
  console.log("[AdminPanel] Routes:", ROUTES);
}

const C = {
  gold:   "#C9941A",
  goldS:  "rgba(201,148,26,0.13)",
  goldB:  "rgba(201,148,26,0.22)",
  green:  "#3DB070",
  blue:   "#378ADD",
  red:    "#E24B4A",
  warn:   "#F39C12",
  bg:     "#0E0E0E",
  bg2:    "#161616",
  bg3:    "#1C1C1C",
  bg4:    "#232323",
  border: "rgba(255,255,255,0.07)",
  border2:"rgba(201,148,26,0.22)",
  text:   "#F0EDE8",
  muted:  "#A09888",
  dim:    "#5A5248",
};

const AV_COLORS = [
  { bg:"rgba(201,148,26,0.15)", c:C.gold },
  { bg:"rgba(61,176,112,0.15)", c:C.green },
  { bg:"rgba(55,138,221,0.15)", c:C.blue },
  { bg:"rgba(226,75,74,0.15)",  c:C.red },
  { bg:"rgba(148,96,201,0.15)", c:"#9B59B6" },
];

const NAV = [
  { id:"dashboard",  label:"Dashboard",  icon:"ti-layout-dashboard", section:"Overview" },
  { id:"analytics",  label:"Analytics",  icon:"ti-chart-bar",        section:"Overview" },
  { id:"users",      label:"Users",      icon:"ti-users",            section:"Manage" },
  { id:"resources",  label:"Resources",  icon:"ti-map-pin",          section:"Manage" },
  { id:"events",     label:"Events",     icon:"ti-calendar-event",   section:"Manage" },
];

const PAGE_TITLES = {
  dashboard: "Dashboard Overview",
  analytics: "Analytics",
  users:     "User Management",
  resources: "Resources",
  events:    "Events",
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function useToast() {
  const [msg, setMsg] = useState({ text: "", type: "ok" });
  const show = useCallback((text, type = "ok") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "ok" }), 2600);
  }, []);
  return [msg, show];
}

function useApi(path, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const reload = useCallback(() => {
    setLoading(true);
    apiFetch(path)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);
  useEffect(() => { reload(); }, [...deps, reload]);
  return { data, loading, error, reload };
}

// ─── Small UI atoms ───────────────────────────────────────────────────────────
function Badge({ children, color = C.muted, bg = C.bg4, border = C.border }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 9px", borderRadius:4,
      fontSize:11, fontWeight:500, fontFamily:"'Syne',sans-serif",
      background:bg, color, border:`1px solid ${border}` }}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:   { bg:"rgba(61,176,112,.12)",  c:C.green, b:"rgba(61,176,112,.22)" },
    inactive: { bg:C.bg4,                   c:C.muted, b:C.border },
    pending:  { bg:"rgba(243,156,18,.12)",   c:C.warn,  b:"rgba(243,156,18,.22)" },
    live:     { bg:"rgba(226,75,74,.12)",    c:C.red,   b:"rgba(226,75,74,.22)" },
    upcoming: { bg:"rgba(55,138,221,.12)",   c:C.blue,  b:"rgba(55,138,221,.22)" },
    ended:    { bg:C.bg4,                    c:C.muted, b:C.border },
  };
  const s = map[status] || map.inactive;
  return <Badge color={s.c} bg={s.bg} border={s.b}>{status}</Badge>;
}

function RoleBadge({ role }) {
  const map = {
    admin:    { bg:"rgba(201,148,26,.12)", c:C.gold,  b:C.goldB },
    business: { bg:"rgba(61,176,112,.12)", c:C.green, b:"rgba(61,176,112,.22)" },
    user:     { bg:"rgba(55,138,221,.12)", c:C.blue,  b:"rgba(55,138,221,.22)" },
  };
  const s = map[role] || { bg:C.bg4, c:C.muted, b:C.border };
  return <Badge color={s.c} bg={s.bg} border={s.b}>{role}</Badge>;
}

function Btn({ children, variant = "ghost", sm, onClick, disabled, style: ex }) {
  const base = {
    display:"inline-flex", alignItems:"center", gap:5,
    padding: sm ? "4px 10px" : "7px 14px",
    borderRadius:6, fontSize: sm ? 11 : 12,
    cursor: disabled ? "not-allowed" : "pointer",
    border:"none", fontFamily:"'DM Sans',sans-serif", fontWeight:500,
    opacity: disabled ? 0.5 : 1, transition:"opacity .15s",
  };
  const variants = {
    gold:   { background:C.gold,  color:"#000" },
    ghost:  { background:"transparent", color:C.muted, border:`1px solid ${C.border}` },
    danger: { background:"rgba(226,75,74,.15)", color:C.red, border:"1px solid rgba(226,75,74,.25)" },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...ex }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Input({ value, onChange, type = "text", placeholder, style: ex }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:"100%", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6,
        padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"'DM Sans',sans-serif",
        boxSizing:"border-box", outline:"none", ...ex }}
      onFocus={e => e.target.style.borderColor = C.gold}
      onBlur={e  => e.target.style.borderColor = C.border}
    />
  );
}

function Select({ value, onChange, children, style: ex }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:"100%", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6,
        padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"'DM Sans',sans-serif",
        boxSizing:"border-box", outline:"none", ...ex }}>
      {children}
    </select>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:10, color:C.muted, marginBottom:5, display:"block",
        textTransform:"uppercase", letterSpacing:".07em", fontFamily:"'Syne',sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.78)", zIndex:1000,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:C.bg2, border:`1px solid ${C.border2}`, borderRadius:12,
        width:440, maxWidth:"95vw", padding:22, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:600 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg.text) return null;
  const col = msg.type === "err" ? C.red : C.green;
  return (
    <div style={{ position:"fixed", bottom:22, right:22, background:C.bg2,
      border:`1px solid ${col}`, borderRadius:8, padding:"11px 18px",
      fontSize:13, color:col, zIndex:9999, display:"flex", alignItems:"center", gap:9,
      animation:"slideUp .25s ease" }}>
      <i className={`ti ${msg.type==="err"?"ti-alert-circle":"ti-check"}`} aria-hidden="true" />
      {msg.text}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48, color:C.muted, gap:10 }}>
      <i className="ti ti-loader-2" style={{ fontSize:20, animation:"spin 1s linear infinite" }} aria-hidden="true" />
      Loading…
    </div>
  );
}

function EmptyState({ text = "No data found" }) {
  return (
    <div style={{ padding:40, textAlign:"center", color:C.muted, fontSize:13 }}>
      <i className="ti ti-database-off" style={{ fontSize:28, display:"block", marginBottom:10 }} aria-hidden="true" />
      {text}
    </div>
  );
}

function ErrorState({ msg, onRetry }) {
  return (
    <div style={{ padding:40, textAlign:"center", color:C.red, fontSize:13 }}>
      <i className="ti ti-alert-triangle" style={{ fontSize:24, display:"block", marginBottom:8 }} aria-hidden="true" />
      <div style={{ marginBottom:12 }}>{msg}</div>
      {onRetry && <Btn onClick={onRetry}>Retry</Btn>}
    </div>
  );
}

// ─── Table wrapper ────────────────────────────────────────────────────────────
function Tbl({ headers, children }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign:"left", fontSize:10, letterSpacing:".08em",
                textTransform:"uppercase", color:C.dim, padding:"10px 16px",
                fontFamily:"'Syne',sans-serif", borderBottom:`1px solid ${C.border}`, fontWeight:500 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
const TD = { padding:"11px 16px", fontSize:13, borderBottom:`1px solid rgba(42,42,42,.4)`, verticalAlign:"middle" };

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style: ex }) {
  return (
    <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden", ...ex }}>
      {children}
    </div>
  );
}
function CardHead({ title, icon, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"13px 18px", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600,
        display:"flex", alignItems:"center", gap:8 }}>
        {icon && <i className={`ti ${icon}`} style={{ fontSize:15, color:C.gold }} aria-hidden="true" />}
        {title}
      </div>
      <div style={{ display:"flex", gap:8 }}>{children}</div>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, upDown, color, accent }) {
  return (
    <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10,
      padding:"16px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:accent || C.gold }} />
      <div style={{ fontSize:10, letterSpacing:".07em", textTransform:"uppercase",
        color:C.muted, fontFamily:"'Syne',sans-serif", marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700,
        color: color || C.text, lineHeight:1, marginBottom:6 }}>{value}</div>
      {sub && (
        <div style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}>
          {upDown && (
            <span style={{ color: upDown==="up" ? C.green : C.red }}>
              <i className={`ti ${upDown==="up"?"ti-trending-up":"ti-trending-down"}`} style={{ fontSize:11 }} aria-hidden="true" />
            </span>
          )}
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Metric bar ───────────────────────────────────────────────────────────────
function BarRow({ label, value, max, color, pct }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:12 }}>
      <span style={{ width:90, color:C.muted, textAlign:"right", flexShrink:0, fontSize:11 }}>{label}</span>
      <div style={{ flex:1, height:5, background:C.bg4, borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${Math.round((value/max)*100)}%`, height:"100%",
          background:color || C.gold, borderRadius:3, transition:"width .6s ease" }} />
      </div>
      <span style={{ width:36, textAlign:"right", color:C.muted, fontSize:11 }}>{value}{pct?"%":""}</span>
    </div>
  );
}

// ─── Inline filter bar ────────────────────────────────────────────────────────
function FilterBar({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 18px",
      borderBottom:`1px solid ${C.border}`, flexWrap:"wrap" }}>
      {children}
    </div>
  );
}
const filterInput = {
  background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6,
  padding:"7px 12px", color:C.text, fontSize:12, fontFamily:"'DM Sans',sans-serif",
  outline:"none", flex:1, minWidth:140,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage() {
  const { data: users,     loading: lu } = useApi(ROUTES.users);
  const { data: resources, loading: lr } = useApi(ROUTES.resources);
  const { data: events,    loading: le } = useApi(ROUTES.events);

  const totalUsers     = (users     || []).length;
  const totalResources = (resources || []).length;
  const activeEvents   = (events    || []).filter(e => e.status === "live" || e.status === "upcoming").length;
  const pending        = (resources || []).filter(r => r.status === "pending").length;

  const catCount = {};
  (resources || []).forEach(r => { catCount[r.category] = (catCount[r.category] || 0) + 1; });
  const catMax = Math.max(...Object.values(catCount), 1);

  const roleCount = { admin:0, business:0, user:0 };
  (users || []).forEach(u => { if (roleCount[u.role] !== undefined) roleCount[u.role]++; });
  const total = totalUsers || 1;

  const recentActivity = [
    ...(users     || []).slice(-3).reverse().map(u => ({ dot:C.green,  text:`${u.name} joined as ${u.role}` })),
    ...(events    || []).filter(e=>e.status==="live").slice(0,2).map(e => ({ dot:C.blue, text:`${e.name} is now live` })),
    ...(resources || []).filter(r=>r.status==="pending").slice(0,2).map(r => ({ dot:C.warn, text:`${r.name} awaiting review` })),
  ].slice(0, 6);

  return (
    <div style={{ padding:"22px 24px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:22 }}>
        <KPI label="Total Users"      value={lu ? "…" : totalUsers.toLocaleString()}     sub="platform members"  upDown="up"   color={C.gold}  accent={C.gold} />
        <KPI label="Resources Listed" value={lr ? "…" : totalResources.toLocaleString()} sub="in directory"      upDown="up"                   accent={C.green} />
        <KPI label="Active Events"    value={le ? "…" : activeEvents.toLocaleString()}   sub="live & upcoming"   upDown="up"   color={C.blue}  accent={C.blue} />
        <KPI label="Pending Reviews"  value={lr ? "…" : pending.toLocaleString()}        sub="need attention"    upDown="down" color={C.red}   accent={C.red} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:18, marginBottom:18 }}>
        <Card>
          <CardHead title="User Roles" icon="ti-users" />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:24, padding:18 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
              <circle cx="40" cy="40" r="28" fill="none" stroke={C.bg4} strokeWidth="12"/>
              {totalUsers > 0 && <>
                <circle cx="40" cy="40" r="28" fill="none" stroke={C.gold}  strokeWidth="12"
                  strokeDasharray={`${Math.round(roleCount.user/total*176)} 176`} strokeDashoffset="-16" strokeLinecap="round"/>
                <circle cx="40" cy="40" r="28" fill="none" stroke={C.green} strokeWidth="12"
                  strokeDasharray={`${Math.round(roleCount.business/total*176)} 176`}
                  strokeDashoffset={`${-(16 + Math.round(roleCount.user/total*176))}`} strokeLinecap="round"/>
                <circle cx="40" cy="40" r="28" fill="none" stroke={C.blue}  strokeWidth="12"
                  strokeDasharray={`${Math.round(roleCount.admin/total*176)} 176`}
                  strokeDashoffset={`${-(16 + Math.round((roleCount.user+roleCount.business)/total*176))}`} strokeLinecap="round"/>
              </>}
            </svg>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[["User", roleCount.user, C.gold],["Business", roleCount.business, C.green],["Admin", roleCount.admin, C.blue]].map(([l,v,c]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:C.muted }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }} />
                  {l}
                  <span style={{ marginLeft:"auto", color:C.text, fontWeight:500, paddingLeft:16 }}>
                    {totalUsers > 0 ? `${Math.round(v/total*100)}%` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="Resources by Category" icon="ti-category" />
          <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:9 }}>
            {lr ? <Spinner /> : Object.entries(catCount).map(([cat, cnt]) => (
              <BarRow key={cat} label={cat} value={cnt} max={catMax} color={C.gold} />
            ))}
            {!lr && Object.keys(catCount).length === 0 && <EmptyState text="No resources yet" />}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Recent Activity" icon="ti-activity" />
        <div style={{ padding:"0 18px" }}>
          {recentActivity.length === 0 ? <EmptyState /> : recentActivity.map((a, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12,
              padding:"10px 0", borderBottom: i < recentActivity.length-1 ? `1px solid rgba(42,42,42,.4)` : "none", fontSize:12 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:a.dot, marginTop:5, flexShrink:0 }} />
              <div style={{ color:C.muted, lineHeight:1.6 }}>{a.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsPage() {
  const { data: users,     loading: lu } = useApi(ROUTES.users);
  const { data: resources, loading: lr } = useApi(ROUTES.resources);
  const { data: events,    loading: le } = useApi(ROUTES.events);

  const totalViews  = (resources || []).reduce((s, r) => s + (r.views || 0), 0);
  const totalRegs   = (events    || []).reduce((s, e) => s + (e.regs  || 0), 0);
  const activeUsers = (users     || []).filter(u => u.status === "active").length;

  const catCount = {};
  (resources || []).forEach(r => { catCount[r.category] = (catCount[r.category] || 0) + 1; });
  const catMax = Math.max(...Object.values(catCount), 1);

  const statusCount = {};
  (events || []).forEach(e => { statusCount[e.status] = (statusCount[e.status] || 0) + 1; });

  const topResources = [...(resources || [])].sort((a,b) => (b.views||0) - (a.views||0)).slice(0,5);

  const TOP_PAGES = [
    { page:"/map",       views:"12,400", time:"5m 32s", bounce:28, cls:"green" },
    { page:"/resources", views:totalViews > 0 ? totalViews.toLocaleString() : "9,800", time:"3m 44s", bounce:32, cls:"green" },
    { page:"/events",    views:(totalRegs > 0 ? totalRegs : 7200).toLocaleString(), time:"2m 55s", bounce:41, cls:"gold" },
    { page:"/profile",   views:"5,100",  time:"4m 10s", bounce:38, cls:"gold" },
    { page:"/login",     views:"3,900",  time:"1m 20s", bounce:72, cls:"red" },
  ];
  const bMap = { green:{bg:"rgba(61,176,112,.12)",c:C.green,b:"rgba(61,176,112,.2)"},
    gold:{bg:"rgba(201,148,26,.15)",c:C.gold,b:"rgba(201,148,26,.2)"},
    red:{bg:"rgba(226,75,74,.1)",c:C.red,b:"rgba(226,75,74,.2)"} };

  return (
    <div style={{ padding:"22px 24px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:22 }}>
        <KPI label="Total Views"    value={lr?"…":totalViews.toLocaleString()}  sub="across all resources" upDown="up"  color={C.gold}  accent={C.gold} />
        <KPI label="Event Regs"     value={le?"…":totalRegs.toLocaleString()}   sub="total registrations"  upDown="up"  color={C.blue}  accent={C.blue} />
        <KPI label="Active Users"   value={lu?"…":activeUsers.toLocaleString()} sub="currently active"     upDown="up"  color={C.green} accent={C.green} />
        <KPI label="Avg Views/Res"  value={lr?"…":(resources?.length ? Math.round(totalViews/(resources.length)).toLocaleString() : "0")} sub="per resource" accent={C.warn} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:18, marginBottom:18 }}>
        <Card>
          <CardHead title="Resources by Category" icon="ti-chart-bar" />
          <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:9 }}>
            {lr ? <Spinner /> : Object.entries(catCount).map(([cat, cnt]) => (
              <BarRow key={cat} label={cat} value={cnt} max={catMax} color={C.gold} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Top Resources by Views" icon="ti-eye" />
          <div style={{ padding:"0 18px" }}>
            {lr ? <Spinner /> : topResources.length === 0 ? <EmptyState /> : topResources.map((r, i) => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"9px 0", borderBottom: i < topResources.length-1 ? `1px solid rgba(42,42,42,.4)` : "none", fontSize:12 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.gold, width:16, textAlign:"center" }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.text, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</div>
                  <div style={{ color:C.muted, fontSize:10, marginTop:1 }}>{r.category}</div>
                </div>
                <span style={{ color:C.blue, fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600 }}>{(r.views||0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Top Pages" icon="ti-route" />
        <Tbl headers={["Page","Views","Avg Time","Bounce"]}>
          {TOP_PAGES.map((p, i) => {
            const s = bMap[p.cls];
            return (
              <tr key={p.page}>
                <td style={TD}>{p.page}</td>
                <td style={TD}>{p.views}</td>
                <td style={{ ...TD, color:C.muted, fontSize:12 }}>{p.time}</td>
                <td style={TD}><Badge color={s.c} bg={s.bg} border={s.b}>{p.bounce}%</Badge></td>
              </tr>
            );
          })}
        </Tbl>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── USERS PAGE ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function UsersPage() {
  const { data, loading, error, reload } = useApi(ROUTES.users);
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [roleF,   setRoleF]   = useState("");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ name:"", email:"", role:"user" });
  const [saving,  setSaving]  = useState(false);
  const [toast,   showToast]  = useToast();

  useEffect(() => { if (data) setUsers(data); }, [data]);

  const visible = users.filter(u => {
    const q = search.toLowerCase();
    return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) &&
      (!roleF || u.role === roleF);
  });

  async function changeRole(id, newRole) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role:newRole } : u));
    showToast(`Role updated to "${newRole}"`);
    try {
      await apiFetch(`${ROUTES.users}/${id}`, { method:"PATCH", body:JSON.stringify({ role:newRole }) });
    } catch(e) { showToast("Role sync failed — change saved locally", "err"); reload(); }
  }

  function openAdd()   { setEditing(null); setForm({ name:"", email:"", role:"user" }); setModal(true); }
  function openEdit(u) { setEditing(u);    setForm({ name:u.name, email:u.email, role:u.role }); setModal(true); }

  async function save() {
    if (!form.name || !form.email) { showToast("Fill all required fields", "err"); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await apiFetch(`${ROUTES.users}/${editing.id}`, { method:"PATCH", body:JSON.stringify(form) });
        setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...form, ...updated } : u));
        showToast("User updated");
      } else {
        const created = await apiFetch(ROUTES.users, { method:"POST", body:JSON.stringify({ ...form, status:"active", resources:0 }) });
        setUsers(prev => [...prev, created]);
        showToast("User created");
      }
      setModal(false);
    } catch(e) {
      // Optimistic local fallback
      if (editing) {
        setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
        showToast("Saved locally (API error)");
      } else {
        const fake = { id:Date.now(), ...form, status:"active", resources:0, joined:new Date().toISOString().slice(0,10) };
        setUsers(prev => [...prev, fake]);
        showToast("Added locally (API error)");
      }
      setModal(false);
    } finally { setSaving(false); }
  }

  async function deleteUser(u) {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    setUsers(prev => prev.filter(x => x.id !== u.id));
    showToast("User deleted");
    try { await apiFetch(`${ROUTES.users}/${u.id}`, { method:"DELETE" }); }
    catch { reload(); showToast("Delete failed — restored", "err"); }
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorState msg={error} onRetry={reload} />;

  return (
    <div>
      <FilterBar>
        <input style={filterInput} placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...filterInput, flex:"none", width:130 }} value={roleF} onChange={e => setRoleF(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="business">Business</option>
          <option value="user">User</option>
        </select>
        <Btn variant="gold" onClick={openAdd}>
          <i className="ti ti-user-plus" aria-hidden="true" /> Add User
        </Btn>
      </FilterBar>

      <Card style={{ marginTop:0, borderRadius:"0 0 10px 10px" }}>
        {visible.length === 0
          ? <EmptyState text="No users match your search" />
          : (
            <Tbl headers={["User","Role","Joined","Resources","Status","Actions"]}>
              {visible.map(u => {
                const av = AV_COLORS[Math.abs(u.id % AV_COLORS.length)];
                return (
                  <tr key={u.id}>
                    <td style={TD}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:30, height:30, borderRadius:"50%", background:av.bg, color:av.c,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:700, flexShrink:0, fontFamily:"'Syne',sans-serif" }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <div style={{ fontSize:13 }}>{u.name}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={TD}>
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:5,
                          color:C.text, fontSize:12, padding:"4px 8px", fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
                        <option value="user">user</option>
                        <option value="business">business</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ ...TD, color:C.muted, fontSize:12 }}>{u.joined || u.createdAt?.slice(0,10) || "—"}</td>
                    <td style={TD}><span style={{ color:C.gold, fontWeight:600 }}>{u.resources || 0}</span></td>
                    <td style={TD}><StatusBadge status={u.status || "active"} /></td>
                    <td style={TD}>
                      <div style={{ display:"flex", gap:6 }}>
                        <Btn sm onClick={() => openEdit(u)}><i className="ti ti-edit" aria-hidden="true" /></Btn>
                        <Btn sm variant="danger" onClick={() => deleteUser(u)}><i className="ti ti-trash" aria-hidden="true" /></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Tbl>
          )
        }
      </Card>

      <Modal open={modal} title={editing ? "Edit User" : "Add New User"} onClose={() => setModal(false)}>
        <FormGroup label="Full Name *">
          <Input value={form.name}  onChange={v => setForm(f=>({...f,name:v}))}  placeholder="Abebe Girma" />
        </FormGroup>
        <FormGroup label="Email *">
          <Input type="email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} placeholder="abebe@email.com" />
        </FormGroup>
        <FormGroup label="Role">
          <Select value={form.role} onChange={v => setForm(f=>({...f,role:v}))}>
            <option value="user">User</option>
            <option value="business">Business</option>
            <option value="admin">Admin</option>
          </Select>
        </FormGroup>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:18 }}>
          <Btn onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="gold" onClick={save} disabled={saving}>
            {saving ? "Saving…" : editing ? "Update User" : "Add User"}
          </Btn>
        </div>
      </Modal>

      <Toast msg={toast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── RESOURCES PAGE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORIES = ["Restaurant","Health","Education","Tech","Finance","Transport","Community","Other"];

function ResourcesPage() {
  const { data, loading, error, reload } = useApi(ROUTES.resources);
  const [resources, setResources] = useState([]);
  const [search,    setSearch]    = useState("");
  const [catF,      setCatF]      = useState("");
  const [statusF,   setStatusF]   = useState("");
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState({ name:"", category:"Restaurant", owner:"", description:"" });
  const [saving,    setSaving]    = useState(false);
  const [toast,     showToast]    = useToast();

  useEffect(() => { if (data) setResources(data); }, [data]);

  const visible = resources.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) &&
    (!catF    || r.category === catF) &&
    (!statusF || r.status   === statusF)
  );

  async function toggleStatus(r) {
    const next = r.status === "active" ? "inactive" : "active";
    setResources(prev => prev.map(x => x.id === r.id ? { ...x, status:next } : x));
    showToast("Status updated");
    try { await apiFetch(`${ROUTES.resources}/${r.id}`, { method:"PATCH", body:JSON.stringify({ status:next }) }); }
    catch { reload(); showToast("Sync failed", "err"); }
  }

  async function deleteResource(r) {
    if (!window.confirm(`Delete "${r.name}"?`)) return;
    setResources(prev => prev.filter(x => x.id !== r.id));
    showToast("Resource deleted");
    try { await apiFetch(`${ROUTES.resources}/${r.id}`, { method:"DELETE" }); }
    catch { reload(); showToast("Delete failed", "err"); }
  }

  async function save() {
    if (!form.name) { showToast("Resource name required", "err"); return; }
    setSaving(true);
    try {
      const created = await apiFetch(ROUTES.resources, { method:"POST", body:JSON.stringify({ ...form, views:0, status:"pending" }) });
      setResources(prev => [...prev, created]);
      showToast("Resource added!");
    } catch {
      setResources(prev => [...prev, { id:Date.now(), ...form, views:0, status:"pending" }]);
      showToast("Added locally (API error)");
    } finally { setSaving(false); setModal(false); }
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorState msg={error} onRetry={reload} />;

  return (
    <div>
      <FilterBar>
        <input style={filterInput} placeholder="Search resources…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...filterInput, flex:"none", width:140 }} value={catF} onChange={e => setCatF(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={{ ...filterInput, flex:"none", width:130 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <Btn variant="gold" onClick={() => { setForm({ name:"", category:"Restaurant", owner:"", description:"" }); setModal(true); }}>
          <i className="ti ti-plus" aria-hidden="true" /> Add Resource
        </Btn>
      </FilterBar>

      <Card style={{ marginTop:0, borderRadius:"0 0 10px 10px" }}>
        {visible.length === 0
          ? <EmptyState text="No resources match filters" />
          : (
            <Tbl headers={["Name","Category","Owner","Views","Status","Actions"]}>
              {visible.map(r => (
                <tr key={r.id}>
                  <td style={{ ...TD, fontWeight:500 }}>{r.name}</td>
                  <td style={TD}>
                    <span style={{ background:C.bg4, border:`1px solid ${C.border}`,
                      padding:"2px 9px", borderRadius:4, fontSize:11, color:C.muted }}>
                      {r.category}
                    </span>
                  </td>
                  <td style={{ ...TD, color:C.muted, fontSize:12 }}>{r.owner || "—"}</td>
                  <td style={TD}><span style={{ color:C.blue, fontWeight:500 }}>{(r.views||0).toLocaleString()}</span></td>
                  <td style={TD}><StatusBadge status={r.status} /></td>
                  <td style={TD}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn sm onClick={() => toggleStatus(r)} title={r.status==="active"?"Deactivate":"Activate"}>
                        <i className={`ti ${r.status==="active"?"ti-eye-off":"ti-eye"}`} aria-hidden="true" />
                      </Btn>
                      <Btn sm variant="danger" onClick={() => deleteResource(r)}>
                        <i className="ti ti-trash" aria-hidden="true" />
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </Tbl>
          )
        }
      </Card>

      <Modal open={modal} title="Add Resource" onClose={() => setModal(false)}>
        <FormGroup label="Name *">
          <Input value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="Resource name" />
        </FormGroup>
        <FormGroup label="Category">
          <Select value={form.category} onChange={v => setForm(f=>({...f,category:v}))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>
        </FormGroup>
        <FormGroup label="Owner">
          <Input value={form.owner} onChange={v => setForm(f=>({...f,owner:v}))} placeholder="Owner name" />
        </FormGroup>
        <FormGroup label="Description">
          <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
            placeholder="Brief description…"
            style={{ width:"100%", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6,
              padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"'DM Sans',sans-serif",
              boxSizing:"border-box", outline:"none", resize:"vertical", minHeight:80 }} />
        </FormGroup>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:18 }}>
          <Btn onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="gold" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Resource"}</Btn>
        </div>
      </Modal>

      <Toast msg={toast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function EventsPage() {
  const { data, loading, error, reload } = useApi(ROUTES.events);
  const [events,  setEvents]  = useState([]);
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("");
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ name:"", date:"", location:"", description:"" });
  const [saving,  setSaving]  = useState(false);
  const [toast,   showToast]  = useToast();

  useEffect(() => { if (data) setEvents(data); }, [data]);

  const visible = events.filter(e =>
    (e.name?.toLowerCase().includes(search.toLowerCase()) ||
     e.location?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusF || e.status === statusF)
  );

  async function deleteEvent(e) {
    if (!window.confirm(`Delete "${e.name}"?`)) return;
    setEvents(prev => prev.filter(x => x.id !== e.id));
    showToast("Event deleted");
    try { await apiFetch(`${ROUTES.events}/${e.id}`, { method:"DELETE" }); }
    catch { reload(); showToast("Delete failed", "err"); }
  }

  async function save() {
    if (!form.name || !form.date) { showToast("Event name and date required", "err"); return; }
    setSaving(true);
    try {
      const created = await apiFetch(ROUTES.events, { method:"POST", body:JSON.stringify({ ...form, regs:0, status:"upcoming" }) });
      setEvents(prev => [...prev, created]);
      showToast("Event created!");
    } catch {
      setEvents(prev => [...prev, { id:Date.now(), ...form, regs:0, status:"upcoming" }]);
      showToast("Added locally (API error)");
    } finally { setSaving(false); setModal(false); }
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorState msg={error} onRetry={reload} />;

  return (
    <div>
      <FilterBar>
        <input style={filterInput} placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...filterInput, flex:"none", width:140 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="ended">Ended</option>
        </select>
        <Btn variant="gold" onClick={() => { setForm({ name:"", date:"", location:"", description:"" }); setModal(true); }}>
          <i className="ti ti-plus" aria-hidden="true" /> Add Event
        </Btn>
      </FilterBar>

      <Card style={{ marginTop:0, borderRadius:"0 0 10px 10px" }}>
        {visible.length === 0
          ? <EmptyState text="No events found" />
          : (
            <Tbl headers={["Event","Date","Location","Registrations","Status","Actions"]}>
              {visible.map(e => (
                <tr key={e.id}>
                  <td style={{ ...TD, fontWeight:500 }}>{e.name}</td>
                  <td style={{ ...TD, color:C.muted, fontSize:12 }}>{e.date || e.startDate?.slice(0,10) || "—"}</td>
                  <td style={{ ...TD, color:C.muted, fontSize:12 }}>{e.location || "—"}</td>
                  <td style={TD}><span style={{ color:C.green, fontWeight:500 }}>{(e.regs||e.registrations||0).toLocaleString()}</span></td>
                  <td style={TD}><StatusBadge status={e.status} /></td>
                  <td style={TD}>
                    <Btn sm variant="danger" onClick={() => deleteEvent(e)}>
                      <i className="ti ti-trash" aria-hidden="true" />
                    </Btn>
                  </td>
                </tr>
              ))}
            </Tbl>
          )
        }
      </Card>

      <Modal open={modal} title="Add Event" onClose={() => setModal(false)}>
        <FormGroup label="Event Name *">
          <Input value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="Event title" />
        </FormGroup>
        <FormGroup label="Date *">
          <Input type="date" value={form.date} onChange={v => setForm(f=>({...f,date:v}))} />
        </FormGroup>
        <FormGroup label="Location">
          <Input value={form.location} onChange={v => setForm(f=>({...f,location:v}))} placeholder="Venue, Addis Ababa" />
        </FormGroup>
        <FormGroup label="Description">
          <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
            placeholder="Event description…"
            style={{ width:"100%", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6,
              padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"'DM Sans',sans-serif",
              boxSizing:"border-box", outline:"none", resize:"vertical", minHeight:80 }} />
        </FormGroup>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:18 }}>
          <Btn onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="gold" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Event"}</Btn>
        </div>
      </Modal>

      <Toast msg={toast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Sidebar({ page, setPage, open, setOpen }) {
  const sections = [...new Set(NAV.map(n => n.section))];
  const W  = open ? 210 : 52;

  return (
    <aside style={{
      width:W, minHeight:"100vh", background:C.bg2,
      borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column",
      flexShrink:0, transition:"width .22s cubic-bezier(.4,0,.2,1)", overflow:"hidden",
      position:"relative", zIndex:20,
    }}>
      {/* Logo */}
      <div style={{ padding:"16px 12px 14px", borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:10, minHeight:60 }}>
        <div onClick={() => setOpen(!open)}
          style={{ width:30, height:30, background:C.gold, borderRadius:7, display:"flex",
            alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif",
            fontWeight:700, fontSize:12, color:"#000", flexShrink:0, cursor:"pointer" }}>
          AH
        </div>
        <div style={{ overflow:"hidden", transition:"opacity .22s, width .22s",
          opacity:open?1:0, width:open?120:0, whiteSpace:"nowrap" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:C.gold }}>AddisHub</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>Admin Console</div>
        </div>
        {/* Collapse toggle */}
        <button onClick={() => setOpen(!open)}
          style={{ marginLeft:"auto", background:"none", border:"none", color:C.muted,
            cursor:"pointer", fontSize:14, display:"flex", alignItems:"center",
            transition:"opacity .2s", opacity:open?1:0, padding:0, flexShrink:0 }}
          aria-label="Collapse sidebar">
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"8px 0", overflowY:"auto", overflowX:"hidden" }}>
        {sections.map(sec => (
          <div key={sec}>
            <div style={{ fontSize:9, letterSpacing:".12em", color:C.dim, padding:"10px 14px 4px",
              textTransform:"uppercase", fontFamily:"'Syne',sans-serif",
              overflow:"hidden", transition:"opacity .2s, height .2s",
              opacity:open?1:0, height:open?"auto":0, whiteSpace:"nowrap" }}>
              {sec}
            </div>
            {NAV.filter(n => n.section === sec).map(n => (
              <div key={n.id}
                title={!open ? n.label : undefined}
                onClick={() => setPage(n.id)}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding: open ? "9px 14px" : "9px 0",
                  justifyContent: open ? "flex-start" : "center",
                  margin:"1px 6px", borderRadius:7, cursor:"pointer",
                  fontSize:13, fontFamily:"'DM Sans',sans-serif",
                  transition:"all .15s",
                  color: page === n.id ? C.gold : C.muted,
                  background: page === n.id ? "rgba(201,148,26,0.1)" : "transparent",
                  borderLeft: page === n.id ? `2px solid ${C.gold}` : "2px solid transparent",
                }}>
                <i className={`ti ${n.icon}`} style={{ fontSize:16, flexShrink:0 }} aria-hidden="true" />
                <span style={{ overflow:"hidden", transition:"opacity .2s, width .2s",
                  opacity:open?1:0, width:open?"auto":0, whiteSpace:"nowrap" }}>
                  {n.label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:"12px 10px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:"50%",
            background:"rgba(201,148,26,0.15)", color:C.gold,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, fontFamily:"'Syne',sans-serif", flexShrink:0 }}>K</div>
          <div style={{ overflow:"hidden", transition:"opacity .2s, width .2s",
            opacity:open?1:0, width:open?"auto":0, whiteSpace:"nowrap" }}>
            <div style={{ fontSize:12, color:C.text }}>Kenesa</div>
            <div style={{ fontSize:10, color:C.muted }}>Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROOT ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [page,       setPage]      = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeStr,    setTimeStr]   = useState("");

  useEffect(() => {
    const tick = () => {
      const opts = { timeZone:"Africa/Addis_Ababa", weekday:"short", month:"short",
        day:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit" };
      setTimeStr("EAT — " + new Date().toLocaleString("en-GB", opts));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(16px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(201,148,26,0.3); border-radius:2px; }
        body { margin:0; }
      `}</style>
      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif",
        background:C.bg, color:C.text, overflow:"hidden" }}>

        <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} />

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Topbar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 22px", borderBottom:`1px solid ${C.border}`, background:C.bg2, flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:600 }}>
                {PAGE_TITLES[page]}
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{timeStr}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, background:C.bg3,
                border:`1px solid ${C.border}`, padding:"4px 10px", borderRadius:20, fontSize:11, color:C.muted }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, display:"inline-block",
                  animation:"spin 3s linear infinite", animationName:"none",
                  boxShadow:`0 0 0 0 ${C.green}` }} />
                Live
              </div>
              <span style={{ fontSize:10, background:"rgba(201,148,26,.12)", color:C.gold,
                border:`1px solid rgba(201,148,26,.25)`, padding:"3px 9px",
                borderRadius:4, fontFamily:"'Syne',sans-serif", letterSpacing:".05em" }}>
                SUPER ADMIN
              </span>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {page === "dashboard"  && <DashboardPage />}
            {page === "analytics"  && <AnalyticsPage />}
            {page === "users"      && <UsersPage />}
            {page === "resources"  && <ResourcesPage />}
            {page === "events"     && <EventsPage />}
          </div>
        </div>
      </div>
    </>
  );
}