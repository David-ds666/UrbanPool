import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function DriverDashboard() {
  const { user, userProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayEarnings: 0, todayRides: 0, totalCompleted: 0,
    activeRides: 0, acceptanceRate: 100, totalRides: 0,
  });

  const driverId = user?.uid || "driver_system";
  const driverName = userProfile?.name?.split(" ")[0] || "Driver";

  // Fetch stats
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5001/api/driver/stats/${driverId}`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [user]);

  // Poll requests when online
  useEffect(() => {
    let interval;
    if (isOnline) {
      fetchRequests();
      interval = setInterval(fetchRequests, 5000);
    } else {
      setRequests([]);
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/driver/requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/driver/accept/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId })
      });
      if (res.ok) {
        fetchRequests();
        // Refresh stats
        fetch(`http://localhost:5001/api/driver/stats/${driverId}`)
          .then(r => r.json())
          .then(data => setStats(data))
          .catch(console.error);
      }
    } catch (err) {
      console.error("Accept error", err);
    }
  };

  const STAT_CARDS = [
    { label: "Today's Earnings", value: `₹${stats.todayEarnings}`, icon: "💰", color: "#10b981" },
    { label: "Trips Today", value: stats.todayRides, icon: "🚗", color: "#3b82f6" },
    { label: "Total Completed", value: stats.totalCompleted, icon: "✅", color: "#8b5cf6" },
    { label: "Acceptance Rate", value: `${stats.acceptanceRate}%`, icon: "📊", color: "#f59e0b" },
  ];

  return (
    <div className="driver-dashboard">
      <div className="driver-dash-header">
        <div>
          <h1>Welcome back, {driverName}</h1>
          <p className="driver-dash-subtitle">
            {isOnline ? "You're receiving ride requests" : "Go online to start earning"}
          </p>
        </div>

        <div className="online-toggle-container">
          <span className={`online-status-text ${isOnline ? "online" : ""}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="driver-stats-grid">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="driver-stat-card">
            <div className="driver-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div className="driver-stat-info">
              <span className="driver-stat-value">{card.value}</span>
              <span className="driver-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── REQUESTS AREA ── */}
      {!isOnline ? (
        <div className="offline-state">
          <div className="offline-icon">🛞</div>
          <h3>You're currently offline</h3>
          <p>Toggle the switch above to go online and start receiving ride requests in your area.</p>
        </div>
      ) : (
        <div className="requests-area">
          <div className="requests-header">
            <h2>
              Live Requests
              {requests.length > 0 && <span className="requests-count">{requests.length}</span>}
            </h2>
            {loading && <span className="requests-updating">Scanning...</span>}
          </div>

          {requests.length === 0 ? (
            <div className="offline-state scanning">
              <div className="scanning-animation">
                <div className="scanning-ring"></div>
                <span className="scanning-icon">📡</span>
              </div>
              <h3>Scanning for riders...</h3>
              <p>It's quiet right now. Stay online — requests will appear here.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((req) => (
                <div key={req.id} className="request-card fadeIn">
                  <div className="req-price-tag">₹{req.price}</div>

                  <div className="req-meta">
                    {req.rideType} • {req.date} at {req.time}
                  </div>

                  <div className="req-locations">
                    <div className="req-loc-line"></div>

                    <div className="req-loc">
                      <div className="req-loc-icon start"></div>
                      <div className="req-loc-text">
                        <span>Pickup</span>
                        <strong>{req.pickup}</strong>
                      </div>
                    </div>

                    <div className="req-loc">
                      <div className="req-loc-icon end"></div>
                      <div className="req-loc-text">
                        <span>Dropoff</span>
                        <strong>{req.drop}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="req-actions">
                    <button className="req-btn decline" onClick={() => {
                      setRequests(prev => prev.filter(r => r.id !== req.id));
                    }}>
                      Decline
                    </button>
                    <button className="req-btn accept" onClick={() => handleAccept(req.id)}>
                      Accept Ride
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
