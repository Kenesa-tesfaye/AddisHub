import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiBell, FiSearch, FiMapPin, FiArrowDownRight } from 'react-icons/fi';
import { MdOutlineEvent } from 'react-icons/md';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import './ResourcesHeader.css';
import Logo from '../../../components/Logo'

const RESOURCE_CATEGORIES = ['All', 'Health', 'Education', 'Technology', 'Culture', 'Finance', 'Transport'];
const EVENT_CATEGORIES = ['All', 'Upcoming', 'Registration', 'Ended', 'Technology', 'Culture'];

function ResourcesHeader({ onSearch, onCategoryChange, onPageChange, totalCount }) {
  const [activePage, setActivePage] = useState('resources');
  const [activeCategory, setActiveCategory] = useState('All');
  const user = useSelector((state) => state.auth.user);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePageSwitch = (page) => {
    setActivePage(page);
    setActiveCategory('All');
    onPageChange(page);
    onCategoryChange('');
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    onCategoryChange(cat === 'All' ? '' : cat);
  };

  const handleSearch = (val) => {
    onSearch(val);
  };

  const categories = activePage === 'resources' ? RESOURCE_CATEGORIES : EVENT_CATEGORIES;

  return (
    <header className="crh-header">

      {/* ── Top Row ── */}
      <div className="crh-top">
        <div className="crh-logo"><Logo variant="nav" /></div>

        {/* Desktop search */}
        <div className="crh-search">
          <FiSearch className="crh-search-icon" size={15} />
          <input
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={activePage === 'resources' ? 'Search resources, locations...' : 'Search events...'}
          />
        </div>

        {/* Page Switch */}
        <div className="crh-switch">
          <button
            className={`crh-switch-btn ${activePage === 'resources' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('resources')}
          >
            <HiOutlineBuildingOffice2 size={15} />
            <span className="btn-label">Resources</span>
          </button>
          <button
            className={`crh-switch-btn ${activePage === 'events' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('events')}
          >
            <MdOutlineEvent size={15} />
            <span className="btn-label">Events</span>
          </button>
        </div>

        {/* Right */}
        <div className="crh-right">
          <div className="crh-notif">
            <FiBell size={17} />
            <div className="crh-notif-dot" />
          </div>
          <span className="crh-user-name">{user?.name?.split(' ')[0] || 'User'}</span>
          <div className="crh-avatar">
            {user?.image
              ? <img src={user.image} alt="avatar" />
              : getInitials(user?.name)
            }
          </div>
        </div>
      </div>

      {/* ── Mobile Search Row (visible only on mobile) ── */}
      <div className="crh-mobile-search">
        <FiSearch className="crh-mobile-search-icon" size={14} />
        <input
          type="text"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={activePage === 'resources' ? 'Search resources...' : 'Search events...'}
        />
      </div>

      {/* ── Filters Row ── */}
      <div className="crh-filters">
        <span className="crh-filter-label">Filter</span>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`crh-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
        <div className="crh-divider" />
        <div className="crh-location">
          <FiMapPin size={13} color="#046e32" />
          <span>Addis Ababa</span>
        </div>
      </div>

      {/* ── Results Bar ── */}
      <div className="crh-results-bar">
        <span className="crh-results-text">
          <strong>{totalCount || 0}</strong> {activePage} found
        </span>
        <div className="crh-sort">
          <FiArrowDownRight size={13} />
          <span>Latest</span>
        </div>
      </div>

    </header>
  );
}

export default ResourcesHeader;