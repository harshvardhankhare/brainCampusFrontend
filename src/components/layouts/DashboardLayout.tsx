// DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./dashboard.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <div className={`dashboard-layout ${isCollapsed ? "collapsed" : ""}`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <div className="dashboard-main">
        <Navbar onToggle={toggleSidebar} isCollapsed={isCollapsed} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;