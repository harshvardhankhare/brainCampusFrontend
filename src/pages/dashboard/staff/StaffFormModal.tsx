// src/pages/dashboard/staff/StaffFormModal.jsx
import React, { useState, useEffect } from 'react';
import { staffApi } from '../../../api/staffApi/staffApi';
import styles from './StaffFormModal.module.css';

const STAFF_TYPES  = [ 'TEACHER','ACCOUNTANT','RECEPTIONIST','LIBRARIAN', 'DRIVER', 'SECURITY', 'ADMINISTRATIVE', 'OTHER'];
const ROLES =[ 'TEACHER','ACCOUNTANT','RECEPTIONIST','LIBRARIAN', 'DRIVER', 'SECURITY', 'ADMINISTRATIVE', 'OTHER']; // adjust based on your RoleType enum

const StaffFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    joiningDate: '',
    type: '',
    designation: '',
    address: '',
    role: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeCode: initialData.employeeCode || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        dateOfBirth: initialData.dateOfBirth || '',
        joiningDate: initialData.joiningDate || '',
        type: initialData.type || '',
        designation: initialData.designation || '',
        address: initialData.address || '',
        role: initialData.role || '',
        password: '', // never prefill password
      });
    } else {
      // Reset for create
      setFormData({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        joiningDate: '',
        type: '',
        designation: '',
        address: '',
        role: '',
        password: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (
      !formData.employeeCode ||
      !formData.firstName ||
      !formData.joiningDate ||
      !formData.type ||
      !formData.role
    ) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }
    if (!isEditing && !formData.password) {
      setError('Password is required for new staff.');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await staffApi.update(initialData.id, formData);
      } else {
        response = await staffApi.create(formData);
      }
      onSave(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{isEditing ? 'Edit Staff' : 'Add New Staff'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Employee Code *</label>
              <input
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>First Name *</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Joining Date *</label>
              <input
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                {STAFF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Designation</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
              />
            </div>
            {!isEditing && (
              <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  minLength="8"
                />
              </div>
            )}
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;