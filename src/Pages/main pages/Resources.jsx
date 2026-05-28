import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import ResourcesHeader from './resources comp/ResourcesHeader';
import api from '../../api/api';
import ResourceCard from './resources comp/ResourceCard';
import EventCard from './resources comp/EventCard';
import './resources.css';
import ResourcesFooter from '../../components/ResourcesFooter';
import BottomNav from '../../components/BottomNav';

function Resources() {
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState('resources');
  const location = useLocation();

  useEffect(() => {
    if (page === 'resources') fetchResources();
    if (page === 'events') fetchEvents();
  }, [location, category, page]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      const res = await api.get(`/resources?${params}`);
      setResources(res.data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && !['Upcoming', 'Registration', 'Ended'].includes(category)) {
        params.append('category', category);
      }
      const res = await api.get(`/events?${params}`);

      let data = res.data;
      if (category === 'Upcoming') data = data.filter(e => e.event_type === 'upcoming');
      if (category === 'Registration') data = data.filter(e => e.event_type === 'registration_period');
      if (category === 'Ended') data = data.filter(e => e.event_type === 'ended');

      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setCategory('');
    setSearch('');
  };

  const filtered = resources.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  const currentList = page === 'resources' ? filtered : filteredEvents;

  return (
    <div className="res-page">

      {/* Sticky Header */}
      <ResourcesHeader
        onSearch={setSearch}
        onCategoryChange={setCategory}
        onPageChange={handlePageChange}
        totalCount={currentList.length}
      />

      {/* Main */}
      <main className="res-main">

        {/* Loading skeleton */}
        {loading && (
          <div className={page === 'resources' ? 'res-grid' : 'res-events-grid'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="res-skeleton">
                <div className="skel-img" />
                <div className="skel-body">
                  <div className="skel-line short" />
                  <div className="skel-line" />
                  <div className="skel-line short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && currentList.length === 0 && (
          <div className="res-empty">
            <div className="res-empty-icon">
              {page === 'resources' ? '🏙️' : '📅'}
            </div>
            <h3>No {page} found</h3>
            <p>Try adjusting your search or filter.</p>
            <button
              className="res-empty-btn"
              onClick={() => { setSearch(''); setCategory(''); }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Resources */}
        {!loading && page === 'resources' && filtered.length > 0 && (
          <>
            <div className="res-section-header">
              <h2>Resources <span>{filtered.length}</span></h2>
            </div>
            <div className="res-grid">
              {filtered.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </>
        )}

        {/* Events */}
        {!loading && page === 'events' && filteredEvents.length > 0 && (
          <>
            <div className="res-section-header">
              <h2>Events <span>{filteredEvents.length}</span></h2>
            </div>
            <div className="res-events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}

      </main>

      <BottomNav/>


      {/* <ResourcesFooter /> */}
    </div>
  );
}

export default Resources;