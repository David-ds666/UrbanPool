import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import "./AirportBooking.css";

function AirportBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  const [direction, setDirection] = useState("to_airport"); // 'to_airport' or 'from_airport'
  
  const [pickup, setPickup] = useState(state?.pickup || "");
  const [drop, setDrop] = useState(state?.drop || "");
  const [flightNumber, setFlightNumber] = useState("");
  
  const [vehicleClass, setVehicleClass] = useState("hatchback"); // hatchback, sedan, suv
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Pricing calculation
  const getPrice = () => {
    if (!pickup || !drop) return null;
    let base = 399; // hatchback airport base
    if (vehicleClass === "sedan") base = 499;
    if (vehicleClass === "suv") base = 799;
    return base;
  };

  const currentPrice = getPrice();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const userId = user?.userId || user?.uid || "mock_user_1";
        const res = await fetch(`http://localhost:5001/api/wallet/${userId}`);
        const data = await res.json();
        setWalletBalance(data.balance || 0);
      } catch (err) {}
    };
    if (user) fetchWallet();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pickup || !drop || !date || !time) {
      setError("Please fill in pickup, drop-off, date, and time.");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < currentPrice) {
      setError("Insufficient Wallet balance to book this airport ride.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: user?.userId || user?.uid || "mock_user_1",
        pickup: direction === "to_airport" ? pickup : "✈️ " + pickup,
        drop: direction === "from_airport" ? drop : "✈️ " + drop,
        date,
        time,
        price: currentPrice,
        rideType: `Airport Transfer (${vehicleClass})`,
        paymentMethod,
        message: flightNumber ? `Flight: ${flightNumber}` : "Airport Transfer.",
        status: "Confirmed"
      };

      const res = await fetch("http://localhost:5001/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        addNotification({
          type: "success",
          title: "Airport Ride Confirmed! ✈️",
          message: `Your ${vehicleClass} is scheduled for ${date} at ${time}.`
        });

        addRide({
          id: result.id || `ap_${Date.now()}`,
          date,
          time,
          from: payload.pickup,
          to: payload.drop,
          price: currentPrice,
          type: `Airport - ${vehicleClass}`,
          status: "Confirmed"
        });

        navigate("/");
      } else {
        setError(result.error || "Failed to make reservation.");
      }
    } catch (err) {
      setError("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="airport-page">
      <div className="airport-header">
        <h1>Book an Airport Transfer</h1>
        <p>Reliable rides to and from 700+ major airports.</p>
      </div>

      <form className="airport-form" onSubmit={handleSubmit}>
        
        {/* Direction Toggle */}
        <div className="airport-toggle">
          <button 
            type="button" 
            className={`airport-toggle-btn ${direction === "to_airport" ? "active" : ""}`} 
            onClick={() => setDirection("to_airport")}
          >
            Going to Airport
          </button>
          <button 
            type="button" 
            className={`airport-toggle-btn ${direction === "from_airport" ? "active" : ""}`} 
            onClick={() => setDirection("from_airport")}
          >
            Leaving Airport
          </button>
        </div>

        {/* Logistics */}
        <div className="airport-section">
          <h3>Locations</h3>

          {direction === "to_airport" ? (
            <>
              <div className="airport-row">
                <div className="airport-col">
                  <label>Pickup Location</label>
                  <LocationInput value={pickup} onChange={setPickup} placeholder="Enter your current location" />
                </div>
              </div>
              <div className="airport-row">
                <div className="airport-col">
                  <label>Airport</label>
                  <LocationInput value={drop} onChange={setDrop} placeholder="Enter airport name or code (e.g. JFK)" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="airport-row">
                <div className="airport-col">
                  <label>Airport</label>
                  <LocationInput value={pickup} onChange={setPickup} placeholder="Enter arriving airport" />
                </div>
              </div>
              <div className="airport-row">
                <div className="airport-col">
                  <label>Destination</label>
                  <LocationInput value={drop} onChange={setDrop} placeholder="Enter your destination" />
                </div>
              </div>
            </>
          )}

          <div className="airport-row">
            <div className="airport-col">
              <label>Flight Number (Optional)</label>
              <input 
                type="text" 
                className="airport-input" 
                placeholder="e.g. BA284" 
                value={flightNumber} 
                onChange={(e) => setFlightNumber(e.target.value)} 
              />
              <div className="flight-note">We'll track your flight and automatically adjust your pickup time if there are delays.</div>
            </div>
          </div>
          
          <div className="airport-row">
            <div className="airport-col">
              <label>Date</label>
              <input type="date" className="airport-input" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="airport-col">
              <label>Time</label>
              <input type="time" className="airport-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Vehicle Class */}
        <div className="airport-section">
          <h3>Luggage & Vehicle</h3>
          <div className="v-options">
            <div className={`v-card ${vehicleClass === "hatchback" ? "selected" : ""}`} onClick={() => setVehicleClass("hatchback")}>
              <div className="v-icon">🚗</div>
              <div className="v-name">Standard</div>
              <div className="v-price">1-2 Bags · ₹399 base</div>
            </div>
            <div className={`v-card ${vehicleClass === "sedan" ? "selected" : ""}`} onClick={() => setVehicleClass("sedan")}>
              <div className="v-icon">🚘</div>
              <div className="v-name">Sedan</div>
              <div className="v-price">3-4 Bags · ₹499 base</div>
            </div>
            <div className={`v-card ${vehicleClass === "suv" ? "selected" : ""}`} onClick={() => setVehicleClass("suv")}>
              <div className="v-icon">🚙</div>
              <div className="v-name">SUV</div>
              <div className="v-price">5+ Bags · ₹799 base</div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="airport-section">
          <h3>Payment Method</h3>
          <div className="bk-pay-options" style={{ marginBottom: "16px" }}>
            <label className={`bk-pay-option ${paymentMethod === "wallet" ? "bk-pay-selected" : ""}`}>
              <input type="radio" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} /> UrbanPool Wallet
            </label>
            <label className={`bk-pay-option ${paymentMethod === "cash" ? "bk-pay-selected" : ""}`}>
              <input type="radio" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} /> Cash
            </label>
            <label className={`bk-pay-option ${paymentMethod === "upi" ? "bk-pay-selected" : ""}`}>
              <input type="radio" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI
            </label>
          </div>

          {paymentMethod === "wallet" && (
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600" }}>
                <span>Wallet Balance:</span>
                <span style={{ color: walletBalance >= (currentPrice || 0) ? "#10b981" : "#ef4444" }}>₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="airport-total">
          <span>Estimated Total</span>
          <strong>{currentPrice ? `₹${currentPrice}` : "Enter locations..."}</strong>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

        <button type="submit" className="airport-submit" disabled={loading}>
          {loading ? "Processing..." : "Confirm Airport Ride"}
        </button>
      </form>
    </div>
  );
}

export default AirportBooking;
