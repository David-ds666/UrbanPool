import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import "./CityBooking.css";

function CityBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  const [pickup, setPickup] = useState(state?.pickup || "");
  const [drop, setDrop] = useState(state?.drop || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [vehicleClass, setVehicleClass] = useState("sedan"); // hatchback, sedan, suv
  
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Logic to simulate city spacing
  const getPrice = () => {
    if (!pickup || !drop) return null;
    let base = 199;
    if (vehicleClass === "sedan") base = 299;
    if (vehicleClass === "suv") base = 499;
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
      setError("Insufficient Wallet balance to book this global city ride.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: user?.userId || user?.uid || "mock_user_1",
        pickup,
        drop,
        date,
        time,
        price: currentPrice,
        rideType: `Global City Ride (${vehicleClass})`,
        paymentMethod,
        message: "City explorer ride.",
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
          title: "City Ride Booked! 🏙️",
          message: `Your ${vehicleClass} is reserved for ${date} at ${time}.`
        });

        addRide({
          id: result.id || `ct_${Date.now()}`,
          date,
          time,
          from: pickup,
          to: drop,
          price: currentPrice,
          type: `City Ride - ${vehicleClass}`,
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
    <div className="city-page">
      <div className="city-header">
        <h1>Global City Explorer</h1>
        <p>Book a ride in any of our 15,000+ supported cities worldwide.</p>
      </div>

      <form className="city-form" onSubmit={handleSubmit}>
        
        {/* Logistics Basics */}
        <div className="city-section">
          <h3>Your Journey</h3>

          <div className="city-row">
            <div className="city-col">
              <label>Pickup Location</label>
              <LocationInput value={pickup} onChange={setPickup} placeholder="Where are you starting?" />
            </div>
          </div>
          <div className="city-row">
            <div className="city-col">
              <label>Destination</label>
              <LocationInput value={drop} onChange={setDrop} placeholder="Where are you heading?" />
            </div>
          </div>
          
          <div className="city-row">
            <div className="city-col">
              <label>Date</label>
              <input type="date" className="city-input" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="city-col">
              <label>Time</label>
              <input type="time" className="city-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Vehicle Class */}
        <div className="city-section">
          <h3>Choose Vehicle</h3>
          <div className="v-options">
            <div className={`v-card ${vehicleClass === "hatchback" ? "selected" : ""}`} onClick={() => setVehicleClass("hatchback")}>
              <div className="v-icon">🚗</div>
              <div className="v-name">Compact</div>
              <div className="v-price">Affordable & Quick</div>
            </div>
            <div className={`v-card ${vehicleClass === "sedan" ? "selected" : ""}`} onClick={() => setVehicleClass("sedan")}>
              <div className="v-icon">🚘</div>
              <div className="v-name">Downtown Sedan</div>
              <div className="v-price">Spacious & Smooth</div>
            </div>
            <div className={`v-card ${vehicleClass === "suv" ? "selected" : ""}`} onClick={() => setVehicleClass("suv")}>
              <div className="v-icon">🚙</div>
              <div className="v-name">Urban SUV</div>
              <div className="v-price">Premium Comfort</div>
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="city-section">
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
        <div className="city-total">
          <span>Estimated Total</span>
          <strong>{currentPrice ? `₹${currentPrice}` : "Enter locations..."}</strong>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

        <button type="submit" className="city-submit" disabled={loading}>
          {loading ? "Processing..." : "Confirm City Ride"}
        </button>
      </form>
    </div>
  );
}

export default CityBooking;
