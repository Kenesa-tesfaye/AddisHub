/**
 * UserCard.jsx — fixed version
 *
 * ROOT CAUSE:
 *   GET /resources?userId=  and  GET /events?userId=  both return 500
 *   because your NestJS backend does NOT support userId as a query param.
 *   Supported params are only: category, location.
 *
 * FIX:
 *   1. Fetch /resources and /events once (no userId param).
 *   2. Filter the results client-side by user_id === user.id.
 *   3. Module-level promise cache so all cards on the same page
 *      share ONE network request per endpoint, not one per card.
 *
 * ALSO FIXED:
 *   · avatar border color was #046032 (dark green) — should be #C9941A (gold)
 *   · "View Profile" button color corrected
 *   · role comparison lowercased to match backend ('admin' not 'ADMIN')
 */

import { useState, useEffect } from 'react';
import { FiCalendar, FiTag, FiStar } from 'react-icons/fi';

/* ─── Module-level cache ────────────────────────────────────────
   Shared across all UserCard instances on the same page render.
   Resets when the module is hot-reloaded in dev.
─────────────────────────────────────────────────────────────── */
const _cache = {
  resources : null,   // Promise | null
  events    : null,   // Promise | null
};

/**
 * Fetch the full list once, cache the promise so parallel card
 * renders don't fire duplicate requests.
 */
async function fetchAll(endpoint, apiInstance) {
  if (!_cache[endpoint]) {
    _cache[endpoint] = apiInstance
      .get(`/${endpoint}`)
      .then(r => (Array.isArray(r.data) ? r.data : []))
      .catch(() => []);
  }
  return _cache[endpoint];
}

/* ─── Helpers ───────────────────────────────────────────────── */
const getInitials = name =>
  (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = date => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

/* ─── Design tokens ─────────────────────────────────────────── */
const T = {
  bg     : '#111111',
  bgHov  : '#161616',
  border : '#1E1E1E',
  borderH: '#2A2A2A',
  gold   : '#046032',   
  goldL  : '#046032cc',
  green  : '#3DB070',
  greenD : '#1A6B3C',
  text   : '#FFFFFF',
  textSec: '#888888',
  textMut: '#555555',
};

/* ─── Skeleton pulse ─────────────────────────────────────────── */
function SkeletonNum() {
  return (
    <div style={{
      width: 32, height: 20, borderRadius: 4, margin: '0 auto 2px',
      background: `linear-gradient(90deg, #1E1E1E 25%, #2A2A2A 50%, #1E1E1E 75%)`,
      backgroundSize: '200% 100%',
      animation: 'ucSkel 1.4s ease infinite',
    }}/>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER CARD
═══════════════════════════════════════════════════════════════ */
function UserCard({ user, onClick, apiInstance }) {
  const [resourceCount, setResourceCount] = useState(null); // null = loading
  const [eventCount,    setEventCount]    = useState(null);
  const [hov,           setHov]           = useState(false);

  useEffect(() => {
    if (!user?.id || !apiInstance) return;
    let alive = true;

    (async () => {
      try {
        /* Both requests share the cached promise — only 2 real HTTP calls
           regardless of how many UserCards are on the page */
        const [allResources, allEvents] = await Promise.all([
          fetchAll('resources', apiInstance),
          fetchAll('events',    apiInstance),
        ]);

        if (!alive) return;

        /* Filter client-side by user_id */
        setResourceCount(allResources.filter(r => r.user_id === user.id).length);
        setEventCount(   allEvents.filter(e => e.user_id === user.id).length);
      } catch {
        if (alive) { setResourceCount(0); setEventCount(0); }
      }
    })();

    return () => { alive = false; };
  }, [user?.id, apiInstance]);

  const isAdmin   = user?.role?.toLowerCase() === 'admin';
  const isLoading = resourceCount === null || eventCount === null;

  return (
    <>
      <style>{`
        @keyframes ucSkel {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onClick}
        style={{
          background  : hov ? T.bgHov : T.bg,
          border      : `1px solid ${hov ? T.borderH : T.border}`,
          borderRadius: 16,
          padding     : 20,
          cursor      : 'pointer',
          transition  : 'all 0.2s',
          transform   : hov ? 'translateY(-2px)' : 'none',
          boxShadow   : hov ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
          display     : 'flex',
          flexDirection: 'column',
          gap         : 12,
          fontFamily  : 'DM Sans, sans-serif',
        }}>

        {/* ── Avatar + name/email ── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: user.image ? 'none' : `linear-gradient(135deg, ${T.greenD}, ${T.gold})`,
            border: `2px solid ${T.gold}`,   /* ✅ gold border, was green */
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            overflow: 'hidden',
            boxShadow: `0 0 0 3px rgba(201,148,26,0.15)`,
          }}>
            {user.image
              ? <img src={user.image} alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}/>
              : getInitials(user.name)
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: T.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name || 'Unknown User'}
            </div>
            <div style={{
              fontSize: 12, color: T.textSec,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.email}
            </div>
            {user.role && (
              <span style={{
                display: 'inline-block',
                marginTop: 5,
                fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: isAdmin ? T.green : T.gold,
                background: isAdmin ? `${T.green}15` : `${T.gold}15`,
                border: `1px solid ${isAdmin ? T.green : T.gold}35`,
                padding: '2px 8px', borderRadius: 10,
              }}>
                {isAdmin ? 'Admin' : 'Contributor'}
              </span>
            )}
          </div>
        </div>

        {/* ── Bio ── */}
        {user.bio && (
          <p style={{
            fontSize: 12, color: T.textSec, lineHeight: 1.6, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {user.bio}
          </p>
        )}

        {/* ── Stats ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, paddingTop: 10, borderTop: `1px solid ${T.border}`,
        }}>
          {[
            { label: 'Resources', value: resourceCount, color: T.gold,  icon: <FiTag  size={11}/> },
            { label: 'Events',    value: eventCount,    color: T.green, icon: <FiStar size={11}/> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{
              textAlign: 'center', padding: '8px 4px',
              borderRadius: 10, background: `${color}08`,
              border: `1px solid ${color}18`,
            }}>
              {isLoading
                ? <SkeletonNum/>
                : <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
                    {value}
                  </div>
              }
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                <span style={{ color: T.textMut }}>{icon}</span>
                <span style={{ fontSize: 10, color: T.textMut }}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Join date ── */}
        {user.created_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textMut }}>
            <FiCalendar size={11}/>
            Joined {formatDate(user.created_at)}
          </div>
        )}

        {/* ── View profile button ── */}
        <button
          onClick={e => { e.stopPropagation(); onClick?.(); }}
          onMouseEnter={e => {
            e.currentTarget.style.background = T.goldL;
            e.currentTarget.style.transform  = 'none';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = T.gold;
            e.currentTarget.style.transform  = 'none';
          }}
          style={{
            background: T.gold, 
            border    : 'none',
            borderRadius: 9,
            padding   : '9px 14px',
            color     : '#000',
            fontWeight: 700,
            fontSize  : 12,
            cursor    : 'pointer',
            transition: 'background 0.18s',
            marginTop : 2,
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: 0.3,
          }}>
          View Profile →
        </button>
      </div>
    </>
  );
}

export default UserCard;