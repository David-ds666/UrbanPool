import { useState, useEffect } from "react";
import "./Admin.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | drivers | riders

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5001/api/admin/users");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Failed to load users. Ensure the backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(q) ||
      u.userId?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q);
    const matchRole =
      roleFilter === "all" ||
      (roleFilter === "drivers" && u.isDriver) ||
      (roleFilter === "riders" && !u.isDriver);
    return matchSearch && matchRole;
  });

  const driverCount = users.filter(u => u.isDriver).length;
  const riderCount  = users.filter(u => !u.isDriver).length;
  const totalWallet = users.reduce((s, u) => s + (u.walletBalance || 0), 0);

  const shortId = uid => uid && uid.length > 14 ? `${uid.substring(0, 14)}…` : (uid || "-");

  return (
    <div className="admin-users-page">

      {/* Summary row */}
      <div className="admin-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="admin-kpi-card">
          <div className="kpi-icon kpi-icon-blue">👥</div>
          <div className="kpi-body">
            <h3>Total Users</h3>
            <p className="kpi-value">{total}</p>
            <span className="kpi-trend positive">All registered</span>
          </div>
        </div>
        <div className="admin-kpi-card">
          <div className="kpi-icon kpi-icon-purple">🚗</div>
          <div className="kpi-body">
            <h3>Drivers</h3>
            <p className="kpi-value">{driverCount}</p>
            <span className="kpi-trend neutral">Active driver accounts</span>
          </div>
        </div>
        <div className="admin-kpi-card">
          <div className="kpi-icon kpi-icon-green">₹</div>
          <div className="kpi-body">
            <h3>Wallet Funds</h3>
            <p className="kpi-value">₹{totalWallet.toLocaleString()}</p>
            <span className="kpi-trend positive">Across all users</span>
          </div>
        </div>
        <div className="admin-kpi-card">
          <div className="kpi-icon kpi-icon-orange">👤</div>
          <div className="kpi-body">
            <h3>Riders</h3>
            <p className="kpi-value">{riderCount}</p>
            <span className="kpi-trend neutral">Passenger accounts</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <div className="table-toolbar">
          <h3>User Directory <span className="count-badge">{filtered.length}</span></h3>
          <div className="toolbar-controls">
            <input
              className="admin-search-input"
              placeholder="Search name, city, ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="admin-select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="drivers">Drivers Only</option>
              <option value="riders">Riders Only</option>
            </select>
            <button className="admin-refresh-btn" onClick={fetchUsers}>↻ Refresh</button>
          </div>
        </div>

        {error ? (
          <div className="admin-error-inline">⚠️ {error}</div>
        ) : loading ? (
          <div className="admin-loading" style={{ height: 220 }}>
            <div className="admin-spinner" /> Loading users…
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Firebase UID</th>
                  <th>City</th>
                  <th>Rides</th>
                  <th>Wallet</th>
                  <th>Role</th>
                  <th>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      {users.length === 0
                        ? "No users registered yet. They appear here after first login."
                        : "No users match your search / filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user.userId}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-circle">
                            {(user.name && user.name !== "Unregistered")
                              ? user.name[0].toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-phone">{user.phone !== "-" ? user.phone : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="col-id" title={user.userId}>{shortId(user.userId)}</td>
                      <td>{user.city !== "-" ? user.city : <span style={{ color: "#ccc" }}>—</span>}</td>
                      <td className="col-fare">{user.bookingCount}</td>
                      <td className={user.walletBalance > 0 ? "col-wallet-pos" : "col-id"}>
                        ₹{(user.walletBalance || 0).toFixed(0)}
                      </td>
                      <td>
                        <span className={`role-badge ${user.isDriver ? "role-driver" : "role-rider"}`}>
                          {user.isDriver ? "🚗 Driver" : "👤 Rider"}
                        </span>
                      </td>
                      <td>{user.memberSince}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
