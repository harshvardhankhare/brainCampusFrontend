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
  const [showClassFeeModal, setShowClassFeeModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [submittingClassFee, setSubmittingClassFee] = useState<boolean>(false);

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
    feeMonth: "", // 1 = Jan ... 12 = Dec, or empty for annual/non-monthly
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

  // Sections for Class Fee modal
  const classFeeSections = Array.from(
    new Set(
      classes
        .filter((c) => !classFeeForm.class || c.name === classFeeForm.class)
        .map((c) => c.section)
    )
  );
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
      `/dashboard/students/list?classId=${selectedClass.id}&year=${encodeURIComponent(
        year
      )}`
    );
  };

  const handleAddStudent = () => {
    navigate("/students/add");
  };
  const handleFeeChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFeeForm({
      ...feeForm,
      [e.target.name]: e.target.value,
    });
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
  const handleClassFeeChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setClassFeeForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "class" ? { section: "" } : {}),
    }));
  };

  const handleSubmitClassFee = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Locate the exact class by name, section, and academic year
    const selectedClass = classes.find(
      (c) =>
        c.name === classFeeForm.class &&
        c.section === classFeeForm.section &&
        c.academicYear === classFeeForm.year
    );

    if (!selectedClass) {
      alert("Selected class, section, and academic year combination not found.");
      return;
    }

    // 2. Map form fee fields to backend FeeType enums
    const feeMappings: Array<{
      key: keyof typeof classFeeForm;
      feeType: string;
      label: string;
    }> = [
      { key: "tuitionFee", feeType: "TUITION", label: "Tuition" },
      { key: "examFee", feeType: "EXAM", label: "Exam" },
      { key: "busFee", feeType: "TRANSPORT", label: "Bus" },
      { key: "libraryFee", feeType: "LIBRARY", label: "Library" },
      { key: "sportsFee", feeType: "SPORTS", label: "Sports" },
    ];

    const feesToCreate = feeMappings
      .map(({ key, feeType, label }) => ({
        feeType,
        label,
        amount: parseFloat(classFeeForm[key]),
      }))
      .filter((item) => !isNaN(item.amount) && item.amount > 0);

    if (feesToCreate.length === 0) {
      alert("Please enter at least one fee amount greater than 0.");
      return;
    }

    try {
      setSubmittingClassFee(true);

      const parsedMonth = classFeeForm.feeMonth
        ? parseInt(classFeeForm.feeMonth, 10)
        : null;

      // 3. Post fees to backend /student-fees/class
      const requests = feesToCreate.map((fee) =>
        studentApi.createClassFee({
          classId: selectedClass.id,
          academicYear: classFeeForm.year,
          feeType: fee.feeType,
          feeMonth: parsedMonth,
          amount: fee.amount,
          description: `${fee.label} Fee for ${classFeeForm.class} ${
            classFeeForm.section
          }${parsedMonth ? ` (Month ${parsedMonth})` : ""}`,
        })
      );

      const responses = await Promise.all(requests);

      const summaryMessages = responses.map((res) => res.data?.message).join("\n");

      alert(
        `Fees assigned successfully to ${classFeeForm.class} ${classFeeForm.section}!\n\n${summaryMessages}`
      );

      setShowClassFeeModal(false);

      // Reset form
      setClassFeeForm({
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
    } catch (error: any) {
      console.error("Failed to add class fee:", error);
      const message =
        error.response?.data?.message ||
        "Failed to add class fee. Please try again.";
      alert(message);
    } finally {
      setSubmittingClassFee(false);
    }
  };

  const handleResultChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setResultForm({
      ...resultForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubjectChange = (
    index: number,
    field: keyof SubjectItem,
    value: string
  ) => {
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

  const removeSubjectRow = (index: number) => {
    if (resultForm.subjects.length <= 1) return;
    const updated = [...resultForm.subjects];
    updated.splice(index, 1);
    setResultForm({
      ...resultForm,
      subjects: updated,
    });
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

  return (
    <div className="students-page">
      {/* Header */}
      <div className="students-header">
        <h1 className="students-title">Students</h1>
        <div className="header-actions">
          <button className="add-student-btn" onClick={handleAddStudent}>
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

      {/* Student Filter Card */}
      <div className="filter-card">
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

          {/* Academic Year */}
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
                {loadingFilters ? "Loading Academic Years..." : "Select Year"}
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
          <button className="view-btn" onClick={handleViewStudents}>
            <FaEye /> View Students
          </button>
        </div>
      </div>
      {showAddFeeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddFeeModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Fee for Student</h2>
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
                <div className="form-row">
                  <div className="form-group">
                    <label>Tuition Fee</label>
                    <input
                      type="number"
                      name="tuitionFee"
                      value={feeForm.tuitionFee}
                      onChange={handleFeeChange}
                      placeholder="₹"
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

      {showClassFeeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowClassFeeModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Fee for Whole Class</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowClassFeeModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitClassFee} className="modal-form">
              <div className="form-row">
                {/* Class */}
                <div className="form-group">
                  <label>Class</label>
                  <select
                    name="class"
                    value={classFeeForm.class}
                    onChange={handleClassFeeChange}
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

                {/* Section */}
                <div className="form-group">
                  <label>Section</label>
                  <select
                    name="section"
                    value={classFeeForm.section}
                    onChange={handleClassFeeChange}
                    required
                    disabled={!classFeeForm.class}
                  >
                    <option value="">
                      {!classFeeForm.class
                        ? "Select Class First"
                        : "Select Section"}
                    </option>
                    {classFeeSections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                {/* Academic Year */}
                <div className="form-group">
                  <label>Academic Year</label>
                  <select
                    name="year"
                    value={classFeeForm.year}
                    onChange={handleClassFeeChange}
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

                {/* Fee Month (Optional for Monthly Fees) */}
                <div className="form-group">
                  <label>Fee Month (Optional)</label>
                  <select
                    name="feeMonth"
                    value={classFeeForm.feeMonth}
                    onChange={handleClassFeeChange}
                  >
                    <option value="">Annual / Non-Monthly</option>
                    <option value="1">1 - January</option>
                    <option value="2">2 - February</option>
                    <option value="3">3 - March</option>
                    <option value="4">4 - April</option>
                    <option value="5">5 - May</option>
                    <option value="6">6 - June</option>
                    <option value="7">7 - July</option>
                    <option value="8">8 - August</option>
                    <option value="9">9 - September</option>
                    <option value="10">10 - October</option>
                    <option value="11">11 - November</option>
                    <option value="12">12 - December</option>
                  </select>
                </div>
              </div>

              <div className="fee-breakdown-inputs">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tuition Fee</label>
                    <input
                      type="number"
                      name="tuitionFee"
                      value={classFeeForm.tuitionFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Exam Fee</label>
                    <input
                      type="number"
                      name="examFee"
                      value={classFeeForm.examFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bus / Transport Fee</label>
                    <input
                      type="number"
                      name="busFee"
                      value={classFeeForm.busFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Library Fee</label>
                    <input
                      type="number"
                      name="libraryFee"
                      value={classFeeForm.libraryFee}
                      onChange={handleClassFeeChange}
                      placeholder="₹"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Sports Fee</label>
                  <input
                    type="number"
                    name="sportsFee"
                    value={classFeeForm.sportsFee}
                    onChange={handleClassFeeChange}
                    placeholder="₹"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowClassFeeModal(false)}
                  disabled={submittingClassFee}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submittingClassFee}
                >
                  {submittingClassFee ? "Adding Fees..." : "Add Class Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
              <h2>Upload Student Result</h2>
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
                <label>Subjects & Marks</label>
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
                              onClick={() => removeSubjectRow(idx)}
                              disabled={resultForm.subjects.length <= 1}
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