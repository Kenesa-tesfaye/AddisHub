import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  FiCalendar, FiMapPin, FiHeart, FiEye,
  FiArrowLeft, FiGrid, FiList, FiAlertCircle,
} from 'react-icons/fi';
import { getUser } from '../../api/auth';
import api from '../../api/api';
import Nav from '../../components/Nav';
import defaultImage from '../../assets/main.png';
import './profile.css';

/* ─── helpers ─────────────────────────────────────────────── */
const formatCount = (v) => {
  const n = Number(v) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA';

const getInitials = (name) =>
  (name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const getEventStatus = (ev) => {
  const now = new Date();
  const rs  = ev.registration_start ? new Date(ev.registration_start) : null;
  const re  = ev.registration_end   ? new Date(ev.registration_end)   : null;
  if (rs && now < rs)  return 'upcoming';
  if (rs && re && now >= rs && now <= re) return 'registration_period';
  if (re && now > re)  return 'ended';
  return 'upcoming';
};

const EV_STATUS = {
  upcoming:            { label: 'Upcoming',   cls: 'badge--blue'  },
  registration_period: { label: 'Reg. Open',  cls: 'badge--green' },
  ended:               { label: 'Ended',      cls: 'badge--gray'  },
};

/* ─── Skeleton ────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, br = 6 }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: br }} />;
}

function CardSkeleton() {
  return (
    <div className="resource-card resource-card--skel">
      <div className="card-image-wrap"><Skel h="100%" br={0} /></div>
      <div className="card-content">
        <Skel w="40%" h={12} br={20} />
        <Skel w="80%" h={18} />
        <Skel h={12} /><Skel w="90%" h={12} />
        <div className="card-stats"><Skel w={70} h={12} /><Skel w={60} h={12} /></div>
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────── */
function Empty({ msg }) {
  return (
    <div className="empty-container">
      <FiAlertCircle size={36} />
      <p>{msg}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
function Userview() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId   = new URLSearchParams(location.search).get('userId');

  const [profile,   setProfile]   = useState(null);
  const [resources, setResources] = useState([]);
  const [events,    setEvents]    = useState([]);
  const [activeTab, setActiveTab] = useState('resources');
  const [viewMode,  setViewMode]  = useState('grid');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!userId) { setError('No user selected.'); setLoading(false); return; }

    let alive = true;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const [userData, resData, evData] = await Promise.all([
          getUser(userId),
          api.get('/resources').then(r =>
            (Array.isArray(r.data) ? r.data : []).filter(x => x.user_id === userId)),
          api.get('/events').then(r =>
            (Array.isArray(r.data) ? r.data : []).filter(x => x.user_id === userId)),
        ]);
        if (!alive) return;
        setProfile(userData);
        setResources(resData);
        setEvents(evData);
      } catch (err) {
        console.error(err);
        if (alive) setError('Unable to load user profile. Please try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [userId]);

  const totalLikes = resources.reduce((s, r) => s + (r.like_count || 0), 0);
  const totalViews = resources.reduce((s, r) => s + (r.view_count || 0), 0);
  const roleLabel  = profile?.role === 'admin' ? 'Admin' : 'Contributor';

  return (
    <div className="profile-page">
      <Nav />
      <div className="profile-container">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <section className="profile-header-section">

          <div className="back-row">
            <button type="button" className="back-link" onClick={() => navigate(-1)}>
              <FiArrowLeft size={15} /> Back
            </button>
          </div>

          <div className="profile-header-content">
            {/* Avatar */}
            <div className="profile-avatar">
              {loading ? (
                <Skel w={96} h={96} br={48} />
              ) : profile?.image ? (
                <img src={profile.image} alt={profile.name || 'avatar'}
                  onError={e => { e.target.src = defaultImage; }} />
              ) : (
                <span>{getInitials(profile?.name)}</span>
              )}
            </div>

            {/* Info */}
            <div className="profile-header-details">
              {loading ? (
                <div className="profile-skel-block">
                  <Skel w={180} h={24} /><Skel w={140} h={14} />
                  <Skel h={13} /><Skel w="75%" h={13} />
                </div>
              ) : (
                <>
                  <div className="profile-header-top">
                    <div>
                      <h1 className="profile-name">{profile?.name || 'Unknown User'}</h1>
                      <p className="profile-email">{profile?.email || ''}</p>
                    </div>
                    <span className={`role-badge role-badge--${profile?.role === 'admin' ? 'admin' : 'user'}`}>
                      {roleLabel}
                    </span>
                  </div>
                  <p className="profile-bio">
                    {profile?.bio || 'This user has not added a bio yet.'}
                  </p>
                  <div className="profile-meta-row">
                    {profile?.location && (
                      <div className="profile-meta-item">
                        <FiMapPin size={11} />{profile.location}
                      </div>
                    )}
                    <div className="profile-meta-item">
                      <FiCalendar size={11} />Joined {formatDate(profile?.created_at)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats-grid">
            {[
              { label: 'Resources', value: loading ? '—' : resources.length },
              { label: 'Events',    value: loading ? '—' : events.length },
              { label: 'Likes',     value: loading ? '—' : formatCount(totalLikes) },
              { label: 'Views',     value: loading ? '—' : formatCount(totalViews) },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTENT ─────────────────────────────────────────── */}
        <section className="profile-section">

          <div className="section-header">
            <div className="profile-tabs">
              {[
                { id: 'resources', label: 'Resources', count: resources.length },
                { id: 'events',    label: 'Events',    count: events.length },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                  {!loading && <span className="tab-count">{t.count}</span>}
                </button>
              ))}
            </div>

            {activeTab === 'resources' && !loading && resources.length > 0 && (
              <div className="view-toggle">
                <button type="button" title="Grid" onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}>
                  <FiGrid size={14} />
                </button>
                <button type="button" title="List" onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}>
                  <FiList size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="profile-content">
            {error && <Empty msg={error} />}

            {/* Resources */}
            {!error && activeTab === 'resources' && (
              <div className={`resources-grid resources-grid--${viewMode}`}>
                {loading
                  ? [1,2,3].map(i => <CardSkeleton key={i} />)
                  : resources.length === 0
                    ? <Empty msg="This user has not published any resources yet." />
                    : resources.map(r => (
                        <div key={r.id} className={`resource-card resource-card--${viewMode}`}>
                          <div className="card-image-wrap">
                            <img src={r.image_url || defaultImage} alt={r.title}
                              onError={e => { e.target.src = defaultImage; }} />
                            {r.category && <span className="card-category-badge">{r.category}</span>}
                          </div>
                          <div className="card-content">
                            <h4 className="card-title">{r.title}</h4>
                            <p className="description">{r.description || 'No description available.'}</p>
                            {r.location && (
                              <div className="card-location"><FiMapPin size={11}/>{r.location}</div>
                            )}
                            <div className="card-stats">
                              <span><FiEye size={13}/>{formatCount(r.view_count)}</span>
                              <span><FiHeart size={13}/>{formatCount(r.like_count)}</span>
                            </div>
                            <Link className="card-link" to={`/resources/${r.id}`}>
                              View resource →
                            </Link>
                          </div>
                        </div>
                      ))
                }
              </div>
            )}

            {/* Events */}
            {!error && activeTab === 'events' && (
              <div className="resources-grid resources-grid--grid">
                {loading
                  ? [1,2,3].map(i => <CardSkeleton key={i} />)
                  : events.length === 0
                    ? <Empty msg="This user has not created any events yet." />
                    : events.map(ev => {
                        const status = getEventStatus(ev);
                        const st     = EV_STATUS[status] || EV_STATUS.upcoming;
                        const pct    = ev.capacity ? Math.min(100, ((ev.registered||0)/ev.capacity)*100) : 0;
                        return (
                          <div key={ev.id} className="resource-card resource-card--grid">
                            <div className="card-image-wrap">
                              <img src={ev.image_url || defaultImage} alt={ev.title}
                                onError={e => { e.target.src = defaultImage; }} />
                              <span className={`card-category-badge ${st.cls}`}>{st.label}</span>
                            </div>
                            <div className="card-content">
                              {ev.category && <span className="card-category-text">{ev.category}</span>}
                              <h4 className="card-title">{ev.title}</h4>
                              <p className="description">{ev.description || 'No event description.'}</p>
                              <div className="card-stats">
                                <span><FiCalendar size={13}/>{formatDate(ev.event_date)}</span>
                                <span className={ev.entry_fee ? 'stat--gold' : 'stat--green'}>
                                  {ev.entry_fee ? `${ev.entry_fee} ETB` : 'Free'}
                                </span>
                              </div>
                              {ev.capacity && (
                                <div className="capacity-bar-wrap">
                                  <div className="capacity-bar-labels">
                                    <span>Registrations</span>
                                    <span>{ev.registered||0}/{ev.capacity}</span>
                                  </div>
                                  <div className="capacity-bar">
                                    <div className="capacity-bar-fill" style={{ width: `${pct}%` }}/>
                                  </div>
                                </div>
                              )}
                              <Link className="card-link" to={`/resources/${ev.id}`}>View event →</Link>
                            </div>
                          </div>
                        );
                      })
                }
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Userview;