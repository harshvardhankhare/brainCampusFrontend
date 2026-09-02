// DashboardLayout.jsx
import { useState,useEffect } from "react";
import { Outlet ,useLocation } from "react-router-dom";
import "./dashboard.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
    useEffect(() => {
      setIsCollapsed(true);
  }, [location]);

   const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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