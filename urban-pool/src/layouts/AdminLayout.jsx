import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Users, Zap, LogOut } from "lucide-react";
import "../pages/Admin/Admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "All Rides", path: "/admin/rides", icon: <Car size={20} /> },
    { name: "Surge Control", path: "/admin/surge", icon: <Zap size={20} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>UrbanPool <span>Admin</span></h2>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout" onClick={() => navigate("/")}>
            <LogOut size={20} />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{navItems.find(i => i.path === location.pathname)?.name || "Dashboard"}</h1>
          <div className="admin-profile">Admin User</div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
