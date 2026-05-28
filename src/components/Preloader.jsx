import { useEffect, useState } from "react";
import "./Preloader.css";

/**
 * CRH Preloader
 * Drop into App.jsx or index route. Unmounts itself after animation completes.
 *
 * Usage:
 *   const [loading, setLoading] = useState(true);
 *   ...
 *   {loading && <Preloader onDone={() => setLoading(false)} />}
 */
const Preloader = ({ onDone }) => {
  const [phase, setPhase] = useState("enter"); // enter → text → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 1400);
    const t2 = setTimeout(() => setPhase("exit"), 2600);
    const t3 = setTimeout(() => onDone?.(),10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`crh-preloader crh-preloader--${phase}`} aria-label="Loading Addis Hub" role="status">
      {/* Ambient background glow */}
      <div className="crh-preloader__glow" />

      {/* Animated mark */}
      <div className="crh-preloader__mark">
        <svg
          width="120"
          height="120"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="crh-preloader__svg"
        >
          {/* Outer ring — draws in */}
          <line className="crh-preloader__ring crh-preloader__ring--1" x1="100" y1="34" x2="157.16" y2="67" stroke="#3DB070" strokeWidth="2.8" strokeLinecap="round" opacity="0.35"/>
          <line className="crh-preloader__ring crh-preloader__ring--2" x1="157.16" y1="67" x2="157.16" y2="133" stroke="#3DB070" strokeWidth="2.8" strokeLinecap="round" opacity="0.35"/>
          <line className="crh-preloader__ring crh-preloader__ring--3" x1="157.16" y1="133" x2="100" y2="166" stroke="#3DB070" strokeWidth="2.8" strokeLinecap="round" opacity="0.35"/>
          <line className="crh-preloader__ring crh-preloader__ring--4" x1="100" y1="166" x2="42.84" y2="133" stroke="#3DB070" strokeWidth="2.8" strokeLinecap="round" opacity="0.35"/>
          <line className="crh-preloader__ring crh-preloader__ring--5" x1="42.84" y1="133" x2="42.84" y2="67" stroke="#3DB070" strokeWidth="2.8" strokeLinecap="round" opacity="0.35"/>
          <line className="crh-preloader__ring crh-preloader__ring--6" x1="42.84" y1="67" x2="100" y2="34" stroke="#3DB070" strokeWidth="2.8" strokeLinecap="round" opacity="0.35"/>

          {/* Spokes from center */}
          <line className="crh-preloader__spoke crh-preloader__spoke--1" x1="100" y1="100" x2="100" y2="34" stroke="#3DB070" strokeWidth="3.92" strokeLinecap="round" opacity="0.6"/>
          <line className="crh-preloader__spoke crh-preloader__spoke--2" x1="100" y1="100" x2="157.16" y2="67" stroke="#3DB070" strokeWidth="3.92" strokeLinecap="round" opacity="0.6"/>
          <line className="crh-preloader__spoke crh-preloader__spoke--3" x1="100" y1="100" x2="157.16" y2="133" stroke="#3DB070" strokeWidth="3.92" strokeLinecap="round" opacity="0.6"/>
          <line className="crh-preloader__spoke crh-preloader__spoke--4" x1="100" y1="100" x2="100" y2="166" stroke="#3DB070" strokeWidth="3.92" strokeLinecap="round" opacity="0.6"/>
          <line className="crh-preloader__spoke crh-preloader__spoke--5" x1="100" y1="100" x2="42.84" y2="133" stroke="#3DB070" strokeWidth="3.92" strokeLinecap="round" opacity="0.6"/>
          <line className="crh-preloader__spoke crh-preloader__spoke--6" x1="100" y1="100" x2="42.84" y2="67" stroke="#3DB070" strokeWidth="3.92" strokeLinecap="round" opacity="0.6"/>

          {/* 6 nodes — alternating filled/outline, staggered pop */}
          <circle className="crh-preloader__node crh-preloader__node--1" cx="100" cy="34" r="17" fill="#3DB070" stroke="#3DB070" strokeWidth="4.2"/>
          <circle className="crh-preloader__node crh-preloader__node--2" cx="157.16" cy="67" r="17" fill="none" stroke="#3DB070" strokeWidth="4.2"/>
          <circle className="crh-preloader__node crh-preloader__node--3" cx="157.16" cy="133" r="17" fill="#3DB070" stroke="#3DB070" strokeWidth="4.2"/>
          <circle className="crh-preloader__node crh-preloader__node--4" cx="100" cy="166" r="17" fill="none" stroke="#3DB070" strokeWidth="4.2"/>
          <circle className="crh-preloader__node crh-preloader__node--5" cx="42.84" cy="133" r="17" fill="#3DB070" stroke="#3DB070" strokeWidth="4.2"/>
          <circle className="crh-preloader__node crh-preloader__node--6" cx="42.84" cy="67" r="17" fill="none" stroke="#3DB070" strokeWidth="4.2"/>

          {/* Center hex */}
          <polygon
            className="crh-preloader__hex"
            points="122.517,87 122.517,113 100,126 77.483,113 77.483,87 100,74"
            fill="#3DB070"
          />
          {/* Center dot */}
          <circle className="crh-preloader__dot" cx="100" cy="100" r="9.88" fill="#0E0E0E"/>
        </svg>
      </div>

      {/* Text block */}
      <div className={`crh-preloader__text ${phase === "text" || phase === "exit" ? "crh-preloader__text--visible" : ""}`}>
        <span className="crh-preloader__wordmark">Addis</span>
        <span className="crh-preloader__sub">HUB</span>
        <span className="crh-preloader__tagline">COMMUNITY RESOURCE HUB</span>
      </div>
    </div>
  );
};

export default Preloader;
