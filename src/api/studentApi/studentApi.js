import api from '../axios';

export const studentApi = {
  // ========== Students ==========
  create: (data) => api.post('/students', data),
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),

  // ========== Student Fees (Individual & Class) ==========
  createStudentFee: (data) => api.post('/student-fees', data),
  createClassFee: (data) => api.post('/student-fees/class', data),
  getClassFees: (classId, academicYear) =>
    api.get(`/student-fees/class/${classId}`, {
      params: { academicYear },
    }),
  getStudentFees: (studentId) => api.get(`/student-fees/student/${studentId}`),
  getStudentFeesByYear: (studentId, academicYear) =>
    api.get(`/student-fees/student/${studentId}/academic-year`, {
      params: { academicYear },
    }),

  // ========== Fee Payments ==========
  createPayment: (data) => api.post('/fee-payments', data),
  getPaymentsByFee: (feeId) => api.get(`/fee-payments/fee/${feeId}`),
};

// ========== Classes & Academic Years ==========
export const classApi = {
  getAll: () => api.get('/classes'),
};

export const academicYearApi = {
  getAll: () => api.get('/academic-years'),
};

export default studentApi;