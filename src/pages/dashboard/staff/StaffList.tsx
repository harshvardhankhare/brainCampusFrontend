// src/pages/dashboard/staff/StaffList.jsx
import React, { useState, useEffect } from 'react';
import { staffApi } from '../../../api/staffApi/staffApi';;
import StaffFormModal from './StaffFormModal';
import styles from './StaffList.module.css';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Available staff types from backend enum
  const STAFF_TYPES = [ 'TEACHER','ACCOUNTANT','RECEPTIONIST','LIBRARIAN', 'DRIVER', 'SECURITY', 'ADMINISTRATIVE', 'OTHER']; // adjust as needed
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await staffApi.getAll();
      setStaff(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await staffApi.delete(id);
      setStaff(staff.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleStatus = async (id, currentActive) => {
    try {
      const newStatus = !currentActive;
      await staffApi.updateStatus(id, newStatus);
      setStaff(
        staff.map((s) =>
          s.id === id ? { ...s, active: newStatus } : s
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingStaff(null);
  };

  const handleSave = (savedStaff) => {
    if (editingStaff) {
      // update in list
      setStaff(staff.map((s) => (s.id === savedStaff.id ? savedStaff : s)));
    } else {
      // add new
      setStaff([savedStaff, ...staff]);
    }
    setModalOpen(false);
    setEditingStaff(null);
  };

  const filteredStaff = filterType
    ? staff.filter((s) => s.type === filterType)
    : staff;

  if (loading) return <div className={styles.loading}>Loading staff...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Staff Management</h2>
        <button className={styles.createBtn} onClick={handleOpenCreate}>
          + Add Staff
        </button>
      </div>

      <div className={styles.filters}>
        <label>Filter by Type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All</option>
          {STAFF_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noData}>
                No staff found.
              </td>
            </tr>
          ) : (
            filteredStaff.map((s) => (
              <tr key={s.id}>
                <td>{s.employeeCode}</td>
                <td>
                  {s.firstName} {s.lastName || ''}
                </td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td>{s.type}</td>
                <td>{s.designation || '-'}</td>
                <td>
                  <span
                    className={s.active ? styles.activeBadge : styles.inactiveBadge}
                  >
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleOpenEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => handleToggleStatus(s.id, s.active)}
                  >
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <StaffFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        initialData={editingStaff}
      />
    </div>
  );
};

export default StaffList;