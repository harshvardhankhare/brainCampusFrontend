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
const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
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
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<NotFound/>} />
    </Routes>
  )
}

export default AppRoutes