import React, { useEffect, useState, useCallback } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaTimes,
  FaFilter,
} from "react-icons/fa";
import api from "../../../api/axios";
import "./AuditLogViewer.css";

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | SUCCESS | FAILED
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  // Pagination (0-based)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        size: pageSize,
        sort: "createdAt,desc",
      };

      if (statusFilter === "SUCCESS") params.success = true;
      if (statusFilter === "FAILED") params.success = false;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get("/api/audit/dashboard/logs", { params });
      const data = res.data.data;

      setLogs(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err.response?.data?.message || "Failed to fetch audit trails");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (type) => {
    setStatusFilter(type);
    setPage(0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const getMethodClass = (method) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "method-get";
      case "POST":
        return "method-post";
      case "PUT":
        return "method-put";
      case "DELETE":
        return "method-delete";
      default:
        return "method-default";
    }
  };

  return (
    <div className="audit-log-page">
      {/* Top Header */}
      <div className="audit-header">
        <div>
          <h2 className="audit-title">API Request Audit Trail</h2>
          <p className="audit-subtitle">
            Inspect individual API executions, latency benchmarks, and error diagnostics
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tab-group">
          <button
            className={`filter-tab ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => handleFilterChange("ALL")}
          >
            All Logs
          </button>
          <button
            className={`filter-tab success-tab ${statusFilter === "SUCCESS" ? "active" : ""}`}
            onClick={() => handleFilterChange("SUCCESS")}
          >
            <FaCheckCircle size={13} />
            <span>Success</span>
          </button>
          <button
            className={`filter-tab failed-tab ${statusFilter === "FAILED" ? "active" : ""}`}
            onClick={() => handleFilterChange("FAILED")}
          >
            <FaTimesCircle size={13} />
            <span>Failed</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Summary */}
      <div className="audit-toolbar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search endpoint or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="records-count">
          Showing <strong>{logs.length}</strong> of <strong>{totalElements}</strong> recorded requests
        </div>
      </div>

      {error && <div className="audit-error">{error}</div>}

      {/* Main Table */}
      <div className="audit-table-card">
        {loading ? (
          <div className="audit-state">
            <div className="audit-spinner" />
            <p>Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="audit-state">
            <FaFilter size={32} className="empty-state-icon" />
            <p>No request logs match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>User</th>
                  <th>Latency</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={!log.success ? "row-failed" : ""}
                  >
                    <td>
                      <span
                        className={`status-chip ${
                          log.statusCode < 400 ? "chip-ok" : "chip-error"
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td>
                      <span className={`method-chip ${getMethodClass(log.httpMethod)}`}>
                        {log.httpMethod}
                      </span>
                    </td>
                    <td className="endpoint-col">
                      <span className="endpoint-text" title={log.endpoint}>
                        {log.endpoint}
                      </span>
                    </td>
                    <td>{log.username || "Anonymous"}</td>
                    <td>
                      <span
                        className={`latency-text ${
                          log.executionTimeMs > 1000
                            ? "latency-high"
                            : log.executionTimeMs > 400
                            ? "latency-med"
                            : "latency-low"
                        }`}
                      >
                        {log.executionTimeMs} ms
                      </span>
                    </td>
                    <td className="time-col">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="details-btn"
                        onClick={() => setSelectedLog(log)}
                        title="View Full Payload & Details"
                      >
                        <FaInfoCircle size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="audit-pagination">
          <div className="page-size-selector">
            <label>Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="pagination-actions">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <FaChevronLeft size={12} />
            </button>
            <span className="page-indicator">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Slideover Modal */}
      {selectedLog && (
        <div className="audit-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div
            className="audit-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Request Audit Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedLog(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-item">
                <label>Route & Method</label>
                <div className="route-display">
                  <span className={`method-chip ${getMethodClass(selectedLog.httpMethod)}`}>
                    {selectedLog.httpMethod}
                  </span>
                  <code>{selectedLog.endpoint}</code>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Status Code</label>
                  <span>{selectedLog.statusCode} ({selectedLog.success ? "Success" : "Failed"})</span>
                </div>
                <div className="detail-item">
                  <label>Duration</label>
                  <span>{selectedLog.executionTimeMs} ms</span>
                </div>
                <div className="detail-item">
                  <label>Caller User</label>
                  <span>{selectedLog.username}</span>
                </div>
                <div className="detail-item">
                  <label>Client IP</label>
                  <span>{selectedLog.clientIp || "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Query Params</label>
                  <span>{selectedLog.queryString || "None"}</span>
                </div>
                <div className="detail-item">
                  <label>Timestamp</label>
                  <span>{new Date(selectedLog.createdAt).toUTCString()}</span>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="detail-item error-section">
                  <label>Captured Error / Stack Message</label>
                  <pre className="error-payload">{selectedLog.errorMessage}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;