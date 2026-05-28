/**
 * Signup.jsx — CRH / Addis HUB Registration page
 * Route: /signup
 *
 * REAL API:  POST /auth/signup  →  { name, email, password }  →  { token, user }
 * GOOGLE:    Same Google Identity Services as Login — auto-registers if no account
 *
 * FIELDS:
 *  - Full name          (required, min 2 chars)
 *  - Email address      (required, valid format, unique)
 *  - Password           (required, min 8 chars, strength meter)
 *  - Confirm password   (must match)
 *  - Bio                (optional, max 200 chars)
 *  - Terms agreement    (must accept)
 *
 * REDUX: dispatches login({ token, user }) from authSlice on success
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import api from "../../api/api";

/* ─── tokens ──────────────────────────────────────────────────── */
const C = {
  bg     : "#080808",
  panel  : "#0D0D0D",
  card   : "#111111",
  card2  : "#161616",
  b1     : "#1A1A1A",
  b2     : "#252525",
  b3     : "#303030",
  gold   : "#046032",
  goldL  : "#16b666",
  goldD  : "#043E1F",
  green  : "#3DB070",
  greenD : "#1A6B3C",
  text   : "#F2F2F2",
  textSec: "#7A7A7A",
  textMut: "#444",
  danger : "#D94F4F",
  warn   : "#D4914A",
  info   : "#4A82D4",
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/* ─── icons ───────────────────────────────────────────────────── */
const Ico = ({ d, size = 18, color = "currentColor", fill = "none", style: s = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke={color} strokeWidth={1.9}
    strokeLinecap="round" strokeLinejoin="round" style={s}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const I = {
  user    : ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  mail    : ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  lock    : ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  eye     : ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff  : "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  edit    : "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  check   : "M20 6L9 17l-5-5",
  close   : "M18 6L6 18M6 6l12 12",
  alert   : ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  shield  : "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  map     : ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z","M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  star    : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart   : "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  arrowR  : "M5 12h14M12 5l7 7-7 7",
  info    : ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 8h.01","M12 12v4"],
  users   : ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
};

/* Google logo */
const GoogleLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

/* ─── password strength ─────────────────────────────────────── */
const getStrength = pw => {
  if (!pw) return { score: 0, label: "", color: C.b3 };
  let score = 0;
  if (pw.length >= 8)                        score++;
  if (pw.length >= 12)                       score++;
  if (/[A-Z]/.test(pw))                     score++;
  if (/[0-9]/.test(pw))                     score++;
  if (/[^A-Za-z0-9]/.test(pw))             score++;
  const map = [
    { label: "",           color: C.b3     },
    { label: "Weak",       color: C.danger },
    { label: "Fair",       color: C.warn   },
    { label: "Good",       color: C.info   },
    { label: "Strong",     color: C.green  },
    { label: "Very strong",color: C.green  },
  ];
  return { score, ...map[Math.min(score, 5)] };
};

/* ─── validation ────────────────────────────────────────────── */
const V = {
  name    : v => !v.trim() ? "Full name is required" : v.trim().length < 2 ? "Name must be at least 2 characters" : "",
  email   : v => !v.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "",
  password: v => !v ? "Password is required" : v.length < 8 ? "Password must be at least 8 characters" : "",
  confirm : (v, pw) => !v ? "Please confirm your password" : v !== pw ? "Passwords do not match" : "",
  bio     : v => v.length > 200 ? "Bio must be under 200 characters" : "",
  terms   : v => !v ? "You must accept the terms to continue" : "",
};

/* ─── sub-components ────────────────────────────────────────── */
function HexBg() {
  return (
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.05 }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="shex" x="0" y="0" width="64" height="56" patternUnits="userSpaceOnUse">
          <polygon points="32,2 60,17 60,47 32,62 4,47 4,17" fill="none" stroke={C.gold} strokeWidth=".8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#shex)"/>
    </svg>
  );
}

function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="none" stroke={C.gold} strokeWidth="2"/>
      <polygon points="24,10 36,17 36,31 24,38 12,31 12,17" fill={C.greenD} stroke={C.green} strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="4.5" fill={C.gold}/>
      {[0,60,120,180,240,300].map((deg,i)=>{
        const r=(deg*Math.PI)/180;
        return <line key={i} x1="24" y1="24" x2={24+Math.cos(r)*11} y2={24+Math.sin(r)*11} stroke={C.gold} strokeWidth="1.4" opacity=".7"/>;
      })}
    </svg>
  );
}

