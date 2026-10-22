import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";   
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaSyncAlt,
  FaListUl
} from "react-icons/fa";
import api from "../../../api/axios";
import "./ApiDashboard.css";

const STATUS_COLORS = {
  "2xx Success": "#10B981",
  "3xx Redirect": "#3B82F6",
  "4xx Client Error": "#F59E0B",
  "5xx Server Error": "#EF4444",
  Other: "#6B7280",
};

const ApiDashboard = () => {
  const navigate = useNavigate();      
  const [latencyData, setLatencyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calculateStartDate = (range) => {
    const now = new Date();
    if (range === "24h") now.setHours(now.getHours() - 24);
    else if (range === "7d") now.setDate(now.getDate() - 7);
    else if (range === "30d") now.setDate(now.getDate() - 30);
    return now.toISOString();
  };

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const startDate = calculateStartDate(timeRange);

      const [statusRes, latencyRes] = await Promise.all([
        api.get("/api/audit/dashboard/status-distribution", {
          params: { startDate },
        }),
        api.get("/api/audit/dashboard/endpoint-latency", {
          params: { startDate },
        }),
      ]);

      setStatusData(statusRes.data.data || []);
      setLatencyData(latencyRes.data.data || []);
    } catch (err) {
      console.error("Failed to load audit metrics:", err);
      setError(err.response?.data?.message || "Failed to load API telemetry");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Transform raw status distribution for the Pie Chart
  const formattedStatusData = useMemo(() => {
    const buckets = {
      "2xx Success": 0,
      "3xx Redirect": 0,
      "4xx Client Error": 0,
      "5xx Server Error": 0,
    };

    statusData.forEach((item) => {
      const code = parseInt(item.status, 10);
      const count = parseInt(item.count, 10) || 0;
      if (code >= 200 && code < 300) buckets["2xx Success"] += count;
      else if (code >= 300 && code < 400) buckets["3xx Redirect"] += count;
      else if (code >= 400 && code < 500) buckets["4xx Client Error"] += count;
      else if (code >= 500) buckets["5xx Server Error"] += count;
    });

    return Object.keys(buckets)
      .filter((k) => buckets[k] > 0)
      .map((k) => ({ name: k, value: buckets[k] }));
  }, [statusData]);

  // Aggregated KPI Stats
  const kpis = useMemo(() => {
    let totalCalls = 0;
    let failedCalls = 0;
    let totalDurationWeighted = 0;

    statusData.forEach((s) => {
      const count = parseInt(s.count, 10) || 0;
      const code = parseInt(s.status, 10);
      totalCalls += count;
      if (code >= 400) failedCalls += count;
    });

    latencyData.forEach((l) => {
      const count = parseInt(l.totalCalls, 10) || 0;
      const latency = parseFloat(l.avgLatency) || 0;
      totalDurationWeighted += latency * count;
    });

    const avgLatency =
      totalCalls > 0 ? (totalDurationWeighted / totalCalls).toFixed(1) : 0;
    const successRate =
      totalCalls > 0
        ? (((totalCalls - failedCalls) / totalCalls) * 100).toFixed(1)
        : 100;

    return { totalCalls, failedCalls, avgLatency, successRate };
  }, [statusData, latencyData]);

  return (
    <div className="api-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">API Observability & Audit</h2>
          <p className="dashboard-subtitle">
            Real-time request telemetry, response times, and error tracking
          </p>
        </div>

        <div className="dashboard-actions">
          <select
            className="time-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>

                 <button
    className="logs-btn"
    onClick={() => navigate("/dashboard/api-dashboard/logs")}
  >
    <FaListUl />
    <span>View Logs</span>
  </button>
          <button
            className="refresh-btn"
            onClick={fetchMetrics}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper info">
            <FaExchangeAlt />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Requests</span>
            <span className="kpi-value">
              {kpis.totalCalls.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper success">
            <FaCheckCircle />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Success Rate</span>
            <span className="kpi-value">{kpis.successRate}%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper warning">
            <FaClock />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Avg Latency</span>
            <span className="kpi-value">{kpis.avgLatency} ms</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper danger">
            <FaTimesCircle />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Failed Invocations</span>
            <span className="kpi-value">{kpis.failedCalls}</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Latency by Endpoint */}
        <div className="chart-card">
          <h3 className="chart-title">Endpoint Response Times (Avg ms)</h3>
          <div className="chart-wrapper">
            {latencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={latencyData.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit="ms" />
                  <YAxis
                    dataKey="endpoint"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    formatter={(val) => [`${parseFloat(val).toFixed(1)} ms`, "Latency"]}
                  />
                  <Bar
                    dataKey="avgLatency"
                    fill="#6366F1"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No telemetry captured yet</div>
            )}
          </div>
        </div>

        {/* HTTP Status Code Split */}
        <div className="chart-card">
          <h3 className="chart-title">HTTP Response Codes</h3>
          <div className="chart-wrapper">
            {formattedStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {formattedStatusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No status data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Endpoint Table Details */}
      <div className="table-card">
        <h3 className="chart-title">Endpoint Traffic Summary</h3>
        <div className="table-wrapper">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Endpoint Route</th>
                <th>Total Invocations</th>
                <th>Average Latency</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              {latencyData.map((row, idx) => {
                const latency = parseFloat(row.avgLatency || 0);
                return (
                  <tr key={idx}>
                    <td>
                      <code className="route-badge">{row.endpoint}</code>
                    </td>
                    <td>{row.totalCalls}</td>
                    <td>{latency.toFixed(1)} ms</td>
                    <td>
                      <span
                        className={`status-pill ${
                          latency < 200
                            ? "pill-green"
                            : latency < 600
                            ? "pill-amber"
                            : "pill-red"
                        }`}
                      >
                        {latency < 200
                          ? "Fast"
                          : latency < 600
                          ? "Moderate"
                          : "Slow"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiDashboard;