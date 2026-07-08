import { useState } from "react";
import {
  FaBookOpen,
  FaUsers,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import "./Academics.css";

const Academics = () => {
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  // Mock data
  const stats = [
    { label: "Total Classes", value: 12, icon: FaBookOpen, color: "#6366f1" },
    { label: "Total Subjects", value: 48, icon: FaChalkboardTeacher, color: "#8b5cf6" },
    { label: "Total Teachers", value: 32, icon: FaUsers, color: "#f59e0b" },
    { label: "Upcoming Exams", value: 5, icon: FaCalendarAlt, color: "#10b981" },
  ];

  const classData = [
    {
      name: "Class 1",
      sections: ["A", "B"],
      subjects: ["English", "Math", "Science", "Art"],
    },
    {
      name: "Class 2",
      sections: ["A", "B", "C"],
      subjects: ["English", "Math", "Science", "Social Studies"],
    },
    {
      name: "Class 3",
      sections: ["A", "B"],
      subjects: ["English", "Math", "Science", "Computer"],
    },
    {
      name: "Class 4",
      sections: ["A", "B", "C"],
      subjects: ["English", "Math", "Science", "History"],
    },
    {
      name: "Class 5",
      sections: ["A", "B"],
      subjects: ["English", "Math", "Physics", "Chemistry", "Biology"],
    },
  ];

  const upcomingExams = [
    { name: "Mid-Term Exam", class: "Class 5", date: "2025-02-15" },
    { name: "Weekly Test", class: "Class 3", date: "2025-02-18" },
    { name: "Final Practical", class: "Class 10", date: "2025-02-22" },
  ];

  const handleYearChange = (e) => setSelectedYear(e.target.value);

  return (
    <div className="academics-page">
      {/* Header */}
      <div className="academics-header">
        <div className="header-left">
          <h1 className="academics-title">Academics</h1>
          <div className="year-selector">
            <label htmlFor="academic-year">Academic Year:</label>
            <select
              id="academic-year"
              value={selectedYear}
              onChange={handleYearChange}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn primary">
            <FaPlus /> Add Class
          </button>
          <button className="action-btn secondary">
            <FaPlus /> Add Subject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon" style={{ backgroundColor: stat.color + "20", color: stat.color }}>
              <stat.icon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Classes & Exams */}
      <div className="academics-grid">
        {/* Class & Subject List */}
        <div className="class-list-wrapper">
          <div className="section-header">
            <h2>Classes & Subjects</h2>
            <button className="view-all-btn">View All <FaEye /></button>
          </div>
          <div className="class-accordion">
            {classData.map((cls, idx) => (
              <div className="class-item" key={idx}>
                <div className="class-header">
                  <span className="class-name">{cls.name}</span>
                  <span className="section-badge">
                    {cls.sections.length} Section{cls.sections.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="subject-tags">
                  {cls.subjects.map((sub, i) => (
                    <span className="subject-tag" key={i}>{sub}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="exam-list-wrapper">
          <div className="section-header">
            <h2>Upcoming Exams</h2>
            <button className="view-all-btn">View All <FaEye /></button>
          </div>
          <div className="exam-list">
            {upcomingExams.map((exam, idx) => (
              <div className="exam-item" key={idx}>
                <div className="exam-info">
                  <span className="exam-name">{exam.name}</span>
                  <span className="exam-class">{exam.class}</span>
                </div>
                <span className="exam-date">{exam.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Academics;