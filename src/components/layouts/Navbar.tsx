// Navbar.jsx
import { useState } from "react";
import { FaSearch, FaBell, FaCog } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ onToggle, isCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Hamburger – visible only when sidebar is collapsed */}
        {isCollapsed && (
          <button className="hamburger-btn" onClick={onToggle} aria-label="Open sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="navbar-right">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="navbar-actions">
          <button className="icon-btn" aria-label="Notifications">
            <FaBell />
            <span className="badge-dot">3</span>
          </button>
          <button className="icon-btn" aria-label="Settings">
            <FaCog />
          </button>
          <div className="user-profile">
            <img
              src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=40"
              alt="User"
              className="user-avatar-nav"
            />
            <span className="user-name-nav">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;