function Spinner({ size = 18, color = "#000" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spinIt .75s linear infinite",flexShrink:0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

/* Reusable input field */
function InputField({ label, id, type="text", value, onChange, onBlur,
                      error, touched, placeholder, icon, rightEl,
                      autoComplete, autoFocus, hint }) {
  const [focused, setFocused] = useState(false);
  const showErr = touched && error;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <label htmlFor={id} style={{ fontSize:11,fontWeight:700,color:showErr?C.danger:C.textMut,textTransform:"uppercase",letterSpacing:1,transition:"color .2s" }}>
          {label}
        </label>
        {hint && <span style={{ fontSize:10,color:C.textMut }}>{hint}</span>}
      </div>
      <div style={{ position:"relative",borderRadius:12,border:`1.5px solid ${showErr?C.danger:focused?C.gold+"80":C.b2}`,background:C.card2,transition:"all .2s",boxShadow:focused&&!showErr?`0 0 0 3px ${C.gold}15`:"none" }}>
        {icon && (
          <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
            <Ico d={I[icon]} size={16} color={showErr?C.danger:focused?C.gold:C.textMut}/>
          </div>
        )}
        <input
          id={id} type={type} value={value} placeholder={placeholder}
          autoComplete={autoComplete} autoFocus={autoFocus}
          onChange={e=>onChange(e.target.value)}
          onFocus={()=>setFocused(true)}
          onBlur={()=>{ setFocused(false); onBlur?.(); }}
          style={{ width:"100%",boxSizing:"border-box",background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"13px 14px",paddingLeft:icon?42:14,paddingRight:rightEl?46:14,fontFamily:"DM Sans,sans-serif" }}
        />
        {rightEl && (
          <div style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)" }}>{rightEl}</div>
        )}
      </div>
      {showErr ? (
        <div style={{ display:"flex",alignItems:"center",gap:5,animation:"errIn .2s ease" }}>
          <Ico d={I.alert} size={12} color={C.danger}/>
          <span style={{ fontSize:11,color:C.danger }}>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

/* Textarea field */
function TextareaField({ label, id, value, onChange, onBlur, error, touched, placeholder, maxLen }) {
  const [focused, setFocused] = useState(false);
  const showErr = touched && error;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <label htmlFor={id} style={{ fontSize:11,fontWeight:700,color:showErr?C.danger:C.textMut,textTransform:"uppercase",letterSpacing:1 }}>
          {label} <span style={{ color:C.textMut,fontWeight:400,textTransform:"none",letterSpacing:0 }}>(optional)</span>
        </label>
        <span style={{ fontSize:10,color:value.length>maxLen*0.9?C.warn:C.textMut }}>{value.length}/{maxLen}</span>
      </div>
      <div style={{ borderRadius:12,border:`1.5px solid ${showErr?C.danger:focused?C.gold+"80":C.b2}`,background:C.card2,transition:"all .2s",boxShadow:focused&&!showErr?`0 0 0 3px ${C.gold}15`:"none" }}>
        <textarea
          id={id} value={value} placeholder={placeholder} rows={3}
          onChange={e=>onChange(e.target.value.slice(0,maxLen))}
          onFocus={()=>setFocused(true)}
          onBlur={()=>{ setFocused(false); onBlur?.(); }}
          style={{ width:"100%",boxSizing:"border-box",background:"transparent",border:"none",outline:"none",color:C.text,fontSize:14,padding:"12px 14px",fontFamily:"DM Sans,sans-serif",resize:"none",lineHeight:1.65 }}
        />
      </div>
      {showErr && (
        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
          <Ico d={I.alert} size={12} color={C.danger}/>
          <span style={{ fontSize:11,color:C.danger }}>{error}</span>
        </div>
      )}
    </div>
  );
}

/* Password strength bar */
function StrengthBar({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <div style={{ display:"flex",gap:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1,height:3,borderRadius:3,background:i<=score?color:C.b2,transition:"background .3s" }}/>
        ))}
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:10,color,fontWeight:600 }}>{label}</span>
        {score < 3 && (
          <span style={{ fontSize:10,color:C.textMut }}>Use uppercase, numbers & symbols</span>
        )}
      </div>
    </div>
  );
}

