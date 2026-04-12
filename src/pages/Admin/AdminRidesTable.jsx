import { useState, useEffect } from "react";
import "./Admin.css";

export default function AdminRidesTable() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRides = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5001/api/admin/rides");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load rides. Ensure the backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, []);

  const filtered = rides.filter(ride => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      ride.pickup?.toLowerCase().includes(q) ||
      ride.drop?.toLowerCase().includes(q) ||
      String(ride.id).includes(q) ||
      ride.type?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" ||
      (ride.status || "confirmed").toLowerCase().replace("_", "-") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-table-container">
      <div className="table-toolbar">
        <h3>All Platform Rides <span className="count-badge">{filtered.length}</span></h3>
        <div className="toolbar-controls">
          <input
            className="admin-search-input"
            placeholder="Search pickup, drop, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="admin-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="driver-assigned">Driver Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="admin-refresh-btn" onClick={fetchRides}>↻ Refresh</button>
        </div>
      </div>

      {error ? (
        <div className="admin-error-inline">⚠️ {error}</div>
      ) : loading ? (
        <div className="admin-loading" style={{ height: 220 }}>
          <div className="admin-spinner" /> Loading rides…
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Date</th>
                <th>Fare</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    {rides.length === 0
                      ? "No rides on the platform yet."
                      : "No rides match your search / filter."}
                  </td>
                </tr>
              ) : (
                filtered.map(ride => (
                  <tr key={ride.id}>
                    <td className="col-id">#{ride.id}</td>
                    <td>{ride.type}</td>
                    <td className="truncate">{ride.pickup}</td>
                    <td className="truncate">{ride.drop}</td>
                    <td>{ride.date}</td>
                    <td className="col-fare">₹{ride.price}</td>
                    <td>
                      <span className={`status-badge ${(ride.status || 'confirmed').toLowerCase().replace('_', '-')}`}>
                        {ride.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
