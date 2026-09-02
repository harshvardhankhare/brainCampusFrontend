import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import api from "../../../api/axios";
import "./StudentResultDetails.css";

const StudentResultDetails = () => {
  const { id, examId } = useParams();
  const navigate = useNavigate();

  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportCard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/report-cards/student/${id}/exam/${examId}`
        );

        setReportCard(response.data.data);
      } catch (err) {
        console.error("Failed to fetch report card:", err);

        if (err.response?.status === 404) {
          setError(
            err.response?.data?.message ||
              "Result report not found."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You do not have permission to view this result."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load result report."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && examId) {
      fetchReportCard();
    }
  }, [id, examId]);

  const handleBack = () => {
    navigate(`/dashboard/students/${id}`);
  };

  if (loading) {
    return (
      <div className="student-result-details-page">
        <div className="loading">
          Loading result report...
        </div>
      </div>
    );
  }

  if (error || !reportCard) {
    return (
      <div className="not-found-container">
        <h2>{error || "Result report not found"}</h2>

        <button
          className="back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="student-result-details-page">

      {/* =========================
          Header
          ========================= */}
      <div className="result-details-header">

        <button
          className="back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft /> Back
        </button>

        <div>
          <h1 className="result-details-title">
            Result Report
          </h1>

          <p className="result-details-subtitle">
            {reportCard.examName}
          </p>
        </div>

      </div>


      {/* =========================
          Student Information
          ========================= */}
      <div className="result-student-card">

        <div className="result-student-avatar">
          {reportCard.studentName
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div className="result-student-info">

          <h2>{reportCard.studentName}</h2>

          <div className="result-student-details">

            <span>
              <strong>Roll No:</strong>{" "}
              {reportCard.roleNumber || "N/A"}
            </span>

            <span>
              <strong>Class:</strong>{" "}
              {reportCard.className || "N/A"}
            </span>

            <span>
              <strong>Section:</strong>{" "}
              {reportCard.section || "N/A"}
            </span>

            <span>
              <strong>Academic Year:</strong>{" "}
              {reportCard.academicYear || "N/A"}
            </span>

          </div>

        </div>

      </div>


      {/* =========================
          Exam Information
          ========================= */}
      <div className="result-exam-card">

        <div className="result-exam-icon">
          <FaBook />
        </div>

        <div>
          <span className="result-exam-label">
            Examination
          </span>

          <h2>{reportCard.examName}</h2>
        </div>

      </div>


      {/* =========================
          Subject Results
          ========================= */}
      <div className="result-report-card">

        <div className="result-card-header">
          <h3>
            <FaBook /> Subject Results
          </h3>
        </div>

        <div className="result-table-wrapper">

          <table className="result-table">

            <thead>
              <tr>
                <th>Subject</th>
                <th>Maximum Marks</th>
                <th>Passing Marks</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {reportCard.subjects &&
              reportCard.subjects.length > 0 ? (
                reportCard.subjects.map((subject) => (
                  <tr key={subject.subjectId}>

                    {/* Subject */}
                    <td>
                      <div className="subject-info">

                        <strong>
                          {subject.subjectName}
                        </strong>

                        {subject.subjectCode && (
                          <small>
                            {subject.subjectCode}
                          </small>
                        )}

                      </div>
                    </td>

                    {/* Maximum Marks */}
                    <td>
                      {subject.maxMarks}
                    </td>

                    {/* Passing Marks */}
                    <td>
                      {subject.passingMarks}
                    </td>

                    {/* Obtained Marks */}
                    <td>
                      <strong>
                        {subject.marksObtained}
                      </strong>
                    </td>

                    {/* Grade */}
                    <td>
                      <span className="grade-badge">
                        {subject.grade}
                      </span>
                    </td>

                    {/* Status */}
                    <td>

                      {subject.passed ? (
                        <span className="result-pass">
                          <FaCheckCircle />
                          Pass
                        </span>
                      ) : (
                        <span className="result-fail">
                          <FaTimesCircle />
                          Fail
                        </span>
                      )}

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="no-result-data"
                  >
                    No subject results available.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================
          Overall Result
          ========================= */}
      <div className="overall-result-card">

        <h3>Overall Result</h3>

        <div className="overall-result-grid">

          {/* Total Marks */}
          <div className="overall-result-item">

            <span>Total Marks</span>

            <strong>
              {reportCard.totalMarks} /{" "}
              {reportCard.maximumMarks}
            </strong>

          </div>


          {/* Percentage */}
          <div className="overall-result-item">

            <span>Percentage</span>

            <strong>
              {reportCard.percentage}%
            </strong>

          </div>


          {/* Grade */}
          <div className="overall-result-item">

            <span>Overall Grade</span>

            <strong>
              {reportCard.grade}
            </strong>

          </div>


          {/* Result */}
          <div className="overall-result-item">

            <span>Final Result</span>

            <strong
              className={
                reportCard.result === "PASS"
                  ? "overall-pass"
                  : "overall-fail"
              }
            >
              {reportCard.result}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentResultDetails;