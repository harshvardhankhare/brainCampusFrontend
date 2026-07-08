// StudentDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaMoneyBill,
  FaChartLine,
  FaBook,
} from "react-icons/fa";
import "./StudentDetails.css";

// Mock function to fetch student details by ID
const getStudentById = (id) => {
  const allStudents = [
    {
      id: 1,
      name: "Ava Johnson",
      rollNo: "2024001",
      class: "Class 5",
      section: "A",
      year: "2025",
      dob: "2012-05-15",
      gender: "Female",
      email: "ava.johnson@school.edu",
      phone: "+91 98765 43210",
      address: "123, Green Valley, Mumbai - 400001",
      parents: {
        father: "Mr. Robert Johnson",
        mother: "Mrs. Lisa Johnson",
        contact: "+91 98765 43211",
      },
      admission: {
        date: "2020-06-01",
        admissionNo: "ADM-2020-001",
      },
      fees: {
        total: 25000,
        paid: 20000,
        due: 5000,
        lastPayment: "2026-01-15",
      },
      attendance: {
        totalDays: 120,
        present: 110,
        absent: 10,
        percentage: 91.67,
      },
      results: [
        { exam: "Mid-Term", subjects: { Math: 85, Science: 78, English: 92, Social: 80 } },
        { exam: "Final", subjects: { Math: 90, Science: 82, English: 95, Social: 88 } },
      ],
    },
    // ... more students
  ];
  return allStudents.find((s) => s.id === parseInt(id)) || null;
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);

  if (!student) {
    return (
      <div className="not-found-container">
        <h2>Student not found</h2>
        <button className="back-btn" onClick={() => navigate("/students")}>
          <FaArrowLeft /> Back
        </button>
      </div>
    );
  }

  const handleBack = () => navigate("/students");

  return (
    <div className="student-details-page">
      {/* Header with Back button */}
      <div className="details-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="details-title">Student Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src={`https://ui-avatars.com/api/?name=${student.name}&background=6366f1&color=fff&size=120`}
            alt="Profile"
          />
        </div>
        <div className="profile-info">
          <h2>{student.name}</h2>
          <div className="profile-tags">
            <span className="tag">{student.class}</span>
            <span className="tag">Section {student.section}</span>
            <span className="tag">Roll No: {student.rollNo}</span>
          </div>
          <p className="profile-dob">DOB: {student.dob}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="details-grid">
        {/* Personal Information */}
        <div className="detail-card">
          <h3><FaUser /> Personal Information</h3>
          <div className="detail-item"><strong>Email:</strong> {student.email}</div>
          <div className="detail-item"><strong>Phone:</strong> {student.phone}</div>
          <div className="detail-item"><strong>Gender:</strong> {student.gender}</div>
          <div className="detail-item"><strong>Address:</strong> {student.address}</div>
        </div>

        {/* Parent Information */}
        <div className="detail-card">
          <h3><FaUser /> Parent / Guardian</h3>
          <div className="detail-item"><strong>Father:</strong> {student.parents.father}</div>
          <div className="detail-item"><strong>Mother:</strong> {student.parents.mother}</div>
          <div className="detail-item"><strong>Contact:</strong> {student.parents.contact}</div>
        </div>

        {/* Admission Details */}
        <div className="detail-card">
          <h3><FaCalendarAlt /> Admission Details</h3>
          <div className="detail-item"><strong>Admission No:</strong> {student.admission.admissionNo}</div>
          <div className="detail-item"><strong>Admission Date:</strong> {student.admission.date}</div>
          <div className="detail-item"><strong>Academic Year:</strong> {student.year}</div>
        </div>

        {/* Fee Summary */}
        <div className="detail-card">
          <h3><FaMoneyBill /> Fee Summary</h3>
          <div className="fee-row">
            <span>Total Fees:</span>
            <strong>₹{student.fees.total.toLocaleString()}</strong>
          </div>
          <div className="fee-row">
            <span>Paid:</span>
            <strong style={{ color: "#10b981" }}>₹{student.fees.paid.toLocaleString()}</strong>
          </div>
          <div className="fee-row">
            <span>Due:</span>
            <strong style={{ color: "#ef4444" }}>₹{student.fees.due.toLocaleString()}</strong>
          </div>
          <div className="fee-progress">
            <div
              className="fee-progress-bar"
              style={{ width: `${(student.fees.paid / student.fees.total) * 100}%` }}
            ></div>
          </div>
          <div className="fee-last">Last Payment: {student.fees.lastPayment}</div>
        </div>

        {/* Attendance */}
        <div className="detail-card">
          <h3><FaChartLine /> Attendance</h3>
          <div className="attendance-stats">
            <div className="attendance-item">
              <span className="attendance-label">Present</span>
              <span className="attendance-value">{student.attendance.present}</span>
            </div>
            <div className="attendance-item">
              <span className="attendance-label">Absent</span>
              <span className="attendance-value">{student.attendance.absent}</span>
            </div>
            <div className="attendance-item">
              <span className="attendance-label">Total Days</span>
              <span className="attendance-value">{student.attendance.totalDays}</span>
            </div>
          </div>
          <div className="attendance-percentage">
            <span>Overall Attendance</span>
            <span className="percentage-value" style={{ color: student.attendance.percentage >= 75 ? "#10b981" : "#ef4444" }}>
              {student.attendance.percentage}%
            </span>
          </div>
        </div>

        {/* Results / Marks */}
        <div className="detail-card full-width">
          <h3><FaBook /> Results</h3>
          <div className="results-table-wrapper">
            {student.results.map((exam, idx) => (
              <div key={idx} className="exam-block">
                <h4>{exam.exam}</h4>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(exam.subjects).map(([subject, marks]) => (
                      <tr key={subject}>
                        <td>{subject}</td>
                        <td>{marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;