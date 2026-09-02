import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./Teachers.css";

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState(null);

  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    academicYear: "",
    weeklyPeriods: 5,
    teacherId: "",
  });

  // =========================
  // Fetch all data
  // =========================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignmentsResponse,
        teachersResponse,
        classesResponse,
        subjectsResponse,
        academicYearsResponse,
      ] = await Promise.all([
        api.get("/class-subjects"),
        api.get("/teachers"),
        api.get("/classes"),
        api.get("/subjects"),
        api.get("/academic-years"),
      ]);

      setAssignments(
        assignmentsResponse.data.data || []
      );

      setTeachers(
        teachersResponse.data.data || []
      );

      setClasses(
        classesResponse.data.data || []
      );

      setSubjects(
        subjectsResponse.data.data || []
      );

      setAcademicYears(
        academicYearsResponse.data.data || []
      );
    } catch (err) {
      console.error(
        "Failed to load teacher assignments:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load teacher assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Open modal
  // =========================

  const handleOpenModal = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);

      setFormData({
        classId: assignment.classId || "",
        subjectId: assignment.subjectId || "",
        academicYear:
          assignment.academicYear || "",
        weeklyPeriods:
          assignment.weeklyPeriods || 5,
        teacherId: assignment.teacherId || "",
      });
    } else {
      setEditingAssignment(null);

      const activeYear = academicYears.find(
        (year) => year.active
      );

      setFormData({
        classId: "",
        subjectId: "",
        academicYear:
          activeYear?.name || "",
        weeklyPeriods: 5,
        teacherId: "",
      });
    }

    setShowModal(true);
  };

  // =========================
  // Close modal
  // =========================

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAssignment(null);

    setFormData({
      classId: "",
      subjectId: "",
      academicYear: "",
      weeklyPeriods: 5,
      teacherId: "",
    });
  };

  // =========================
  // Form change
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Create / Update
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        classId: Number(formData.classId),
        subjectId: Number(formData.subjectId),
        academicYear: formData.academicYear,
        weeklyPeriods: Number(
          formData.weeklyPeriods
        ),
        teacherId: formData.teacherId
          ? Number(formData.teacherId)
          : null,
      };

      if (editingAssignment) {
        // UPDATE

        const response = await api.put(
          `/class-subjects/${editingAssignment.id}`,
          payload
        );

        const updatedAssignment =
          response.data.data;

        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.id === editingAssignment.id
              ? updatedAssignment
              : assignment
          )
        );
      } else {
        // CREATE

        const response = await api.post(
          "/class-subjects",
          payload
        );

        const newAssignment =
          response.data.data;

        setAssignments((prev) => [
          ...prev,
          newAssignment,
        ]);
      }

      handleCloseModal();
    } catch (err) {
      console.error(
        "Failed to save assignment:",
        err
      );

      const message =
        err.response?.status === 403
          ? "You do not have permission to perform this action."
          : err.response?.data?.message ||
            "Failed to save assignment.";

      alert(message);
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/class-subjects/${id}`
      );

      setAssignments((prev) =>
        prev.filter(
          (assignment) =>
            assignment.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete assignment:",
        err
      );

      const message =
        err.response?.status === 403
          ? "You do not have permission to delete this assignment."
          : err.response?.data?.message ||
            "Failed to delete assignment.";

      alert(message);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="teacher-assignments-page">
        <div className="loading">
          Loading assignments...
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="teacher-assignments-page">

      {/* Header */}

      <div className="assignments-header">

        <h1>
          Teacher Assignments
        </h1>

        <button
          className="add-assignment-btn"
          onClick={() =>
            handleOpenModal()
          }
        >
          <FaPlus />
          Assign Teacher
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Table */}

      <div className="table-wrapper">

        <table className="assignment-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Teacher</th>
              <th>Class</th>
              <th>Section</th>
              <th>Subject</th>
              <th>Academic Year</th>
              <th>Weekly Periods</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {assignments.length > 0 ? (

              assignments.map(
                (assignment, index) => (

                  <tr
                    key={assignment.id}
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {assignment.teacherName ||
                        "Not Assigned"}
                    </td>

                    <td>
                      {assignment.className}
                    </td>

                    <td>
                      {assignment.section}
                    </td>

                    <td>
                      {assignment.subjectName}

                      {assignment.subjectCode && (
                        <span className="subject-code">
                          {" "}
                          ({assignment.subjectCode})
                        </span>
                      )}
                    </td>

                    <td>
                      {assignment.academicYear}
                    </td>

                    <td>
                      {assignment.weeklyPeriods}
                    </td>

                    <td className="action-btns">

                      <button
                        className="action-btn edit-btn"
                        onClick={() =>
                          handleOpenModal(
                            assignment
                          )
                        }
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() =>
                          handleDelete(
                            assignment.id
                          )
                        }
                        title="Delete"
                      >
                        <FaTrash />
                      </button>

                    </td>

                  </tr>

                )

              )

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="no-data"
                >
                  No teacher assignments found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* =========================
          Modal
          ========================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={handleCloseModal}
        >

          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="modal-header">

              <h2>
                {editingAssignment
                  ? "Edit Teacher Assignment"
                  : "Assign Teacher"}
              </h2>

              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="modal-form"
            >

              {/* Teacher */}

              <div className="form-group">

                <label htmlFor="teacherId">
                  Teacher
                </label>

                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Teacher
                  </option>

                  {teachers
                    .filter(
                      (teacher) =>
                        teacher.active
                    )
                    .map((teacher) => (

                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {teacher.firstName}{" "}
                        {teacher.lastName}{" "}
                        ({teacher.employeeCode})
                      </option>

                    ))}

                </select>

              </div>

              {/* Class */}

              <div className="form-group">

                <label htmlFor="classId">
                  Class
                </label>

                <select
                  id="classId"
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Class
                  </option>

                  {classes
                    .filter(
                      (schoolClass) =>
                        schoolClass.active
                    )
                    .map((schoolClass) => (

                      <option
                        key={schoolClass.id}
                        value={schoolClass.id}
                      >
                        {schoolClass.name} -{" "}
                        {schoolClass.section}
                      </option>

                    ))}

                </select>

              </div>

              {/* Subject */}

              <div className="form-group">

                <label htmlFor="subjectId">
                  Subject
                </label>

                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Subject
                  </option>

                  {subjects
                    .filter(
                      (subject) =>
                        subject.active
                    )
                    .map((subject) => (

                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                        {subject.code
                          ? ` (${subject.code})`
                          : ""}
                      </option>

                    ))}

                </select>

              </div>

              {/* Academic Year */}

              <div className="form-group">

                <label htmlFor="academicYear">
                  Academic Year
                </label>

                <select
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Academic Year
                  </option>

                  {academicYears
                    .filter(
                      (year) =>
                        year.active
                    )
                    .map((year) => (

                      <option
                        key={year.id}
                        value={year.name}
                      >
                        {year.name}
                      </option>

                    ))}

                </select>

              </div>

              {/* Weekly Periods */}

              <div className="form-group">

                <label htmlFor="weeklyPeriods">
                  Weekly Periods
                </label>

                <input
                  type="number"
                  id="weeklyPeriods"
                  name="weeklyPeriods"
                  value={
                    formData.weeklyPeriods
                  }
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                />

              </div>

              {/* Actions */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  {editingAssignment
                    ? "Update Assignment"
                    : "Assign Teacher"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default TeacherAssignments;