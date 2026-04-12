import { Outlet } from "react-router-dom"

function AppLayout() {
  return (
    <div>
      <h3 style={{ padding: "16px" }}>UrbanPool Dashboard</h3>
      <Outlet />
    </div>
  )
}

export default AppLayout