import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaEye } from "react-icons/fa";

import api from "../../../api/axios";
import "./StudentList.css";

const StudentList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);

  const classId = params.get("classId");
  const year = params.get("year");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/students", {
          params: {
            classId: classId,
            academicYear: year,
          },
        });

        setStudents(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load students"
        );
      } finally {
        setLoading(false);
      }
    };

    if (classId && year) {
      fetchStudents();
    } else {
      setLoading(false);
      setError("Invalid class or academic year");
    }
  }, [classId, year]);

  const handleBack = () => {
    navigate("/dashboard/students");
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/students/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/students/${id}`);

      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete student:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete student"
      );
    }
  };

  const handleView = (id) => {
    navigate(`/dashboard/students/${id}`);
  };

  const className =
    students.length > 0
      ? students[0].className
      : "";

  const section =
    students.length > 0
      ? students[0].section
      : "";

  return (
    <div className="student-list-page">

      <div className="list-header">

        <button
          className="back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft /> Back
        </button>

        <h2 className="list-title">
          Students of {className} - {section} ({year})
        </h2>

      </div>

      {loading && (
        <div className="loading">
          Loading students...
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">

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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {students.length > 0 ? (

                students.map((student, index) => (

                  <tr key={student.id}>

                    <td>{index + 1}</td>

                    <td>
                      {student.roleNumber}
                    </td>

                    <td>
                      {student.firstName}{" "}
                      {student.lastName || ""}
                    </td>

                    <td>
                      {student.email}
                    </td>

                    <td>
                      {student.className}
                    </td>

                    <td>
                      {student.section}
                    </td>

                    <td>
                      {student.academicYear}
                    </td>

                    <td className="action-btns">

                      <button
                        className="action-btn view-btn"
                        onClick={() =>
                          handleView(student.id)
                        }
                        title="View"
                      >
                        <FaEye />
                      </button>

                      <button
                        className="action-btn edit-btn"
                        onClick={() =>
                          handleEdit(student.id)
                        }
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() =>
                          handleDelete(student.id)
                        }
                        title="Delete"
                      >
                        <FaTrash />
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="8"
                    className="no-data"
                  >
                    No students found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default StudentList;