import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Outlet />
    </div>
  )
}

export default AuthLayout