import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import "./RentalBooking.css";

function RentalBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  const [pickup, setPickup] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [hours, setHours] = useState(2); // 2, 4, 8, 12
  const [vehicleClass, setVehicleClass] = useState(state?.vehicleType || "hatchback"); // hatchback, sedan, suv
  
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  // Pricing calculation
  const getPrice = () => {
    if (!pickup) return null;
    let hourlyRate = 249; // hatchback
    if (vehicleClass === "sedan") hourlyRate = 399;
    if (vehicleClass === "suv") hourlyRate = 599;
    return hourlyRate * hours;
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

    if (!pickup || !date || !time) {
      setError("Please fill in the pickup location, date, and time.");
      return;
    }

    if (paymentMethod === "card") {
      setError("Please fill all card details");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < currentPrice) {
      setError("Insufficient Wallet balance to book this rental.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        pickup,
        drop: "Hourly Rental (Multi-stop)", 
        date,
        time,
        price: currentPrice,
        rideType: `Rental - ${hours} Hrs (${vehicleClass})`,
        paymentMethod,
        message: `Hourly Car Rental (${hours} Hours).`,
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
          title: "Rental Booked! ⏱️",
          message: `Your ${vehicleClass} is reserved for ${hours} hours starting ${date} at ${time}.`
        });

        addRide({
          id: result.booking?.id || `rn_${Date.now()}`,
          date,
          time,
          from: pickup,
          to: "Hourly Multi-stop",
          price: currentPrice,
          type: `Rental (${hours}H) - ${vehicleClass}`,
          status: "Confirmed"
        });

        const fakeNames = ["Abdul Khan", "Deepak Gupta", "Vijay Kumar", "Sanjay Singh"];
        const fakeCars = vehicleClass === "suv" ? ["Toyota Innova", "Mahindra Scorpio"] : vehicleClass === "sedan" ? ["Honda City", "Maruti Ciaz"] : ["Maruti Swift", "Hyundai i20"];
        
        setDriverDetails({
            name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
            carNo: "MH 12 " + Math.floor(1000 + Math.random() * 9000),
            carModel: fakeCars[Math.floor(Math.random() * fakeCars.length)],
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
                <div style={{ fontSize: "60px", marginBottom: "10px" }}>⏱️</div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginBottom: "8px" }}>Rental Confirmed!</h2>
                <p style={{ color: "#64748b", fontSize: "16px" }}>Your chauffeur has been booked for {hours} hours.</p>
            </div>
            
            <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "16px", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>Assigned Chauffeur Details</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#64748b" }}>Chauffeur Name</span>
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

            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
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

  // Use Place mode instead of Directions mode, since we only have a pickup location
  const mapSrc = pickup 
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(pickup)}&zoom=14`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=India&zoom=5`;

  return (
    <div className="rental-page-split">
      <div className="rental-panel">
        <div className="rental-header">
          <h1>Book an Hourly Rental</h1>
          <p>Keep a car and professional driver with you for the whole day.</p>
        </div>

        <form className="rental-form" onSubmit={handleSubmit}>
          
          {/* Logistics Basics */}
          <div className="rental-section">
            <h3>Starting Point & Time</h3>

            <div className="rental-row">
              <div className="rental-col">
                <label>Pickup Location</label>
                <LocationInput value={pickup} onChange={setPickup} placeholder="Where should the driver meet you?" />
              </div>
            </div>
            
            <div className="rental-row">
              <div className="rental-col">
                <label>Date</label>
                <input type="date" className="rental-input" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="rental-col">
                <label>Time</label>
                <input type="time" className="rental-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Hours Package */}
          <div className="rental-section">
            <h3>Rental Package</h3>
            <div className="hr-options">
              {[2, 4, 8, 12].map(h => (
                <div 
                  key={h} 
                  className={`hr-card ${hours === h ? "selected" : ""}`} 
                  onClick={() => setHours(h)}
                >
                  <div className="hr-val">{h} Hrs</div>
                  <div className="hr-label">{h * 10} km limit</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Class */}
          <div className="rental-section">
            <h3>Choose Vehicle</h3>
            <div className="v-options">
              <div className={`v-card ${vehicleClass === "hatchback" ? "selected" : ""}`} onClick={() => setVehicleClass("hatchback")}>
                <div className="v-icon">🚗</div>
                <div className="v-name">Hatchback</div>
                <div className="v-price">₹249/hr</div>
              </div>
              <div className={`v-card ${vehicleClass === "sedan" ? "selected" : ""}`} onClick={() => setVehicleClass("sedan")}>
                <div className="v-icon">🚘</div>
                <div className="v-name">Sedan</div>
                <div className="v-price">₹399/hr</div>
              </div>
              <div className={`v-card ${vehicleClass === "suv" ? "selected" : ""}`} onClick={() => setVehicleClass("suv")}>
                <div className="v-icon">🚙</div>
                <div className="v-name">Premium SUV</div>
                <div className="v-price">₹599/hr</div>
              </div>
            </div>
          </div>

          {/* Payment Configuration */}
          <div className="rental-section">
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
          <div className="rental-total">
            <span>Estimated Total</span>
            <strong>{currentPrice ? `₹${currentPrice.toLocaleString("en-IN")}` : "Enter locations..."}</strong>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

          <button type="submit" className="rental-submit" disabled={loading || paymentMethod === "card" || !currentPrice}>
            {loading ? "Processing..." : "Confirm Rental"}
          </button>
        </form>
      </div>

      <div className="rental-map">
        <iframe
          title="Pickup Location map"
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

export default RentalBooking;
