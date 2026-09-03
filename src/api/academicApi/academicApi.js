import api from '../axios';

export const academicApi = {
  // Academic Years
  getAcademicYears: () => api.get('/academic-years'),

  // Classes
  getClasses: () => api.get('/classes'),
  createClass: (data) => api.post('/classes', data), // { name, section, academicYear }

  // Subjects
  getSubjects: () => api.get('/subjects'),
  createSubject: (data) => api.post('/subjects', data), // { name, code }

  // Class-Subject Assignments
  getClassSubjects: () => api.get('/class-subjects'),
  assignSubjectToClass: (data) => api.post('/class-subjects', data),

  // Teachers & Exams
  getTeachers: () => api.get('/teachers'),
  getExams: () => api.get('/exams'),
};

export default academicApi;