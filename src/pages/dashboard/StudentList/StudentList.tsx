// StudentList.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import "./StudentList.css";

// Mock student data generator based on filters
const generateMockStudents = (classVal, section, year) => {
  const names = [
    "Emma Johnson", "Liam Smith", "Olivia Davis", "Noah Wilson",
    "Ava Brown", "James Taylor", "Sophia Martinez", "Benjamin Anderson",
    "Mia Thomas", "Ethan Jackson"
  ];
  return names.map((name, index) => ({
    id: index + 1,
    name,
    rollNo: `2024${String(index + 1).padStart(3, "0")}`,
    class: classVal,
    section,
    year,
    email: `${name.toLowerCase().replace(" ", ".")}@school.edu`,
  }));
};

const StudentList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const classVal = params.get("class") || "Unknown";
  const section = params.get("section") || "Unknown";
  const year = params.get("year") || "Unknown";

  const students = generateMockStudents(classVal, section, year);

  const handleBack = () => navigate("/dashboard/students");

  const handleEdit = (id) => {
    alert(`Edit student with ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      alert(`Student ${id} deleted (mock)`);
    }
  };

  return (
 
    <div className="student-list-page">
      <div className="list-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="list-title">
          Students of {classVal} - {section} ({year})
        </h2>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Section</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.rollNo}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.class}</td>
                  <td>{student.section}</td>
                  <td>{student.year}</td>
                  <td className="action-btns">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(student.id)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(student.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default StudentList;