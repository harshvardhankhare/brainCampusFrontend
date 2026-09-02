import { useEffect, useState } from "react";
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
import "./Students.css";

const Students = () => {
  const navigate = useNavigate();

  // =========================
  // Student filter data
  // =========================

  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [filters, setFilters] = useState({
    className: "",
    section: "",
    year: "",
  });

  // =========================
  // Modal visibility
  // =========================

  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showClassFeeModal, setShowClassFeeModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // =========================
  // Fetch classes & academic years
  // =========================

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

  // =========================
  // Single fee form
  // =========================

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

  // =========================
  // Class fee form
  // =========================

  const [classFeeForm, setClassFeeForm] = useState({
    class: "",
    section: "",
    year: "",
    tuitionFee: "",
    examFee: "",
    busFee: "",
    libraryFee: "",
    sportsFee: "",
  });

  // =========================
  // Result upload form
  // =========================

  const [resultForm, setResultForm] = useState({
    rollNo: "",
    name: "",
    class: "",
    examType: "",
    subjects: [
      {
        name: "Math",
        theoryGained: "",
        theoryMax: "",
        practicalGained: "",
        practicalMax: "",
      },
      {
        name: "Science",
        theoryGained: "",
        theoryMax: "",
        practicalGained: "",
        practicalMax: "",
      },
      {
        name: "English",
        theoryGained: "",
        theoryMax: "",
        practicalGained: "",
        practicalMax: "",
      },
      {
        name: "Social",
        theoryGained: "",
        theoryMax: "",
        practicalGained: "",
        practicalMax: "",
      },
    ],
  });

  const examTypes = [
    "Mid-Term",
    "Final",
    "Weekly Test",
    "Quarterly",
  ];

  // =========================
  // Derived filter options
  // =========================

  const classNames = [
    ...new Set(classes.map((schoolClass) => schoolClass.name)),
  ];

  // Only show sections belonging to selected class
  const sections = [
    ...new Set(
      classes
        .filter(
          (schoolClass) =>
            !filters.className ||
            schoolClass.name === filters.className
        )
        .map((schoolClass) => schoolClass.section)
    ),
  ];

  // =========================
  // Student filter handlers
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [name]: value,
      };

      // If class changes, reset section
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

    // Find the exact class-section-year combination
    const selectedClass = classes.find(
      (schoolClass) =>
        schoolClass.name === className &&
        schoolClass.section === section &&
        schoolClass.academicYear === year
    );

    if (!selectedClass) {
      alert("Selected class and section not found.");
      return;
    }

    navigate(
      `/dashboard/students/list?classId=${selectedClass.id}&year=${encodeURIComponent(
        year
      )}`
    );
  };

  // =========================
  // Add student
  // =========================

  const handleAddStudent = () => {
    navigate("/students/add");
  };

  // =========================
  // Fee form handlers
  // =========================

  const handleFeeChange = (e) => {
    setFeeForm({
      ...feeForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitFee = (e) => {
    e.preventDefault();

    const details = {
      tuitionFee: parseFloat(feeForm.tuitionFee) || 0,
      examFee: parseFloat(feeForm.examFee) || 0,
      busFee: parseFloat(feeForm.busFee) || 0,
      libraryFee: parseFloat(feeForm.libraryFee) || 0,
      sportsFee: parseFloat(feeForm.sportsFee) || 0,
    };

    const total = Object.values(details).reduce(
      (a, b) => a + b,
      0
    );

    const payload = {
      student: {
        rollNo: feeForm.rollNo,
        name: feeForm.name,
      },
      year: feeForm.year,
      details,
      total,
      paid: 0,
      due: total,
      lastPayment: new Date().toISOString().split("T")[0],
    };

    console.log("Single Fee Added:", payload);

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

  // =========================
  // Class fee handlers
  // =========================

  const handleClassFeeChange = (e) => {
    setClassFeeForm({
      ...classFeeForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitClassFee = (e) => {
    e.preventDefault();

    const details = {
      tuitionFee: parseFloat(classFeeForm.tuitionFee) || 0,
      examFee: parseFloat(classFeeForm.examFee) || 0,
      busFee: parseFloat(classFeeForm.busFee) || 0,
      libraryFee: parseFloat(classFeeForm.libraryFee) || 0,
      sportsFee: parseFloat(classFeeForm.sportsFee) || 0,
    };

    const total = Object.values(details).reduce(
      (a, b) => a + b,
      0
    );

    const payload = {
      class: classFeeForm.class,
      section: classFeeForm.section,
      year: classFeeForm.year,
      details,
      total,
    };

    console.log("Class Fee Added:", payload);

    alert(
      `Fee structure added for ${classFeeForm.class} ${classFeeForm.section} (${classFeeForm.year}) – Total per student: ₹${total}`
    );

    setShowClassFeeModal(false);

    setClassFeeForm({
      class: "",
      section: "",
      year: "",
      tuitionFee: "",
      examFee: "",
      busFee: "",
      libraryFee: "",
      sportsFee: "",
    });
  };

  // =========================
  // Result form handlers
  // =========================

  const handleResultChange = (e) => {
    setResultForm({
      ...resultForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...resultForm.subjects];

    updated[index][field] = value;

    setResultForm({
      ...resultForm,
      subjects: updated,
    });
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

  const removeSubjectRow = (index) => {
    if (resultForm.subjects.length <= 1) {
      return;
    }

    const updated = [...resultForm.subjects];

    updated.splice(index, 1);

    setResultForm({
      ...resultForm,
      subjects: updated,
    });
  };

  const handleSubmitResult = (e) => {
    e.preventDefault();

    const subjects = {};

    resultForm.subjects.forEach((s) => {
      if (s.name) {
        subjects[s.name] = {
          theory: {
            gained: parseFloat(s.theoryGained) || 0,
            max: parseFloat(s.theoryMax) || 0,
          },

          practical: {
            gained: parseFloat(s.practicalGained) || 0,
            max: parseFloat(s.practicalMax) || 0,
          },

          totalGained:
            (parseFloat(s.theoryGained) || 0) +
            (parseFloat(s.practicalGained) || 0),

          totalMax:
            (parseFloat(s.theoryMax) || 0) +
            (parseFloat(s.practicalMax) || 0),
        };
      }
    });

    const payload = {
      student: {
        rollNo: resultForm.rollNo,
        name: resultForm.name,
      },
      class: resultForm.class,
      exam: resultForm.examType,
      subjects,
    };

    console.log("Result Uploaded:", payload);

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
        {
          name: "Math",
          theoryGained: "",
          theoryMax: "",
          practicalGained: "",
          practicalMax: "",
        },
        {
          name: "Science",
          theoryGained: "",
          theoryMax: "",
          practicalGained: "",
          practicalMax: "",
        },
        {
          name: "English",
          theoryGained: "",
          theoryMax: "",
          practicalGained: "",
          practicalMax: "",
        },
        {
          name: "Social",
          theoryGained: "",
          theoryMax: "",
          practicalGained: "",
          practicalMax: "",
        },
      ],
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="students-page">

      {/* =========================
          Header
          ========================= */}

      <div className="students-header">

        <h1 className="students-title">
          Students
        </h1>

        <div className="header-actions">

          <button
            className="add-student-btn"
            onClick={handleAddStudent}
          >
            <FaUserPlus /> Add Student
          </button>

          <button
            className="action-btn secondary"
            onClick={() => setShowAddFeeModal(true)}
          >
            <FaMoneyBill /> Add Fee
          </button>

          <button
            className="action-btn tertiary"
            onClick={() => setShowClassFeeModal(true)}
          >
            <FaUsers /> Class Fee
          </button>

          <button
            className="action-btn upload"
            onClick={() => setShowResultModal(true)}
          >
            <FaUpload /> Upload Result
          </button>

        </div>
      </div>

      {/* =========================
          Student Filter Card
          ========================= */}

      <div className="filter-card">

        <div className="filter-row">

          {/* Class */}

          <div className="filter-group">

            <label htmlFor="className">
              Class
            </label>

            <select
              id="className"
              name="className"
              value={filters.className}
              onChange={handleChange}
              className="filter-select"
              disabled={loadingFilters}
            >

              <option value="">
                {loadingFilters
                  ? "Loading Classes..."
                  : "Select Class"}
              </option>

              {classNames.map((className) => (
                <option
                  key={className}
                  value={className}
                >
                  {className}
                </option>
              ))}

            </select>

          </div>


          {/* Section */}

          <div className="filter-group">

            <label htmlFor="section">
              Section
            </label>

            <select
              id="section"
              name="section"
              value={filters.section}
              onChange={handleChange}
              className="filter-select"
              disabled={
                loadingFilters ||
                !filters.className
              }
            >

              <option value="">
                {!filters.className
                  ? "Select Class First"
                  : "Select Section"}
              </option>

              {sections.map((section) => (
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              ))}

            </select>

          </div>


          {/* Academic Year */}

          <div className="filter-group">

            <label htmlFor="year">
              Academic Year
            </label>

            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              className="filter-select"
              disabled={loadingFilters}
            >

              <option value="">
                {loadingFilters
                  ? "Loading Academic Years..."
                  : "Select Year"}
              </option>

              {academicYears.map((academicYear) => (
                <option
                  key={academicYear.id}
                  value={academicYear.name}
                >
                  {academicYear.name}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="filter-actions">

          <button
            className="view-btn"
            onClick={handleViewStudents}
          >
            <FaEye /> View Students
          </button>

        </div>

      </div>


      {/* =========================
          MODALS
          ========================= */}

      {/* 1. Add Single Fee Modal */}

      {showAddFeeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddFeeModal(false)}
        >

          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <h2>
                Add Fee for Student
              </h2>

              <button
                className="modal-close-btn"
                onClick={() => setShowAddFeeModal(false)}
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleSubmitFee}
              className="modal-form"
            >

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Roll No
                  </label>

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

                  <label>
                    Student Name
                  </label>

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

                <label>
                  Academic Year
                </label>

                <select
                  name="year"
                  value={feeForm.year}
                  onChange={handleFeeChange}
                  required
                >

                  <option value="">
                    Select Year
                  </option>

                  {academicYears.map((academicYear) => (
                    <option
                      key={academicYear.id}
                      value={academicYear.name}
                    >
                      {academicYear.name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="fee-breakdown-inputs">

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Tuition Fee
                    </label>

                    <input
                      type="number"
                      name="tuitionFee"
                      value={feeForm.tuitionFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Exam Fee
                    </label>

                    <input
                      type="number"
                      name="examFee"
                      value={feeForm.examFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                    />

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Bus Fee
                    </label>

                    <input
                      type="number"
                      name="busFee"
                      value={feeForm.busFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Library Fee
                    </label>

                    <input
                      type="number"
                      name="libraryFee"
                      value={feeForm.libraryFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Sports Fee
                  </label>

                  <input
                    type="number"
                    name="sportsFee"
                    value={feeForm.sportsFee}
                    onChange={handleFeeChange}
                    placeholder="₹"
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

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Add Fee
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* 2. Add Class Fee Modal */}

      {showClassFeeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowClassFeeModal(false)}
        >

          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <h2>
                Add Fee for Whole Class
              </h2>

              <button
                className="modal-close-btn"
                onClick={() => setShowClassFeeModal(false)}
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleSubmitClassFee}
              className="modal-form"
            >

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Class
                  </label>

                  <select
                    name="class"
                    value={classFeeForm.class}
                    onChange={handleClassFeeChange}
                    required
                  >

                    <option value="">
                      Select Class
                    </option>

                    {classNames.map((className) => (
                      <option
                        key={className}
                        value={className}
                      >
                        {className}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Section
                  </label>

                  <select
                    name="section"
                    value={classFeeForm.section}
                    onChange={handleClassFeeChange}
                    required
                  >

                    <option value="">
                      Select Section
                    </option>

                    {sections.map((section) => (
                      <option
                        key={section}
                        value={section}
                      >
                        {section}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Academic Year
                </label>

                <select
                  name="year"
                  value={classFeeForm.year}
                  onChange={handleClassFeeChange}
                  required
                >

                  <option value="">
                    Select Year
                  </option>

                  {academicYears.map((academicYear) => (
                    <option
                      key={academicYear.id}
                      value={academicYear.name}
                    >
                      {academicYear.name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="fee-breakdown-inputs">

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Tuition Fee
                    </label>

                    <input
                      type="number"
                      name="tuitionFee"
                      value={classFeeForm.tuitionFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Exam Fee
                    </label>

                    <input
                      type="number"
                      name="examFee"
                      value={classFeeForm.examFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                    />

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Bus Fee
                    </label>

                    <input
                      type="number"
                      name="busFee"
                      value={classFeeForm.busFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Library Fee
                    </label>

                    <input
                      type="number"
                      name="libraryFee"
                      value={classFeeForm.libraryFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Sports Fee
                  </label>

                  <input
                    type="number"
                    name="sportsFee"
                    value={classFeeForm.sportsFee}
                    onChange={handleClassFeeChange}
                    placeholder="₹"
                  />

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowClassFeeModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Add Class Fee
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* 3. Upload Result Modal */}

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

              <h2>
                Upload Student Result
              </h2>

              <button
                className="modal-close-btn"
                onClick={() => setShowResultModal(false)}
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleSubmitResult}
              className="modal-form"
            >

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Roll No
                  </label>

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

                  <label>
                    Student Name
                  </label>

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

                  <label>
                    Class
                  </label>

                  <select
                    name="class"
                    value={resultForm.class}
                    onChange={handleResultChange}
                    required
                  >

                    <option value="">
                      Select Class
                    </option>

                    {classNames.map((className) => (
                      <option
                        key={className}
                        value={className}
                      >
                        {className}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Exam Type
                  </label>

                  <select
                    name="examType"
                    value={resultForm.examType}
                    onChange={handleResultChange}
                    required
                  >

                    <option value="">
                      Select Exam
                    </option>

                    {examTypes.map((examType) => (
                      <option
                        key={examType}
                        value={examType}
                      >
                        {examType}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div className="subject-table-wrapper">

                <label>
                  Subjects & Marks
                </label>

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

                      {resultForm.subjects.map(
                        (sub, idx) => (

                          <tr key={idx}>

                            <td>

                              <input
                                type="text"
                                value={sub.name}
                                onChange={(e) =>
                                  handleSubjectChange(
                                    idx,
                                    "name",
                                    e.target.value
                                  )
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
                                  handleSubjectChange(
                                    idx,
                                    "theoryGained",
                                    e.target.value
                                  )
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
                                  handleSubjectChange(
                                    idx,
                                    "theoryMax",
                                    e.target.value
                                  )
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
                                  handleSubjectChange(
                                    idx,
                                    "practicalGained",
                                    e.target.value
                                  )
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
                                  handleSubjectChange(
                                    idx,
                                    "practicalMax",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                min="0"
                              />

                            </td>

                            <td>

                              <button
                                type="button"
                                className="remove-subject-btn"
                                onClick={() =>
                                  removeSubjectRow(idx)
                                }
                                disabled={
                                  resultForm.subjects
                                    .length <= 1
                                }
                              >
                                <FaTimes />
                              </button>

                            </td>

                          </tr>

                        )
                      )}

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
                  onClick={() =>
                    setShowResultModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
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