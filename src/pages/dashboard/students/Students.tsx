// Students.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaEye } from "react-icons/fa";
import "./Students.css";

const Students = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    year: "",
  });

  const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
  const sections = ["A", "B", "C", "D"];
  const years = ["2024", "2025", "2026"];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewStudents = () => {
    const { class: cls, section, year } = filters;
    if (!cls || !section || !year) {
      alert("Please select all filters.");
      return;
    }
    // Navigate to the list page with query params
    navigate(`/dashboard/students/list?class=${cls}&section=${section}&year=${year}`);
  };

  const handleAddStudent = () => {
    navigate("/students/add");
  };

  return (
    <div className="students-page">
      <div className="students-header">
        <h1 className="students-title">Students</h1>
        <button className="add-student-btn" onClick={handleAddStudent}>
          <FaUserPlus /> Add Student
        </button>
      </div>

      <div className="filter-card">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="class">Class</label>
            <select
              id="class"
              name="class"
              value={filters.class}
              onChange={handleChange}
              className="filter-select"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="section">Section</label>
            <select
              id="section"
              name="section"
              value={filters.section}
              onChange={handleChange}
              className="filter-select"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="year">Academic Year</label>
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              className="filter-select"
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button className="view-btn" onClick={handleViewStudents}>
            <FaEye /> View Students
          </button>
        </div>
      </div>
    </div>
  );
};

export default Students;