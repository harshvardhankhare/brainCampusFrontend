import { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./Teachers.css";

const Teachers = () => {
  // =========================
  // Data
  // =========================

  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // Teacher modal
  // =========================

  const [showTeacherModal, setShowTeacherModal] =
    useState(false);

  const [editingTeacher, setEditingTeacher] =
    useState(null);

  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // =========================
  // Assignment modal
  // =========================

  const [showAssignmentModal, setShowAssignmentModal] =
    useState(false);

  const [assignmentForm, setAssignmentForm] =
    useState({
      teacherId: "",
      classId: "",
      subjectId: "",
      academicYear: "",
      weeklyPeriods: 5,
    });

  // =========================
  // Fetch data
  // =========================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        teachersResponse,
        assignmentsResponse,
        classesResponse,
        subjectsResponse,
        academicYearsResponse,
      ] = await Promise.all([
        api.get("/teachers"),
        api.get("/class-subjects"),
        api.get("/classes"),
        api.get("/subjects"),
        api.get("/academic-years"),
      ]);

      setTeachers(
        teachersResponse.data.data || []
      );

      setAssignments(
        assignmentsResponse.data.data || []
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
        "Failed to load teacher data:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load teacher data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Teacher helpers
  // =========================

  const getTeacherName = (teacher) => {
    return `${teacher.firstName || ""} ${
      teacher.lastName || ""
    }`.trim();
  };

  const getTeacherAssignments = (teacherId) => {
    return assignments.filter(
      (assignment) =>
        assignment.teacherId === teacherId
    );
  };

  // =========================
  // Teacher modal
  // =========================

  const handleOpenTeacherModal = (
    teacher = null
  ) => {
    if (teacher) {
      setEditingTeacher(teacher);

      setTeacherForm({
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
      });
    } else {
      setEditingTeacher(null);

      setTeacherForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }

    setShowTeacherModal(true);
  };

  const handleCloseTeacherModal = () => {
    setShowTeacherModal(false);
    setEditingTeacher(null);

    setTeacherForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
  };

  const handleTeacherChange = (e) => {
    const { name, value } = e.target;

    setTeacherForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Create / Update teacher
  // =========================

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        firstName: teacherForm.firstName,
        lastName: teacherForm.lastName,
        email: teacherForm.email,
        phone: teacherForm.phone,
      };

      if (editingTeacher) {
        const response = await api.put(
          `/teachers/${editingTeacher.id}`,
          payload
        );

        const updatedTeacher =
          response.data.data;

        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.id === editingTeacher.id
              ? updatedTeacher
              : teacher
          )
        );
      } else {
        const response = await api.post(
          "/teachers",
          payload
        );

        const newTeacher =
          response.data.data;

        setTeachers((prev) => [
          ...prev,
          newTeacher,
        ]);
      }

      handleCloseTeacherModal();
    } catch (err) {
      console.error(
        "Failed to save teacher:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to save teacher."
      );
    }
  };

  // =========================
  // Delete teacher
  // =========================

  const handleDeleteTeacher = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/teachers/${id}`);

      setTeachers((prev) =>
        prev.filter(
          (teacher) => teacher.id !== id
        )
      );

      // Remove assignments from local state
      // belonging to this teacher
      setAssignments((prev) =>
        prev.filter(
          (assignment) =>
            assignment.teacherId !== id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete teacher:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete teacher."
      );
    }
  };

  // =========================
  // Assignment modal
  // =========================

  const handleOpenAssignmentModal = (
    teacherId
  ) => {
    const activeYear = academicYears.find(
      (year) => year.active
    );

    setAssignmentForm({
      teacherId: teacherId,
      classId: "",
      subjectId: "",
      academicYear:
        activeYear?.name || "",
      weeklyPeriods: 5,
    });

    setShowAssignmentModal(true);
  };

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);

    setAssignmentForm({
      teacherId: "",
      classId: "",
      subjectId: "",
      academicYear: "",
      weeklyPeriods: 5,
    });
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;

    setAssignmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Create assignment
  // =========================

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        classId: Number(
          assignmentForm.classId
        ),

        subjectId: Number(
          assignmentForm.subjectId
        ),

        academicYear:
          assignmentForm.academicYear,

        weeklyPeriods: Number(
          assignmentForm.weeklyPeriods
        ),

        teacherId: Number(
          assignmentForm.teacherId
        ),
      };

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

      handleCloseAssignmentModal();
    } catch (err) {
      console.error(
        "Failed to assign teacher:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to assign teacher."
      );
    }
  };

  // =========================
  // Delete assignment
  // =========================

  const handleDeleteAssignment = async (
    assignmentId
  ) => {
    const confirmed = window.confirm(
      "Remove this teacher assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/class-subjects/${assignmentId}`
      );

      setAssignments((prev) =>
        prev.filter(
          (assignment) =>
            assignment.id !== assignmentId
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove assignment:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to remove assignment."
      );
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="teachers-page">
        <div className="loading">
          Loading teachers...
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="teachers-page">

      {/* Header */}

      <div className="teachers-header">

        <h1 className="teachers-title">
          Teachers
        </h1>

        <button
          className="add-teacher-btn"
          onClick={() =>
            handleOpenTeacherModal()
          }
        >
          <FaUserPlus />
          Add Teacher
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* =========================
          Teacher List
          ========================= */}

      <div className="table-wrapper">

        <table className="teacher-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Employee Code</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Assigned Classes / Subjects</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {teachers.length > 0 ? (

              teachers.map(
                (teacher, index) => {

                  const teacherAssignments =
                    getTeacherAssignments(
                      teacher.id
                    );

                  return (
                    <tr
                      key={teacher.id}
                    >

                      {/* # */}

                      <td>
                        {index + 1}
                      </td>

                      {/* Employee Code */}

                      <td>
                        {teacher.employeeCode}
                      </td>

                      {/* Name */}

                      <td>
                        <strong>
                          {getTeacherName(
                            teacher
                          )}
                        </strong>
                      </td>

                      {/* Email */}

                      <td>
                        {teacher.email || "-"}
                      </td>

                      {/* Phone */}

                      <td>
                        {teacher.phone || "-"}
                      </td>

                      {/* Status */}

                      <td>

                        {teacher.active ? (
                          <span className="status-active">
                            Active
                          </span>
                        ) : (
                          <span className="status-inactive">
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* Assignments */}

                      <td>

                        {teacherAssignments.length >
                        0 ? (

                          <div className="teacher-assignments">

                            {teacherAssignments.map(
                              (assignment) => (

                                <div
                                  className="assignment-item"
                                  key={
                                    assignment.id
                                  }
                                >

                                  <div>
                                    <strong>
                                      {
                                        assignment.subjectName
                                      }
                                    </strong>

                                    {" — "}

                                    {
                                      assignment.className
                                    }

                                    {" - "}

                                    {
                                      assignment.section
                                    }

                                    <span className="assignment-year">
                                      {" "}
                                      (
                                      {
                                        assignment.academicYear
                                      }
                                      )
                                    </span>

                                    <span className="assignment-periods">
                                      {" "}
                                      •{" "}
                                      {
                                        assignment.weeklyPeriods
                                      }{" "}
                                      periods/week
                                    </span>
                                  </div>

                                  <button
                                    className="remove-assignment-btn"
                                    title="Remove assignment"
                                    onClick={() =>
                                      handleDeleteAssignment(
                                        assignment.id
                                      )
                                    }
                                  >
                                    <FaTrash />
                                  </button>

                                </div>

                              )
                            )}

                          </div>

                        ) : (

                          <span className="no-assignment">
                            No assignment
                          </span>

                        )}

                      </td>

                      {/* Actions */}

                      <td className="action-btns">

                        <button
                          className="action-btn assign-btn"
                          title="Assign class / subject"
                          onClick={() =>
                            handleOpenAssignmentModal(
                              teacher.id
                            )
                          }
                        >
                          <FaPlus />
                        </button>

                        <button
                          className="action-btn edit-btn"
                          title="Edit teacher"
                          onClick={() =>
                            handleOpenTeacherModal(
                              teacher
                            )
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="action-btn delete-btn"
                          title="Delete teacher"
                          onClick={() =>
                            handleDeleteTeacher(
                              teacher.id
                            )
                          }
                        >
                          <FaTrash />
                        </button>

                      </td>

                    </tr>
                  );
                }
              )

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="no-data"
                >
                  No teachers found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          ADD / EDIT TEACHER MODAL
          ================================================= */}

      {showTeacherModal && (

        <div
          className="modal-overlay"
          onClick={
            handleCloseTeacherModal
          }
        >

          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                {editingTeacher
                  ? "Edit Teacher"
                  : "Add New Teacher"}
              </h2>

              <button
                className="modal-close-btn"
                onClick={
                  handleCloseTeacherModal
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleTeacherSubmit}
              className="modal-form"
            >

              <div className="form-group">

                <label>
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={
                    teacherForm.firstName
                  }
                  onChange={
                    handleTeacherChange
                  }
                  required
                  placeholder="Enter first name"
                />

              </div>

              <div className="form-group">

                <label>
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={
                    teacherForm.lastName
                  }
                  onChange={
                    handleTeacherChange
                  }
                  required
                  placeholder="Enter last name"
                />

              </div>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    teacherForm.email
                  }
                  onChange={
                    handleTeacherChange
                  }
                  required
                  placeholder="teacher@school.edu"
                />

              </div>

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    teacherForm.phone
                  }
                  onChange={
                    handleTeacherChange
                  }
                  placeholder="Enter phone number"
                />

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    handleCloseTeacherModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  {editingTeacher
                    ? "Update Teacher"
                    : "Add Teacher"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          ASSIGNMENT MODAL
          ================================================= */}

      {showAssignmentModal && (

        <div
          className="modal-overlay"
          onClick={
            handleCloseAssignmentModal
          }
        >

          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                Assign Teacher
              </h2>

              <button
                className="modal-close-btn"
                onClick={
                  handleCloseAssignmentModal
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={
                handleAssignmentSubmit
              }
              className="modal-form"
            >

              {/* Teacher */}

              <div className="form-group">

                <label>
                  Teacher
                </label>

                <select
                  name="teacherId"
                  value={
                    assignmentForm.teacherId
                  }
                  onChange={
                    handleAssignmentChange
                  }
                  disabled
                >

                  {teachers
                    .filter(
                      (teacher) =>
                        teacher.id ===
                        Number(
                          assignmentForm.teacherId
                        )
                    )
                    .map((teacher) => (

                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {getTeacherName(
                          teacher
                        )}{" "}
                        (
                        {
                          teacher.employeeCode
                        }
                        )
                      </option>

                    ))}

                </select>

              </div>

              {/* Class */}

              <div className="form-group">

                <label>
                  Class
                </label>

                <select
                  name="classId"
                  value={
                    assignmentForm.classId
                  }
                  onChange={
                    handleAssignmentChange
                  }
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

                <label>
                  Subject
                </label>

                <select
                  name="subjectId"
                  value={
                    assignmentForm.subjectId
                  }
                  onChange={
                    handleAssignmentChange
                  }
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

                <label>
                  Academic Year
                </label>

                <select
                  name="academicYear"
                  value={
                    assignmentForm.academicYear
                  }
                  onChange={
                    handleAssignmentChange
                  }
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

                <label>
                  Weekly Periods
                </label>

                <input
                  type="number"
                  name="weeklyPeriods"
                  value={
                    assignmentForm.weeklyPeriods
                  }
                  onChange={
                    handleAssignmentChange
                  }
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
                  onClick={
                    handleCloseAssignmentModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Assign Teacher
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Teachers;