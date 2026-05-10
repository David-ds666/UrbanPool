import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Users, Clock, ChevronDown, ChevronUp, CheckCircle, XCircle, MapPin } from "lucide-react";

function formatDate(d) {
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d || "—"; }
}

export default function DriverSeatRequests() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRide, setExpandedRide] = useState(null);
  const [updating, setUpdating] = useState(null);

  const driverId = user?.uid;

  const fetchRides = () => {
    if (!driverId) return;
    setLoading(true);
    fetch(`http://localhost:5001/api/carpool/my-offers/${driverId}`)
      .then(r => r.json())
      .then(data => setRides(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRides(); }, [user]);

  const updateBooking = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await fetch(`http://localhost:5001/api/carpool/booking/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchRides();
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  // All rides that have at least one booking
  const ridesWithBookings = rides.filter(r => (r.bookings || []).length > 0);
  const totalPassengers = rides.flatMap(r => r.bookings || []).filter(b => b.status === "confirmed").length;
  const totalEarnings = rides.flatMap(r => r.bookings || [])
    .filter(b => b.status === "confirmed")
    .reduce((s, b) => s + (b.totalFare || 0), 0);

  if (loading) return (
    <div className="offline-state" style={{ height: "300px" }}>
      <div className="scanning-animation"><div className="scanning-ring" /><span className="scanning-icon">👥</span></div>
      <p>Loading seat requests...</p>
    </div>
  );

  return (
    <div className="driver-active-rides">

      {/* Summary */}
      <div className="sr-summary-row">
        <div className="sr-summary-card">
          <span className="sr-summary-icon">👥</span>
          <div><span className="sr-summary-value">{totalPassengers}</span><span className="sr-summary-label">Confirmed Passengers</span></div>
        </div>
        <div className="sr-summary-card">
          <span className="sr-summary-icon">💰</span>
          <div><span className="sr-summary-value">₹{totalEarnings}</span><span className="sr-summary-label">Total Earnings</span></div>
        </div>
        <div className="sr-summary-card">
          <span className="sr-summary-icon">🚗</span>
          <div><span className="sr-summary-value">{ridesWithBookings.length}</span><span className="sr-summary-label">Rides with Bookings</span></div>
        </div>
      </div>

      {/* Section header */}
      <div className="active-rides-section-header" style={{ marginTop: "28px" }}>
        <h2>Seat Requests</h2>
        <button className="orc-refresh-btn" onClick={fetchRides} title="Refresh">↻</button>
      </div>

      {ridesWithBookings.length === 0 ? (
        <div className="driver-empty-rides">
          <span className="driver-empty-icon">🪑</span>
          <h3>No seat requests yet</h3>
          <p>When passengers book seats on your offered rides, they'll appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ridesWithBookings.map(ride => {
            const isExpanded = expandedRide === ride.id;
            const allBookings = ride.bookings || [];
            const confirmed = allBookings.filter(b => b.status === "confirmed");
            const cancelled = allBookings.filter(b => b.status === "cancelled");

            return (
              <div key={ride.id} className="offered-ride-card">
                {/* Ride header */}
                <div className="orc-header">
                  <div className="orc-route">
                    <MapPin size={14} color="#6b7280" />
                    <span className="orc-city">{ride.pickup}</span>
                    <span className="orc-arrow">→</span>
                    <span className="orc-city">{ride.destination}</span>
                  </div>
                  <span className="orc-info-chip">
                    <Clock size={12} /> {ride.date} · {ride.time}
                  </span>
                </div>

                {/* Stats row */}
                <div className="orc-info-row">
                  <span className="orc-info-chip"><Users size={12} /> {confirmed.length} confirmed</span>
                  <span className="orc-info-chip">₹{ride.pricePerSeat}/seat</span>
                  {confirmed.length > 0 && (
                    <span className="orc-info-chip orc-earnings-chip">
                      💰 ₹{confirmed.reduce((s, b) => s + (b.totalFare || 0), 0)}
                    </span>
                  )}
                  {cancelled.length > 0 && (
                    <span className="orc-info-chip" style={{ color: "#dc2626", background: "#fef2f2", borderColor: "#fecaca" }}>
                      {cancelled.length} cancelled
                    </span>
                  )}
                </div>

                {/* Seat fill bar */}
                <div className="orc-seat-bar">
                  <div className="orc-seat-fill"
                    style={{ width: `${ride.seatsAvailable + confirmed.reduce((s,b)=>s+(b.seatsBooked||0),0) > 0
                      ? (confirmed.reduce((s,b)=>s+(b.seatsBooked||0),0) /
                        (ride.seatsAvailable + confirmed.reduce((s,b)=>s+(b.seatsBooked||0),0))) * 100
                      : 0}%` }}
                  />
                </div>

                {/* Expand toggle */}
                <button className="orc-toggle-btn" onClick={() => setExpandedRide(isExpanded ? null : ride.id)}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {allBookings.length} booking(s) — click to {isExpanded ? "collapse" : "manage"}
                </button>

                {/* Passenger list */}
                {isExpanded && (
                  <div className="orc-passengers">
                    {allBookings.length === 0 ? (
                      <p className="orc-no-passengers">No bookings for this ride.</p>
                    ) : (
                      allBookings.map(b => (
                        <div key={b.id} className="orc-passenger-row">
                          <div className="orc-passenger-avatar">
                            {b.passengerName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="orc-passenger-info">
                            <strong>{b.passengerName || "Passenger"}</strong>
                            <span>{b.seatsBooked} seat(s) · ₹{b.totalFare} · {formatDate(b.createdAt)}</span>
                          </div>

                          {/* Status badge + actions */}
                          {b.status === "confirmed" ? (
                            <div className="orc-passenger-actions">
                              <span className="sr-status-confirmed">✓ Confirmed</span>
                              <button
                                className="orc-passenger-btn orc-passenger-cancel"
                                disabled={updating === b.id}
                                onClick={() => updateBooking(b.id, "cancelled")}
                                title="Cancel booking"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="sr-status-cancelled">✗ Cancelled</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
