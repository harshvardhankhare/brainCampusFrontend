import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaChalkboardTeacher,
  FaPlus,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../../api/axios";
import "./AcademicSetup.css";

interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  active?: boolean;
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  academicYear: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

const AcademicSetup = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"years" | "classes" | "subjects" | "promote">("years");
  const [loading, setLoading] = useState(true);

  // Data State
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter State
  const [selectedYear, setSelectedYear] = useState("");

  // Form States
  const [yearForm, setYearForm] = useState({ name: "", startDate: "", endDate: "" });
  const [classForm, setClassForm] = useState({ name: "", section: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "" });
  
  // Promotion State
  const [promoForm, setPromoForm] = useState({
    fromAcademicYearId: "",
    fromClassId: "",
    toAcademicYearId: "",
    toClassId: "",
  });
  const [promoResult, setPromoResult] = useState<any>(null);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // =========================================================
  // Fetch Data
  // =========================================================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [yearsRes, classesRes, subjectsRes] = await Promise.all([
        api.get("/academic-years"),
        api.get("/classes"),
        api.get("/subjects"),
      ]);

      const yearsList = yearsRes.data.data || [];
      setAcademicYears(yearsList);

      // Auto-switch tab if no years exist
      if (yearsList.length === 0) {
        setActiveTab("years");
      } else if (!selectedYear) {
        const activeYear = yearsList.find((y: AcademicYear) => y.active) || yearsList[0];
        setSelectedYear(activeYear.name);
        setActiveTab("classes");
      }

      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load academic data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // =========================================================
  // Handlers
  // =========================================================
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleAddYear = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await api.post("/academic-years", yearForm);
      setYearForm({ name: "", startDate: "", endDate: "" });
      
      // Refresh years and auto-select the new one
      const res = await api.get("/academic-years");
      const updatedYears = res.data.data || [];
      setAcademicYears(updatedYears);
      
      const newYear = updatedYears.find((y: AcademicYear) => y.name === yearForm.name);
      if (newYear) setSelectedYear(newYear.name);
      
      setActiveTab("classes");
      showSuccess(`Academic Year ${yearForm.name} created!`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create academic year.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedYear) {
      setError("Please select an academic year first.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.post("/classes", {
        name: classForm.name.trim(),
        section: classForm.section.trim(),
        academicYear: selectedYear,
      });

      const res = await api.get("/classes");
      setClasses(res.data.data || []);
      setClassForm({ name: "", section: "" });
      showSuccess(`Class ${classForm.name} (${classForm.section}) created!`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create class.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubject = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await api.post("/subjects", {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim().toUpperCase(),
      });

      const res = await api.get("/subjects");
      setSubjects(res.data.data || []);
      setSubjectForm({ name: "", code: "" });
      showSuccess(`Subject "${subjectForm.name}" created!`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subject.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromote = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setPromoResult(null);

      const payload = {
        fromAcademicYearId: Number(promoForm.fromAcademicYearId),
        fromClassId: Number(promoForm.fromClassId),
        toAcademicYearId: Number(promoForm.toAcademicYearId),
        toClassId: Number(promoForm.toClassId),
      };

      const res = await api.post("/promotions", payload);
      setPromoResult(res.data.data);
      showSuccess("Students promoted successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to promote students.");
    } finally {
      setSubmitting(false);
    }
  };

  // Derived lists for dropdowns
  const filteredClasses = classes.filter((c) => !selectedYear || c.academicYear === selectedYear);
  
  const fromYearClasses = classes.filter(c => c.academicYear === academicYears.find(y => y.id === Number(promoForm.fromAcademicYearId))?.name);
  const toYearClasses = classes.filter(c => c.academicYear === academicYears.find(y => y.id === Number(promoForm.toAcademicYearId))?.name);

  // =========================================================
  // Render
  // =========================================================
  if (loading) return <div className="loading-state">Loading setup data...</div>;

  return (
    <div className="setup-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/dashboard/academics")}>
            <FaArrowLeft size={14} /> Back to Academics
          </button>
          <div>
            <h1 className="page-title">Academic Setup</h1>
            <p className="page-subtitle">Manage years, classes, subjects, and student promotions.</p>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* Tabs */}
      <div className="setup-tabs">
        <button className={`tab-btn ${activeTab === "years" ? "active" : ""}`} onClick={() => setActiveTab("years")}>
          <FaCalendarAlt /> Academic Years
        </button>
        <button 
          className={`tab-btn ${activeTab === "classes" ? "active" : ""}`} 
          onClick={() => setActiveTab("classes")}
          disabled={academicYears.length === 0}
        >
          <FaBookOpen /> Classes
        </button>
        <button 
          className={`tab-btn ${activeTab === "subjects" ? "active" : ""}`} 
          onClick={() => setActiveTab("subjects")}
          disabled={academicYears.length === 0}
        >
          <FaChalkboardTeacher /> Subjects
        </button>
        <button 
          className={`tab-btn ${activeTab === "promote" ? "active" : ""}`} 
          onClick={() => setActiveTab("promote")}
          disabled={academicYears.length < 2}
        >
          <FaArrowRight /> Promote Students
        </button>
      </div>

      {/* Main Content Area */}
      <div className="setup-content">
        
        {/* ================= YEARS TAB ================= */}
        {activeTab === "years" && (
          <div className="tab-panel animate-fade">
            {academicYears.length === 0 && (
              <div className="warning-banner">
                You must create an Academic Year before you can add Classes or Subjects.
              </div>
            )}

            <div className="split-layout">
              {/* Left: List */}
              <div className="list-card">
                <h3>Existing Academic Years ({academicYears.length})</h3>
                <div className="item-list">
                  {academicYears.length === 0 ? (
                    <p className="empty-text">No academic years found. Create one to get started.</p>
                  ) : (
                    academicYears.map((y) => (
                      <div key={y.id} className="list-item">
                        <div>
                          <strong>{y.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {y.startDate} to {y.endDate}
                          </div>
                        </div>
                        {y.active && <span className="badge badge-success">Active</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Add Form */}
              <div className="form-card">
                <h3>Add Academic Year</h3>
                <form onSubmit={handleAddYear} className="setup-form">
                  <div className="form-group">
                    <label>Year Name (e.g. 2026-2027)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-2027"
                      value={yearForm.name}
                      onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={yearForm.startDate}
                      onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={yearForm.endDate}
                      onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <FaPlus /> {submitting ? "Creating..." : "Create Academic Year"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= CLASSES TAB ================= */}
        {activeTab === "classes" && (
          <div className="tab-panel animate-fade">
            <div className="panel-header">
              <div className="year-filter">
                <label>Academic Year:</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.name}>{y.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="split-layout">
              <div className="list-card">
                <h3>Existing Classes ({filteredClasses.length})</h3>
                <div className="item-list">
                  {filteredClasses.length === 0 ? (
                    <p className="empty-text">No classes found for {selectedYear}.</p>
                  ) : (
                    filteredClasses.map((c) => (
                      <div key={c.id} className="list-item">
                        <div>
                          <strong>{c.name}</strong> - Section {c.section}
                        </div>
                        <span className="badge">{c.academicYear}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="form-card">
                <h3>Add New Class</h3>
                <form onSubmit={handleAddClass} className="setup-form">
                  <div className="form-group">
                    <label>Academic Year</label>
                    <input type="text" value={selectedYear} disabled />
                  </div>
                  <div className="form-group">
                    <label>Class Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grade 5"
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={classForm.section}
                      onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <FaPlus /> {submitting ? "Creating..." : "Create Class"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= SUBJECTS TAB ================= */}
        {activeTab === "subjects" && (
          <div className="tab-panel animate-fade">
            <div className="split-layout">
              <div className="list-card">
                <h3>Existing Subjects ({subjects.length})</h3>
                <div className="item-list">
                  {subjects.length === 0 ? (
                    <p className="empty-text">No subjects found.</p>
                  ) : (
                    subjects.map((s) => (
                      <div key={s.id} className="list-item">
                        <div>
                          <strong>{s.name}</strong>
                        </div>
                        <span className="badge code-badge">{s.code}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="form-card">
                <h3>Add New Subject</h3>
                <form onSubmit={handleAddSubject} className="setup-form">
                  <div className="form-group">
                    <label>Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g. MATH101"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <FaPlus /> {submitting ? "Creating..." : "Create Subject"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= PROMOTE TAB ================= */}
        {activeTab === "promote" && (
          <div className="tab-panel animate-fade">
            <div className="promo-layout">
              <div className="form-card promo-card">
                <h3>Promote Students</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Move an entire class from one academic year to another. This creates enrollment records for the new year.
                </p>
                
                <form onSubmit={handlePromote} className="setup-form">
                  {/* From Section */}
                  <div className="promo-section">
                    <h4>From (Current Year)</h4>
                    <div className="form-group">
                      <label>Source Academic Year</label>
                      <select
                        value={promoForm.fromAcademicYearId}
                        onChange={(e) => setPromoForm({ ...promoForm, fromAcademicYearId: e.target.value, fromClassId: "" })}
                        required
                      >
                        <option value="">Select Year</option>
                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Source Class</label>
                      <select
                        value={promoForm.fromClassId}
                        onChange={(e) => setPromoForm({ ...promoForm, fromClassId: e.target.value })}
                        required
                        disabled={!promoForm.fromAcademicYearId}
                      >
                        <option value="">Select Class</option>
                        {fromYearClasses.map(c => (
                          <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="promo-divider">
                    <FaArrowRight />
                  </div>

                  {/* To Section */}
                  <div className="promo-section">
                    <h4>To (Next Year)</h4>
                    <div className="form-group">
                      <label>Target Academic Year</label>
                      <select
                        value={promoForm.toAcademicYearId}
                        onChange={(e) => setPromoForm({ ...promoForm, toAcademicYearId: e.target.value, toClassId: "" })}
                        required
                      >
                        <option value="">Select Year</option>
                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Target Class</label>
                      <select
                        value={promoForm.toClassId}
                        onChange={(e) => setPromoForm({ ...promoForm, toClassId: e.target.value })}
                        required
                        disabled={!promoForm.toAcademicYearId}
                      >
                        <option value="">Select Class</option>
                        {toYearClasses.map(c => (
                          <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn promo-submit" disabled={submitting}>
                    {submitting ? "Promoting..." : "Execute Promotion"}
                  </button>
                </form>
              </div>

              {/* Result Card */}
              {promoResult && (
                <div className="result-card animate-fade">
                  <FaCheckCircle className="result-icon" />
                  <h3>Promotion Successful</h3>
                  <div className="result-details">
                    <p><strong>{promoResult.totalStudents}</strong> students found in source class.</p>
                    <p><strong>{promoResult.promotedStudents}</strong> students successfully promoted to {promoResult.toClassName} ({promoResult.toAcademicYear}).</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AcademicSetup;