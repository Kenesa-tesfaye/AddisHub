import { FiMapPin, FiMail, FiGithub, FiExternalLink } from "react-icons/fi";
import { MdOutlineExplore } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";
import "./resources-footer.css";
import Logo from "./Logo";

const ResourcesFooter = () => {
  const navLinks = [
    { label: "Resources", href: "/resources" },
    { label: "Events", href: "/events" },
    { label: "Map View", href: "/map" },
    { label: "Profile", href: "/profile" },
  ];

  const categories = [
    "Health", "Education", "Transport", "Finance",
    "Culture", "Government", "NGO", "Emergency",
  ];

  return (
    <footer className="crh-footer">
      {/* Top divider glow line */}
      <div className="crh-footer__glow-line" />

      <div className="crh-footer__inner">
        {/* Brand column */}
        <div className="crh-footer__brand">
          <div className="crh-footer__logo">
            <span className="crh-footer__logo-icon">
              <MdOutlineExplore />
            </span>
            <Logo variant="icon" />
          </div>
          <p className="crh-footer__tagline">
            Connecting Addis Ababa to the resources that matter.
          </p>
          <div className="crh-footer__location">
            <FiMapPin size={13} />
            <span>Addis Ababa, Ethiopia</span>
          </div>
          <div className="crh-footer__socials">
            <a href="mailto:hello@crh.et" className="crh-footer__social-link" aria-label="Email">
              <FiMail />
            </a>
            <a href="https://github.com/kenesa8556/crh-backend" target="_blank" rel="noreferrer" className="crh-footer__social-link" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="https://crh-backend-production.up.railway.app" target="_blank" rel="noreferrer" className="crh-footer__social-link" aria-label="Live API">
              <FiExternalLink />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div className="crh-footer__col">
          <h4 className="crh-footer__col-title">
            <HiOutlineSparkles size={13} />
            Explore
          </h4>
          <ul className="crh-footer__links">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="crh-footer__link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="crh-footer__col">
          <h4 className="crh-footer__col-title">
            <HiOutlineSparkles size={13} />
            Categories
          </h4>
          <ul className="crh-footer__links crh-footer__links--grid">
            {categories.map((cat) => (
              <li key={cat}>
                <a href={`/resources?category=${cat.toLowerCase()}`} className="crh-footer__link">
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Status column */}
        <div className="crh-footer__col">
          <h4 className="crh-footer__col-title">
            <HiOutlineSparkles size={13} />
            System
          </h4>
          <div className="crh-footer__status">
            <div className="crh-footer__status-row">
              <span className="crh-footer__status-dot crh-footer__status-dot--green" />
              <span>Backend API</span>
            </div>
            <div className="crh-footer__status-row">
              <span className="crh-footer__status-dot crh-footer__status-dot--green" />
              <span>Database</span>
            </div>
            <div className="crh-footer__status-row">
              <span className="crh-footer__status-dot crh-footer__status-dot--yellow" />
              <span>Frontend (Beta)</span>
            </div>
          </div>
          <p className="crh-footer__version">v1.0.0-beta · May 2026</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="crh-footer__bottom">
        <span className="crh-footer__copy">
          © {new Date().getFullYear()} City Resources Hub. Built for Addis Ababa.
        </span>
        <span className="crh-footer__made">
          Made with <span className="crh-footer__heart">♥</span> in Ethiopia
        </span>
      </div>
    </footer>
  );
};

export default ResourcesFooter;