import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Car, Wallet, LogOut, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import "./Driver.css"; // We'll create a shared Driver CSS

export default function DriverLayout() {
  const { user, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "Live Requests", path: "/driver", icon: <LayoutDashboard size={20} />, exact: true },
    { name: "Active Rides", path: "/driver/active-rides", icon: <Car size={20} /> },
    { name: "Earnings", path: "/driver/earnings", icon: <Wallet size={20} /> },
  ];

  return (
    <div className="driver-layout">
      {/* Sidebar Navigation */}
      <aside className="driver-sidebar">
        <div className="driver-brand">
          <div className="driver-logo" onClick={() => navigate("/")}>
            <span className="logo-icon">🛞</span>
            <h2>Driver<span className="brand-dot">.</span></h2>
          </div>
        </div>

        <nav className="driver-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `driver-nav-item ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="driver-sidebar-footer">
          <div className="driver-user-info">
            <div className="driver-avatar">{userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "D"}</div>
            <div className="driver-details">
              <strong>{userProfile?.name || "Driver"}</strong>
              <span>★ 4.9</span>
            </div>
          </div>
          
          <button className="driver-action-btn" onClick={() => navigate("/")} style={{marginTop: '10px'}}>
            <ArrowLeft size={16} /> Rider Mode
          </button>
          
          <button className="driver-action-btn logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="driver-main-content">
        <div className="driver-topbar">
          <h1 className="driver-page-title">
            {/* Dynamic title logic can be placed here, or handled inside child components */}
          </h1>
          <div className="driver-topbar-actions">
            <button className="driver-notif-btn">
              🔔 <span className="notif-badge">2</span>
            </button>
          </div>
        </div>
        
        <div className="driver-content-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
