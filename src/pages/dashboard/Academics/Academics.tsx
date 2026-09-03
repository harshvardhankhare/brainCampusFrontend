import React, { useEffect, useState, useMemo, ChangeEvent, FormEvent } from "react";
import {
  FaBookOpen,
  FaUsers,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaPlus,
  FaEye,
  FaTimes,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./Academics.css";

// =========================
// TypeScript Interfaces
// =========================
interface AcademicYear {
  id: number;
  name: string;
  active?: boolean;
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  academicYear: string;
  active?: boolean;
}

interface ClassSubject {
  id: number;
  classId: number;
  className: string;
  section: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  academicYear: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName?: string;
  active?: boolean;
}

interface Exam {
  id: number;
  name: string;
  academicYear: string;
  className: string;
  section?: string;
  startDate: string;
  endDate?: string;
}

interface GroupedClass {
  name: string;
  sections: string[];
  subjects: string[];
}

const Academics: React.FC = () => {
  // =========================
  // State
  // =========================
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Modal States
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [submittingModal, setSubmittingModal] = useState<boolean>(false);

  // Forms
  const [classForm, setClassForm] = useState({
    name: "",
    section: "",
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
  });

  // =========================
  // 1. Initial Load: Academic Years
  // =========================
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get("/academic-years");
        const yearsList: AcademicYear[] = response.data.data || [];
        setAcademicYears(yearsList);

        if (yearsList.length > 0) {
          // Select active year or fallback to first
          const activeYear = yearsList.find((y) => y.active) || yearsList[0];
          setSelectedYear(activeYear.name);
        }
      } catch (err) {
        console.error("Failed to fetch academic years:", err);
      }
    };

    fetchYears();
  }, []);

  // =========================
  // 2. Fetch Academics Data
  // =========================
  const fetchAcademicsData = async () => {
    try {
      setLoading(true);

      const [
        classesRes,
        classSubjectsRes,
        subjectsRes,
        teachersRes,
        examsRes,
      ] = await Promise.all([
        api.get("/classes"),
        api.get("/class-subjects"),
        api.get("/subjects"),
        api.get("/teachers"),
        api.get("/exams"),
      ]);

      setClasses(classesRes.data.data || []);
      setClassSubjects(classSubjectsRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
      setExams(examsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load academics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicsData();
  }, []);

  // =========================
  // 3. Computed / Filtered Data
  // =========================

  // Filter classes by selected academic year
  const filteredClasses = useMemo(() => {
    return classes.filter(
      (c) => !selectedYear || c.academicYear === selectedYear
    );
  }, [classes, selectedYear]);

  // Group classes by class name, aggregate sections and assigned subjects
  const groupedClasses = useMemo<GroupedClass[]>(() => {
    const map = new Map<string, { sections: Set<string>; subjects: Set<string> }>();

    filteredClasses.forEach((cls) => {
      if (!map.has(cls.name)) {
        map.set(cls.name, { sections: new Set(), subjects: new Set() });
      }
      map.get(cls.name)?.sections.add(cls.section);
    });

    // Find subjects taught in these classes for this year
    classSubjects
      .filter((cs) => !selectedYear || cs.academicYear === selectedYear)
      .forEach((cs) => {
        if (map.has(cs.className)) {
          map.get(cs.className)?.subjects.add(cs.subjectName);
        }
      });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      sections: Array.from(data.sections).sort(),
      subjects: Array.from(data.subjects).sort(),
    }));
  }, [filteredClasses, classSubjects, selectedYear]);

  // Filter exams for selected academic year
  const upcomingExams = useMemo(() => {
    return exams
      .filter((exam) => !selectedYear || exam.academicYear === selectedYear)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [exams, selectedYear]);

  // Dynamic Statistics
  const stats = useMemo(() => [
    {
      label: "Total Classes",
      value: filteredClasses.length,
      icon: FaBookOpen,
      color: "#6366f1",
    },
    {
      label: "Total Subjects",
      value: subjects.length,
      icon: FaChalkboardTeacher,
      color: "#8b5cf6",
    },
    {
      label: "Total Teachers",
      value: teachers.length,
      icon: FaUsers,
      color: "#f59e0b",
    },
    {
      label: "Upcoming Exams",
      value: upcomingExams.length,
      icon: FaCalendarAlt,
      color: "#10b981",
    },
  ], [filteredClasses.length, subjects.length, teachers.length, upcomingExams.length]);

  // =========================
  // Handlers
  // =========================
  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  // Add Class Submission
  const handleAddClassSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedYear) {
      alert("Please select an academic year first.");
      return;
    }

    try {
      setSubmittingModal(true);
      await api.post("/classes", {
        name: classForm.name.trim(),
        section: classForm.section.trim(),
        academicYear: selectedYear,
      });

      alert(`Class ${classForm.name} (${classForm.section}) created successfully!`);
      setShowAddClassModal(false);
      setClassForm({ name: "", section: "" });

      // Refresh list
      const res = await api.get("/classes");
      setClasses(res.data.data || []);
    } catch (err: any) {
      console.error("Failed to create class:", err);
      alert(err.response?.data?.message || "Failed to create class.");
    } finally {
      setSubmittingModal(false);
    }
  };

  // Add Subject Submission
  const handleAddSubjectSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmittingModal(true);
      await api.post("/subjects", {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim().toUpperCase(),
      });

      alert(`Subject "${subjectForm.name}" created successfully!`);
      setShowAddSubjectModal(false);
      setSubjectForm({ name: "", code: "" });

      // Refresh list
      const res = await api.get("/subjects");
      setSubjects(res.data.data || []);
    } catch (err: any) {
      console.error("Failed to create subject:", err);
      alert(err.response?.data?.message || "Failed to create subject.");
    } finally {
      setSubmittingModal(false);
    }
  };

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
              disabled={loading || academicYears.length === 0}
            >
              {academicYears.length === 0 ? (
                <option value="">Loading...</option>
              ) : (
                academicYears.map((year) => (
                  <option key={year.id} value={year.name}>
                    {year.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="action-btn primary"
            onClick={() => setShowAddClassModal(true)}
          >
            <FaPlus /> Add Class
          </button>
          <button
            className="action-btn secondary"
            onClick={() => setShowAddSubjectModal(true)}
          >
            <FaPlus /> Add Subject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div
              className="stat-icon"
              style={{
                backgroundColor: stat.color + "20",
                color: stat.color,
              }}
            >
              <stat.icon />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {loading ? "..." : stat.value}
              </span>
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
            <h2>Classes & Subjects ({selectedYear})</h2>
            <button
              className="view-all-btn"
              onClick={fetchAcademicsData}
              title="Refresh"
            >
              Refresh <FaEye />
            </button>
          </div>

          <div className="class-accordion">
            {loading ? (
              <p style={{ padding: "1rem", color: "#666" }}>Loading classes...</p>
            ) : groupedClasses.length === 0 ? (
              <p style={{ padding: "1rem", color: "#888" }}>
                No classes found for {selectedYear}. Click <strong>Add Class</strong> to create one.
              </p>
            ) : (
              groupedClasses.map((cls, idx) => (
                <div className="class-item" key={idx}>
                  <div className="class-header">
                    <span className="class-name">{cls.name}</span>
                    <span className="section-badge">
                      {cls.sections.length} Section{cls.sections.length > 1 ? "s" : ""} (
                      {cls.sections.join(", ")})
                    </span>
                  </div>

                  <div className="subject-tags">
                    {cls.subjects.length > 0 ? (
                      cls.subjects.map((sub, i) => (
                        <span className="subject-tag" key={i}>
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "#999",
                          fontStyle: "italic",
                        }}
                      >
                        No subjects assigned yet
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="exam-list-wrapper">
          <div className="section-header">
            <h2>Upcoming Exams ({selectedYear})</h2>
            <button
              className="view-all-btn"
              onClick={fetchAcademicsData}
              title="Refresh"
            >
              Refresh <FaEye />
            </button>
          </div>

          <div className="exam-list">
            {loading ? (
              <p style={{ padding: "1rem", color: "#666" }}>Loading exams...</p>
            ) : upcomingExams.length === 0 ? (
              <p style={{ padding: "1rem", color: "#888" }}>
                No exams scheduled for {selectedYear}.
              </p>
            ) : (
              upcomingExams.map((exam, idx) => (
                <div className="exam-item" key={idx}>
                  <div className="exam-info">
                    <span className="exam-name">{exam.name}</span>
                    <span className="exam-class">
                      {exam.className}
                      {exam.section ? ` - Sec ${exam.section}` : ""}
                    </span>
                  </div>
                  <span className="exam-date">{exam.startDate}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Add Class Modal                                              */}
      {/* ============================================================ */}
      {showAddClassModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddClassModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Class</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddClassModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="modal-form">
              <div className="form-group">
                <label>Academic Year</label>
                <input type="text" value={selectedYear} disabled />
              </div>

              <div className="form-group">
                <label>Class Name</label>
                <input
                  type="text"
                  placeholder="e.g., Class 10 or Grade 5"
                  value={classForm.name}
                  onChange={(e) =>
                    setClassForm({ ...classForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Section</label>
                <input
                  type="text"
                  placeholder="e.g., A, B, or C"
                  value={classForm.section}
                  onChange={(e) =>
                    setClassForm({ ...classForm, section: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddClassModal(false)}
                  disabled={submittingModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submittingModal}
                >
                  {submittingModal ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Add Subject Modal                                            */}
      {/* ============================================================ */}
      {showAddSubjectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddSubjectModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Subject</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddSubjectModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="modal-form">
              <div className="form-group">
                <label>Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Physics"
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g., MATH101, PHY201"
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, code: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddSubjectModal(false)}
                  disabled={submittingModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submittingModal}
                >
                  {submittingModal ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academics;