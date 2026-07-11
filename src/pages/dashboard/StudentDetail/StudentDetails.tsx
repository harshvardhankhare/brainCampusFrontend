// StudentDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaMoneyBill,
  FaChartLine,
  FaBook,
  FaPlus,
} from "react-icons/fa";
import "./StudentDetails.css";

// Mock function with enhanced results data
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
      feesHistory: [
        {
          year: "2024-2025",
          class: "Class 4",
          details: {
            tuitionFee: 18000,
            examFee: 2000,
            busFee: 3000,
            libraryFee: 500,
            sportsFee: 500,
          },
          total: 24000,
          paid: 20000,
          due: 4000,
          lastPayment: "2025-02-10",
        },
        {
          year: "2025-2026",
          class: "Class 5",
          details: {
            tuitionFee: 20000,
            examFee: 2500,
            busFee: 3500,
            libraryFee: 500,
            sportsFee: 500,
          },
          total: 27000,
          paid: 22000,
          due: 5000,
          lastPayment: "2026-01-15",
        },
      ],
      // Enhanced results: each subject has theory, practical, and total
      resultsHistory: [
        {
          class: "Class 4",
          exam: "Mid-Term",
          subjects: {
            Math: {
              theory: { gained: 42, max: 50 },
              practical: { gained: 18, max: 20 },
              totalGained: 60,
              totalMax: 70,
            },
            Science: {
              theory: { gained: 38, max: 50 },
              practical: { gained: 15, max: 20 },
              totalGained: 53,
              totalMax: 70,
            },
            English: {
              theory: { gained: 45, max: 50 },
              practical: { gained: 0, max: 0 }, // no practical
              totalGained: 45,
              totalMax: 50,
            },
            Social: {
              theory: { gained: 40, max: 50 },
              practical: { gained: 10, max: 15 },
              totalGained: 50,
              totalMax: 65,
            },
          },
        },
        {
          class: "Class 4",
          exam: "Final",
          subjects: {
            Math: {
              theory: { gained: 48, max: 50 },
              practical: { gained: 19, max: 20 },
              totalGained: 67,
              totalMax: 70,
            },
            Science: {
              theory: { gained: 42, max: 50 },
              practical: { gained: 16, max: 20 },
              totalGained: 58,
              totalMax: 70,
            },
            English: {
              theory: { gained: 47, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 47,
              totalMax: 50,
            },
            Social: {
              theory: { gained: 43, max: 50 },
              practical: { gained: 12, max: 15 },
              totalGained: 55,
              totalMax: 65,
            },
          },
        },
        {
          class: "Class 5",
          exam: "Mid-Term",
          subjects: {
            Math: {
              theory: { gained: 45, max: 50 },
              practical: { gained: 18, max: 20 },
              totalGained: 63,
              totalMax: 70,
            },
            Science: {
              theory: { gained: 40, max: 50 },
              practical: { gained: 14, max: 20 },
              totalGained: 54,
              totalMax: 70,
            },
            English: {
              theory: { gained: 46, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 46,
              totalMax: 50,
            },
            Social: {
              theory: { gained: 42, max: 50 },
              practical: { gained: 11, max: 15 },
              totalGained: 53,
              totalMax: 65,
            },
          },
        },
        {
          class: "Class 5",
          exam: "Final",
          subjects: {
            Math: {
              theory: { gained: 48, max: 50 },
              practical: { gained: 19, max: 20 },
              totalGained: 67,
              totalMax: 70,
            },
            Science: {
              theory: { gained: 44, max: 50 },
              practical: { gained: 17, max: 20 },
              totalGained: 61,
              totalMax: 70,
            },
            English: {
              theory: { gained: 48, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 48,
              totalMax: 50,
            },
            Social: {
              theory: { gained: 45, max: 50 },
              practical: { gained: 13, max: 15 },
              totalGained: 58,
              totalMax: 65,
            },
          },
        },
        {
          class: "Class 5",
          exam: "Weekly Test",
          subjects: {
            Math: {
              theory: { gained: 38, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 38,
              totalMax: 50,
            },
            Science: {
              theory: { gained: 36, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 36,
              totalMax: 50,
            },
            English: {
              theory: { gained: 42, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 42,
              totalMax: 50,
            },
            Social: {
              theory: { gained: 38, max: 50 },
              practical: { gained: 0, max: 0 },
              totalGained: 38,
              totalMax: 50,
            },
          },
        },
      ],
      attendance: {
        totalDays: 120,
        present: 110,
        absent: 10,
        percentage: 91.67,
      },
    },
  ];
  return allStudents.find((s) => s.id === parseInt(id)) || null;
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);

  const [selectedFeeYear, setSelectedFeeYear] = useState(
    student?.feesHistory?.length > 0 ? student.feesHistory[0].year : ""
  );
  const [feeData, setFeeData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [selectedResultClass, setSelectedResultClass] = useState(
    student?.resultsHistory?.length > 0 ? student.resultsHistory[0].class : ""
  );
  const [selectedResultExam, setSelectedResultExam] = useState("");

  useEffect(() => {
    if (student && selectedFeeYear) {
      const found = student.feesHistory.find((f) => f.year === selectedFeeYear);
      setFeeData(found || null);
    }
  }, [selectedFeeYear, student]);

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

  const handleAddPayment = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!feeData) return;
    const newPaid = feeData.paid + amount;
    if (newPaid > feeData.total) {
      alert(`Amount exceeds total fee. Remaining due: ₹${feeData.due}`);
      return;
    }
    const newDue = feeData.total - newPaid;
    setFeeData({
      ...feeData,
      paid: newPaid,
      due: newDue,
      lastPayment: new Date().toISOString().split("T")[0],
    });
    setPaymentAmount("");
  };

  const resultClasses = [...new Set(student.resultsHistory.map((r) => r.class))];
  const examsForClass = student.resultsHistory
    .filter((r) => r.class === selectedResultClass)
    .map((r) => r.exam);

  useEffect(() => {
    if (selectedResultClass && examsForClass.length > 0) {
      if (!selectedResultExam || !examsForClass.includes(selectedResultExam)) {
        setSelectedResultExam(examsForClass[0]);
      }
    }
  }, [selectedResultClass, examsForClass, selectedResultExam]);

  const selectedResult = student.resultsHistory.find(
    (r) => r.class === selectedResultClass && r.exam === selectedResultExam
  );

  // Helper to compute overall totals for the exam
  const computeOverallTotals = (subjects) => {
    let totalGained = 0;
    let totalMax = 0;
    Object.values(subjects).forEach((s) => {
      totalGained += s.totalGained;
      totalMax += s.totalMax;
    });
    return { totalGained, totalMax };
  };

  return (
    <div className="student-details-page">
      {/* Header */}
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

        {/* Fee Summary */}
        <div className="detail-card full-width">
          <div className="fee-header">
            <h3><FaMoneyBill /> Fee Summary</h3>
            <select
              value={selectedFeeYear}
              onChange={(e) => setSelectedFeeYear(e.target.value)}
              className="fee-year-select"
            >
              {student.feesHistory.map((f) => (
                <option key={f.year} value={f.year}>
                  {f.year} ({f.class})
                </option>
              ))}
            </select>
          </div>
          {feeData ? (
            <>
              <div className="fee-class">Class: {feeData.class}</div>
              <div className="fee-breakdown">
                {Object.entries(feeData.details).map(([key, value]) => (
                  <div key={key} className="fee-row">
                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span>₹{value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="fee-total">
                <strong>Total:</strong> ₹{feeData.total.toLocaleString()}
              </div>
              <div className="fee-row">
                <span>Paid:</span>
                <strong style={{ color: "#10b981" }}>₹{feeData.paid.toLocaleString()}</strong>
              </div>
              <div className="fee-row">
                <span>Due:</span>
                <strong style={{ color: "#ef4444" }}>₹{feeData.due.toLocaleString()}</strong>
              </div>
              <div className="fee-progress">
                <div
                  className="fee-progress-bar"
                  style={{ width: `${(feeData.paid / feeData.total) * 100}%` }}
                ></div>
              </div>
              <div className="fee-last">Last Payment: {feeData.lastPayment}</div>

              <form className="add-payment-form" onSubmit={handleAddPayment}>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  step="100"
                  className="payment-input"
                />
                <button type="submit" className="payment-btn">
                  <FaPlus /> Add Payment
                </button>
              </form>
            </>
          ) : (
            <p className="no-data">No fee data for selected year.</p>
          )}
        </div>

        {/* Results with enhanced marks */}
        <div className="detail-card full-width">
          <div className="results-header">
            <h3><FaBook /> Results</h3>
            <div className="results-filters">
              <select
                value={selectedResultClass}
                onChange={(e) => {
                  setSelectedResultClass(e.target.value);
                  setSelectedResultExam("");
                }}
                className="result-filter-select"
              >
                {resultClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <select
                value={selectedResultExam}
                onChange={(e) => setSelectedResultExam(e.target.value)}
                className="result-filter-select"
                disabled={!selectedResultClass}
              >
                {examsForClass.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedResult ? (
            <div className="exam-block">
              <h4>{selectedResult.exam} - {selectedResult.class}</h4>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Theory</th>
                    <th>Practical</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedResult.subjects).map(([subject, marks]) => {
                    const hasPractical = marks.practical && marks.practical.max > 0;
                    return (
                      <tr key={subject}>
                        <td>{subject}</td>
                        <td>
                          {marks.theory.gained} / {marks.theory.max}
                        </td>
                        <td>
                          {hasPractical ? `${marks.practical.gained} / ${marks.practical.max}` : '-'}
                        </td>
                        <td>
                          <strong>
                            {marks.totalGained} / {marks.totalMax}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Overall</th>
                    <td colSpan="2"></td>
                    <td>
                      <strong>
                        {computeOverallTotals(selectedResult.subjects).totalGained} /{' '}
                        {computeOverallTotals(selectedResult.subjects).totalMax}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="no-data">No results available for the selected class and exam.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;