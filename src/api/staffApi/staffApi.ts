// src/api/staffApi.js
import api from '../axios';

export const staffApi = {
  // GET /staff
  getAll: () => api.get('/staff'),

  // GET /staff/type/{type}
  getByType: (type:any) => api.get(`/staff/type/${type}`),

  // GET /staff/{id}
  getById: (id:any) => api.get(`/staff/${id}`),

  // POST /staff
  create: (data:any) => api.post('/staff', data),

  // PUT /staff/{id}
  update: (id:any, data:any) => api.put(`/staff/${id}`, data),

  // DELETE /staff/{id}
  delete: (id:any) => api.delete(`/staff/${id}`),

  // PATCH /staff/{id}/status?active={boolean}
  updateStatus: (id:any, active:any) =>
    api.patch(`/staff/${id}/status`, null, { params: { active } }),
};