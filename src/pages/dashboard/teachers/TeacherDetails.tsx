import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./TeacherDetails.css";

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    classId: "",
    subjectId: "",
    academicYear: "",
    weeklyPeriods: 5,
  });
  useEffect(() => {
    if (id) fetchTeacherDetails();
  }, [id]);

  const getTeacher = async () => {
    try {
      const res = await api.get(`/teachers/${id}`);
      return res.data.data;
    } catch {
      // Fallback if single-teacher endpoint is not available
      const res = await api.get("/teachers");
      return (
        (res.data.data || []).find(
          (t) => String(t.id) === String(id)
        ) || null
      );
    }
  };

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        teacherData,
        assignmentsResponse,
        classesResponse,
        subjectsResponse,
        academicYearsResponse,
      ] = await Promise.all([
        getTeacher(),
        api.get("/class-subjects"),
        api.get("/classes"),
        api.get("/subjects"),
        api.get("/academic-years"),
      ]);

      if (!teacherData) {
        setError("Teacher not found.");
        return;
      }

      setTeacher(teacherData);

      setAssignments(
        (assignmentsResponse.data.data || []).filter(
          (assignment) =>
            String(assignment.teacherId) === String(teacherData.id)
        )
      );

      setClasses(classesResponse.data.data || []);
      setSubjects(subjectsResponse.data.data || []);
      setAcademicYears(academicYearsResponse.data.data || []);
    } catch (err) {
      console.error("Failed to load teacher details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load teacher details."
      );
    } finally {
      setLoading(false);
    }
  };
  const getTeacherName = (t) =>
    `${t?.firstName || ""} ${t?.lastName || ""}`.trim();

  const getInitials = (t) =>
    `${t?.firstName?.[0] || ""}${t?.lastName?.[0] || ""}`.toUpperCase() ||
    "T";

  const totalPeriods = assignments.reduce(
    (sum, a) => sum + Number(a.weeklyPeriods || 0),
    0
  );

  // =========================
  // Edit teacher
  // =========================
  const handleOpenEditModal = () => {
    setEditForm({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.put(
        `/teachers/${teacher.id}`,
        editForm
      );

      setTeacher(response.data.data);
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update teacher:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete teacher
  // =========================
  const handleDeleteTeacher = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      await api.delete(`/teachers/${teacher.id}`);
      navigate("/dashboard/teachers");
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete teacher."
      );
    }
  };

  // =========================
  // Assignments
  // =========================
  const handleOpenAssignModal = () => {
    const activeYear = academicYears.find((y) => y.active);

    setAssignForm({
      classId: "",
      subjectId: "",
      academicYear: activeYear?.name || "",
      weeklyPeriods: 5,
    });

    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.post("/class-subjects", {
        classId: Number(assignForm.classId),
        subjectId: Number(assignForm.subjectId),
        academicYear: assignForm.academicYear,
        weeklyPeriods: Number(assignForm.weeklyPeriods),
        teacherId: Number(teacher.id),
      });

      setAssignments((prev) => [...prev, response.data.data]);
      handleCloseAssignModal();
    } catch (err) {
      console.error("Failed to assign teacher:", err);
      alert(
        err.response?.data?.message ||
          "Failed to assign teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const confirmed = window.confirm(
      "Remove this teacher assignment?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/class-subjects/${assignmentId}`);
      setAssignments((prev) =>
        prev.filter((a) => a.id !== assignmentId)
      );
    } catch (err) {
      console.error("Failed to remove assignment:", err);
      alert(
        err.response?.data?.message ||
          "Failed to remove assignment."
      );
    }
  };

  // =========================
  // Loading / error
  // =========================
  if (loading) {
    return (
      <div className="teacher-details-page">
        <div className="loading">Loading teacher details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-details-page">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard/teachers")}
        >
          <FaArrowLeft /> Back to Teachers
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="teacher-details-page">
      {/* Header */}
      <div className="details-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard/teachers")}
        >
          <FaArrowLeft /> Back to Teachers
        </button>

        <div className="details-header-actions">
          <button
            className="edit-teacher-btn"
            onClick={handleOpenEditModal}
          >
            <FaEdit /> Edit
          </button>
          <button
            className="delete-teacher-btn"
            onClick={handleDeleteTeacher}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {getInitials(teacher)}
        </div>

        <div className="profile-main">
          <div className="profile-name-row">
            <h1>{getTeacherName(teacher) || "Unnamed Teacher"}</h1>
            <span
              className={`status-badge ${
                teacher.active ? "active" : "inactive"
              }`}
            >
              {teacher.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="profile-meta">
            <span>
              <FaIdBadge />
              {teacher.employeeCode || "—"}
            </span>
            <span>
              <FaEnvelope />
              {teacher.email || "—"}
            </span>
            <span>
              <FaPhone />
              {teacher.phone || "—"}
            </span>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <span>{assignments.length}</span>
            Assignments
          </div>
          <div>
            <span>{totalPeriods}</span>
            Periods / week
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Assigned Classes &amp; Subjects</h2>
          <button
            className="add-assignment-btn"
            onClick={handleOpenAssignModal}
          >
            <FaPlus /> Assign Class / Subject
          </button>
        </div>

        {assignments.length > 0 ? (
          <div className="assignment-list">
            {assignments.map((assignment) => (
              <div
                className="assignment-row"
                key={assignment.id}
              >
                <div className="assignment-main">
                  <span className="assignment-subject">
                    {assignment.subjectName || "Subject"}
                  </span>
                  <span className="assignment-class">
                    {assignment.className || "Class"}
                    {assignment.section
                      ? ` - ${assignment.section}`
                      : ""}
                  </span>
                </div>

                <div className="assignment-tags">
                  <span className="tag">
                    {assignment.academicYear || "—"}
                  </span>
                  <span className="tag periods">
                    {assignment.weeklyPeriods} periods / week
                  </span>
                </div>

                <button
                  className="remove-assignment-btn"
                  title="Remove assignment"
                  onClick={() =>
                    handleDeleteAssignment(assignment.id)
                  }
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No classes or subjects assigned yet.
          </div>
        )}
      </div>

      {/* =========================
          EDIT TEACHER MODAL
          ========================= */}
      {showEditModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseEditModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Teacher</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseEditModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="modal-form"
            >
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          ASSIGNMENT MODAL
          ========================= */}
      {showAssignModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseAssignModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Assign Teacher</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseAssignModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleAssignSubmit}
              className="modal-form"
            >
              <div className="form-group">
                <label>Teacher</label>
                <input
                  type="text"
                  value={`${getTeacherName(teacher)} (${
                    teacher.employeeCode || ""
                  })`}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Class</label>
                <select
                  name="classId"
                  value={assignForm.classId}
                  onChange={handleAssignChange}
                  required
                >
                  <option value="">Select Class</option>
                  {classes
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.section}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select
                  name="subjectId"
                  value={assignForm.subjectId}
                  onChange={handleAssignChange}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.code ? ` (${s.code})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <select
                  name="academicYear"
                  value={assignForm.academicYear}
                  onChange={handleAssignChange}
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears
                    .filter((y) => y.active)
                    .map((y) => (
                      <option key={y.id} value={y.name}>
                        {y.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Weekly Periods</label>
                <input
                  type="number"
                  name="weeklyPeriods"
                  value={assignForm.weeklyPeriods}
                  onChange={handleAssignChange}
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseAssignModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? "Assigning..." : "Assign Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetails;