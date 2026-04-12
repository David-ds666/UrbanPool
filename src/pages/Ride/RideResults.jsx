import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthGate from "../../components/common/AuthGate/AuthGate";
import { calculateRidePrice, getEstimateETA } from "../../utils/pricing";
import "./RideResults.css";

const RIDE_TYPES = [
  { id: "pool", icon: "🚗", name: "UrbanPool", desc: "Shared · 2-3 riders", capacity: "1-3" },
  { id: "go", icon: "🚙", name: "UrbanGo", desc: "Affordable solo rides", capacity: "1-4" },
  { id: "xl", icon: "🚐", name: "UrbanXL", desc: "Extra space for groups", capacity: "1-6" },
  { id: "premier", icon: "✨", name: "Premier", desc: "Top-rated drivers · luxury", capacity: "1-4" },
  { id: "electric", icon: "⚡", name: "UrbanEV", desc: "Zero-emission electric rides", capacity: "1-4" },
  { id: "bike", icon: "🏍️", name: "Bike", desc: "Quick & affordable", capacity: "1" },
];

export default function RideResults() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState("pool");
  const [showAuth, setShowAuth] = useState(false);

  const pickup = state?.pickup || "Pickup";
  const drop = state?.drop || "Dropoff";
  const date = state?.date || new Date().toLocaleDateString();
  const time = state?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const [surgeInfo, setSurgeInfo] = useState({ isSurge: false, multiplier: 1, reasons: [] });

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const updatedRides = await Promise.all(RIDE_TYPES.map(async (type) => {
          const data = await calculateRidePrice(type.id, pickup, drop);
          if (data.distance !== undefined) setDistance(parseFloat(data.distance) || 0);
          if (data.isSurge !== undefined) {
            setSurgeInfo({ isSurge: data.isSurge, multiplier: data.surgeMultiplier, reasons: data.surgeReasons || [] });
          }
          return { 
            ...type, 
            price: data.price,
            basePrice: data.basePrice,
            eta: data.eta, 
            available: data.available !== false,
            matchCount: data.matchCount,
            isSurge: data.isSurge,
          };
        }));
        setRides(updatedRides);
      } catch (err) {
        console.error("Error fetching ride data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [pickup, drop]);

  const selectedRide = rides.find(r => r.id === selected) || {};
  const allUnavailable = rides.length > 0 && rides.every(r => !r.available);

  const handleBook = () => {
    if (!selectedRide.available) return;
    
    // Gate: must be logged in to book
    if (!user) {
      setShowAuth(true);
      return;
    }

    navigate("/booking", {
      state: {
        pickup, drop, date, time,
        rideType: selectedRide.name,
        price: selectedRide.price,
      },
    });
  };

  // Build Google Maps embed URL
  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(drop)}&mode=driving`;

  return (
    <div className="rr-page">
      {/* ── LEFT PANEL ────────────────────────────── */}
      <div className="rr-panel">
        {/* Trip summary */}
        <div className="rr-trip">
          <div className="rr-trip-route">
            <div className="rr-dot green" />
            <div className="rr-line" />
            <div className="rr-dot red" />
          </div>
          <div className="rr-trip-info">
            <div className="rr-trip-row">
              <span className="rr-label">Pickup</span>
              <span className="rr-value">{pickup}</span>
            </div>
            <div className="rr-trip-row">
              <span className="rr-label">Dropoff</span>
              <span className="rr-value">{drop}</span>
            </div>
          </div>
        </div>

        <div className="rr-meta">
          <span>📅 {date}</span>
          <span>🕐 {time}</span>
          <span className="rr-distance">📍 {distance.toFixed(1)} km</span>
        </div>

        {/* Ride options */}
        <h3 className="rr-heading">Choose a ride</h3>

        {/* Surge Alert Banner */}
        {surgeInfo.isSurge && (
          <div className="rr-surge-banner">
            <span className="rr-surge-icon">⚡</span>
            <div className="rr-surge-text">
              <strong>High Demand — {surgeInfo.multiplier}× surge pricing</strong>
              <span>{surgeInfo.reasons.join(" + ")}</span>
            </div>
          </div>
        )}

        <div className="rr-rides">
          {loading ? (
            <div className="rr-loading">Calculating best prices...</div>
          ) : allUnavailable ? (
            <div className="rr-unavailable-msg">
              <span className="warning-icon">⚠️</span>
              <p>Rides are currently not available for this distance ({distance} km).</p>
              <button className="secondary-btn" onClick={() => navigate("/")}>Go back</button>
            </div>
          ) : (
            rides.map((ride) => (
              <div
                key={ride.id}
                className={`rr-ride-card ${selected === ride.id ? "rr-active" : ""} ${!ride.available ? "rr-disabled" : ""}`}
                onClick={() => ride.available && setSelected(ride.id)}
              >
                <div className="rr-ride-left">
                  <span className="rr-ride-icon">{ride.icon}</span>
                  <div>
                    <h4>{ride.name}</h4>
                    <p>{ride.desc}</p>
                    {ride.id === 'pool' && ride.matchCount > 0 && (
                      <span className="rr-match-badge">
                        🔥 {ride.matchCount} {ride.matchCount === 1 ? 'person' : 'people'} near you
                      </span>
                    )}
                  </div>
                </div>
                <div className="rr-ride-right">
                  <span className="rr-ride-price">
                    {ride.available ? (
                      ride.isSurge ? (
                        <>
                          <span className="rr-price-original">₹{ride.basePrice}</span>
                          <span className="rr-price-surge">₹{ride.price}</span>
                        </>
                      ) : `₹${ride.price}`
                    ) : "N/A"}
                  </span>
                  <span className="rr-ride-eta">
                    {ride.available ? ride.eta : "Unavailable"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Book button */}
        <button 
          className={`rr-book-btn ${(!selectedRide.available || loading) ? "rr-btn-disabled" : ""}`} 
          onClick={handleBook}
          disabled={loading || !selectedRide.available}
        >
          {loading ? "Loading..." : 
           !selectedRide.available ? "Ride Unavailable" :
           `Book ${selectedRide.name || ""} · ₹${selectedRide.price || ""}`}
        </button>
      </div>

      {/* ── MAP ───────────────────────────────────── */}
      <div className="rr-map">
        <iframe
          title="Route map"
          src={mapSrc}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <AuthGate
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        message="to book a ride"
      />
    </div>
  );
}