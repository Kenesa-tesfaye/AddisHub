import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  FiHome, FiBookmark, FiMap, FiUser, FiSettings,
  FiLogOut, FiPlus, FiBell, FiSearch, FiMenu,
  FiHeart, FiEye, FiCalendar, FiMapPin, FiUsers,
  FiChevronLeft, FiFilter
} from 'react-icons/fi';
import defaultimg from '../../assets/main.png';
import { MdOutlineEvent } from 'react-icons/md';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import api from '../../api/api';
import { getAllUsers } from '../../api/auth';
import './home2.css';
import ResourceCard from './resources comp/ResourceCard';
import EventCard from './resources comp/EventCard';
import UserCard from './resources comp/UserCard';
import Logo from '../../components/Logo';
import BottomNav from '../../components/BottomNav';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCount = (num) => {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
};

const formatDate = (date) => {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1580746738099-b2d87cdc13a9?w=400&q=70';
const DEFAULT_EVENT_IMG = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=70';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: <FiHome size={18} />, label: 'Home', path: '/' },
  { icon: <HiOutlineBuildingOffice2 size={18} />, label: 'Resources', path: '/resources' },
  { icon: <MdOutlineEvent size={18} />, label: 'Events', path: '/resources' },
  { icon: <FiMap size={18} />, label: 'Map View', path: '/map' },
  { icon: <FiBookmark size={18} />, label: 'Saved', path: '/profile' },
];

const NAV_ACCOUNT = [
  { icon: <FiUser size={18} />, label: 'Profile', path: '/profile' },
  { icon: <FiSettings size={18} />, label: 'Settings', path: '/' },
];


