import { useState } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaDownload,
} from "react-icons/fa";
import "./Finance.css";

const Finance = () => {
  const [period, setPeriod] = useState("month"); // month, quarter, year

  // Mock data
  const summary = [
    {
      label: "Total Revenue",
      value: "₹2,45,800",
      change: "+12.5%",
      positive: true,
      icon: FaArrowUp,
      color: "#10b981",
    },
    {
      label: "Total Expenses",
      value: "₹1,12,300",
      change: "+5.2%",
      positive: false,
      icon: FaArrowDown,
      color: "#ef4444",
    },
    {
      label: "Net Profit",
      value: "₹1,33,500",
      change: "+18.3%",
      positive: true,
      icon: FaArrowUp,
      color: "#6366f1",
    },
    {
      label: "Pending Fees",
      value: "₹45,200",
      change: "-8.1%",
      positive: true,
      icon: FaArrowUp,
      color: "#f59e0b",
    },
  ];

  const transactions = [
    { id: 1, description: "Fee Collection - Class 5A", amount: "+₹24,000", status: "Paid", date: "2026-02-01", type: "income" },
    { id: 2, description: "Teacher Salary - Feb", amount: "-₹18,000", status: "Processed", date: "2026-02-02", type: "expense" },
    { id: 3, description: "Lab Equipment Purchase", amount: "-₹6,500", status: "Pending", date: "2026-02-03", type: "expense" },
    { id: 4, description: "Fee Collection - Class 3B", amount: "+₹16,000", status: "Paid", date: "2026-02-03", type: "income" },
    { id: 5, description: "Transport Service", amount: "-₹4,200", status: "Paid", date: "2026-02-04", type: "expense" },
  ];

  return (
    <div className="finance-page">
      {/* Header */}
      <div className="finance-header">
        <h1 className="finance-title">Finance</h1>
        <div className="header-controls">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <div className="header-actions">
            <button className="action-btn primary">
              <FaPlus /> Add Income
            </button>
            <button className="action-btn secondary">
              <FaPlus /> Add Expense
            </button>
            <button className="action-btn tertiary">
              <FaDownload /> Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summary.map((item, idx) => (
          <div className="summary-card" key={idx}>
            <div className="card-header">
              <span className="card-label">{item.label}</span>
              <span className="card-icon" style={{ color: item.color }}>
                <item.icon />
              </span>
            </div>
            <div className="card-value">{item.value}</div>
            <div className="card-change" style={{ color: item.positive ? "#10b981" : "#ef4444" }}>
              {item.change} from previous period
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Chart + Recent Transactions */}
      <div className="finance-grid">
        {/* Income vs Expense Chart (simplified bar) */}
        <div className="chart-card">
          <div className="section-header">
            <h2>Income vs Expenses</h2>
            <span className="period-label">Last 6 months</span>
          </div>
          <div className="chart-bars">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, idx) => (
              <div className="bar-group" key={idx}>
                <div className="bar">
                  <div
                    className="bar-income"
                    style={{ height: `${40 + Math.random() * 40}%` }}
                  ></div>
                  <div
                    className="bar-expense"
                    style={{ height: `${20 + Math.random() * 30}%` }}
                  ></div>
                </div>
                <span className="bar-label">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-card">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="transactions-list">
            {transactions.map((txn) => (
              <div className="transaction-item" key={txn.id}>
                <div className="txn-left">
                  <span
                    className={`txn-icon ${txn.type}`}
                    style={{
                      background: txn.type === "income" ? "#d1fae5" : "#fee2e2",
                      color: txn.type === "income" ? "#065f46" : "#991b1b",
                    }}
                  >
                    {txn.type === "income" ? "+" : "−"}
                  </span>
                  <div className="txn-info">
                    <span className="txn-description">{txn.description}</span>
                    <span className="txn-date">{txn.date}</span>
                  </div>
                </div>
                <div className="txn-right">
                  <span
                    className={`txn-amount ${txn.type}`}
                    style={{
                      color: txn.type === "income" ? "#065f46" : "#991b1b",
                    }}
                  >
                    {txn.amount}
                  </span>
                  <span
                    className={`txn-status ${txn.status.toLowerCase()}`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;