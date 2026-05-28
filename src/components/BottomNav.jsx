import { Link, useLocation } from 'react-router';
import { FiHome, FiMap, FiUser } from 'react-icons/fi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import './BottomNav.css';

const NAV_ITEMS = [
  { icon: <FiHome size={22} />, label: 'Home', path: '/' },
  { icon: <HiOutlineBuildingOffice2 size={22} />, label: 'Resources', path: '/resources' },
  { icon: <FiMap size={22} />, label: 'Map', path: '/map' },
  { icon: <FiUser size={22} />, label: 'Profile', path: '/profile' },
];

const isActive = (path, pathname) => {
  if (path === '/') return pathname === '/';
  return pathname.startsWith(path);
};

function BottomNav() {
  const location = useLocation();
  const { pathname } = location;

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="crh-bottom-nav" aria-label="Mobile bottom navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={`crh-bottom-nav__item ${isActive(item.path, pathname) ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;