// ─── Home Page ────────────────────────────────────────────────────────────────
function Home1() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [collapsed, setCollapsed] = useState(false);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [likedCount, setLikedCount] = useState(0);
  const [loadingRes, setLoadingRes] = useState(true);
  const [loadingEv, setLoadingEv] = useState(true);
  const [activeNav, setActiveNav] = useState('Home');
  const [search, setSearch] = useState('');

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterEventType, setFilterEventType] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | resources | events | users
  const [userLocation, setUserLocation] = useState(null);
  const [nearMe, setNearMe] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // User search
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const CATEGORIES = ['Health', 'Education', 'Technology', 'Culture', 'Finance', 'Transport'];
  const LOCATIONS = ['Bole', 'Kazanchis', 'Piazza', 'CMC', 'Jemo', '4 Kilo', 'Mexico'];
  const EVENT_TYPES = ['upcoming', 'registration_period', 'ended'];
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('all');



  const buildNotifications = (eventsData, resourcesData) => {
    const notifs = [];

    // registration open events
    eventsData
      .filter(e => e.event_type === 'registration_period')
      .forEach(e => {
        notifs.push({
          id: `ev-reg-${e.id}`,
          type: 'events',
          icon: 'ti-calendar-event',
          iconBg: '#1a3a5c',
          iconColor: '#5b9bd5',
          title: 'Registration is now open',
          body: `${e.title} registration is open. Secure your spot now.`,
          time: '2m ago',
          read: false,
          action: { label: 'Register Now', path: '/resources' },
        });
      });

    // top liked resource
    const topLiked = [...resourcesData].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))[0];
    if (topLiked) {
      notifs.push({
        id: `res-liked-${topLiked.id}`,
        type: 'resources',
        icon: 'ti-heart',
        iconBg: '#C9941A15',
        iconColor: '#C9941A',
        title: 'Your resource was liked',
        body: `${topLiked.title} received ${topLiked.like_count || 0} likes.`,
        time: '15m ago',
        read: false,
        action: null,
      });
    }

    // upcoming events reminder
    eventsData
      .filter(e => e.event_type === 'upcoming')
      .slice(0, 1)
      .forEach(e => {
        notifs.push({
          id: `ev-up-${e.id}`,
          type: 'events',
          icon: 'ti-bell',
          iconBg: 'var(--color-background-secondary)',
          iconColor: 'var(--color-text-tertiary)',
          title: 'Event reminder',
          body: `${e.title} is coming up soon.`,
          time: '1h ago',
          read: true,
          action: null,
        });
      });

    setNotifications(notifs);
  };

  const fetchEvents = async () => {
    setLoadingEv(true);
    try {
      const res = await api.get('/events');
      setEvents(res.data);
      buildNotifications(res.data, resources); // ✅ build notifications
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEv(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNearMe = () => {
    if (nearMe) {
      setNearMe(false);
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearMe(true);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError('Location access denied');
        setLocationLoading(false);
      }
    );
  };




  // Haversine formula — calculates km between two coordinates
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Parse map_location field — your DB stores "9.0227,38.7468"
  const parseCoords = (mapLocation) => {
    if (!mapLocation) return null;
    const parts = mapLocation.split(',');
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };



  const NEAR_ME_RADIUS_KM = 10; // 10km radius

  const filteredResources = resources.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? r.category === filterCategory : true;
    const matchLocation = filterLocation
      ? r.location?.toLowerCase().includes(filterLocation.toLowerCase())
      : true;

    // near me filter
    let matchNearMe = true;
    if (nearMe && userLocation) {
      const coords = parseCoords(r.map_location);
      if (coords) {
        const dist = getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        matchNearMe = dist <= NEAR_ME_RADIUS_KM;
      } else {
        matchNearMe = false;
      }
    }

    return matchSearch && matchCategory && matchLocation && matchNearMe;
  });

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? e.category === filterCategory : true;
    const matchLocation = filterLocation
      ? e.location?.toLowerCase().includes(filterLocation.toLowerCase())
      : true;
    const matchType = filterEventType ? e.event_type === filterEventType : true;

    // near me filter
    let matchNearMe = true;
    if (nearMe && userLocation) {
      const coords = parseCoords(e.map_location);
      if (coords) {
        const dist = getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        matchNearMe = dist <= NEAR_ME_RADIUS_KM;
      } else {
        matchNearMe = false;
      }
    }

    return matchSearch && matchCategory && matchLocation && matchType && matchNearMe;
  });

  const filteredUsers = users.filter((u) => {
    return u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
  });

  const activeFilterCount = [filterCategory, filterLocation, filterEventType, filterType !== 'all' ? filterType : ''].filter(Boolean).length;

  useEffect(() => {
    fetchResources();
    fetchEvents();
    fetchUsers();
    if (user?.id) fetchUserStats();
  }, []);

  useEffect(() => {
    const query = userSearch.trim();
    const timer = setTimeout(() => {
      fetchUsers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    if (filterType === 'resources' || filterType === 'events') {
      setUserSearch('');
    }
  }, [filterType]);

  const fetchResources = async () => {
    setLoadingRes(true);
    try {
      const res = await api.get('/resources');
      const data = res.data;
      setResources(data.slice(0, 6));
      // trending = top by view_count
      setTrending([...data].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRes(false);
    }
  };

  const getDistanceLabel = (mapLocation) => {
    if (!nearMe || !userLocation) return null;
    const coords = parseCoords(mapLocation);
    if (!coords) return null;
    const dist = getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
    return dist < 1 ? `${(dist * 1000).toFixed(0)}m away` : `${dist.toFixed(1)}km away`;
  };



  const fetchUserStats = async () => {
    try {
      const res = await api.get(`/auth/${user.id}`);
      setLikedCount(res.data.favourite_resources?.length || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async (searchQuery = '') => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers(searchQuery);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const registrationEvents = events.filter(e => e.event_type === 'registration_period');
  const upcomingEvents = events.filter(e => e.event_type === 'upcoming').slice(0, 3);



  return (
    <div className="h-app">

      {/* ── Top Bar ── */}
      <header className="h-topbar">
        <button
          className="h-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiMenu size={18} /> : <FiChevronLeft size={18} />}
        </button>

        <div className={`h-logo ${collapsed ? 'logo-small' : ''}`}>
          <Logo variant="icon" />
        </div>

        <div className="h-search-wrap">
          <FiSearch className="h-search-icon" size={15} />
          <input
            type="text"
            value={filterType === 'users' ? userSearch : search}
            onChange={(e) => {
              if (filterType === 'users') {
                setUserSearch(e.target.value);
              } else {
                setSearch(e.target.value);
              }
            }}
            placeholder={filterType === 'users' ? "Search users by name or email..." : "Search resources, events..."}
            className="h-search-input"
          />
        </div>

        <div className="h-topbar-right">
          <div
            className="h-notif-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ position: 'relative' }}
          >
            <FiBell size={17} />
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="h-ndot" />
            )}
          </div>
          <span className="h-user-name">{user?.name?.split(' ')[0] || 'User'}</span>
          <div className="h-avatar">{getInitials(user?.name)}</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="h-body">
        {/* Notification Panel */}
        {notifOpen && (
          <div className="h-notif-panel">
            {/* Header */}
            <div className="h-notif-header">
              <div className="h-notif-title-row">
                <span className="h-notif-title">Notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="h-notif-count">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div className="h-notif-actions">
                <button onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}>
                  Mark all read
                </button>
                <button onClick={() => setNotifications([])}>Clear all</button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="h-notif-tabs">
              {['all', 'unread', 'events', 'resources'].map((tab) => (
                <button
                  key={tab}
                  className={`h-notif-tab ${notifFilter === tab ? 'active' : ''}`}
                  onClick={() => setNotifFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="h-notif-list">
              {notifications
                .filter(n => {
                  if (notifFilter === 'unread') return !n.read;
                  if (notifFilter === 'events') return n.type === 'events';
                  if (notifFilter === 'resources') return n.type === 'resources';
                  return true;
                })
                .length === 0 ? (
                <div className="h-notif-empty">
                  <FiBell size={28} />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications
                  .filter(n => {
                    if (notifFilter === 'unread') return !n.read;
                    if (notifFilter === 'events') return n.type === 'events';
                    if (notifFilter === 'resources') return n.type === 'resources';
                    return true;
                  })
                  .map((n) => (
                    <div
                      key={n.id}
                      className={`h-notif-item ${n.read ? '' : 'unread'}`}
                      onClick={() => setNotifications(prev =>
                        prev.map(x => x.id === n.id ? { ...x, read: true } : x)
                      )}
                    >
                      <div
                        className="h-notif-icon"
                        style={{ background: n.iconBg }}
                      >
                        <i className={`ti ${n.icon}`} style={{ color: n.iconColor }} />
                      </div>
                      <div className="h-notif-body">
                        <div className="h-notif-row">
                          <span className="h-notif-item-title">{n.title}</span>
                          <span className="h-notif-time">{n.time}</span>
                        </div>
                        <p className="h-notif-text">{n.body}</p>
                        {n.action && (
                          <button
                            className="h-notif-action-btn"
                            onClick={(e) => { e.stopPropagation(); navigate(n.action.path); }}
                          >
                            {n.action.label}
                          </button>
                        )}
                      </div>
                      {!n.read && <div className="h-notif-dot" />}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ── Sidebar ── */}
        <aside className={`h-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <nav className="h-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`h-nav-item ${activeNav === item.label ? 'active' : ''}`}
                onClick={() => setActiveNav(item.label)}
              >
                <span className="h-nav-icon">{item.icon}</span>
                <span className="h-nav-text">{item.label}</span>
                {!collapsed && item.label === 'Resources' && (
                  <span className="h-nav-badge">{resources.length}</span>
                )}
                <span className="h-tooltip">{item.label}</span>
              </Link>
            ))}

            <span className={`h-nav-label ${collapsed ? 'hide' : ''}`}>Account</span>

            {NAV_ACCOUNT.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="h-nav-item"
              >
                <span className="h-nav-icon">{item.icon}</span>
                <span className="h-nav-text">{item.label}</span>
                <span className="h-tooltip">{item.label}</span>
              </Link>
            ))}

            <button className="h-nav-item h-logout-btn" onClick={handleLogout}>
              <span className="h-nav-icon"><FiLogOut size={18} /></span>
              <span className="h-nav-text">Logout</span>
              <span className="h-tooltip">Logout</span>
            </button>
          </nav>

          <Link to="/resources" className="h-add-btn">
            <FiPlus size={18} />
            <span className="h-nav-text">Add Resource</span>
          </Link>
        </aside>

        {/* ── Main Feed ── */}
        <main className="h-main">

          {/* Greeting */}
          <div className="h-greeting">
            <div>
              <h2>{getGreeting()}, <span>{user?.name?.split(' ')[0] || 'there'}</span></h2>
              <p>Here's what's happening in Addis today</p>
            </div>
            {/* Filter Toggle Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                className={`h-chip ${nearMe ? 'active' : ''}`}
                onClick={handleNearMe}
              >
                <FiMapPin size={12} />
                {locationLoading ? 'Getting location...' : nearMe ? 'Near me ✓' : 'Near me'}
              </div>
              {locationError && (
                <span style={{ fontSize: '11px', color: '#ff4444' }}>{locationError}</span>
              )}
              <button
                className={`h-filter-toggle ${filterOpen ? 'active' : ''}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FiFilter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="h-filter-count">{activeFilterCount}</span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  className="h-filter-clear"
                  onClick={() => {
                    setFilterCategory('');
                    setFilterLocation('');
                    setFilterEventType('');
                    setFilterType('all');
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Filter Panel */}
            {filterOpen && (
              <div className="h-filter-panel">

                {/* Content Type */}
                <div className="h-filter-group">
                  <span className="h-filter-label">Show</span>
                  <div className="h-filter-chips">
                    {['all', 'resources', 'events', 'users'].map((t) => (
                      <button
                        key={t}
                        className={`h-filter-chip ${filterType === t ? 'active' : ''}`}
                        onClick={() => setFilterType(t)}
                      >
                        {t === 'all' ? 'All' : t === 'resources' ? 'Resources' : t === 'events' ? 'Events' : 'Users'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="h-filter-group">
                  <span className="h-filter-label">Category</span>
                  <div className="h-filter-chips">
                    <button
                      className={`h-filter-chip ${filterCategory === '' ? 'active' : ''}`}
                      onClick={() => setFilterCategory('')}
                    >
                      All
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        className={`h-filter-chip ${filterCategory === cat ? 'active' : ''}`}
                        onClick={() => setFilterCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="h-filter-group">
                  <span className="h-filter-label">Location</span>
                  <div className="h-filter-chips">
                    <button
                      className={`h-filter-chip ${filterLocation === '' ? 'active' : ''}`}
                      onClick={() => setFilterLocation('')}
                    >
                      All
                    </button>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        className={`h-filter-chip ${filterLocation === loc ? 'active' : ''}`}
                        onClick={() => setFilterLocation(loc)}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div className="h-filter-group">
                  <span className="h-filter-label">Event Type</span>
                  <div className="h-filter-chips">
                    <button
                      className={`h-filter-chip ${filterEventType === '' ? 'active' : ''}`}
                      onClick={() => setFilterEventType('')}
                    >
                      All
                    </button>
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type}
                        className={`h-filter-chip ${filterEventType === type ? 'active' : ''}`}
                        onClick={() => setFilterEventType(type)}
                      >
                        {type === 'upcoming' ? 'Upcoming'
                          : type === 'registration_period' ? 'Registration Open'
                            : 'Ended'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Stats */}
          <div className="h-stats-row">
            <div className="h-stat-card">
              <div className="h-stat-top">
                <div className="h-stat-icon gold"><FiHeart size={15} /></div>
                <span className="h-stat-trend">your likes</span>
              </div>
              <div className="h-stat-num">{likedCount}</div>
              <div className="h-stat-lbl">Liked Resources</div>
            </div>
            <div className="h-stat-card">
              <div className="h-stat-top">
                <div className="h-stat-icon blue"><FiCalendar size={15} /></div>
                <span className="h-stat-trend">{registrationEvents.length} open</span>
              </div>
              <div className="h-stat-num">{events.length}</div>
              <div className="h-stat-lbl">Total Events</div>
            </div>
            <div className="h-stat-card">
              <div className="h-stat-top">
                <div className="h-stat-icon green"><HiOutlineBuildingOffice2 size={15} /></div>
                <span className="h-stat-trend">in Addis</span>
              </div>
              <div className="h-stat-num">{resources.length}+</div>
              <div className="h-stat-lbl">Resources</div>
            </div>

            <div className="h-stat-card">
              <div className="h-stat-top">
                <div className="h-stat-icon purple"><FiEye size={15} /></div>
                <span className="h-stat-trend">total</span>
              </div>
              <div className="h-stat-num">
                {formatCount(resources.reduce((acc, r) => acc + (r.view_count || 0), 0))}
              </div>
              <div className="h-stat-lbl">Total Views</div>
            </div>
          </div>

          {/* Registration open event — highlighted */}
          {registrationEvents[0] && (
            <div className="h-event-wide">
              <img
                src={registrationEvents[0].image_url || DEFAULT_EVENT_IMG}
                alt={registrationEvents[0].title}
                onError={(e) => { e.target.src = DEFAULT_EVENT_IMG; }}
              />
              <div className="h-event-overlay">
                <span className="h-event-badge">Registration Open</span>
                <h3 className="h-event-title">{registrationEvents[0].title}</h3>
                <div className="h-event-meta">
                  <span><FiCalendar size={12} /> {formatDate(registrationEvents[0].event_date)}</span>
                  <span><FiMapPin size={12} /> {registrationEvents[0].location}</span>
                  <span>{registrationEvents[0].entry_fee ? `${registrationEvents[0].entry_fee} ETB` : 'Free'}</span>
                </div>
              </div>
              <button
                className="h-event-reg-btn"
                onClick={() => navigate('/resources')}
              >
                Register Now
              </button>
            </div>
          )}

          {/* Feed */}
          {(filterType === 'all' || filterType === 'resources') && (
            <>
              <div className="h-feed-label">
                <h3>Latest Resources</h3>
                <Link to="/resources">See all</Link>
              </div>

              <div className="h-feed-grid">
                {loadingRes ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-feed-card h-skeleton-card">
                      <div className="h-skeleton-img" />
                      <div className="h-feed-body">
                        <div className="h-skeleton-line short" />
                        <div className="h-skeleton-line" />
                        <div className="h-skeleton-line short" />
                      </div>
                    </div>
                  ))
                ) : filteredResources.length === 0 ? (
                  <p className="h-empty">No resources found.</p>
                ) : (
                  filteredResources.map((r) => (
                    <ResourceCard key={r.id} resource={r} onClick={() => navigate(`/resources/${r.id}`)} />
                  ))
                )}
              </div>

              {/* Divider */}
              <div className="h-section-divider" />
            </>
          )}

          {/* Events Feed */}
          {(filterType === 'all' || filterType === 'events') && (
            <>
              <div className="h-feed-label">
                <h3>Latest Events</h3>
                <Link to="/resources">See all</Link>
              </div>

              <div className="h-events-grid">
                {loadingEv ? (
                  [1, 2].map((i) => (
                    <div key={i} className="h-event-feed-card h-skeleton-card">
                      <div className="h-skeleton-img" style={{ height: '160px' }} />
                    </div>
                  ))
                ) : filteredEvents.length === 0 ? (
                  <p className="h-empty">No events found.</p>
                ) : (
                  filteredEvents.map((e) => (
                    <div
                      key={e.id}
                      className="h-event-feed-card"
                      onClick={() => navigate('/resources')}
                    >
                      <img
                        src={e.image_url || DEFAULT_EVENT_IMG}
                        alt={e.title}
                        onError={(ev) => { ev.target.src = DEFAULT_EVENT_IMG; }}
                      />
                      <div className="h-event-feed-overlay" />
                      <div className="h-event-feed-content">
                        <span className={`h-event-feed-badge ${e.event_type}`}>
                          {e.event_type === 'registration_period' ? 'Registration Open'
                            : e.event_type === 'upcoming' ? 'Upcoming' : 'Ended'}
                        </span>
                        <div className="h-event-feed-title">{e.title}</div>
                        <div className="h-event-feed-meta">
                          <span><FiCalendar size={11} />{formatDate(e.event_date)}</span>
                          <span><FiMapPin size={11} />{e.location}</span>
                          <span>{e.entry_fee ? `${e.entry_fee} ETB` : 'Free'}</span>
                        </div>
                      </div>
                      {e.event_type === 'registration_period' && (
                        <button
                          className="h-event-feed-btn"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            navigate('/resources');
                          }}
                        >
                          Register
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Users Feed */}
          {(filterType === 'all' || filterType === 'users') && (
            <>
              <div className="h-feed-label">
                <h3>Community Contributors</h3>
              </div>

              {/* User search bar */}
              <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: '#111',
                  border: '1px solid #1E1E1E',
                  borderRadius: 10,
                  paddingLeft: 12,
                  gap: 8,
                }}>
                  <FiSearch size={15} color="#888" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search contributors..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      fontSize: 14,
                      padding: '10px 0',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div className="h-feed-grid">
                {loadingUsers ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-feed-card h-skeleton-card">
                      <div className="h-skeleton-line" />
                      <div className="h-skeleton-line short" />
                      <div className="h-skeleton-line" />
                    </div>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <p className="h-empty">No contributors found.</p>
                ) : (
                  filteredUsers.map((u) => (

                    <UserCard
                      key={u.id}
                      user={u}
                      apiInstance={api}          // ← pass api here
                      onClick={() => navigate(`/User-view?userId=${u.id}`)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </main>

        {/* ── Right Panel ── */}
        <aside className="h-right-panel">

          {/* Trending */}
          <div className="h-panel-section">
            <div className="h-panel-title">Trending this week</div>
            {trending.map((r, i) => (
              <div key={r.id} className="h-tr-item" onClick={() => navigate(`/resources/${r.id}`)}>
                <div className="h-tr-num">0{i + 1}</div>
                <img
                  className="h-tr-img"
                  src={r.image_url || defaultimg}
                  alt={r.title}
                  onError={(e) => { e.target.src = defaultimg; }}
                />
                <div className="h-tr-info">
                  <div className="h-tr-title">{r.title}</div>
                  <div className="h-tr-meta">{r.category} • {r.location}</div>
                </div>
                <div className="h-tr-views">{formatCount(r.view_count)}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="h-panel-section">
            <div className="h-panel-title">Upcoming Events</div>
            {loadingEv ? (
              <p style={{ color: '#555', fontSize: '12px' }}>Loading...</p>
            ) : upcomingEvents.length === 0 ? (
              <p style={{ color: '#555', fontSize: '12px' }}>No upcoming events.</p>
            ) : (
              upcomingEvents.map((e) => (
                <div key={e.id} className="h-mini-ev" onClick={() => navigate('/resources')}>
                  <div className="h-mini-ev-title">{e.title}</div>
                  <div className="h-mini-ev-meta">
                    <span>{formatDate(e.event_date)}</span>
                    <span className="h-mini-ev-fee">{e.entry_fee ? `${e.entry_fee} ETB` : 'Free'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </aside>

        <BottomNav />

      </div>

    </div>
  );
}

export default Home1;