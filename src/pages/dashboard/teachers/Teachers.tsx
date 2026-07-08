import { useState } from "react";
import { FaUserPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "./Teachers.css";

const Teachers = () => {
  // Mock initial data
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Dr. Emily Johnson",
      classAssigned: "Class 5",
      section: "A",
      subject: "Mathematics",
      email: "emily.johnson@school.edu",
    },
    {
      id: 2,
      name: "Mr. Michael Brown",
      classAssigned: "Class 4",
      section: "B",
      subject: "Science",
      email: "michael.brown@school.edu",
    },
    {
      id: 3,
      name: "Ms. Sarah Davis",
      classAssigned: "Class 3",
      section: "C",
      subject: "English",
      email: "sarah.davis@school.edu",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    classAssigned: "",
    section: "",
    subject: "",
    email: "",
  });

  const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
  const sections = ["A", "B", "C", "D"];

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData(teacher);
    } else {
      setEditingTeacher(null);
      setFormData({ name: "", classAssigned: "", section: "", subject: "", email: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      // Edit existing
      setTeachers(
        teachers.map((t) => (t.id === editingTeacher.id ? { ...t, ...formData } : t))
      );
    } else {
      // Add new
      const newTeacher = {
        id: Date.now(),
        ...formData,
      };
      setTeachers([...teachers, newTeacher]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="teachers-page">
      <div className="teachers-header">
        <h1 className="teachers-title">Teachers</h1>
        <button className="add-teacher-btn" onClick={() => handleOpenModal()}>
          <FaUserPlus /> Add Teacher
        </button>
      </div>

      <div className="table-wrapper">
        <table className="teacher-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Class Assigned</th>
              <th>Section</th>
              <th>Subject</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((teacher, index) => (
                <tr key={teacher.id}>
                  <td>{index + 1}</td>
                  <td>{teacher.name}</td>
                  <td>{teacher.classAssigned}</td>
                  <td>{teacher.section}</td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.email}</td>
                  <td className="action-btns">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleOpenModal(teacher)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter teacher name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="classAssigned">Class Assigned</label>
                  <select
                    id="classAssigned"
                    name="classAssigned"
                    value={formData.classAssigned}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="section">Section</label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="teacher@school.edu"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingTeacher ? "Update" : "Add"} Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;