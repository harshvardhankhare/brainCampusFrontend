import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, CreditCard, GraduationCap, LogOut, Menu, UserRound, X } from "lucide-react";
import "./StudentLayout.css";

const StudentLayout = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Student";

  const signOut = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/clearUser" });
    dispatch({ type: "auth/setInitialized", payload: true });
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="student-shell">
      <aside className={`student-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="student-brand">
          <span className="student-brand-mark"><GraduationCap size={21} /></span>
          <span>BrainCampus<span className="student-brand-sub">STUDENT SPACE</span></span>
          <button className="student-close-menu" onClick={closeMenu} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <div className="student-nav-label">YOUR CAMPUS</div>
        <nav className="student-nav" aria-label="Student navigation">
          <NavLink end to="/student-dashboard" onClick={closeMenu}><BookOpen size={19} /><span>Overview</span></NavLink>
          <NavLink to="/student-dashboard/profile" onClick={closeMenu}><UserRound size={19} /><span>My profile</span></NavLink>
          <NavLink to="/student-dashboard/fees" onClick={closeMenu}><CreditCard size={19} /><span>Fees</span></NavLink>
        </nav>
        <div className="student-sidebar-bottom">
          <div className="student-sidebar-user">
            <span className="student-avatar">{displayName[0]?.toUpperCase()}</span>
            <span className="student-sidebar-user-name">{displayName}</span>
          </div>
          <button className="student-signout" onClick={signOut}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {menuOpen && <button className="student-backdrop" onClick={closeMenu} aria-label="Close navigation" />}
      <div className="student-main">
        <header className="student-topbar">
          <button className="student-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="student-crumb"><span>Student space</span><span className="student-crumb-dot">/</span><strong>Learning &amp; life</strong></div>
          <div className="student-topbar-user"><span className="student-avatar">{displayName[0]?.toUpperCase()}</span><span>{displayName}</span></div>
        </header>
        <main className="student-content"><Outlet /></main>
        <footer className="student-footer">BrainCampus <span>·</span> Your learning journey, in one place</footer>
      </div>
    </div>
  );
};

export default StudentLayout;
