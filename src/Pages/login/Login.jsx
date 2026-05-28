/**
 * Login.jsx — CRH / Addis HUB Authentication page
 *
 * REAL API:  POST /auth/login  →  { email, password }  →  { token, user }
 * GOOGLE:    Google Identity Services (no extra package needed)
 *            Requires VITE_GOOGLE_CLIENT_ID in your .env file
 *
 * REDUX:     dispatches login({ token, user }) from authSlice
 *
 * FEATURES:
 *  - Email + password with inline validation
 *  - Show / hide password toggle
 *  - Remember me (persists email to localStorage)
 *  - Google One-Tap + button OAuth
 *  - Loading skeleton on submit
 *  - Error banners per field and global
 *  - Redirect to /profile if already logged in
 *  - Fully responsive: split desktop / stacked mobile
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";   // action: login({ token, user })
import api from "../../api/api";

/* ──────────────────────────────────────────────────────────────
   DESIGN TOKENS
────────────────────────────────────────────────────────────── */
const C = {
  bg     : "#080808",
  panel  : "#0D0D0D",
  card   : "#111111",
  card2  : "#161616",
  b1     : "#1A1A1A",
  b2     : "#252525",
  b3     : "#303030",
  gold   : "#046032",
  goldL  : "#04A025",
  goldD  : "#9A7010",
  green  : "#3DB070",
  greenD : "#1A6B3C",
  text   : "#F2F2F2",
  textSec: "#7A7A7A",
  textMut: "#444",
  danger : "#D94F4F",
  info   : "#4A82D4",
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/* ──────────────────────────────────────────────────────────────
   ICONS
────────────────────────────────────────────────────────────── */
const Ico = ({ d, size = 18, color = "currentColor", fill = "none", style: s = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke={color} strokeWidth={1.9}
    strokeLinecap="round" strokeLinejoin="round" style={s}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const I = {
  mail    : ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  lock    : ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  eye     : ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff  : "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  check   : "M20 6L9 17l-5-5",
  alert   : ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  user    : ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  shield  : "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  map     : ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  users   : ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  arrowR  : "M5 12h14M12 5l7 7-7 7",
};

/* Google's coloured logo SVG */
const GoogleLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

/* ──────────────────────────────────────────────────────────────
   VALIDATION
────────────────────────────────────────────────────────────── */
const validateEmail = v => {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  return "";
};
const validatePassword = v => {
  if (!v) return "Password is required";
  if (v.length < 6) return "Password must be at least 6 characters";
  return "";
};

/* ──────────────────────────────────────────────────────────────
   SUB-COMPONENTS
────────────────────────────────────────────────────────────── */

/* Animated hex background */
function HexBg() {
  return (
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.055 }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="lhex" x="0" y="0" width="64" height="56" patternUnits="userSpaceOnUse">
          <polygon points="32,2 60,17 60,47 32,62 4,47 4,17" fill="none" stroke={C.gold} strokeWidth=".8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lhex)"/>
    </svg>
  );
}

/* CRH inline logo mark */
function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="CRH mark">
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

/* Input with icon, label, error */
function InputField({ label, id, type="text", value, onChange, onBlur, error, touched,
                      placeholder, icon, rightEl, autoComplete, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const showErr = touched && error;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <label htmlFor={id} style={{ fontSize:11,fontWeight:700,color:showErr?C.danger:C.textMut,textTransform:"uppercase",letterSpacing:1,transition:"color .2s" }}>
        {label}
      </label>
      <div style={{ position:"relative",borderRadius:12,border:`1.5px solid ${showErr?C.danger:focused?C.gold+"80":C.b2}`,background:C.card2,transition:"border-color .2s",boxShadow:focused&&!showErr?`0 0 0 3px ${C.gold}15`:"none" }}>
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
          <div style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)" }}>
            {rightEl}
          </div>
        )}
      </div>
      {showErr && (
        <div style={{ display:"flex",alignItems:"center",gap:5,animation:"errIn .2s ease" }}>
          <Ico d={I.alert} size={12} color={C.danger}/>
          <span style={{ fontSize:11,color:C.danger }}>{error}</span>
        </div>
      )}
    </div>
  );
}

