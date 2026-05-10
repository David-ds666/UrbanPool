import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Clock, ChevronDown, ChevronUp, CheckCircle, XCircle, Navigation } from "lucide-react";

const STATUS_CONFIG = {
  open:        { label: "Open",        color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
  full:        { label: "Full",        color: "#6b21a8", bg: "#faf5ff", border: "#e9d5ff" },
  in_progress: { label: "In Progress", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  completed:   { label: "Completed",   color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
  cancelled:   { label: "Cancelled",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

// ── Single Offered Ride Card ──
function OfferedRideCard({ ride, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(null);

  const sc = STATUS_CONFIG[ride.status] || STATUS_CONFIG.open;
  const totalSeats  = (ride.seatsAvailable || 0) + (ride.confirmedSeats || 0);
  const filledSeats = ride.confirmedSeats || 0;
  const confirmedBookings = (ride.bookings || []).filter(b => b.status === "confirmed");
  const earnings = confirmedBookings.reduce((s, b) => s + (b.totalFare || 0), 0);

  const updateBooking = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await fetch(`http://localhost:5001/api/carpool/booking/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const updateRideStatus = async (newStatus) => {
    const ENDPOINTS = {
      cancelled:   `/api/carpool/ride/${ride.id}/cancel`,
      in_progress: `/api/carpool/ride/${ride.id}/start`,
      completed:   `/api/carpool/ride/${ride.id}/complete`,
    };
    const endpoint = ENDPOINTS[newStatus];
    if (!endpoint) return;
    try {
      const res = await fetch(`http://localhost:5001${endpoint}`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      onRefresh();
    } catch (err) { console.error('updateRideStatus error:', err); }
  };


  return (
    <div className="offered-ride-card">
      {/* Route + status */}
      <div className="orc-header">
        <div className="orc-route">
          <span className="orc-city">{ride.pickup}</span>
          <span className="orc-arrow">→</span>
          <span className="orc-city">{ride.destination}</span>
        </div>
        <span className="orc-status-badge"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          {sc.label}
        </span>
      </div>

      {/* Info chips */}
      <div className="orc-info-row">
        <span className="orc-info-chip"><Clock size={13} /> {ride.date} · {ride.time}</span>
        <span className="orc-info-chip"><Users size={13} /> {filledSeats}/{totalSeats} seats</span>
        <span className="orc-info-chip">₹{ride.pricePerSeat}/seat</span>
        {earnings > 0 && <span className="orc-info-chip orc-earnings-chip">💰 ₹{earnings} earned</span>}
      </div>

      {/* Seat fill bar */}
      <div className="orc-seat-bar">
        <div className="orc-seat-fill"
          style={{ width: `${totalSeats > 0 ? (filledSeats / totalSeats) * 100 : 0}%` }} />
      </div>

      {/* Footer: expand + actions */}
      <div className="orc-footer">
        <button className="orc-toggle-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {confirmedBookings.length > 0
            ? `${confirmedBookings.length} passenger(s) — view`
            : "No bookings yet"}
        </button>

        <div className="orc-actions">
          {(ride.status === "open" || ride.status === "full") && (
            <>
              <button className="orc-btn orc-btn-go" onClick={() => updateRideStatus("in_progress")}>
                <Navigation size={14} /> Start Ride
              </button>
              <button className="orc-btn orc-btn-cancel" onClick={() => updateRideStatus("cancelled")}>
                Cancel
              </button>
            </>
          )}
          {ride.status === "in_progress" && (
            <button className="orc-btn orc-btn-complete" onClick={() => updateRideStatus("completed")}>
              <CheckCircle size={14} /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Expanded passengers */}
      {expanded && (
        <div className="orc-passengers">
          {confirmedBookings.length === 0 ? (
            <p className="orc-no-passengers">No confirmed bookings for this ride yet.</p>
          ) : (
            confirmedBookings.map(b => (
              <div key={b.id} className="orc-passenger-row">
                <div className="orc-passenger-avatar">
                  {b.passengerName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="orc-passenger-info">
                  <strong>{b.passengerName || "Passenger"}</strong>
                  <span>{b.seatsBooked} seat(s) · ₹{b.totalFare}</span>
                </div>
                <div className="orc-passenger-actions">
                  <button
                    className="orc-passenger-btn orc-passenger-cancel"
                    disabled={updating === b.id}
                    onClick={() => updateBooking(b.id, "cancelled")}
                    title="Cancel booking"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ──
export default function DriverDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [freshProfile, setFreshProfile] = useState(null);
  const [offeredRides, setOfferedRides] = useState([]);
  const [ridesLoading, setRidesLoading] = useState(true);

  const driverId = user?.uid;
  const driverName = (freshProfile?.name || userProfile?.name)?.split(" ")[0] || "Driver";

  // Fetch profile for name display
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5001/api/profile/${user.uid}`)
      .then(r => r.json())
      .then(data => { if (data.profile) setFreshProfile(data.profile); })
      .catch(() => {});
  }, [user]);

  // Fetch offered rides
  const fetchOfferedRides = () => {
    if (!driverId) return;
    setRidesLoading(true);
    fetch(`http://localhost:5001/api/carpool/my-offers/${driverId}`)
      .then(r => r.json())
      .then(data => setOfferedRides(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setRidesLoading(false));
  };

  useEffect(() => { fetchOfferedRides(); }, [user]);

  const activeRides    = offeredRides.filter(r => ["open", "full", "in_progress"].includes(r.status));
  const completedRides = offeredRides.filter(r => r.status === "completed");
  const totalEarnings  = offeredRides.flatMap(r => r.bookings || [])
    .filter(b => b.status === "confirmed").reduce((s, b) => s + (b.totalFare || 0), 0);
  const totalPassengers = offeredRides.flatMap(r => r.bookings || [])
    .filter(b => b.status === "confirmed").length;

  const STAT_CARDS = [
    { label: "Total Earnings",   value: `₹${totalEarnings}`,    icon: "💰" },
    { label: "Active Rides",     value: activeRides.length,     icon: "🚗" },
    { label: "Rides Completed",  value: completedRides.length,  icon: "✅" },
    { label: "Total Passengers", value: totalPassengers,        icon: "👥" },
  ];

  return (
    <div className="driver-dashboard">

      {/* Header */}
      <div className="driver-dash-header">
        <div>
          <h1>Welcome back, {driverName}</h1>
          <p className="driver-dash-subtitle">Manage your offered rides and passengers below</p>
        </div>
      </div>

      {/* Offer a Ride CTA */}
      <div className="driver-offer-cta">
        <div className="driver-offer-cta-text">
          <strong>Post a new ride</strong>
          <span>Going somewhere? Offer your empty seats and earn while you travel.</span>
        </div>
        <button className="driver-offer-cta-btn" onClick={() => navigate("/carpool/offer")}>
          <Plus size={16} /> Offer a Ride
        </button>
      </div>

      {/* Stat Cards */}
      <div className="driver-stats-grid">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="driver-stat-card">
            <span className="driver-stat-icon-emoji">{card.icon}</span>
            <div className="driver-stat-info">
              <span className="driver-stat-value">{card.value}</span>
              <span className="driver-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* My Offered Rides */}
      <div className="offered-rides-section">
        <div className="offered-rides-header">
          <h2>My Offered Rides</h2>
          {activeRides.length > 0 && <span className="requests-count">{activeRides.length}</span>}
          <button className="orc-refresh-btn" onClick={fetchOfferedRides} title="Refresh">↻</button>
        </div>

        {ridesLoading ? (
          <div className="offline-state" style={{ height: "200px" }}>
            <div className="scanning-animation">
              <div className="scanning-ring" /><span className="scanning-icon">🚗</span>
            </div>
            <p>Loading your rides...</p>
          </div>
        ) : offeredRides.length === 0 ? (
          <div className="driver-empty-rides">
            <span className="driver-empty-icon">🛣️</span>
            <h3>No rides offered yet</h3>
            <p>Click "Offer a Ride" above to post your first ride and start earning.</p>
            <button className="driver-offer-cta-btn"
              style={{ marginTop: "16px", background: "#111", color: "#fff" }}
              onClick={() => navigate("/carpool/offer")}>
              <Plus size={16} /> Offer a Ride
            </button>
          </div>
        ) : (
          <div className="offered-rides-list">
            {activeRides.length > 0 && (
              <>
                <p className="offered-rides-group-label">Active</p>
                {activeRides.map(ride => (
                  <OfferedRideCard key={ride.id} ride={ride} onRefresh={fetchOfferedRides} />
                ))}
              </>
            )}
            {completedRides.length > 0 && (
              <>
                <p className="offered-rides-group-label" style={{ marginTop: "24px" }}>Completed</p>
                {completedRides.map(ride => (
                  <OfferedRideCard key={ride.id} ride={ride} onRefresh={fetchOfferedRides} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
