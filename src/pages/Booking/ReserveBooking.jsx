import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import { calculateRidePrice } from "../../utils/pricing";
import "./ReserveBooking.css";

const RIDE_TYPES = [
  { id: "pool", icon: "🚗", name: "UrbanPool", desc: "Shared · 2-3 riders", capacity: "1-3" },
  { id: "go", icon: "🚙", name: "UrbanGo", desc: "Affordable solo rides", capacity: "1-4" },
  { id: "xl", icon: "🚐", name: "UrbanXL", desc: "Extra space for groups", capacity: "1-6" },
  { id: "premier", icon: "✨", name: "Premier", desc: "Top-rated drivers · luxury", capacity: "1-4" },
  { id: "electric", icon: "⚡", name: "UrbanEV", desc: "Zero-emission electric rides", capacity: "1-4" },
  { id: "bike", icon: "🏍️", name: "Bike", desc: "Quick & affordable", capacity: "1" },
];

function ReserveBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState(state?.date || "");
  const [time, setTime] = useState(state?.time || "");
  const [driverMessage, setDriverMessage] = useState("");
  const [vehicleClass, setVehicleClass] = useState("go");
  
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [pricingMap, setPricingMap] = useState({});
  const [calculatingPricing, setCalculatingPricing] = useState(false);
  const [distance, setDistance] = useState(0);

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
    if (!pickup || !drop) return;
    
    const delayDebounceFn = setTimeout(async () => {
      setCalculatingPricing(true);
      try {
        const prices = {};
        let finalDistance = 0;
        
        await Promise.all(RIDE_TYPES.map(async (type) => {
          const data = await calculateRidePrice(type.id, pickup, drop);
          if (data.distance !== undefined) finalDistance = parseFloat(data.distance);
          prices[type.id] = data;
        }));
        
        setPricingMap(prices);
        setDistance(finalDistance);
      } catch (err) {
        console.error("Pricing calculation failed:", err);
      } finally {
        setCalculatingPricing(false);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(delayDebounceFn);
  }, [pickup, drop]);

  const currentPricingInfo = pricingMap[vehicleClass];
  const currentPrice = currentPricingInfo?.price || null;
  const isDistanceValid = currentPricingInfo?.available !== false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pickup || !drop || !date || !time) {
      setError("Please fill in all location and time fields.");
      return;
    }

    if (!currentPrice || !isDistanceValid) {
      setError("Please select valid locations to calculate price.");
      return;
    }

    if (paymentMethod === "card") {
        setError("Please fill all card details");
        return;
    }

    if (paymentMethod === "wallet" && walletBalance < currentPrice) {
      setError("Insufficient Wallet balance to reserve this ride.");
      return;
    }

    setLoading(true);

    try {
      const selectedType = RIDE_TYPES.find(t => t.id === vehicleClass);
      
      const payload = {
        pickup,
        drop,
        date,
        time,
        price: currentPrice,
        rideType: `Reserve (${selectedType?.name})`,
        paymentMethod,
        message: driverMessage,
        status: "Reserved"
      };

      const { saveBooking } = await import("../../services/bookingService.js");
      const result = await saveBooking(user?.userId || user?.uid || "mock_user_1", payload);

      if (result && result.success) {
        if (paymentMethod === 'wallet') {
          setWalletBalance(prev => prev - currentPrice);
        }

        addNotification({
          type: "success",
          title: "Reservation Confirmed! 📅",
          message: `Your ${selectedType?.name} is reserved for ${date} at ${time}.`
        });

        addRide({
          id: result.booking?.id || `res_${Date.now()}`,
          date,
          time,
          from: pickup,
          to: drop,
          price: currentPrice,
          type: `Reserve - ${selectedType?.name}`,
          status: "Upcoming"
        });

        const fakeNames = ["Rajesh Kumar", "Amit Singh", "Sunil Sharma", "Vikram Patel", "Gurpreet Singh"];
        const fakeCars = ["White Dzire", "Silver Innova", "White Ertiga", "Grey Verna", "White WagonR"];
        setDriverDetails({
            name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
            carNo: "PB 01 AB " + Math.floor(1000 + Math.random() * 9000),
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateConfig = tomorrow.toISOString().split("T")[0];

  if (success) {
      return (
        <div className="bk-container" style={{ margin: "40px auto", maxWidth: "600px", padding: "30px", background: "#fff", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <div style={{ fontSize: "60px", marginBottom: "10px" }}>✅</div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginBottom: "8px" }}>Reservation Successful!</h2>
                <p style={{ color: "#64748b", fontSize: "16px" }}>Your scheduled ride has been confirmed.</p>
            </div>
            
            <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "16px", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>Assigned Driver Details</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#64748b" }}>Driver Name</span>
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
    <div className="reserve-page-split">
      <div className="reserve-panel">
        <div className="reserve-header" style={{ marginBottom: "20px" }}>
          <h1>Schedule your ride in advance</h1>
          <p>Book up to 30 days ahead with guaranteed flat-rate pricing.</p>
        </div>

        <form className="reserve-form" onSubmit={handleSubmit}>
          
          {/* Route Details */}
          <div className="reserve-section">
            <h3>Route Details</h3>
            <div className="reserve-row">
              <div className="reserve-col">
                <label>Pickup Location</label>
                <LocationInput value={pickup} onChange={setPickup} placeholder="Enter pickup" />
              </div>
            </div>
            <div className="reserve-row">
              <div className="reserve-col">
                <label>Dropoff Location</label>
                <LocationInput value={drop} onChange={setDrop} placeholder="Enter destination" />
              </div>
            </div>

            {distance > 0 && (
               <div style={{ marginTop: "16px", color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                   📍 <strong>Distance:</strong> {distance} km
               </div>
            )}
          </div>

          {/* Schedule & Notes */}
          <div className="reserve-section">
            <h3>Schedule & Instructions</h3>
            <div className="reserve-row">
              <div className="reserve-col">
                <label>Pickup Date</label>
                <input type="date" className="reserve-input" value={date} min={minDateConfig} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="reserve-col">
                <label>Pickup Time</label>
                <input type="time" className="reserve-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="reserve-row">
              <div className="reserve-col">
                <label>Message for Driver (Optional)</label>
                <textarea 
                  className="reserve-input" 
                  placeholder="E.g., I have two large suitcases. Please call upon arrival." 
                  value={driverMessage}
                  onChange={(e) => setDriverMessage(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Class Options */}
          <div className="reserve-section">
            <h3>Choose a vehicle</h3>
            <div className="reserve-vehicles" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              {calculatingPricing ? (
                   <div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px" }}>Calculating prices and availability...</div>
              ) : pickup && drop && !pricingMap["go"] ? (
                   <div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px" }}>Waiting for route data...</div>
              ) : pickup && drop ? (
                 RIDE_TYPES.map((type) => {
                     const info = pricingMap[type.id];
                     const priceDisplay = info ? (info.available ? `₹${info.price}` : "Unavailable") : "—";
                     const isUnavailable = info && info.available === false;

                     return (
                         <div 
                           key={type.id} 
                           className={`vehicle-card ${vehicleClass === type.id ? "selected" : ""} ${isUnavailable ? "unavailable" : ""}`} 
                           onClick={() => { if (!isUnavailable) setVehicleClass(type.id); }}
                           style={{ 
                               display: "flex", alignItems: "center", padding: "16px", background: vehicleClass === type.id ? "#f1f5f9" : "#fff", 
                               border: `2px solid ${vehicleClass === type.id ? "#000" : "#e2e8f0"}`, borderRadius: "16px",
                               cursor: isUnavailable ? "not-allowed" : "pointer", opacity: isUnavailable ? 0.5 : 1, transition: "all 0.2s"
                           }}
                         >
                             <span style={{ fontSize: "32px", marginRight: "16px" }}>{type.icon}</span>
                             <div style={{ flex: 1 }}>
                                 <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700" }}>{type.name}</h4>
                                 <p style={{ margin: "0", fontSize: "13px", color: "#64748b" }}>{type.desc} • {type.capacity} seats</p>
                             </div>
                             <div style={{ fontWeight: "800", fontSize: "18px", color: isUnavailable ? "#94a3b8" : "#000" }}>
                                 {priceDisplay}
                             </div>
                         </div>
                     )
                 })
              ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px" }}>Please enter pickup and dropoff locations to see options.</div>
              )}
            </div>
          </div>

          {/* Payment Configuration Mirroring Booking jsx */}
          <div className="reserve-section">
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
          <div className="reserve-total" style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "800", padding: "24px 0", borderTop: "2px solid #e2e8f0", marginTop: "16px" }}>
            <span>Estimated Total</span>
            <strong>{currentPrice ? `₹${currentPrice}` : "—"}</strong>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "20px", textAlign: "center", fontSize: "15px", fontWeight: "600", background: "#fef2f2", padding: "12px", borderRadius: "8px" }}>{error}</div>}

          <button 
             type="submit" 
             className="reserve-submit" 
             disabled={loading || calculatingPricing || paymentMethod === "card" || !isDistanceValid || !currentPrice || !pickup || !drop}
             style={{ width: "100%", padding: "18px", fontSize: "16px", fontWeight: "700", background: (loading || calculatingPricing || paymentMethod === "card" || !isDistanceValid || !currentPrice || !pickup || !drop) ? "#94a3b8" : "#000", color: "#fff", border: "none", borderRadius: "12px", cursor: (loading || calculatingPricing || paymentMethod === "card" || !isDistanceValid || !currentPrice || !pickup || !drop) ? "not-allowed" : "pointer", transition: "background 0.2s" }}
          >
            {loading ? "Processing..." : calculatingPricing ? "Calculating Prices..." : "Confirm Reservation"}
          </button>
        </form>
      </div>

      <div className="reserve-map" style={{ flex: 1, minHeight: "100vh", position: "sticky", top: 0 }}>
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

export default ReserveBooking;
