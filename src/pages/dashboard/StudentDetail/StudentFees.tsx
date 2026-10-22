import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaMoneyBill,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaWallet,
  FaReceipt,
} from "react-icons/fa";
import api from "../../../api/axios";
import "./StudentFees.css";

const todayISO = () => new Date().toISOString().split("T")[0];

const FEE_TYPE_LABELS = {
  TUITION: "Tuition Fee",
  EXAM: "Exam Fee",
  TRANSPORT: "Bus Fee",
  LIBRARY: "Library Fee",
  SPORTS: "Sports Fee",
  ADMISSION: "Admission Fee",
  OTHER: "Other",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatMonth = (m) =>
  m ? MONTH_NAMES[Number(m) - 1] || `Month ${m}` : "Annual";

const getFeeStatus = (fee) => {
  const amount = Number(fee.amount || 0);
  const paid = fee.paid ? amount : Number(fee.paidAmount || 0);

  if (paid >= amount && amount > 0) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "PENDING";
};

const StudentFees = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payForm, setPayForm] = useState({
    amount: "",
    paidDate: todayISO(),
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState("");

  // =========================================================
  // Fetch
  // =========================================================
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentRes, feesRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get(`/student-fees/student/${id}`),
      ]);

      setStudent(studentRes.data.data);
      setFees(feesRes.data.data || []);
    } catch (err) {
      console.error("Failed to load student fees:", err);
      setError(
        err.response?.data?.message || "Failed to load student fees."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Summary
  // =========================================================
  const summary = useMemo(() => {
    const total = fees.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0
    );

    const paid = fees.reduce((sum, f) => {
      if (f.paid) return sum + Number(f.amount || 0);
      return sum + Number(f.paidAmount || 0);
    }, 0);

    const pending = Math.max(total - paid, 0);
    const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

    return { total, paid, pending, percent };
  }, [fees]);

  // =========================================================
  // Handlers
  // =========================================================
  const handleBack = () => navigate(`/dashboard/students/${id}`);

  const handleOpenPay = (fee) => {
    const amount = Number(fee.amount || 0);
    const alreadyPaid = fee.paid
      ? amount
      : Number(fee.paidAmount || 0);
    const remaining = Math.max(amount - alreadyPaid, 0);

    setSelectedFee(fee);
    setPayForm({
      amount: remaining > 0 ? String(remaining) : "",
      paidDate: todayISO(),
      note: "",
    });
    setPayError("");
    setShowPayModal(true);
  };

  const handleClosePay = () => {
    setShowPayModal(false);
    setSelectedFee(null);
    setPayError("");
  };

  const handlePayChange = (e) => {
    setPayForm({ ...payForm, [e.target.name]: e.target.value });
  };

  const handleSubmitPay = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      setSubmitting(true);
      setPayError("");

      await api.post(`/student-fees/${selectedFee.id}/pay`, {
        amount: Number(payForm.amount),
        paidDate: payForm.paidDate,
        note: payForm.note,
      });

      // Refresh fees
      const feesRes = await api.get(`/student-fees/student/${id}`);
      setFees(feesRes.data.data || []);
      handleClosePay();
    } catch (err) {
      console.error("Failed to record payment:", err);
      setPayError(
        err.response?.data?.message || "Failed to record payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Loading / error
  // =========================================================
  if (loading) {
    return (
      <div className="student-fees-page">
        <div className="loading">Loading student fees...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="student-fees-page">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
        <div className="error">{error || "Student not found."}</div>
      </div>
    );
  }

  // =========================================================
  // Render
  // =========================================================
  return (
    <div className="student-fees-page">
      {/* Header */}
      <div className="fees-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
        <div>
          <h1 className="fees-title">Fees</h1>
          <p className="fees-subtitle">
            {student.firstName} {student.lastName || ""} ·{" "}
            {student.className}-{student.section} · Roll{" "}
            {student.roleNumber || "—"}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="fees-summary">
        <div className="summary-card summary-total">
          <div className="summary-icon">
            <FaWallet />
          </div>
          <div>
            <span className="summary-label">Total Fees</span>
            <span className="summary-value">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>

        <div className="summary-card summary-paid">
          <div className="summary-icon">
            <FaCheckCircle />
          </div>
          <div>
            <span className="summary-label">Paid</span>
            <span className="summary-value">
              {formatCurrency(summary.paid)}
            </span>
          </div>
        </div>

        <div className="summary-card summary-pending">
          <div className="summary-icon">
            <FaExclamationCircle />
          </div>
          <div>
            <span className="summary-label">Outstanding</span>
            <span className="summary-value">
              {formatCurrency(summary.pending)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fees-progress-card">
        <div className="progress-top">
          <span>
            Payment progress · {summary.percent}% complete
          </span>
          <span className="progress-hint">
            {summary.pending > 0
              ? `${formatCurrency(summary.pending)} remaining`
              : "All cleared 🎉"}
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${summary.percent}%` }}
          />
        </div>
      </div>

      {/* Fee list */}
      <div className="fees-table-card">
        <div className="fees-table-header">
          <h2>Fee Breakdown</h2>
          <span className="fees-count">
            {fees.length} item{fees.length === 1 ? "" : "s"}
          </span>
        </div>

        {fees.length === 0 ? (
          <div className="fees-empty">
            <FaReceipt size={36} className="fees-empty-icon" />
            <p className="fees-empty-title">No fees assigned</p>
            <p className="fees-empty-sub">
              This student has no fee records for the selected period.
            </p>
          </div>
        ) : (
          <div className="fees-table-wrapper">
            <table className="fees-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid On</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => {
                  const status = getFeeStatus(fee);
                  const isPaid = status === "PAID";

                  return (
                    <tr key={fee.id}>
                      <td>
                        <span className="fee-type-chip">
                          {FEE_TYPE_LABELS[fee.feeType] ||
                            fee.feeType ||
                            "Fee"}
                        </span>
                      </td>

                      <td className="fee-desc">
                        {fee.description || "—"}
                      </td>

                      <td className="fee-period">
                        {formatMonth(fee.feeMonth)}
                        {fee.academicYear
                          ? ` · ${fee.academicYear}`
                          : ""}
                      </td>

                      <td className="fee-amount">
                        {formatCurrency(fee.amount)}
                      </td>

                      <td>
                        {status === "PAID" && (
                          <span className="status-pill status-paid">
                            <FaCheckCircle /> Paid
                          </span>
                        )}
                        {status === "PARTIAL" && (
                          <span className="status-pill status-partial">
                            <FaClock /> Partial
                          </span>
                        )}
                        {status === "PENDING" && (
                          <span className="status-pill status-pending">
                            <FaExclamationCircle /> Pending
                          </span>
                        )}
                      </td>

                      <td className="fee-paid-date">
                        {fee.paidDate || "—"}
                      </td>

                      <td>
                        {!isPaid && (
                          <button
                            className="pay-btn"
                            onClick={() => handleOpenPay(fee)}
                          >
                            <FaMoneyBill /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================
          PAY MODAL
          ========================================================= */}
      {showPayModal && selectedFee && (
        <div className="modal-overlay" onClick={handleClosePay}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Record Payment</h2>
                <p className="modal-subtitle">
                  {FEE_TYPE_LABELS[selectedFee.feeType] ||
                    selectedFee.feeType}{" "}
                  · {formatCurrency(selectedFee.amount)}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleClosePay}
              >
                <FaTimes />
              </button>
            </div>

            {payError && (
              <div className="pay-error">{payError}</div>
            )}

            <form onSubmit={handleSubmitPay} className="modal-form">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={payForm.amount}
                  onChange={handlePayChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Paid Date</label>
                <input
                  type="date"
                  name="paidDate"
                  value={payForm.paidDate}
                  onChange={handlePayChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  type="text"
                  name="note"
                  value={payForm.note}
                  onChange={handlePayChange}
                  placeholder="e.g., Paid via UPI"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleClosePay}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;