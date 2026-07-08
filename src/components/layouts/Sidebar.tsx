// Sidebar.jsx
import { NavLink } from "react-router-dom";
import { sidebarItems } from "./sideBarData";
import "./sideBar.css";

const Sidebar = ({ isCollapsed, onToggle }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header with logo and toggle */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              {/* ... your SVG logo ... */}
            </svg>
          </div>
          <span className="logo-text">BrainCampus</span>
        </div>
        <button className="toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 10H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 7L15 10L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="menu">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
              title={isCollapsed ? item.title : undefined}
            >
              <span className="menu-icon"><Icon size={22} /></span>
              <span className="menu-label">{item.title}</span>
              {/* {item.badge && <span className="menu-badge">{item.badge}</span>}
              {isActive && <span className="active-indicator" />} */}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer user */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=40" alt="User" />
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;