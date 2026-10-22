import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserGraduate,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

import api from "../../../api/axios";
import "./StudentList.css";

const ICON_SIZE = 16;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const StudentList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const classId = params.get("classId");
  const year = params.get("year");

  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Reset page to 0 whenever filters change
  useEffect(() => {
    setPage(0);
  }, [classId, year]);

  // Fetch students (paginated)
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
            page,
            size,
          },
        });

        if (cancelled) return;

        // Backend returns PageResponse<StudentResponse>
        const data = response.data.data || {};

        setStudents(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setFirst(data.first ?? true);
        setLast(data.last ?? true);
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
  }, [classId, year, page, size, reloadKey]);

  // =========================
  // Actions
  // =========================
  const handleBack = () => navigate("/dashboard/students");

  const handleEdit = (id) => navigate(`/dashboard/students/${id}/edit`);

  const handleView = (id) => navigate(`/dashboard/students/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await api.delete(`/students/${id}`);

      // If this was the only row on the page and we're not on page 0,
      // go back a page; otherwise refetch the current page.
      if (students.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert(
        err.response?.data?.message || "Failed to delete student"
      );
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages || newPage === page) return;
    setPage(newPage);
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  // Build a windowed list of page numbers with ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages = [0];

    if (page > 2) pages.push("...");

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);

    return pages;
  };

  const className = students[0]?.className || "";
  const section = students[0]?.section || "";

  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

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
            {totalElements} student{totalElements === 1 ? "" : "s"} enrolled
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

      {/* Table + Pagination */}
      {!loading && !error && (
        <div className="table-card">
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
                      {/* Row number across pages */}
                      <td>{page * size + index + 1}</td>

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

          {/* Pagination */}
          {totalElements > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing <strong>{startItem}–{endItem}</strong> of{" "}
                <strong>{totalElements}</strong>
              </div>

              <div className="pagination-right">
                <label className="page-size">
                  Rows per page:
                  <select value={size} onChange={handleSizeChange}>
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(0)}
                      disabled={first}
                      aria-label="First page"
                      title="First page"
                    >
                      <FaAngleDoubleLeft size={12} />
                    </button>

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={first}
                      aria-label="Previous page"
                      title="Previous page"
                    >
                      <FaChevronLeft size={12} />
                    </button>

                    {getPageNumbers().map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`e-${idx}`}
                          className="pagination-ellipsis"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          className={`pagination-btn ${
                            p === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(p)}
                          aria-label={`Page ${p + 1}`}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p + 1}
                        </button>
                      )
                    )}

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={last}
                      aria-label="Next page"
                      title="Next page"
                    >
                      <FaChevronRight size={12} />
                    </button>

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={last}
                      aria-label="Last page"
                      title="Last page"
                    >
                      <FaAngleDoubleRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList;