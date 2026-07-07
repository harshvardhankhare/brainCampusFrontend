import { Outlet } from "react-router-dom";
const DashboardLayout = () => {
  return (
     <div className="dashboard-layout">

      {/* Sidebar */}

      {/* Navbar */}

      <main>
        <Outlet />
      </main>

    </div>
  )
}

export default DashboardLayout