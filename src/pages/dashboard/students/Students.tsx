import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaEye,
  FaMoneyBill,
  FaUsers,
  FaUpload,
  FaTimes,
  FaPlus,
} from "react-icons/fa";

import api from "../../../api/axios";
import { studentApi } from "../../../api/studentApi/studentApi.js";
import "./Students.css";

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  academicYear: string;
}

interface AcademicYear {
  id: number;
  name: string;
}

interface SubjectItem {
  name: string;
  theoryGained: string;
  theoryMax: string;
  practicalGained: string;
  practicalMax: string;
}

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);

  const [filters, setFilters] = useState({
    className: "",
    section: "",
    year: "",
  });

  const [showAddFeeModal, setShowAddFeeModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoadingFilters(true);

        const [classesResponse, yearsResponse] = await Promise.all([
          api.get("/classes"),
          api.get("/academic-years"),
        ]);

        setClasses(classesResponse.data.data || []);
        setAcademicYears(yearsResponse.data.data || []);
      } catch (err) {
        console.error("Failed to load filters:", err);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  const [feeForm, setFeeForm] = useState({
    rollNo: "",
    name: "",
    year: "",
    tuitionFee: "",
    examFee: "",
    busFee: "",
    libraryFee: "",
    sportsFee: "",
  });

  const [classFeeForm, setClassFeeForm] = useState({
    class: "",
    section: "",
    year: "",
    feeMonth: "",
    tuitionFee: "",
    examFee: "",
    busFee: "",
    libraryFee: "",
    sportsFee: "",
  });

  const [resultForm, setResultForm] = useState({
    rollNo: "",
    name: "",
    class: "",
    examType: "",
    subjects: [
      { name: "Math", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
      { name: "Science", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
      { name: "English", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
      { name: "Social", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
    ] as SubjectItem[],
  });

  const examTypes = ["Mid-Term", "Final", "Weekly Test", "Quarterly"];
  const classNames = Array.from(new Set(classes.map((c) => c.name)));

  const sections = Array.from(
    new Set(
      classes
        .filter((c) => !filters.className || c.name === filters.className)
        .map((c) => c.section)
    )
  );


  const filtersComplete =
    Boolean(filters.className) && Boolean(filters.section) && Boolean(filters.year);
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      if (name === "className") {
        updatedFilters.section = "";
      }
      return updatedFilters;
    });
  };

  const handleViewStudents = () => {
    const { className, section, year } = filters;

    if (!className || !section || !year) {
      alert("Please select class, section and academic year.");
      return;
    }

    const selectedClass = classes.find(
      (c) =>
        c.name === className &&
        c.section === section &&
        c.academicYear === year
    );

    if (!selectedClass) {
      alert("Selected class and section not found.");
      return;
    }

    navigate(
      `/dashboard/students/list?classId=${selectedClass.id}&year=${encodeURIComponent(year)}`
    );
  };

  const handleAddStudent = () => {
    navigate("/dashboard/students/add");
  };

  const handleFeeChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFeeForm({ ...feeForm, [e.target.name]: e.target.value });
  };

  const handleSubmitFee = (e: FormEvent) => {
    e.preventDefault();

    const details = {
      tuitionFee: parseFloat(feeForm.tuitionFee) || 0,
      examFee: parseFloat(feeForm.examFee) || 0,
      busFee: parseFloat(feeForm.busFee) || 0,
      libraryFee: parseFloat(feeForm.libraryFee) || 0,
      sportsFee: parseFloat(feeForm.sportsFee) || 0,
    };

    const total = Object.values(details).reduce((a, b) => a + b, 0);

    alert(
      `Fee added for ${feeForm.name} (${feeForm.rollNo}) – Total: ₹${total}`
    );

    setShowAddFeeModal(false);
    setFeeForm({
      rollNo: "",
      name: "",
      year: "",
      tuitionFee: "",
      examFee: "",
      busFee: "",
      libraryFee: "",
      sportsFee: "",
    });
  };

  const handleResultChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setResultForm({ ...resultForm, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (
    index: number,
    field: keyof SubjectItem,
    value: string
  ) => {
    const updated = [...resultForm.subjects];
    updated[index][field] = value;
    setResultForm({ ...resultForm, subjects: updated });
  };

  const addSubjectRow = () => {
    setResultForm({
      ...resultForm,
      subjects: [
        ...resultForm.subjects,
        {
          name: "",
          theoryGained: "",
          theoryMax: "",
          practicalGained: "",
          practicalMax: "",
        },
      ],
    });
  };

  const removeSubjectRow = (index: number) => {
    if (resultForm.subjects.length <= 1) return;
    const updated = [...resultForm.subjects];
    updated.splice(index, 1);
    setResultForm({ ...resultForm, subjects: updated });
  };

  const handleSubmitResult = (e: FormEvent) => {
    e.preventDefault();

    alert(
      `Result uploaded for ${resultForm.name} (${resultForm.rollNo}) – ${resultForm.examType}`
    );

    setShowResultModal(false);
    setResultForm({
      rollNo: "",
      name: "",
      class: "",
      examType: "",
      subjects: [
        { name: "Math", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
        { name: "Science", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
        { name: "English", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
        { name: "Social", theoryGained: "", theoryMax: "", practicalGained: "", practicalMax: "" },
      ],
    });
  };
  return (
    <div className="students-page">
      {/* ===== Header ===== */}
      <div className="students-header">
        <div>
          <h1 className="students-title">Students</h1>
          <p className="students-subtitle">
            Manage students, fees, and academic results
          </p>
        </div>

        <div className="student-header-actions">
          <button className="student-add-btn" onClick={handleAddStudent}>
            <FaUserPlus /> Add Student
          </button>
          <button
             className="student-action-btn student-action-btn--fee"
              onClick={() => navigate("/dashboard/students/fees/add")}
          >
            <FaMoneyBill /> Add Fee
          </button>
          <button
            className="student-action-btn student-action-btn--fee"
              onClick={() => navigate("/dashboard/students/fees/add")}
          >
            <FaUsers /> Class Fee
          </button>
          <button
            className="student-action-btn student-action-btn--upload"
            onClick={() => setShowResultModal(true)}
          >
            <FaUpload /> Upload Result
          </button>
        </div>
      </div>

      {/* ===== Filter Card ===== */}
      <div className="filter-card">
        <div className="filter-card-header">
          <div>
            <h2 className="filter-title">Find Students</h2>
            <p className="filter-subtitle">
              Select class, section and academic year to view the student list
            </p>
          </div>
        </div>

        <div className="filter-row">
          {/* Class */}
          <div className="filter-group">
            <label htmlFor="className">Class</label>
            <select
              id="className"
              name="className"
              value={filters.className}
              onChange={handleChange}
              className="filter-select"
              disabled={loadingFilters}
            >
              <option value="">
                {loadingFilters ? "Loading Classes..." : "Select Class"}
              </option>
              {classNames.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="filter-group">
            <label htmlFor="section">Section</label>
            <select
              id="section"
              name="section"
              value={filters.section}
              onChange={handleChange}
              className="filter-select"
              disabled={loadingFilters || !filters.className}
            >
              <option value="">
                {!filters.className ? "Select Class First" : "Select Section"}
              </option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="filter-group">
            <label htmlFor="year">Academic Year</label>
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              className="filter-select"
              disabled={loadingFilters}
            >
              <option value="">
                {loadingFilters ? "Loading Years..." : "Select Year"}
              </option>
              {academicYears.map((academicYear) => (
                <option key={academicYear.id} value={academicYear.name}>
                  {academicYear.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-actions">
          {!filtersComplete && !loadingFilters && (
            <span className="filter-hint">
              Select all three filters to continue
            </span>
          )}
          <button className="view-btn" onClick={handleViewStudents}>
            <FaEye /> View Students
          </button>
        </div>
      </div>

      {/* =====================================================
          ADD FEE FOR STUDENT MODAL
          ===================================================== */}
      {showAddFeeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddFeeModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-text">
                <h2>Add Fee for Student</h2>
                <p>Record fee details for a specific student</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddFeeModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitFee} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Roll No</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={feeForm.rollNo}
                    onChange={handleFeeChange}
                    required
                    placeholder="e.g., 2024001"
                  />
                </div>
                <div className="form-group">
                  <label>Student Name</label>
                  <input
                    type="text"
                    name="name"
                    value={feeForm.name}
                    onChange={handleFeeChange}
                    required
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <select
                  name="year"
                  value={feeForm.year}
                  onChange={handleFeeChange}
                  required
                >
                  <option value="">Select Year</option>
                  {academicYears.map((academicYear) => (
                    <option key={academicYear.id} value={academicYear.name}>
                      {academicYear.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fee-breakdown-inputs">
                <div className="fee-breakdown-title">
                  <FaMoneyBill /> Fee Breakdown
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tuition Fee</label>
                    <input
                      type="number"
                      name="tuitionFee"
                      value={feeForm.tuitionFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Exam Fee</label>
                    <input
                      type="number"
                      name="examFee"
                      value={feeForm.examFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bus Fee</label>
                    <input
                      type="number"
                      name="busFee"
                      value={feeForm.busFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Library Fee</label>
                    <input
                      type="number"
                      name="libraryFee"
                      value={feeForm.libraryFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Sports Fee</label>
                  <input
                    type="number"
                    name="sportsFee"
                    value={feeForm.sportsFee}
                    onChange={handleFeeChange}
                    placeholder="₹"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddFeeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          UPLOAD RESULT MODAL
          ===================================================== */}
      {showResultModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowResultModal(false)}
        >
          <div
            className="modal-content result-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-text">
                <h2>Upload Student Result</h2>
                <p>Enter subject-wise theory and practical marks</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowResultModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Roll No</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={resultForm.rollNo}
                    onChange={handleResultChange}
                    required
                    placeholder="e.g., 2024001"
                  />
                </div>
                <div className="form-group">
                  <label>Student Name</label>
                  <input
                    type="text"
                    name="name"
                    value={resultForm.name}
                    onChange={handleResultChange}
                    required
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class</label>
                  <select
                    name="class"
                    value={resultForm.class}
                    onChange={handleResultChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classNames.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Exam Type</label>
                  <select
                    name="examType"
                    value={resultForm.examType}
                    onChange={handleResultChange}
                    required
                  >
                    <option value="">Select Exam</option>
                    {examTypes.map((examType) => (
                      <option key={examType} value={examType}>
                        {examType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="subject-table-wrapper">
                <label>Subjects &amp; Marks</label>
                <div className="subject-table-scroll">
                  <table className="subject-input-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Theory (Gained)</th>
                        <th>Theory (Max)</th>
                        <th>Practical (Gained)</th>
                        <th>Practical (Max)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultForm.subjects.map((sub, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) =>
                                handleSubjectChange(idx, "name", e.target.value)
                              }
                              placeholder="Subject"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={sub.theoryGained}
                              onChange={(e) =>
                                handleSubjectChange(idx, "theoryGained", e.target.value)
                              }
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={sub.theoryMax}
                              onChange={(e) =>
                                handleSubjectChange(idx, "theoryMax", e.target.value)
                              }
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={sub.practicalGained}
                              onChange={(e) =>
                                handleSubjectChange(idx, "practicalGained", e.target.value)
                              }
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={sub.practicalMax}
                              onChange={(e) =>
                                handleSubjectChange(idx, "practicalMax", e.target.value)
                              }
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="remove-subject-btn"
                              onClick={() => removeSubjectRow(idx)}
                              disabled={resultForm.subjects.length <= 1}
                              title="Remove subject"
                            >
                              <FaTimes />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="add-subject-btn"
                  onClick={addSubjectRow}
                >
                  <FaPlus /> Add Subject
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowResultModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Upload Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;