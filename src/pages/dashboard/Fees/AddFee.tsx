import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaUsers,
  FaSearch,
  FaMoneyBill,
  FaCheckCircle,
  FaTimes,
  FaPlus,
  FaCog,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./AddFee.css";

const MODES = [
  {
    id: "student",
    label: "Single Student",
    description: "Assign fees to one specific student",
    icon: FaUserGraduate,
  },
  {
    id: "class",
    label: "Whole Class",
    description: "Apply a fee template to every student in a class",
    icon: FaUsers,
  },
];

const MONTH_OPTIONS = [
  { value: "", label: "Annual / Non-Monthly" },
  { value: "1", label: "1 - January" },
  { value: "2", label: "2 - February" },
  { value: "3", label: "3 - March" },
  { value: "4", label: "4 - April" },
  { value: "5", label: "5 - May" },
  { value: "6", label: "6 - June" },
  { value: "7", label: "7 - July" },
  { value: "8", label: "8 - August" },
  { value: "9", label: "9 - September" },
  { value: "10", label: "10 - October" },
  { value: "11", label: "11 - November" },
  { value: "12", label: "12 - December" },
];

const todayISO = () => new Date().toISOString().split("T")[0];

const AddFee = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get("mode") === "class" ? "class" : "student";
  const initialStudentId = searchParams.get("studentId") || "";

  const [mode, setMode] = useState(initialMode);

  // Reference data
  const [feeTypes, setFeeTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refsError, setRefsError] = useState("");

  // Student search
  const [studentSearch, setStudentSearch] = useState(initialStudentId);
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Class selection
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Shared form
  const [feeMonth, setFeeMonth] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [feeAmounts, setFeeAmounts] = useState({});

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // Load reference data
  // =========================================================
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        setLoadingRefs(true);
        setRefsError("");

        const [feeTypesRes, classesRes, yearsRes] = await Promise.all([
          api.get("/fee-types"),
          api.get("/classes"),
          api.get("/academic-years"),
        ]);

        setFeeTypes(feeTypesRes.data.data || []);
        setClasses(classesRes.data.data || []);
        setAcademicYears(yearsRes.data.data || []);
      } catch (err) {
        console.error("Failed to load reference data:", err);
        setRefsError(
          err.response?.data?.message ||
            "Failed to load fee types / classes. Please refresh."
        );
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchRefs();
  }, []);

  // =========================================================
  // Derived
  // =========================================================
  const sections = useMemo(
    () =>
      Array.from(
        new Set(
          classes
            .filter((c) => !selectedClassId || c.id === Number(selectedClassId))
            .map((c) => c.section)
        )
      ),
    [classes, selectedClassId]
  );

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === Number(selectedClassId)) || null,
    [classes, selectedClassId]
  );

  const activeFeeTypes = useMemo(
    () => feeTypes.filter((ft) => ft.isActive !== false),
    [feeTypes]
  );

  const totalAmount = useMemo(() => {
    return Object.values(feeAmounts).reduce(
      (sum, v) => sum + (parseFloat(v) || 0),
      0
    );
  }, [feeAmounts]);

  const hasAtLeastOneAmount = useMemo(
    () => Object.values(feeAmounts).some((v) => parseFloat(v) > 0),
    [feeAmounts]
  );

  // =========================================================
  // Student search
  // =========================================================
  useEffect(() => {
    if (mode !== "student") return;

    const q = studentSearch.trim();

    if (!q) {
      setStudentResults([]);
      return;
    }

    if (selectedStudent && String(selectedStudent.roleNumber) === q) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingStudents(true);

        const response = await api.get("/students", {
          params: { search: q, page: 0, size: 8 },
        });

        const data = response.data.data;
        const list = Array.isArray(data) ? data : data?.content || [];

        setStudentResults(list);
      } catch (err) {
        console.error("Student search failed:", err);
        setStudentResults([]);
      } finally {
        setSearchingStudents(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [studentSearch, mode, selectedStudent]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(String(student.roleNumber || ""));
    setStudentResults([]);
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setStudentResults([]);
  };

  // =========================================================
  // Amount handlers
  // =========================================================
  const handleAmountChange = (feeTypeId, value) => {
    setFeeAmounts((prev) => ({ ...prev, [feeTypeId]: value }));
  };

  const handleFillAll = (value = "") => {
    const next = {};
    activeFeeTypes.forEach((ft) => {
      next[ft.id] = value;
    });
    setFeeAmounts(next);
  };

  // =========================================================
  // Submit
  // =========================================================
  const validate = () => {
    if (mode === "student" && !selectedStudent) {
      return "Please select a student first.";
    }

    if (mode === "class") {
      if (!selectedClassId) return "Please select a class.";
      if (!selectedSection) return "Please select a section.";
      if (!selectedYear) return "Please select an academic year.";
    }

    if (!hasAtLeastOneAmount) {
      return "Enter at least one fee amount greater than 0.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSuccessMessage("");

      const parsedMonth = feeMonth ? parseInt(feeMonth, 10) : null;

      const feesToCreate = activeFeeTypes
        .map((ft) => ({
          feeTypeId: ft.id,
          feeTypeName: ft.name, // Only used for UI messages now
          amount: parseFloat(feeAmounts[ft.id]) || 0,
        }))
        .filter((f) => f.amount > 0);

      if (mode === "student") {
        // Single student — one request per fee type
        await Promise.all(
          feesToCreate.map((fee) =>
            api.post("/student-fees", {
              studentId: selectedStudent.id,
              academicYear:
                selectedStudent.academicYear || selectedYear || null,
              feeTypeId: fee.feeTypeId,
              feeMonth: parsedMonth,
              amount: fee.amount,
              dueDate,
              description: notes || `${fee.feeTypeName} fee`,
            })
          )
        );

        setSuccessMessage(
          `Added ${feesToCreate.length} fee${
            feesToCreate.length === 1 ? "" : "s"
          } for ${selectedStudent.firstName} ${selectedStudent.lastName || ""}.`
        );
      } else {
        // Whole class — one request per fee type
        await Promise.all(
          feesToCreate.map((fee) =>
            api.post("/student-fees/class", {
              classId: Number(selectedClassId),
              academicYear: selectedYear,
              feeTypeId: fee.feeTypeId,
              feeMonth: parsedMonth,
              amount: fee.amount,
              dueDate,
              description:
                notes ||
                `${fee.feeTypeName} fee · ${selectedClass?.name || ""} ${
                  selectedSection || ""
                }`,
            })
          )
        );

        setSuccessMessage(
          `Applied ${feesToCreate.length} fee${
            feesToCreate.length === 1 ? "" : "s"
          } to ${selectedClass?.name || ""} ${selectedSection || ""}.`
        );
      }

      // Reset amounts, keep the rest so users can add more
      setFeeAmounts({});
      setNotes("");
    } catch (err) {
      console.error("Failed to add fees:", err);
      setSubmitError(
        err.response?.data?.message ||
          "Failed to add fees. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Loading / error
  // =========================================================
  if (loadingRefs) {
    return (
      <div className="add-fee-page">
        <div className="loading">Loading fee setup...</div>
      </div>
    );
  }

  return (
    <div className="add-fee-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate("/dashboard/students")}
          >
            <FaArrowLeft size={14} />
            <span>Back to Students</span>
          </button>

          <div>
            <h1 className="page-title">Add Fees</h1>
            <p className="page-subtitle">
              Assign fees to a single student or to a whole class
            </p>
          </div>
        </div>

        {/* NEW: Manage Fee Types Button */}
        <button
          type="button"
          className="manage-fee-types-btn"
          onClick={() => navigate("/dashboard/settings/fee-types")}
        >
          <FaCog /> Manage Fee Types
        </button>
      </div>

      {refsError && <div className="error-banner">{refsError}</div>}

      {successMessage && (
        <div className="success-banner">
          <FaCheckCircle />
          <span>{successMessage}</span>
          <button
            className="success-dismiss"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {submitError && <div className="error-banner">{submitError}</div>}

      <form onSubmit={handleSubmit} className="fee-form">
        {/* STEP 1 — WHO */}
        <section className="form-section">
          <div className="section-heading">
            <span className="section-step">1</span>
            <div>
              <h2 className="section-title">Who is this fee for?</h2>
              <p className="section-sub">
                Pick a single student or an entire class
              </p>
            </div>
          </div>

          <div className="mode-switcher">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`mode-card ${mode === m.id ? "active" : ""}`}
                  onClick={() => {
                    setMode(m.id);
                    setSubmitError("");
                    setSuccessMessage("");
                  }}
                >
                  <div className="mode-icon">
                    <Icon />
                  </div>
                  <div className="mode-text">
                    <span className="mode-label">{m.label}</span>
                    <span className="mode-desc">{m.description}</span>
                  </div>
                  {mode === m.id && (
                    <FaCheckCircle className="mode-check" />
                  )}
                </button>
              );
            })}
          </div>

          {mode === "student" && (
            <div className="student-picker">
              <label className="field-label">Student</label>

              {selectedStudent ? (
                <div className="selected-student">
                  <div className="selected-avatar">
                    {selectedStudent.firstName?.[0]}
                    {selectedStudent.lastName?.[0]}
                  </div>
                  <div className="selected-info">
                    <strong>
                      {selectedStudent.firstName}{" "}
                      {selectedStudent.lastName || ""}
                    </strong>
                    <span>
                      Roll {selectedStudent.roleNumber || "—"} ·{" "}
                      {selectedStudent.className || "—"}-
                      {selectedStudent.section || "—"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={handleClearStudent}
                    aria-label="Clear student"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="search-wrapper">
                  <div className="search-input-row">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by roll number or name…"
                      autoFocus
                    />
                  </div>

                  {searchingStudents && (
                    <div className="search-loading">
                      Searching students…
                    </div>
                  )}

                  {!searchingStudents &&
                    studentResults.length > 0 && (
                      <div className="search-results">
                        {studentResults.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className="search-result"
                            onClick={() => handleSelectStudent(s)}
                          >
                            <div className="result-avatar">
                              {s.firstName?.[0]}
                              {s.lastName?.[0]}
                            </div>
                            <div className="result-info">
                              <strong>
                                {s.firstName} {s.lastName || ""}
                              </strong>
                              <span>
                                Roll {s.roleNumber || "—"} ·{" "}
                                {s.className || "—"}-
                                {s.section || "—"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                  {!searchingStudents &&
                    studentSearch.trim().length >= 2 &&
                    studentResults.length === 0 && (
                      <div className="search-empty">
                        No students match "{studentSearch}".
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {mode === "class" && (
            <div className="class-picker">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedSection("");
                    }}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedClassId}
                    required
                  >
                    <option value="">
                      {!selectedClassId
                        ? "Select Class First"
                        : "Select Section"}
                    </option>
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Academic Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    required
                  >
                    <option value="">Select Year</option>
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.name}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedClass && (
                <div className="class-summary">
                  <FaUsers />
                  <span>
                    Fee will apply to every student in{" "}
                    <strong>
                      {selectedClass.name} {selectedSection || "—"}
                    </strong>{" "}
                    for {selectedYear || "—"}.
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* STEP 2 — WHAT */}
        <section className="form-section">
          <div className="section-heading">
            <span className="section-step">2</span>
            <div>
              <h2 className="section-title">What fees are you adding?</h2>
              <p className="section-sub">
                Enter an amount for each fee type that applies
              </p>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Fee Month (optional)</label>
              <select
                value={feeMonth}
                onChange={(e) => setFeeMonth(e.target.value)}
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field-label">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Q1 quarterly fee"
              />
            </div>
          </div>

          <div className="fee-types-card">
            <div className="fee-types-header">
              <div>
                <h3 className="fee-types-title">Fee Breakdown</h3>
                <p className="fee-types-sub">
                  {activeFeeTypes.length === 0
                    ? "No fee types configured"
                    : `Leave blank to skip a type · ${activeFeeTypes.length} available`}
                </p>
              </div>

              <div className="fee-types-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => handleFillAll("")}
                >
                  Clear all
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => handleFillAll("0")}
                >
                  Zero all
                </button>
              </div>
            </div>

            {activeFeeTypes.length === 0 ? (
              <div className="fee-types-empty">
                No fee types configured.{" "}
                <button
                  type="button"
                  className="inline-link-btn"
                  onClick={() => navigate("/dashboard/settings/fee-types")}
                >
                  Go to settings to add them.
                </button>
              </div>
            ) : (
              <div className="fee-types-grid">
                {activeFeeTypes.map((ft) => (
                  <div className="fee-type-row" key={ft.id}>
                    <div className="fee-type-meta">
                      <label className="fee-type-label">
                        {ft.name}
                        {ft.isRecurring && (
                          <span className="recurring-badge">monthly</span>
                        )}
                      </label>
                      <span className="fee-type-sub">
                        {ft.code || "—"}
                      </span>
                    </div>

                    <div className="fee-amount-input">
                      <span className="currency">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={feeAmounts[ft.id] || ""}
                        onChange={(e) =>
                          handleAmountChange(ft.id, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalAmount > 0 && (
            <div className="total-bar">
              <div>
                <span className="total-label">
                  {mode === "class"
                    ? "Total per student"
                    : "Total for this student"}
                </span>
                <span className="total-amount">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              {mode === "class" && selectedClass && (
                <div className="total-note">
                  Applies to every student in{" "}
                  {selectedClass.name} {selectedSection}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate("/dashboard/students")}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-btn"
            disabled={submitting || activeFeeTypes.length === 0}
          >
            <FaMoneyBill />
            {submitting
              ? "Adding fees…"
              : mode === "class"
              ? "Add Class Fees"
              : "Add Student Fees"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFee;