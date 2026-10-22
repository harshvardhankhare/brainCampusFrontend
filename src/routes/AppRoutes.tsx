import {Routes, Route, Navigate} from 'react-router-dom';
import Login from "../pages/auth/Login"
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardHome from "../pages/dashboard/DashboardHome";
import Students from "../pages/dashboard/students/Students";
import Teachers from "../pages/dashboard/teachers/Teachers";
import Finance from "../pages/dashboard/finance/Finance";
import DashboardLayout from '../components/layouts/DashboardLayout'
import NotFound from '../pages/NotFound';
import StudentList from '../pages/dashboard/StudentList/StudentList';
import Academics from '../pages/dashboard/Academics/Academics';
import StudentDetails from '../pages/dashboard/StudentDetail/StudentDetails';
import TeacherAssignments from '../pages/dashboard/teachers/TeachersAssignment';
import StudentResultDetails from '../pages/dashboard/StudentDetail/StudentResultDetails';
import StaffList from '../pages/dashboard/staff/staffList'
import AdminOptions from '../pages/Admin/AdminOptions';
import Roles from "../pages/Admin/Roles"
import TeacherDetails from "../pages/dashboard/teachers/TeacherDetails"
import StudentFees from '../pages/dashboard/StudentDetail/StudentFees';
import ApiDashboard from '../pages/dashboard/ApiDashboard/ApiDashboard';
import AuditLogViewer from '../pages/dashboard/ApiDashboard/AuditLogViewer';
const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route
  path="/forgot-password"
  element={<Login />}
/>

<Route
  path="/reset-password"
  element={<Login />}
/>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="finance" element={<Finance />} />
        <Route path='academics' element={<Academics/>}/>
        <Route path='students/list' element={<StudentList/>}/>
        <Route path='students/:id' element={<StudentDetails/>}/>
        <Route path="teachers/assignments" element={<TeacherAssignments />}/>
        <Route path="teachers/:id" element={<TeacherDetails/>}/>
        <Route path="students/:id/results/:examId" element={<StudentResultDetails />}/>
        <Route path="students/:id/fees" element={<StudentFees/>} />
        <Route path="staff" element={<StaffList />} />
        <Route path="admin" element={<AdminOptions />} />
        <Route path="roles" element = {<Roles/>}/>
        <Route path="api-dashboard" element={<ApiDashboard/>}/>
        <Route path="api-dashboard/logs" element={<AuditLogViewer/>}/>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  )
}

export default AppRoutes