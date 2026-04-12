import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import "./Admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, ridesRes] = await Promise.all([
        fetch("http://localhost:5001/api/admin/stats"),
        fetch("http://localhost:5001/api/admin/rides"),
      ]);
      if (!statsRes.ok) throw new Error(`Stats API returned ${statsRes.status}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      if (ridesRes.ok) {
        const ridesData = await ridesRes.json();
        setRecentRides(Array.isArray(ridesData) ? ridesData.slice(0, 6) : []);
      }
    } catch (err) {
      setError("Cannot reach backend. Is the server running on port 5001?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      Loading analytics…
    </div>
  );

  if (error) return (
    <div className="admin-error-state">
      <div className="admin-error-icon">⚠️</div>
      <h3>Backend Unavailable</h3>
      <p>{error}</p>
      <button className="admin-retry-btn" onClick={fetchData}>Retry Connection</button>
    </div>
  );

  const avgFare = stats.totalRides > 0
    ? Math.round(stats.totalRevenue / stats.totalRides)
    : 0;

  const kpis = [
    { label: "Total Revenue",  value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: "₹", color: "green",  trend: "Live from DB" },
    { label: "Total Rides",    value: stats.totalRides ?? 0,                             icon: "🚗", color: "blue",   trend: "All time" },
    { label: "Active Users",   value: stats.activeUsers ?? 0,                            icon: "👥", color: "purple", trend: "Platform total" },
    { label: "Avg Fare / Ride",value: `₹${avgFare}`,                                     icon: "⚡", color: "orange", trend: "Per ride avg" },
  ];

  return (
    <div className="admin-dashboard">

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        {kpis.map(k => (
          <div className="admin-kpi-card" key={k.label}>
            <div className={`kpi-icon kpi-icon-${k.color}`}>{k.icon}</div>
            <div className="kpi-body">
              <h3>{k.label}</h3>
              <p className="kpi-value">{k.value}</p>
              <span className="kpi-trend positive">↑ {k.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="admin-chart-section">
        <div className="chart-header">
          <h3>Revenue — Last 7 Days</h3>
          <button className="admin-refresh-btn" onClick={fetchData}>↻ Refresh</button>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#111" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10}
                tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} dx={-10}
                tickFormatter={v => `₹${v}`} tick={{ fontSize: 12, fill: '#888' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.18} />
              <Tooltip
                formatter={v => [`₹${v}`, "Revenue"]}
                contentStyle={{
                  border: '1px solid #eaeaea', borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px'
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#111"
                strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Rides */}
      {recentRides.length > 0 && (
        <div className="admin-chart-section" style={{ marginTop: 24 }}>
          <div className="chart-header">
            <h3>Recent Rides</h3>
            <span className="count-badge">{recentRides.length}</span>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Type</th><th>Pickup → Drop</th>
                  <th>Fare</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map(ride => (
                  <tr key={ride.id}>
                    <td className="col-id">#{ride.id}</td>
                    <td>{ride.type}</td>
                    <td className="truncate">{ride.pickup} → {ride.drop}</td>
                    <td className="col-fare">₹{ride.price}</td>
                    <td>
                      <span className={`status-badge ${(ride.status || 'confirmed').toLowerCase().replace('_','-')}`}>
                        {ride.status || 'Confirmed'}
                      </span>
                    </td>
                    <td>{ride.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
