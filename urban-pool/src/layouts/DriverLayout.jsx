import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Car, Wallet, LogOut, ArrowLeft, Bell, X } from "lucide-react";
import { timeAgo, notifTimestamp } from "../utils/timeAgo";
import "./Driver.css";

export default function DriverLayout() {
  const { user, logout, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const notifications = userProfile?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Mark all as read when panel is opened
  const handleBellClick = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && unreadCount > 0) {
      updateProfile({
        notifications: notifications.map(n => ({ ...n, read: true }))
      });
    }
  };

  // Dismiss a single notification
  const dismissNotif = (e, id) => {
    e.stopPropagation();
    updateProfile({
      notifications: notifications.filter(n => n.id !== id)
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "My Rides",    path: "/driver",              icon: <LayoutDashboard size={20} />, exact: true },
    { name: "Seat Requests", path: "/driver/active-rides", icon: <Car size={20} /> },
    { name: "Earnings",    path: "/driver/earnings",     icon: <Wallet size={20} /> },
  ];

  const NOTIF_ICONS = { addition: "💰", info: "ℹ️", ride: "🚗", bonus: "🎁" };

  return (
    <div className="driver-layout">
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
            <div className="driver-avatar">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="driver-details">
              <strong>{userProfile?.name || "Driver"}</strong>
              <span>★ 4.9</span>
            </div>
          </div>
          <button className="driver-action-btn" onClick={() => navigate("/")} style={{ marginTop: "10px" }}>
            <ArrowLeft size={16} /> Rider Mode
          </button>
          <button className="driver-action-btn logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="driver-main-content">
        <div className="driver-topbar">
          <h1 className="driver-page-title" />
          <div className="driver-topbar-actions" ref={notifRef}>
            <button
              className={`driver-notif-btn ${notifOpen ? "active" : ""}`}
              onClick={handleBellClick}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="driver-notif-panel">
                <div className="driver-notif-header">
                  <span className="driver-notif-title">Notifications</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {unreadCount > 0 && (
                      <span className="driver-notif-count">{unreadCount}</span>
                    )}
                    <button
                      className="driver-notif-clear"
                      onClick={() => {
                        updateProfile({ notifications: [] });
                        setNotifOpen(false);
                      }}
                      title="Clear all"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="driver-notif-list">
                  {notifications.length === 0 ? (
                    <div className="driver-notif-empty">
                      <Bell size={28} strokeWidth={1.5} />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n, i) => (
                      <div key={n.id || i} className="driver-notif-item">
                        <span className="driver-notif-icon">
                          {NOTIF_ICONS[n.type] || "🔔"}
                        </span>
                        <div className="driver-notif-text">
                          <strong>{n.title}</strong>
                          <span>{n.message}</span>
                          <time>{timeAgo(notifTimestamp(n)) || n.time || ''}</time>
                        </div>
                        <button
                          className="driver-notif-dismiss"
                          onClick={(e) => dismissNotif(e, n.id)}
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="driver-content-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
