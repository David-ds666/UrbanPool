import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthGate from "../../components/common/AuthGate/AuthGate";
import { calculateDistanceAsync } from "../../utils/distance";
import "./CarpoolResults.css";

const API_BASE = "http://localhost:5001/api";
const CARPOOL_RATE_PER_KM = 8;

const BASE_CARPOOLS = [
  {
    id: "cp1",
    driver: { name: "Ankit Sharma", rating: 4.8, img: "👨‍✈️", rides: 124 },
    vehicle: "Swift Dzire • White",
    time: { departure: "09:30 AM", arrival: "10:45 AM", duration: "1h 15m" },
    pricing: { basePrice: 150, seats: 3, totalSeats: 4 },
    features: ["AC", "Music", "No Smoking"]
  },
  {
    id: "cp2",
    driver: { name: "Priya Verma", rating: 4.9, img: "👩‍✈️", rides: 89 },
    vehicle: "Honda City • Black",
    time: { departure: "10:15 AM", arrival: "11:30 AM", duration: "1h 15m" },
    pricing: { basePrice: 200, seats: 2, totalSeats: 3 },
    features: ["AC", "Pets Allowed"]
  },
  {
    id: "cp3",
    driver: { name: "Rahul Gupta", rating: 4.7, img: "👨‍💼", rides: 215 },
    vehicle: "Maruti Ertiga • Silver",
    time: { departure: "11:00 AM", arrival: "12:30 PM", duration: "1h 30m" },
    pricing: { basePrice: 120, seats: 5, totalSeats: 6 },
    features: ["AC", "Large Boot"]
  }
];

/**
 * Build carpool list with dynamic pricing based on distance.
 */
function buildCarpools(dist) {
  return BASE_CARPOOLS.map(ride => {
    const priceFactor = ride.pricing.basePrice / 150; // relative to cheapest
    const dynamicPrice = Math.round(ride.pricing.basePrice + (dist * CARPOOL_RATE_PER_KM * priceFactor));
    const durationMin = Math.round(dist * 1.8 + 5);
    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    return {
      ...ride,
      pricing: { ...ride.pricing, price: dynamicPrice },
      time: { ...ride.time, duration: durationStr }
    };
  });
}

export default function CarpoolResults() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [carpools, setCarpools] = useState([]);

  const pickup = state?.pickup || "Current Location";
  const drop = state?.drop || "Destination";
  const date = state?.date || new Date().toLocaleDateString();

  useEffect(() => {
    const fetchDistance = async () => {
      setLoading(true);
      let finalDist = 0;

      // ── Step 1: Try backend for distance ──
      try {
        const response = await fetch(`${API_BASE}/price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rideType: 'pool', pickup, drop })
        });
        const data = await response.json();
        finalDist = parseFloat(data.distance) || 0;
      } catch (error) {
        console.warn("Backend unavailable:", error.message);
      }

      // ── Step 2: If backend returned 0, use async geocoding (Nominatim+OSRM) ──
      if (finalDist === 0) {
        finalDist = await calculateDistanceAsync(pickup, drop);
      }

      // ── Step 3: Apply distance and build carpools ──
      setDistance(finalDist);

      if (finalDist > 100) {
        setAvailable(false);
        setCarpools([]);
      } else if (finalDist === 0) {
        // Couldn't resolve either location — show rides with base prices
        setAvailable(true);
        setCarpools(BASE_CARPOOLS.map(r => ({
          ...r,
          pricing: { ...r.pricing, price: r.pricing.basePrice }
        })));
      } else {
        setAvailable(true);
        setCarpools(buildCarpools(finalDist));
      }

      setLoading(false);
    };

    fetchDistance();
  }, [pickup, drop]);

  const handleBook = (ride) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    navigate("/booking", {
      state: {
        pickup, drop, date,
        rideType: "Carpool",
        price: ride.pricing.price,
        driver: ride.driver.name
      },
    });
  };

  // Google Maps embed (same working approach as RideResults)
  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(drop)}&mode=driving`;

  return (
    <div className="cr-page">
      <div className="cr-panel">
        <div className="cr-header">
          <div className="cr-route-summary">
            <div className="cr-point">
              <span className="dot start"></span>
              <span className="text">{pickup}</span>
            </div>
            <div className="cr-line"></div>
            <div className="cr-point">
              <span className="dot end"></span>
              <span className="text">{drop}</span>
            </div>
          </div>
          <div className="cr-meta-info">
            <span>📅 {date}</span>
            <span>📍 {distance.toFixed(1)} km</span>
            <span>🚗 {available ? `${carpools.length} rides available` : 'No rides'}</span>
          </div>
        </div>

        <div className="cr-list">
          {loading ? (
            <div className="cr-loading">
              <div className="cr-loading-spinner"></div>
              <p>Calculating distance & finding carpools...</p>
            </div>
          ) : !available ? (
            <div className="cr-unavailable">
              <span className="cr-unavailable-icon">⚠️</span>
              <h3>No Carpools Available</h3>
              <p>Distance is too far ({distance.toFixed(1)} km). Carpools are only available for routes under 100 km.</p>
              <button className="cr-back-btn" onClick={() => navigate("/")}>
                ← Go Back & Change Route
              </button>
            </div>
          ) : (
            carpools.map((ride) => (
              <div 
                key={ride.id} 
                className={`cr-card ${selected === ride.id ? 'active' : ''}`}
                onClick={() => setSelected(ride.id)}
              >
                <div className="cr-card-top">
                  <div className="cr-driver-info">
                    <span className="driver-avatar">{ride.driver.img}</span>
                    <div>
                      <h4>{ride.driver.name}</h4>
                      <span className="rating">⭐ {ride.driver.rating} • {ride.driver.rides} rides</span>
                    </div>
                  </div>
                  <div className="cr-price-info">
                    <span className="price">₹{ride.pricing.price}</span>
                    <span className="per-seat">per seat</span>
                  </div>
                </div>

                <div className="cr-card-details">
                  <div className="cr-time-info">
                    <div className="time-block">
                      <span className="time">{ride.time.departure}</span>
                      <span className="label">Departure</span>
                    </div>
                    <div className="duration-line">
                      <span>{ride.time.duration}</span>
                      <div className="arrow-line"></div>
                    </div>
                    <div className="time-block">
                      <span className="time">{ride.time.arrival}</span>
                      <span className="label">Arrival</span>
                    </div>
                  </div>

                  <div className="cr-bottom-row">
                    <div className="cr-vehicle">
                      <span>{ride.vehicle}</span>
                      <div className="features">
                        {ride.features.map(f => <span key={f} className="feature-tag">{f}</span>)}
                      </div>
                    </div>
                    <div className="cr-seats">
                      <span className="seats-count">{ride.pricing.seats} seats left</span>
                      <progress value={ride.pricing.totalSeats - ride.pricing.seats} max={ride.pricing.totalSeats}></progress>
                    </div>
                  </div>

                  {selected === ride.id && (
                    <button className="cr-book-btn" onClick={() => handleBook(ride)}>
                      Request to Join
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cr-map-container">
        <iframe
          title="Carpool route map"
          src={mapSrc}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <AuthGate
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        message="to request a carpool"
      />
    </div>
  );
}
