import { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaUsers,
  FaMoneyBillWave,
  FaWallet,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import api from "../../api/axios";
import "./DashboardHome.css";

const DashboardHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const today = new Date();

        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        const endDate = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

        const formatDate = (date) => {
          return date.toISOString().split("T")[0];
        };

        const response = await api.get(
          "/management/dashboard",
          {
            params: {
              startDate: formatDate(startDate),
              endDate: formatDate(endDate),
            },
          }
        );

        setDashboard(response.data.data);
      } catch (err) {
        console.error(
          "Failed to fetch dashboard:",
          err
        );

        if (err.response?.status === 403) {
          setError(
            "You do not have permission to view the dashboard."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load dashboard."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "₹0";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-home">
        <div className="dashboard-error">
          {error}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="dashboard-home">

      {/* =========================
          Header
          ========================= */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of your school
          </p>
        </div>
      </div>


      {/* =========================
          Main Statistics
          ========================= */}

      <div className="dashboard-stats-grid">

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <FaUserGraduate />
          </div>

          <div className="stat-content">
            <span>Total Students</span>
            <strong>
              {dashboard.totalStudents}
            </strong>
          </div>
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>

          <div className="stat-content">
            <span>Total Staff</span>
            <strong>
              {dashboard.totalStaff}
            </strong>
          </div>
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>

          <div className="stat-content">
            <span>Fees Collected</span>
            <strong>
              {formatCurrency(
                dashboard.fees?.collected
              )}
            </strong>
          </div>
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <FaWallet />
          </div>

          <div className="stat-content">
            <span>Pending Fees</span>
            <strong>
              {formatCurrency(
                dashboard.fees?.remaining
              )}
            </strong>
          </div>
        </div>

      </div>


      {/* =========================
          Financial Overview
          ========================= */}

      <div className="dashboard-section">

        <div className="section-title">
          <FaChartLine />
          <h2>Financial Overview</h2>
        </div>


        <div className="financial-grid">

          {/* Income */}

          <div className="financial-card">

            <div className="financial-card-header">
              <span>Total Income</span>

              <div className="income-icon">
                <FaArrowUp />
              </div>
            </div>

            <strong>
              {formatCurrency(
                dashboard.totalIncome
              )}
            </strong>

          </div>


          {/* Expenses */}

          <div className="financial-card">

            <div className="financial-card-header">
              <span>Total Expenses</span>

              <div className="expense-icon">
                <FaArrowDown />
              </div>
            </div>

            <strong>
              {formatCurrency(
                dashboard.totalExpenses
              )}
            </strong>

          </div>


          {/* Net */}

          <div className="financial-card">

            <div className="financial-card-header">
              <span>Net Amount</span>

              <div className="net-icon">
                <FaChartLine />
              </div>
            </div>

            <strong>
              {formatCurrency(
                dashboard.netAmount
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =========================
          Fees & Salary
          ========================= */}

      <div className="dashboard-two-column">

        {/* Fees */}

        <div className="dashboard-panel">

          <div className="panel-header">
            <h2>Fee Summary</h2>
          </div>

          <div className="panel-body">

            <div className="summary-row">
              <span>Total Fees</span>

              <strong>
                {formatCurrency(
                  dashboard.fees?.totalFees
                )}
              </strong>
            </div>


            <div className="summary-row">
              <span>Collected</span>

              <strong>
                {formatCurrency(
                  dashboard.fees?.collected
                )}
              </strong>
            </div>


            <div className="summary-row">
              <span>Remaining</span>

              <strong>
                {formatCurrency(
                  dashboard.fees?.remaining
                )}
              </strong>
            </div>


            <div className="summary-row">
              <span>Students Paid</span>

              <strong>
                {dashboard.fees?.studentsPaid || 0}
              </strong>
            </div>


            <div className="summary-row">
              <span>Students Pending</span>

              <strong>
                {dashboard.fees?.studentsPending || 0}
              </strong>
            </div>

          </div>

        </div>


        {/* Salary */}

        <div className="dashboard-panel">

          <div className="panel-header">
            <h2>Salary Summary</h2>
          </div>

          <div className="panel-body">

            <div className="summary-row">
              <span>Total Due</span>

              <strong>
                {formatCurrency(
                  dashboard.salary?.totalDue
                )}
              </strong>
            </div>


            <div className="summary-row">
              <span>Total Paid</span>

              <strong>
                {formatCurrency(
                  dashboard.salary?.totalPaid
                )}
              </strong>
            </div>


            <div className="summary-row">
              <span>Total Pending</span>

              <strong>
                {formatCurrency(
                  dashboard.salary?.totalPending
                )}
              </strong>
            </div>


            <div className="summary-row">
              <span>Staff Paid</span>

              <strong>
                {dashboard.salary?.staffPaid || 0}
              </strong>
            </div>


            <div className="summary-row">
              <span>Staff Pending</span>

              <strong>
                {dashboard.salary?.staffPending || 0}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          Expense Summary
          ========================= */}

      <div className="dashboard-panel expense-summary">

        <div className="panel-header">
          <h2>Expense Summary</h2>
        </div>

        <div className="expense-total">
          <span>Total Expenses</span>

          <strong>
            {formatCurrency(
              dashboard.expenses?.totalExpenses
            )}
          </strong>
        </div>

      </div>

    </div>
  );
};

export default DashboardHome;