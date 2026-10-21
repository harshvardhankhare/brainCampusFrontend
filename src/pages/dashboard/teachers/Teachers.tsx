import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaEye, FaTimes, FaSearch } from "react-icons/fa";

import api from "../../../api/axios";
import "./Teachers.css";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const Teachers = () => {
  const navigate = useNavigate();

  // =========================
  // Data
  // =========================
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================
  // Add teacher modal
  // =========================
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // =========================
  // Fetch
  // =========================
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/teachers");
      setTeachers(response.data.data || []);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      setError(
        err.response?.data?.message || "Failed to load teacher data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Helpers
  // =========================
  const getTeacherName = (teacher) =>
    `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;

    return teachers.filter((teacher) =>
      [
        teacher.employeeCode,
        teacher.firstName,
        teacher.lastName,
        teacher.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [teachers, search]);

  // =========================
  // Add teacher modal handlers
  // =========================
  const handleOpenTeacherModal = () => {
    setTeacherForm(EMPTY_FORM);
    setShowTeacherModal(true);
  };

  const handleCloseTeacherModal = () => {
    setShowTeacherModal(false);
    setTeacherForm(EMPTY_FORM);
  };

  const handleTeacherChange = (e) => {
    const { name, value } = e.target;
    setTeacherForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/teachers", {
        firstName: teacherForm.firstName,
        lastName: teacherForm.lastName,
        email: teacherForm.email,
        phone: teacherForm.phone,
      });

      setTeachers((prev) => [...prev, response.data.data]);
      handleCloseTeacherModal();
    } catch (err) {
      console.error("Failed to save teacher:", err);
      alert(
        err.response?.data?.message || "Failed to save teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="teachers-page">
        <div className="loading">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="teachers-page">
      {/* Header */}
      <div className="teachers-header">
        <div>
          <h1 className="teachers-title">Teachers</h1>
          <p className="teachers-subtitle">
            {teachers.length} teacher{teachers.length === 1 ? "" : "s"} on record
          </p>
        </div>

        <div className="teachers-header-actions">
          <div className="teachers-search">
            <FaSearch />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code or email"
            />
          </div>

          <button
            className="add-teacher-btn"
            onClick={handleOpenTeacherModal}
          >
            <FaUserPlus />
            Add Teacher
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Table — code / name / email / view details */}
      <div className="table-wrapper">
        <table className="teacher-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Employee Code</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher, index) => (
                <tr key={teacher.id}>
                  <td>{index + 1}</td>

                  <td>
                    <span className="employee-code">
                      {teacher.employeeCode || "—"}
                    </span>
                  </td>

                  <td>
                    <strong>{getTeacherName(teacher) || "—"}</strong>
                  </td>

                  <td>{teacher.email || "—"}</td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(`/dashboard/teachers/${teacher.id}`)
                      }
                    >
                      <FaEye />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================
          ADD TEACHER MODAL
          ========================= */}
      {showTeacherModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseTeacherModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add New Teacher</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseTeacherModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleTeacherSubmit}
              className="modal-form"
            >
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={teacherForm.firstName}
                  onChange={handleTeacherChange}
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={teacherForm.lastName}
                  onChange={handleTeacherChange}
                  required
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleTeacherChange}
                  required
                  placeholder="teacher@school.edu"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={teacherForm.phone}
                  onChange={handleTeacherChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseTeacherModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Teacher"}
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