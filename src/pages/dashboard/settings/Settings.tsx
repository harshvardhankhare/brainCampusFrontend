import { useEffect, useState } from "react";
import { 
  Palette, 
  Building2, 
  GraduationCap, 
  BellRing, 
  Save,
  CheckCircle2
} from "lucide-react";
import "./Settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("appearance");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // --- Theme State ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "light";
  });

  // --- School Details State (Mock data) ---
  const [schoolDetails, setSchoolDetails] = useState({
    name: "BrainCampus Academy",
    email: "admin@braincampus.edu",
    phone: "+91 98765 43210",
    address: "123 Education Lane, Tech City",
    logo: ""
  });

  // --- Academic Settings State ---
  const [academicSettings, setAcademicSettings] = useState({
    currentYear: "2026-2027",
    gradingSystem: "percentage"
  });

  // --- Notifications State ---
  const [notifications, setNotifications] = useState({
    feeReminders: true,
    attendanceAlerts: false,
    weeklyReports: true
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const handleSave = (section) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`${section} settings saved successfully!`);
      setTimeout(() => setSavedMessage(""), 3000);
    }, 800);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your application preferences and school configurations.</p>
        </div>
      </div>

      {savedMessage && (
        <div className="success-toast">
          <CheckCircle2 size={18} />
          {savedMessage}
        </div>
      )}

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette size={18} /> Appearance
            </button>
            <button 
              className={`nav-item ${activeTab === 'school' ? 'active' : ''}`}
              onClick={() => setActiveTab('school')}
            >
              <Building2 size={18} /> School Details
            </button>
            <button 
              className={`nav-item ${activeTab === 'academic' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic')}
            >
              <GraduationCap size={18} /> Academic
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <BellRing size={18} /> Notifications
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="settings-content">
          
          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="settings-section animate-fade">
              <div className="section-header">
                <h2>Appearance</h2>
                <p>Customize the look and feel of your dashboard.</p>
              </div>
              
              <div className="setting-group">
                <label>Theme</label>
                <p className="setting-desc">Select your preferred color theme.</p>
                <div className="theme-grid">
                  <div 
                    className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <div className="theme-preview light-preview"></div>
                    <span>Light</span>
                  </div>
                  <div 
                    className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <div className="theme-preview dark-preview"></div>
                    <span>Dark</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHOOL DETAILS TAB */}
          {activeTab === 'school' && (
            <div className="settings-section animate-fade">
              <div className="section-header">
                <h2>School Details</h2>
                <p>Update your institution's basic information.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>School Name</label>
                  <input 
                    type="text" 
                    value={schoolDetails.name}
                    onChange={(e) => setSchoolDetails({...schoolDetails, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    value={schoolDetails.email}
                    onChange={(e) => setSchoolDetails({...schoolDetails, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={schoolDetails.phone}
                    onChange={(e) => setSchoolDetails({...schoolDetails, phone: e.target.value})}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <input 
                    type="text" 
                    value={schoolDetails.address}
                    onChange={(e) => setSchoolDetails({...schoolDetails, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={() => handleSave("School Details")} disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ACADEMIC TAB */}
          {activeTab === 'academic' && (
            <div className="settings-section animate-fade">
              <div className="section-header">
                <h2>Academic Settings</h2>
                <p>Configure how academic data is calculated and displayed.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Current Academic Year</label>
                  <select 
                    value={academicSettings.currentYear}
                    onChange={(e) => setAcademicSettings({...academicSettings, currentYear: e.target.value})}
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Grading System</label>
                  <select 
                    value={academicSettings.gradingSystem}
                    onChange={(e) => setAcademicSettings({...academicSettings, gradingSystem: e.target.value})}
                  >
                    <option value="percentage">Percentage (0-100%)</option>
                    <option value="gpa">GPA (0-10)</option>
                    <option value="letter">Letter Grades (A, B, C...)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={() => handleSave("Academic")} disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="settings-section animate-fade">
              <div className="section-header">
                <h2>Notifications</h2>
                <p>Manage how and when you receive alerts.</p>
              </div>

              <div className="toggle-list">
                <div className="toggle-item">
                  <div>
                    <h4>Fee Reminders</h4>
                    <p>Send automated reminders to parents with pending fees.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.feeReminders}
                      onChange={(e) => setNotifications({...notifications, feeReminders: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div>
                    <h4>Attendance Alerts</h4>
                    <p>Notify parents immediately when a student is marked absent.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.attendanceAlerts}
                      onChange={(e) => setNotifications({...notifications, attendanceAlerts: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div>
                    <h4>Weekly Reports</h4>
                    <p>Receive a weekly summary of school activity every Monday.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.weeklyReports}
                      onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={() => handleSave("Notification")} disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;