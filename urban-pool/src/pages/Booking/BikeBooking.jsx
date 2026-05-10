import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import { calculateDistanceAsync } from "../../utils/distance";
import "./BikeBooking.css";

function BikeBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  // If navigated from Quick Book on the Bike service page, state contains pre-filled data
  const [pickup, setPickup] = useState(state?.pickup || "");
  const [drop, setDrop] = useState(state?.drop || "");
  
  const [bikeType, setBikeType] = useState("standard"); // standard, ev
  
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);

  const [distance, setDistance] = useState(0);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);

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

  // Debounce pricing calculation when route changes
  useEffect(() => {
    if (!pickup || !drop) {
        setDistance(0);
        return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setCalculatingPricing(true);
      try {
        const dist = await calculateDistanceAsync(pickup, drop);
        setDistance(dist || 0);
      } catch (err) {
        console.error("Distance calculation failed:", err);
      } finally {
        setCalculatingPricing(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [pickup, drop]);

  // Base pricing logic for bikes
  const getPrice = () => {
    if (!pickup || !drop) return null;
    let base = 49; 
    let perKm = 5;
    
    if (bikeType === "ev") { base = 39; perKm = 3; }
    
    if (distance > 0) {
      return Math.round(base + (distance * perKm));
    }
    return base; // flat base rate if distance is 0
  };

  const currentPrice = getPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pickup || !drop) {
      setError("Please fill in both pickup and drop-off locations.");
      return;
    }

    if (paymentMethod === "card") {
      setError("Please fill all card details");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < currentPrice) {
      setError("Insufficient Wallet balance to book this ride.");
      return;
    }

    if (!currentPrice && calculatingPricing) {
        setError("Still calculating price. Please wait.");
        return;
    }

    setLoading(true);

    try {
      const payload = {
        pickup,
        drop,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" }),
        price: currentPrice,
        rideType: `Bike (${bikeType === "standard" ? "Moto" : "EV Scooter"})`,
        paymentMethod,
        message: "Bike ride.",
        status: "Confirmed"
      };

      const { saveBooking } = await import("../../services/bookingService.js");
      const result = await saveBooking(user?.userId || user?.uid || "mock_user_1", payload);

      if (result && result.success) {
        if (paymentMethod === 'wallet') {
          setWalletBalance(prev => prev - currentPrice);
        }

        addNotification({
          type: "success",
          title: "Bike Booked! 🛵",
          message: `Your ${bikeType === "standard" ? "Standard Moto" : "Electric Scooter"} rider is on the way.`
        });

        addRide({
          id: result.booking?.id || `bk_${Date.now()}`,
          date: payload.date,
          time: payload.time,
          from: pickup,
          to: drop,
          price: currentPrice,
          type: `Bike - ${bikeType === "standard" ? "Moto" : "EV"}`,
          status: "Confirmed"
        });

        const fakeNames = ["Suraj K", "Rajesh Kumar", "Amit T", "Nitin Y"];
        const fakeBikes = bikeType === "ev" ? ["Ather 450X", "Ola S1 Pro", "Bajaj Chetak EV"] : ["Hero Splendor", "TVS Apache", "Honda Shine"];
        
        setDriverDetails({
            name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
            carNo: "KA 05 " + Math.floor(1000 + Math.random() * 9000),
            carModel: fakeBikes[Math.floor(Math.random() * fakeBikes.length)],
            mobile: "+91 " + Math.floor(9000000000 + Math.random() * 999999999), 
        });

        setSuccess(true);
      } else {
        setError(result?.error || "Failed to make reservation.");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="bk-container" style={{ margin: "40px auto", maxWidth: "600px", padding: "30px", background: "#fff", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <div style={{ fontSize: "60px", marginBottom: "10px" }}>🏍️</div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginBottom: "8px" }}>Driver on the way!</h2>
                <p style={{ color: "#64748b", fontSize: "16px" }}>Your bike partner has been assigned and is heading to your locatiom.</p>
            </div>
            
            <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "16px", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>Assigned Rider Details</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#64748b" }}>Rider Name</span>
                    <strong style={{ fontSize: "15px" }}>{driverDetails?.name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#64748b" }}>Mobile Number</span>
                    <strong style={{ fontSize: "15px" }}>{driverDetails?.mobile}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#64748b" }}>Vehicle</span>
                    <strong style={{ fontSize: "15px" }}>{driverDetails?.carModel}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>License Plate</span>
                    <strong style={{ fontSize: "15px", backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>{driverDetails?.carNo}</strong>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <button 
                  onClick={() => navigate("/")}
                  style={{ background: "#000", color: "#fff", padding: "14px 32px", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}
                >
                    Back to Home
                </button>
            </div>
        </div>
      );
  }

  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(pickup || "India")}&destination=${encodeURIComponent(drop || "India")}&mode=driving`;

  return (
    <div className="bike-page-split">
      <div className="bike-panel">
        <div className="bike-header">
          <h1>Book a Bike Ride</h1>
          <p>The fastest way to beat the city traffic.</p>
        </div>

        <form className="bike-form" onSubmit={handleSubmit}>
          
          {/* Logistics Basics */}
          <div className="bike-section">
            <h3>Where are you riding?</h3>

            <div className="bike-row">
              <div className="bike-col">
                <label>Pickup Location</label>
                <LocationInput value={pickup} onChange={setPickup} placeholder="Enter your current location" />
              </div>
            </div>
            <div className="bike-row">
              <div className="bike-col">
                <label>Destination</label>
                <LocationInput value={drop} onChange={setDrop} placeholder="Where to?" />
              </div>
            </div>
            {distance > 0 && (
               <div style={{ marginTop: "16px", color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                   📍 <strong>Distance:</strong> {distance} km
               </div>
            )}
          </div>

          {/* Vehicle Class */}
          <div className="bike-section">
            <h3>Choose 2-Wheeler</h3>
            <div className="bike-options">
              <div className={`bike-card ${bikeType === "standard" ? "selected" : ""}`} onClick={() => setBikeType("standard")}>
                <div className="bike-icon">🏍️</div>
                <div className="bike-name">Standard Moto</div>
                <div className="bike-price">Fast & Reliable · ₹49 base</div>
              </div>
              <div className={`bike-card ${bikeType === "ev" ? "selected" : ""}`} onClick={() => setBikeType("ev")}>
                <div className="bike-icon">🛵</div>
                <div className="bike-name">EV Scooter</div>
                <div className="bike-price">Eco-Friendly · ₹39 base</div>
              </div>
            </div>
          </div>

          {/* Payment Configuration */}
          <div className="bike-section">
            <h3>Payment Method</h3>
            <div className="bk-pay-options" style={{ marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className={`bk-pay-option ${paymentMethod === 'wallet' ? 'bk-pay-selected' : ''}`} style={{ border: `1px solid ${paymentMethod === 'wallet' ? '#000' : '#e2e8f0'}`, padding: "14px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="radio" name="pay" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} style={{ margin: 0 }} /> UrbanPool Wallet
              </label>
              <label className={`bk-pay-option ${paymentMethod === 'cash' ? 'bk-pay-selected' : ''}`} style={{ border: `1px solid ${paymentMethod === 'cash' ? '#000' : '#e2e8f0'}`, padding: "14px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} style={{ margin: 0 }} /> Cash
              </label>
              <label className={`bk-pay-option ${paymentMethod === 'upi' ? 'bk-pay-selected' : ''}`} style={{ border: `1px solid ${paymentMethod === 'upi' ? '#000' : '#e2e8f0'}`, padding: "14px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="radio" name="pay" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} style={{ margin: 0 }} /> UPI / QR
              </label>
              <label className={`bk-pay-option ${paymentMethod === 'card' ? 'bk-pay-selected' : ''}`} style={{ border: `1px solid ${paymentMethod === 'card' ? '#000' : '#e2e8f0'}`, padding: "14px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ margin: 0 }} /> Card
              </label>
            </div>

            <div style={{ marginTop: "16px" }}>
                {paymentMethod === 'wallet' && (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontSize: "14px", fontWeight: "600", color: "#334155"}}>Available Balance:</span>
                      <span style={{fontSize: "18px", fontWeight: "700", color: walletBalance >= (currentPrice || 0) ? "#10b981" : "#ef4444"}}>
                        ₹{walletBalance.toFixed(2)}
                      </span>
                    </div>
                    {currentPrice && walletBalance < currentPrice && (
                      <p style={{color: '#ef4444', fontSize: '13px', marginTop: '8px'}}>
                        Insufficient funds! Add money to your wallet before booking.
                      </p>
                    )}
                  </div>
                )}
                {paymentMethod === 'upi' && (
                  <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', textAlign: "center" }}>
                    <div style={{ border: "2px solid #e2e8f0", padding: "16px", borderRadius: "12px", display: "inline-block", background: "#fff" }}>
                        <img src="/qr-payment.jpg" alt="Scan to pay" style={{ width: "160px", height: "160px", objectFit: "contain" }} 
                             onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div style={{ display: "none", width: "160px", height: "160px", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: "8px", fontWeight: "600", color: "#94a3b8" }}>
                          QR Code
                        </div>
                    </div>
                    <div style={{ marginTop: "16px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                        Scan securely with any UPI App
                      </span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        After scanning and paying, click Confirm below!
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={{ textAlign: "center", padding: "24px", color: "#64748b", background: "#f8fafc", borderRadius: "12px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "500" }}>💳 Credit/Debit Card payments are coming soon! Please select Cash or UPI / QR.</span>
                  </div>
                )}
            </div>
          </div>

          {/* Summary & Checkout */}
          <div className="bike-total">
            <span>Estimated Total</span>
            <strong>{calculatingPricing ? "Calculating..." : currentPrice ? `₹${currentPrice}` : "Enter locations..."}</strong>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

          <button type="submit" className="bike-submit" disabled={loading || calculatingPricing || paymentMethod === "card" || !currentPrice}>
            {loading ? "Processing..." : calculatingPricing ? "Calculating..." : "Confirm Bike Ride"}
          </button>
        </form>
      </div>

      <div className="bike-map">
        <iframe
          title="Route map"
          src={mapSrc}
          style={{ width: "100%", height: "100%", border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

export default BikeBooking;