/* ─── password requirement checklist ────────────────────────── */
function PwRequirements({ password }) {
  const reqs = [
    { label:"At least 8 characters", met: password.length >= 8 },
    { label:"One uppercase letter",  met: /[A-Z]/.test(password) },
    { label:"One number",            met: /[0-9]/.test(password) },
    { label:"One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:5,padding:"10px 12px",borderRadius:10,background:C.card2,border:`1px solid ${C.b2}` }}>
      {reqs.map(({ label, met }) => (
        <div key={label} style={{ display:"flex",alignItems:"center",gap:7 }}>
          <div style={{ width:14,height:14,borderRadius:"50%",background:met?`${C.green}20`:C.b3,border:`1.5px solid ${met?C.green:C.b3}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s" }}>
            {met && <Ico d={I.check} size={8} color={C.green}/>}
          </div>
          <span style={{ fontSize:11,color:met?C.textSec:C.textMut,transition:"color .2s" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Signup() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const authUser  = useSelector(s => s.auth.user);

  /* redirect if already logged in */
  useEffect(() => { if (authUser) navigate("/", { replace:true }); }, [authUser, navigate]);

  /* ── form fields ── */
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [bio,      setBio]      = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [showPwReqs, setShowPwReqs] = useState(false);

  /* ── validation touched ── */
  const [touched, setTouch] = useState({
    name:false, email:false, password:false, confirm:false, bio:false, terms:false,
  });
  const touch = field => setTouch(p => ({ ...p, [field]:true }));
  const touchAll = () => setTouch({ name:true, email:true, password:true, confirm:true, bio:true, terms:true });

  const errors = {
    name    : V.name(name),
    email   : V.email(email),
    password: V.password(password),
    confirm : V.confirm(confirm, password),
    bio     : V.bio(bio),
    terms   : V.terms(terms),
  };
  const formValid = Object.values(errors).every(e => !e);

  /* ── async state ── */
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const [success,   setSuccess]   = useState(false);

  /* ── Google Identity Services ── */
  const googleBtnRef = useRef(null);

  const handleGoogleCredential = useCallback(async (response) => {
    setGLoading(true); setGlobalErr("");
    try {
      const { data } = await api.post("/auth/google", { credential: response.credential });
      dispatch(login({ token: data.token, user: data.user }));
      setSuccess(true);
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      const msg = err.response?.data?.message;
      setGlobalErr(msg || "Google sign-up failed. Please try with email.");
    } finally { setGLoading(false); }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback : handleGoogleCredential,
        auto_select: false,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type:"standard", theme:"filled_black", size:"large",
          text:"signup_with", shape:"rectangular", logo_alignment:"left", width:"100%",
        });
      }
    };
    const existing = document.getElementById("gsi-script");
    if (existing) { init(); return; }
    const script = document.createElement("script");
    script.id="gsi-script"; script.src="https://accounts.google.com/gsi/client";
    script.async=true; script.defer=true; script.onload=init;
    document.head.appendChild(script);
  }, []); // eslint-disable-line

  /* ── submit ── */
  const handleSubmit = async e => {
    e?.preventDefault();
    touchAll();
    if (!formValid) return;
    setLoading(true); setGlobalErr("");
    try {
      const { data } = await api.post("/auth/signup", {
        name : name.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(bio.trim() && { bio: bio.trim() }),
      });
      dispatch(login({ token: data.token || data.access_token, user: data.user || data }));
      setSuccess(true);
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;
      if (status === 409 || (typeof msg === "string" && msg.toLowerCase().includes("exist")))
        setGlobalErr("An account with this email already exists. Try signing in instead.");
      else
        setGlobalErr(msg || "Registration failed. Check your connection and try again.");
    } finally { setLoading(false); }
  };

  const strength = getStrength(password);

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{height:100%} body{min-height:100%;background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.b3};border-radius:4px}
        input,textarea{font-family:'DM Sans',sans-serif!important}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px ${C.card2} inset!important;-webkit-text-fill-color:${C.text}!important}
        input[type='checkbox']{accent-color:${C.gold};width:16px;height:16px;cursor:pointer}

        @keyframes spFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes spFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spinIt{to{transform:rotate(360deg)}}
        @keyframes errIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
        @keyframes successPop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        @keyframes goldShimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}

        .sp-page{animation:spFadeIn .4s ease}
        .sp-panel{animation:spFadeUp .45s .05s ease both}
        .sp-el{animation:spFadeUp .35s ease both}

        @media(max-width:820px){
          .sp-split{flex-direction:column!important}
          .sp-left{display:none!important}
          .sp-right{max-width:100%!important;padding:28px 20px 48px!important}
        }
        @media(max-width:480px){
          .sp-right{padding:20px 16px 40px!important}
          .sp-card{padding:24px 18px!important;border-radius:16px!important}
          .sp-pw-reqs{display:none!important}
        }
      `}</style>

      <div className="sp-page sp-split" style={{ display:"flex",minHeight:"100vh",background:C.bg }}>

        {/* ══════════════════════════════════════════════════════
            LEFT — branding
        ══════════════════════════════════════════════════════ */}
        <div className="sp-left" style={{ position:"relative",flex:"0 0 42%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"40px 44px",background:C.panel,borderRight:`1px solid ${C.b1}`,overflow:"hidden" }}>
          <HexBg/>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.gold},${C.green},${C.goldD})` }}/>

          {/* Logo */}
          <div className="sp-panel" style={{ display:"flex",alignItems:"center",gap:14,zIndex:1 }}>
            <LogoMark size={44}/>
            <div>
              <div style={{ fontFamily:"Sora,Syne,sans-serif",fontWeight:800,fontSize:20,color:C.text,letterSpacing:.5 }}>
                Addis<span style={{ color:C.gold }}>HUB</span>
              </div>
              <div style={{ fontSize:9,color:C.green,letterSpacing:2.5,textTransform:"uppercase",marginTop:1 }}>City Resources Hub</div>
            </div>
          </div>

          {/* Hero */}
          <div className="sp-panel" style={{ zIndex:1 }}>
            <div style={{ fontSize:10,fontWeight:700,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:16 }}>Join the community</div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:34,lineHeight:1.22,color:C.text,marginBottom:20 }}>
              Be part of building<br/>
              <span style={{ background:`linear-gradient(90deg,${C.gold},${C.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                a better Addis Ababa
              </span>
            </h1>
            <p style={{ fontSize:14,color:C.textSec,lineHeight:1.8,maxWidth:320 }}>
              Share resources, create events, and connect with thousands of community members across the city.
            </p>
          </div>

          {/* Community stats */}
          <div className="sp-panel" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,zIndex:1 }}>
            {[
              { value:"2,400+", label:"Community members",  color:C.gold  },
              { value:"850+",   label:"Resources shared",   color:C.green },
              { value:"140+",   label:"Events hosted",      color:C.info  },
              { value:"10+",    label:"City subcities",     color:C.warn  },
            ].map(s => (
              <div key={s.label} style={{ background:`${C.card}80`,border:`1px solid ${C.b2}`,borderRadius:12,padding:"14px 16px" }}>
                <div style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:s.color,lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11,color:C.textMut,marginTop:5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Perks */}
          <div className="sp-panel" style={{ display:"flex",flexDirection:"column",gap:12,zIndex:1 }}>
            {[
              { icon:I.star,    color:C.gold,  text:"Free forever — no hidden fees" },
              { icon:I.shield,  color:C.green, text:"Your data stays private and secure" },
              { icon:I.trending,color:C.info,  text:"Track impact of your contributions" },
            ].map(({ icon, color, text }) => (
              <div key={text} style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:`${color}18`,border:`1px solid ${color}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Ico d={icon} size={14} color={color}/>
                </div>
                <span style={{ fontSize:12,color:C.textSec }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT — form
        ══════════════════════════════════════════════════════ */}
        <div className="sp-right" style={{ flex:1,maxWidth:580,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 48px",overflowY:"auto" }}>

          {/* Mobile logo */}
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:30 }}>
            <LogoMark size={34}/>
            <div>
              <div style={{ fontFamily:"Sora,Syne,sans-serif",fontWeight:800,fontSize:17,color:C.text }}>Addis<span style={{ color:C.gold }}>HUB</span></div>
              <div style={{ fontSize:8.5,color:C.green,letterSpacing:2.2,textTransform:"uppercase" }}>City Resources Hub</div>
            </div>
          </div>

          {/* Card */}
          <div className="sp-card sp-panel" style={{ background:C.card,border:`1px solid ${C.b1}`,borderRadius:22,padding:"34px 34px",boxShadow:"0 24px 80px rgba(0,0,0,.55)" }}>

            {/* Heading */}
            <div className="sp-el" style={{ marginBottom:26 }}>
              <h2 style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:C.text,marginBottom:6 }}>Create your account</h2>
              <p style={{ fontSize:13,color:C.textSec }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color:C.gold,fontWeight:600,textDecoration:"none" }}>Sign in →</Link>
              </p>
            </div>

            {/* Google button */}
            <div className="sp-el" style={{ marginBottom:20 }}>
              {GOOGLE_CLIENT_ID ? (
                <div ref={googleBtnRef} style={{ width:"100%",minHeight:44,display:"flex",justifyContent:"center" }}/>
              ) : (
                <button type="button" disabled={gLoading}
                  onClick={()=>setGlobalErr("Add VITE_GOOGLE_CLIENT_ID to your .env to enable Google sign-up.")}
                  style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"12px 20px",borderRadius:12,border:`1.5px solid ${C.b3}`,background:C.card2,cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontWeight:600,fontSize:14,color:C.text,transition:"all .2s" }}>
                  {gLoading ? <Spinner size={20} color={C.text}/> : <GoogleLogo size={20}/>}
                  {gLoading ? "Signing up with Google…" : "Sign up with Google"}
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="sp-el" style={{ display:"flex",alignItems:"center",gap:12,marginBottom:22 }}>
              <div style={{ flex:1,height:1,background:C.b2 }}/>
              <span style={{ fontSize:11,color:C.textMut,fontWeight:600,letterSpacing:1,textTransform:"uppercase" }}>or register with email</span>
              <div style={{ flex:1,height:1,background:C.b2 }}/>
            </div>

            {/* Global error */}
            {globalErr && (
              <div className="sp-el" style={{ display:"flex",gap:10,alignItems:"flex-start",padding:"12px 14px",borderRadius:10,background:`${C.danger}10`,border:`1px solid ${C.danger}35`,marginBottom:18 }}>
                <Ico d={I.alert} size={15} color={C.danger} style={{ marginTop:1,flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:13,color:C.danger,lineHeight:1.55 }}>{globalErr}</span>
                  {globalErr.includes("already exists") && (
                    <div style={{ marginTop:6 }}>
                      <Link to="/login" style={{ fontSize:12,color:C.gold,fontWeight:600,textDecoration:"none" }}>Go to login →</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ display:"flex",gap:10,alignItems:"center",padding:"12px 14px",borderRadius:10,background:`${C.green}12`,border:`1px solid ${C.green}35`,marginBottom:18,animation:"successPop .4s ease" }}>
                <Ico d={I.check} size={15} color={C.green}/>
                <span style={{ fontSize:13,color:C.green,fontWeight:600 }}>Account created! Welcome to Addis HUB 🎉</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display:"flex",flexDirection:"column",gap:16 }}>

              {/* Full name */}
              <div className="sp-el" style={{ animationDelay:".04s" }}>
                <InputField label="Full name" id="name" value={name}
                  onChange={v=>{ setName(v); setGlobalErr(""); }}
                  onBlur={()=>touch("name")}
                  error={errors.name} touched={touched.name}
                  placeholder="e.g. Hana Girma"
                  icon="user" autoComplete="name" autoFocus/>
              </div>

              {/* Email */}
              <div className="sp-el" style={{ animationDelay:".08s" }}>
                <InputField label="Email address" id="email" type="email" value={email}
                  onChange={v=>{ setEmail(v); setGlobalErr(""); }}
                  onBlur={()=>touch("email")}
                  error={errors.email} touched={touched.email}
                  placeholder="you@example.com"
                  icon="mail" autoComplete="email"/>
              </div>

              {/* Password */}
              <div className="sp-el" style={{ animationDelay:".12s" }}>
                <InputField label="Password" id="password" type={showPw?"text":"password"}
                  value={password}
                  onChange={v=>{ setPassword(v); setGlobalErr(""); }}
                  onBlur={()=>{ touch("password"); setShowPwReqs(false); }}
                  error={errors.password} touched={touched.password}
                  placeholder="Create a strong password"
                  icon="lock" autoComplete="new-password"
                  hint={`${strength.label}`}
                  rightEl={
                    <button type="button" onClick={()=>setShowPw(p=>!p)}
                      style={{ background:"none",border:"none",cursor:"pointer",color:C.textSec,padding:6,display:"flex",alignItems:"center",borderRadius:6 }}>
                      <Ico d={showPw?I.eyeOff:I.eye} size={16} color={C.textSec}/>
                    </button>
                  }/>
                {/* Strength bar */}
                <StrengthBar password={password}/>
                {/* Requirements checklist */}
                {password && (
                  <div className="sp-pw-reqs">
                    <PwRequirements password={password}/>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="sp-el" style={{ animationDelay:".16s" }}>
                <InputField label="Confirm password" id="confirm" type={showCf?"text":"password"}
                  value={confirm}
                  onChange={v=>{ setConfirm(v); setGlobalErr(""); }}
                  onBlur={()=>touch("confirm")}
                  error={errors.confirm} touched={touched.confirm}
                  placeholder="Re-enter your password"
                  icon="lock" autoComplete="new-password"
                  rightEl={
                    <button type="button" onClick={()=>setShowCf(p=>!p)}
                      style={{ background:"none",border:"none",cursor:"pointer",color:C.textSec,padding:6,display:"flex",alignItems:"center",borderRadius:6 }}>
                      <Ico d={showCf?I.eyeOff:I.eye} size={16} color={C.textSec}/>
                    </button>
                  }/>
                {/* Match indicator */}
                {confirm && password && (
                  <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                    <div style={{ width:14,height:14,borderRadius:"50%",background:confirm===password?`${C.green}20`:C.b3,border:`1.5px solid ${confirm===password?C.green:C.b3}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s" }}>
                      {confirm===password && <Ico d={I.check} size={8} color={C.green}/>}
                    </div>
                    <span style={{ fontSize:11,color:confirm===password?C.green:C.textMut }}>
                      {confirm===password?"Passwords match":"Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio (optional) */}
              <div className="sp-el" style={{ animationDelay:".2s" }}>
                <TextareaField label="Bio" id="bio" value={bio}
                  onChange={v=>{ setBio(v); }}
                  onBlur={()=>touch("bio")}
                  error={errors.bio} touched={touched.bio}
                  placeholder="Tell the community about yourself — interests, role, neighbourhood…"
                  maxLen={200}/>
              </div>

              {/* Terms */}
              <div className="sp-el" style={{ animationDelay:".24s" }}>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  <label style={{ display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer" }}>
                    <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{ marginTop:2,flexShrink:0 }}/>
                    <span style={{ fontSize:13,color:C.textSec,lineHeight:1.6 }}>
                      I agree to the{" "}
                      <span style={{ color:C.gold,fontWeight:600,cursor:"pointer" }}>Terms of Service</span>
                      {" "}and{" "}
                      <span style={{ color:C.gold,fontWeight:600,cursor:"pointer" }}>Privacy Policy</span>
                      . I understand my data stays within the CRH platform.
                    </span>
                  </label>
                  {touched.terms && errors.terms && (
                    <div style={{ display:"flex",alignItems:"center",gap:5,animation:"errIn .2s ease" }}>
                      <Ico d={I.alert} size={12} color={C.danger}/>
                      <span style={{ fontSize:11,color:C.danger }}>{errors.terms}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="sp-el" style={{ animationDelay:".28s",marginTop:4 }}>
                <button type="submit" disabled={loading||success}
                  style={{
                    width:"100%",padding:"14px 20px",borderRadius:12,border:"none",
                    background:loading||success
                      ? `linear-gradient(90deg,${C.goldD},${C.gold},${C.goldD})`
                      : `linear-gradient(90deg,${C.gold},${C.goldL})`,
                    backgroundSize:loading?"300% 100%":"100% 100%",
                    animation:loading?"goldShimmer 1.4s ease infinite":"none",
                    color:"#000",fontFamily:"DM Sans,sans-serif",fontWeight:700,fontSize:15,
                    cursor:loading||success?"not-allowed":"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                    transition:"all .2s",letterSpacing:.3,
                    boxShadow:!loading&&!success?`0 4px 20px ${C.gold}40`:"none",
                  }}>
                  {loading
                    ? <><Spinner size={18} color="#000"/>Creating account…</>
                    : success
                    ? <><Ico d={I.check} size={18} color="#000"/>Account created!</>
                    : <>Create Account <Ico d={I.arrowR} size={17} color="#000"/></>
                  }
                </button>
              </div>

              {/* Progress hint */}
              {!success && !loading && (
                <div className="sp-el" style={{ display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap",animationDelay:".32s" }}>
                  {[
                    { label:"Name",     done:!errors.name     && name     },
                    { label:"Email",    done:!errors.email    && email    },
                    { label:"Password", done:!errors.password && password },
                    { label:"Confirm",  done:!errors.confirm  && confirm  },
                    { label:"Terms",    done:terms                        },
                  ].map(({ label, done }) => (
                    <div key={label} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:20,background:done?`${C.green}14`:C.card2,border:`1px solid ${done?C.green+"30":C.b3}`,transition:"all .25s" }}>
                      <div style={{ width:5,height:5,borderRadius:"50%",background:done?C.green:C.textMut,transition:"background .25s" }}/>
                      <span style={{ fontSize:10,color:done?C.green:C.textMut,transition:"color .25s" }}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>

            {/* Security row */}
            <div className="sp-el" style={{ marginTop:22,paddingTop:18,borderTop:`1px solid ${C.b1}`,display:"flex",alignItems:"center",justifyContent:"center",gap:18,flexWrap:"wrap" }}>
              {[
                { icon:I.lock,   label:"SSL encrypted" },
                { icon:I.shield, label:"JWT secured" },
                { icon:I.users,  label:"Community verified" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <Ico d={icon} size={12} color={C.textMut}/>
                  <span style={{ fontSize:11,color:C.textMut }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign in nudge */}
          <div className="sp-panel" style={{ textAlign:"center",marginTop:22 }}>
            <span style={{ fontSize:13,color:C.textMut }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize:13,color:C.gold,fontWeight:600,textDecoration:"none" }}>Sign in →</Link>
          </div>
        </div>
      </div>
    </>
  );
}