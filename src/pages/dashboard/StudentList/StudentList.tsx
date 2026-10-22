import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserGraduate,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./StudentList.css";

// Bypass any CSS reset by sizing icons via the component prop.
// `size` sets width/height attributes on the <svg> itself.
const ICON_SIZE = 16;

const StudentList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const classId = params.get("classId");
  const year = params.get("year");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // Fetch students
  // =========================
  useEffect(() => {
    let cancelled = false;

    const fetchStudents = async () => {
      if (!classId || !year) {
        setLoading(false);
        setError("Invalid class or academic year");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/students", {
          params: {
            classId,
            academicYear: year,
          },
        });

        if (!cancelled) {
          setStudents(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load students"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [classId, year]);

  // =========================
  // Actions
  // =========================
  const handleBack = () => navigate("/dashboard/students");

  const handleEdit = (id) =>
    navigate(`/dashboard/students/${id}/edit`);

  const handleView = (id) => navigate(`/dashboard/students/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert(
        err.response?.data?.message || "Failed to delete student"
      );
    }
  };

  const className = students[0]?.className || "";
  const section = students[0]?.section || "";

  // =========================
  // UI
  // =========================
  return (
    <div className="student-list-page">
      {/* Header */}
      <div className="list-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="header-info">
          <h2 className="list-title">
            Students of {className || "—"} - {section || "—"}{" "}
            {year ? `(${year})` : ""}
          </h2>
          <p className="list-subtitle">
            {students.length} student
            {students.length === 1 ? "" : "s"} enrolled
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="state-card">
          <div className="spinner" />
          <p>Loading students...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && <div className="error">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="table-wrapper">
          {students.length > 0 ? (
            <table className="student-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Year</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>

                    <td>
                      <span className="roll-chip">
                        {student.roleNumber || "—"}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {student.firstName}{" "}
                        {student.lastName || ""}
                      </strong>
                    </td>

                    <td>{student.email || "—"}</td>
                    <td>{student.className || "—"}</td>
                    <td>{student.section || "—"}</td>
                    <td>{student.academicYear || "—"}</td>

                    <td className="action-btns">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleView(student.id)}
                        title="View"
                        aria-label="View student"
                      >
                        <FaEye size={ICON_SIZE} />
                      </button>

                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(student.id)}
                        title="Edit"
                        aria-label="Edit student"
                      >
                        <FaEdit size={ICON_SIZE} />
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(student.id)}
                        title="Delete"
                        aria-label="Delete student"
                      >
                        <FaTrash size={ICON_SIZE} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FaUserGraduate size={44} className="empty-icon" />
              <p className="empty-title">No students found</p>
              <p className="empty-sub">
                There are no students enrolled in this class yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList;