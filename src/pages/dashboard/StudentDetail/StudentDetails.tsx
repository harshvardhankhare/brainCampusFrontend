import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaChartLine,
  FaBook,
} from "react-icons/fa";
import api from "../../../api/axios";
import "./StudentDetails.css";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // Fetch student
  // =========================

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/students/${id}`);

        setStudent(response.data.data);
      } catch (err) {
        console.error("Failed to fetch student:", err);

        if (err.response?.status === 404) {
          setError("Student not found.");
        } else if (err.response?.status === 403) {
          setError(
            "You do not have permission to view this student."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load student details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  // =========================
  // Back
  // =========================

  const handleBack = () => {
    navigate("/dashboard/students");
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="student-details-page">
        <div className="loading">
          Loading student details...
        </div>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error || !student) {
    return (
      <div className="not-found-container">

        <h2>
          {error || "Student not found"}
        </h2>

        <button
          className="back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft /> Back
        </button>

      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="student-details-page">

      {/* =========================
          Header
          ========================= */}

      <div className="details-header">

        <button
          className="back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="details-title">
          Student Profile
        </h1>

      </div>


      {/* =========================
          Profile Card
          ========================= */}

      <div className="profile-card">

        <div className="profile-avatar">

          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${student.firstName} ${student.lastName || ""}`
            )}&background=6366f1&color=fff&size=120`}
            alt="Profile"
          />

        </div>

        <div className="profile-info">

          <h2>
            {student.firstName} {student.lastName || ""}
          </h2>

          <div className="profile-tags">

            <span className="tag">
              {student.className}
            </span>

            <span className="tag">
              Section {student.section}
            </span>

            <span className="tag">
              Roll No: {student.roleNumber}
            </span>

          </div>

          <p className="profile-dob">
            DOB: {student.dateOfBirth || "Not available"}
          </p>

        </div>

      </div>


      {/* =========================
          Details Grid
          ========================= */}

      <div className="details-grid">

        {/* Personal Information */}

        <div className="detail-card">

          <h3>
            <FaUser /> Personal Information
          </h3>

          <div className="detail-item">
            <strong>Email:</strong>{" "}
            {student.email || "Not available"}
          </div>

          <div className="detail-item">
            <strong>Phone:</strong>{" "}
            {student.phone || "Not available"}
          </div>

          <div className="detail-item">
            <strong>Address:</strong>{" "}
            {student.address || "Not available"}
          </div>

          <div className="detail-item">
            <strong>Status:</strong>{" "}
            {student.active ? "Active" : "Inactive"}
          </div>

        </div>


        {/* Parent Information */}

        <div className="detail-card">

          <h3>
            <FaUser /> Parent / Guardian
          </h3>

          <div className="detail-item">
            <strong>Parent Name:</strong>{" "}
            {student.parentName || "Not available"}
          </div>

          <div className="detail-item">
            <strong>Contact:</strong>{" "}
            {student.parentPhone || "Not available"}
          </div>

        </div>


        {/* Class Details */}

        <div className="detail-card">

          <h3>
            <FaCalendarAlt /> Academic Details
          </h3>

          <div className="detail-item">
            <strong>Class:</strong>{" "}
            {student.className || "Not available"}
          </div>

          <div className="detail-item">
            <strong>Section:</strong>{" "}
            {student.section || "Not available"}
          </div>

          <div className="detail-item">
            <strong>Academic Year:</strong>{" "}
            {student.academicYear || "Not available"}
          </div>

          <div className="detail-item">
            <strong>School:</strong>{" "}
            {student.schoolCode || "Not available"}
          </div>

        </div>


        {/* Attendance */}

        <div className="detail-card">

          <h3>
            <FaChartLine /> Attendance
          </h3>

          <div className="attendance-stats">

            <div className="attendance-item">
              <span className="attendance-label">
                Present
              </span>

              <span className="attendance-value">
                —
              </span>
            </div>

            <div className="attendance-item">
              <span className="attendance-label">
                Absent
              </span>

              <span className="attendance-value">
                —
              </span>
            </div>

            <div className="attendance-item">
              <span className="attendance-label">
                Total Days
              </span>

              <span className="attendance-value">
                —
              </span>
            </div>

          </div>

          <div className="attendance-percentage">

            <span>
              Overall Attendance
            </span>

            <span className="percentage-value">
              —
            </span>

          </div>

        </div>


        {/* Results */}

        <div className="detail-card full-width">

          <div className="results-header">

            <h3>
              <FaBook /> Results
            </h3>

          </div>

          <p className="no-data">
            Results will be connected to the backend next.
          </p>

        </div>

      </div>

    </div>
  );
};

export default StudentDetails;