/* Spinner */
function Spinner({ size = 18, color = "#000" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spinIt .75s linear infinite",flexShrink:0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true);
  setGlobalError("");
  try {
    // Send credential to backend
    const { data } = await api.post("/auth/google", {
      credential: credentialResponse.credential,
    });
 
    // Dispatch to Redux
    dispatch(login({ token: data.token, user: data.user }));
 
    // Save to localStorage
    localStorage.setItem("crh_token", data.token);
    localStorage.setItem("crh_user", JSON.stringify(data.user));
 
    // Redirect to home
    navigate("/home");
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Google login failed";
    setGlobalError(msg);
    console.error("Google OAuth error:", err);
  } finally {
    setLoading(false);
  }
};



  const authUser  = useSelector(s => s.auth.user);

  /* redirect if already logged in */
  useEffect(() => { if (authUser) navigate("/", { replace:true }); }, [authUser, navigate]);

  useEffect(() => {
  // Initialize Google Sign-In
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSuccess,
      auto_select: false,
    });
 
    // Render button if container exists
    const googleButtonContainer = document.getElementById("google-signin-button");
    if (googleButtonContainer) {
      window.google.accounts.id.renderButton(
        googleButtonContainer,
        {
          theme: "filled_black",
          size: "large",
          width: "100%",
        }
      );
    }
  }
}, []);

  /* ── form state ── */
  const [email,    setEmail]    = useState(() => localStorage.getItem("crh_rem_email")||"");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("crh_rem_email"));

  /* ── validation ── */
  const [touched,  setTouched]  = useState({ email:false, password:false });
  const emailErr   = validateEmail(email);
  const passwordErr= validatePassword(password);
  const formValid  = !emailErr && !passwordErr;

  /* ── async state ── */
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [globalErr,setGlobalErr]= useState("");
  const [success,  setSuccess]  = useState(false);

  /* ── Google Identity Services ── */
  const googleBtnRef = useRef(null);

  const handleGoogleCredential = useCallback(async (response) => {
    /* response.credential is a signed JWT (ID token) from Google */
    setGLoading(true); setGlobalErr("");
    try {
      /* Send Google ID token to your backend.
         Add POST /auth/google to your NestJS backend that verifies
         the token with Google and returns { token, user }.
         Until then, this shows the architecture. */
      const { data } = await api.post("/auth/google", {
        credential: response.credential,
      });
      dispatch(login({ token: data.token, user: data.user }));
      setSuccess(true);
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      const msg = err.response?.data?.message;
      setGlobalErr(msg || "Google sign-in failed. Please try email/password.");
    } finally { setGLoading(false); }
  }, [dispatch, navigate]);

  /* load GSI script */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const existing = document.getElementById("gsi-script");
    if (existing) { initGoogle(); return; }
    const script = document.createElement("script");
    script.id  = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, []); // eslint-disable-line

  const initGoogle = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id         : GOOGLE_CLIENT_ID,
      callback          : handleGoogleCredential,
      auto_select       : false,
      cancel_on_tap_outside: true,
    });
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type            : "standard",
        theme           : "filled_black",
        size            : "large",
        text            : "signin_with",
        shape           : "rectangular",
        logo_alignment  : "left",
        width           : "100%",
      });
    }
  };

  const handleGoogleError = () => {
  setGlobalError("Google Sign-In failed. Please try again.");
};

  /* ── Email/password submit ── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setTouched({ email:true, password:true });
    if (!formValid) return;
    setLoading(true); setGlobalErr("");
    try {
      const { data } = await api.post("/auth/login", { email:email.trim(), password });
      /* persist remember-me */
      if (remember) localStorage.setItem("crh_rem_email", email.trim());
      else          localStorage.removeItem("crh_rem_email");
      dispatch(login({ token: data.token || data.access_token, user: data.user || data }));
      setSuccess(true);
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;
      if (status === 401 || status === 403)
        setGlobalErr("Incorrect email or password. Please try again.");
      else if (status === 404)
        setGlobalErr("No account found with this email. Would you like to sign up?");
      else
        setGlobalErr(msg || "Login failed. Check your connection and try again.");
    } finally { setLoading(false); }
  };

  /* Enter-key submit */
  const onKeyDown = e => { if (e.key === "Enter") handleSubmit(); };

  /* ──────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { height:100%; }
        body { min-height:100%; background:${C.bg}; color:${C.text}; font-family:'DM Sans',sans-serif; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:${C.b3}; border-radius:4px; }
        input,textarea { font-family:'DM Sans',sans-serif!important; }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px ${C.card2} inset!important; -webkit-text-fill-color:${C.text}!important; }
        input[type='checkbox'] { accent-color:${C.gold}; width:16px; height:16px; cursor:pointer; }

        @keyframes loginFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes loginFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spinIt       { to{transform:rotate(360deg)} }
        @keyframes errIn        { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
        @keyframes successPop   { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes goldShimmer  { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }
        @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:.5} }

        .l-page    { animation:loginFadeIn .4s ease; }
        .l-panel   { animation:loginFadeUp .45s .05s ease both; }
        .l-form-el { animation:loginFadeUp .35s ease both; }

        /* Responsive: below 820px collapse to single column */
        @media(max-width:820px){
          .l-split  { flex-direction:column!important; }
          .l-left   { display:none!important; }
          .l-right  { max-width:100%!important; padding:28px 20px 48px!important; min-height:100vh!important; }
        }
        @media(max-width:480px){
          .l-right  { padding:20px 16px 40px!important; }
          .l-card   { padding:28px 20px!important; border-radius:16px!important; }
        }
      `}</style>

      <div className="l-page l-split" style={{ display:"flex",minHeight:"100vh",background:C.bg }}>

        {/* ══════════════════════════════════════════════════
            LEFT — branding panel
        ══════════════════════════════════════════════════ */}
        <div className="l-left" style={{ position:"relative",flex:"0 0 42%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"40px 44px",background:C.panel,borderRight:`1px solid ${C.b1}`,overflow:"hidden" }}>
          <HexBg/>
          {/* gold gradient line top */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.greenD},${C.gold},${C.green})` }}/>

          {/* Logo */}
          <div className="l-panel" style={{ display:"flex",alignItems:"center",gap:14,zIndex:1 }}>
            <LogoMark size={44}/>
            <div>
              <div style={{ fontFamily:"Sora,Syne,sans-serif",fontWeight:800,fontSize:20,color:C.text,letterSpacing:.5 }}>
                Addis<span style={{ color:C.gold }}>HUB</span>
              </div>
              <div style={{ fontSize:9,color:C.green,letterSpacing:2.5,textTransform:"uppercase",marginTop:1 }}>
                City Resources Hub
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="l-panel" style={{ zIndex:1 }}>
            <div style={{ fontSize:10,fontWeight:700,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:16 }}>
              Welcome back
            </div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:36,lineHeight:1.2,color:C.text,marginBottom:20 }}>
              Your city's resources,<br/>
              <span style={{ background:`linear-gradient(90deg,${C.gold},${C.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                all in one place
              </span>
            </h1>
            <p style={{ fontSize:14,color:C.textSec,lineHeight:1.8,maxWidth:320 }}>
              Discover community resources, join events, and contribute to building a better Addis Ababa for everyone.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="l-panel" style={{ display:"flex",flexDirection:"column",gap:14,zIndex:1 }}>
            {[
              { icon:I.map,     color:C.gold,  title:"Explore Resources",   desc:"Find health, education & tech hubs near you" },
              { icon:I.trending,color:C.green, title:"Track Events",         desc:"Register and stay updated on community events" },
              { icon:I.users,   color:C.info,  title:"Build Community",      desc:"Connect with contributors across Addis Ababa" },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} style={{ display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:`${color}18`,border:`1px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Ico d={icon} size={16} color={color}/>
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:1 }}>{title}</div>
                  <div style={{ fontSize:11,color:C.textMut }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div className="l-panel" style={{ zIndex:1 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:20,background:`${C.gold}10`,border:`1px solid ${C.gold}28` }}>
              <Ico d={I.shield} size={13} color={C.gold}/>
              <span style={{ fontSize:11,color:C.gold,fontWeight:600 }}>Secured with JWT — Your data stays yours</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT — form panel
        ══════════════════════════════════════════════════ */}
        <div className="l-right" style={{ flex:1,maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 48px" }}>

          {/* Mobile logo (shown only on small screens) */}
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:36 }} className="l-mobile-logo">
            <LogoMark size={36}/>
            <div>
              <div style={{ fontFamily:"Sora,Syne,sans-serif",fontWeight:800,fontSize:18,color:C.text }}>
                Addis<span style={{ color:C.gold }}>HUB</span>
              </div>
              <div style={{ fontSize:8.5,color:C.green,letterSpacing:2.2,textTransform:"uppercase" }}>City Resources Hub</div>
            </div>
          </div>

          {/* Card */}
          <div className="l-card l-panel" style={{ background:C.card,border:`1px solid ${C.b1}`,borderRadius:22,padding:"36px 36px",boxShadow:"0 24px 80px rgba(0,0,0,.55)" }}>

            {/* Heading */}
            <div className="l-form-el" style={{ marginBottom:28 }}>
              <h2 style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,color:C.text,marginBottom:6 }}>
                Sign in to your account
              </h2>
              <p style={{ fontSize:13,color:C.textSec }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ color:C.gold,fontWeight:600,textDecoration:"none" }}>
                  Create one free →
                </Link>
              </p>
            </div>

            {/* ── GOOGLE BUTTON ── */}
                 <div id="google-signin-button" style={{
                      width: "100%",
                      marginTop: 16,
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "center",
                    }} />
                    
                  {/* Divider */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    margin: "20px 0",
                  }}>
                    <div style={{ flex: 1, height: 1, background: C.b2 }} />
                    <span style={{ fontSize: 12, color: C.textSec }}>or</span>
                    <div style={{ flex: 1, height: 1, background: C.b2 }} />
                  </div>

            {/* ── OR DIVIDER ── */}
            <div className="l-form-el" style={{ display:"flex",alignItems:"center",gap:12,marginBottom:22 }}>
              <div style={{ flex:1,height:1,background:C.b2 }}/>
              <span style={{ fontSize:11,color:C.textMut,fontWeight:600,letterSpacing:1,textTransform:"uppercase" }}>or sign in with email</span>
              <div style={{ flex:1,height:1,background:C.b2 }}/>
            </div>

            {/* ── GLOBAL ERROR ── */}
            {globalErr && (
              <div className="l-form-el" style={{ display:"flex",gap:10,alignItems:"flex-start",padding:"12px 14px",borderRadius:10,background:`${C.danger}10`,border:`1px solid ${C.danger}35`,marginBottom:20 }}>
                <Ico d={I.alert} size={15} color={C.danger} style={{ marginTop:1,flexShrink:0 }}/>
                <span style={{ fontSize:13,color:C.danger,lineHeight:1.55 }}>{globalErr}</span>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {success && (
              <div style={{ display:"flex",gap:10,alignItems:"center",padding:"12px 14px",borderRadius:10,background:`${C.green}12`,border:`1px solid ${C.green}35`,marginBottom:20,animation:"successPop .4s ease" }}>
                <Ico d={I.check} size={15} color={C.green}/>
                <span style={{ fontSize:13,color:C.green,fontWeight:600 }}>Signed in! Redirecting…</span>
              </div>
            )}

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} noValidate style={{ display:"flex",flexDirection:"column",gap:18 }}>

              {/* Email */}
              <div className="l-form-el" style={{ animationDelay:".05s" }}>
                <InputField
                  label="Email address"
                  id="email"
                  type="email"
                  value={email}
                  onChange={v=>{ setEmail(v); setGlobalErr(""); }}
                  onBlur={()=>setTouched(p=>({...p,email:true}))}
                  error={emailErr}
                  touched={touched.email}
                  placeholder="you@example.com"
                  icon="mail"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="l-form-el" style={{ animationDelay:".10s" }}>
                <InputField
                  label="Password"
                  id="password"
                  type={showPw?"text":"password"}
                  value={password}
                  onChange={v=>{ setPassword(v); setGlobalErr(""); }}
                  onBlur={()=>setTouched(p=>({...p,password:true}))}
                  error={passwordErr}
                  touched={touched.password}
                  placeholder="Enter your password"
                  icon="lock"
                  autoComplete="current-password"
                  rightEl={
                    <button type="button" onClick={()=>setShowPw(p=>!p)}
                      style={{ background:"none",border:"none",cursor:"pointer",color:C.textSec,padding:6,display:"flex",alignItems:"center",borderRadius:6 }}
                      title={showPw?"Hide password":"Show password"}>
                      <Ico d={showPw?I.eyeOff:I.eye} size={16} color={C.textSec}/>
                    </button>
                  }
                />
              </div>

              {/* Remember me + Forgot password */}
              <div className="l-form-el" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",animationDelay:".15s" }}>
                <label style={{ display:"flex",alignItems:"center",gap:9,cursor:"pointer",userSelect:"none" }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e=>setRemember(e.target.checked)}
                    onKeyDown={onKeyDown}
                  />
                  <span style={{ fontSize:13,color:C.textSec }}>Remember me</span>
                </label>
                <button type="button"
                  onClick={()=>setGlobalErr("Password reset is coming soon. Please contact support.")}
                  style={{ background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.gold,fontWeight:600,fontFamily:"DM Sans,sans-serif",padding:0 }}>
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <div className="l-form-el" style={{ animationDelay:".2s" }}>
                <button
                  type="submit"
                  disabled={loading||success}
                  style={{
                    width:"100%",padding:"14px 20px",borderRadius:12,border:"none",
                    background:loading||success
                      ? `linear-gradient(90deg,${C.goldD},${C.gold},${C.goldD})`
                      : `linear-gradient(90deg,${C.gold},${C.goldL})`,
                    backgroundSize: loading?"300% 100%":"100% 100%",
                    animation: loading ? "goldShimmer 1.4s ease infinite" : "none",
                    color:"#000",fontFamily:"DM Sans,sans-serif",fontWeight:700,fontSize:15,
                    cursor:loading||success?"not-allowed":"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                    transition:"all .2s",letterSpacing:.3,
                    boxShadow:!loading&&!success?`0 4px 20px ${C.gold}40`:"none",
                  }}>
                  {loading
                    ? <><Spinner size={18} color="#000"/>Signing in…</>
                    : success
                    ? <><Ico d={I.check} size={18} color="#000"/>Signed in!</>
                    : <>Sign In <Ico d={I.arrowR} size={17} color="#000"/></>
                  }
                </button>
              </div>
            </form>

            {/* ── ACCOUNT SECURITY ROW ── */}
            <div className="l-form-el" style={{ marginTop:24,paddingTop:20,borderTop:`1px solid ${C.b1}`,display:"flex",alignItems:"center",justifyContent:"center",gap:16,flexWrap:"wrap" }}>
              {[
                { icon:I.lock,   label:"SSL encrypted" },
                { icon:I.shield, label:"JWT secured" },
                { icon:I.user,   label:"Private by default" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <Ico d={icon} size={12} color={C.textMut}/>
                  <span style={{ fontSize:11,color:C.textMut }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign up nudge */}
          <div className="l-panel" style={{ textAlign:"center",marginTop:24 }}>
            <span style={{ fontSize:13,color:C.textMut }}>New to Addis HUB? </span>
            <Link to="/signup" style={{ fontSize:13,color:C.gold,fontWeight:600,textDecoration:"none" }}>
              Create a free account →
            </Link>
          </div>

          {/* Footer note */}
          <div style={{ textAlign:"center",marginTop:16 }}>
            <span style={{ fontSize:11,color:C.textMut,lineHeight:1.6 }}>
              By signing in you agree to our{" "}
              <span style={{ color:C.textSec,cursor:"pointer" }}>Terms of Service</span>
              {" & "}
              <span style={{ color:C.textSec,cursor:"pointer" }}>Privacy Policy</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}