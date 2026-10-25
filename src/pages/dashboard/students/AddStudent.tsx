import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUserPlus, 
  FaSave, 
  FaTimesCircle 
} from "react-icons/fa";
import api from "../../../api/axios"; // Adjust path to your axios instance
import "./AddStudent.css";

const AddStudent = () => {
  const navigate = useNavigate();

  // Reference data
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    roleNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    parentName: "",
    parentPhone: "",
    classId: "",
  });

  // Status State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // Fetch Classes on Mount
  // =========================================================
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get("/classes");
        // Filter to only show active classes, if your backend supports it
        const activeClasses = (res.data.data || []).filter(c => c.active !== false);
        setClasses(activeClasses);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Could not load classes. Please refresh the page.");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // =========================================================
  // Handlers
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.classId) {
      setError("Please select a class.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Convert classId to number for the backend
      const payload = {
        ...formData,
        classId: Number(formData.classId),
      };

      await api.post("/students", payload);
      
      // Redirect back to the students list on success
      navigate("/dashboard/students");
    } catch (err) {
      console.error("Failed to create student:", err);
      setError(
        err.response?.data?.message || 
        "Failed to add student. Role number or email might already exist."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-student-page">
      {/* Header */}
      <div className="page-header">
        <button 
          className="back-btn" 
          onClick={() => navigate("/dashboard/students")}
        >
          <FaArrowLeft size={14} /> Back to Students
        </button>
        <div>
          <h1 className="page-title">Add New Student</h1>
          <p className="page-subtitle">Enter student details to enroll them into a class.</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <FaTimesCircle /> {error}
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit} className="student-form">
          
          {/* Section 1: Academic Info */}
          <div className="form-section">
            <h3 className="section-title">Academic Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Roll Number *</label>
                <input
                  type="text"
                  name="roleNumber"
                  value={formData.roleNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2026001"
                />
              </div>

              <div className="form-group">
                <label>Class & Section *</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                  disabled={loadingClasses}
                >
                  <option value="">
                    {loadingClasses ? "Loading classes..." : "Select a Class"}
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.section} ({c.academicYear})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Info */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., John"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g., Doe"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Residential Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Enter full address"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Parent/Guardian Info */}
          <div className="form-section">
            <h3 className="section-title">Parent / Guardian Details</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Parent/Guardian Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="e.g., Jane Doe"
                />
              </div>

              <div className="form-group">
                <label>Parent/Guardian Phone</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard/students")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || loadingClasses}
            >
              {submitting ? (
                "Enrolling Student..."
              ) : (
                <>
                  <FaUserPlus /> Enroll Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;