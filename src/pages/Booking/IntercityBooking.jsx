import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import { calculateDistanceAsync } from "../../utils/distance";
import "./IntercityBooking.css";

function IntercityBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  // If navigated from Popular Routes, state will contain pre-filled data
  const [pickup, setPickup] = useState(state?.pickup || "");
  const [drop, setDrop] = useState(state?.drop || "");
  
  const [tripType, setTripType] = useState("oneway"); // oneway, roundtrip
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [vehicleClass, setVehicleClass] = useState("sedan"); // sedan, suv
  
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);

  const [distance, setDistance] = useState(0);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);

  const today = new Date().toISOString().split("T")[0];

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

  // Base pricing logic
  const getPrice = () => {
    if (!pickup || !drop) return null;
    
    let ratePerKm = vehicleClass === "suv" ? 20 : 14;
    // Add passenger premium (e.g., 50rs per extra passenger above 1)
    if (passengers > 1) ratePerKm += ((passengers - 1) * 2); // Actually 2rs extra per km

    let totalDist = distance;
    if (tripType === "roundtrip") {
       totalDist = totalDist * 2;
    }
    
    // If distance wasn't loaded but we have state.price from popular route
    if (!distance && state?.price) {
        let base = state.price;
        if (vehicleClass === "suv") base = base * 1.5;
        if (tripType === "roundtrip") base = base * 2;
        if (passengers > 1) base += ((passengers - 1) * 50);
        return Math.round(base);
    }
    
    if (totalDist > 0) {
        const base = totalDist * ratePerKm;
        return Math.round(Math.max(base, vehicleClass === "suv" ? 2000 : 1500));
    }
    return null;
  };

  const currentPrice = getPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pickup || !drop || !date || !time) {
      setError("Please fill in all location and time fields.");
      return;
    }
    
    if (tripType === "roundtrip" && !returnDate) {
      setError("Please specify a return date for round trips.");
      return;
    }

    if (paymentMethod === "card") {
      setError("Please fill all card details");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < currentPrice) {
      setError("Insufficient Wallet balance to book this outstation trip.");
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
        date,
        time,
        price: currentPrice,
        rideType: `Intercity (${tripType}) - ${vehicleClass}`,
        paymentMethod,
        message: `Passengers: ${passengers}. Return: ${returnDate || 'N/A'}`,
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
          title: "Intercity Booked! 🛣️",
          message: `Your ${vehicleClass} is scheduled to ${drop} on ${date}.`
        });

        addRide({
          id: result.booking?.id || `ic_${Date.now()}`,
          date,
          time,
          from: pickup,
          to: drop,
          price: currentPrice,
          type: `Intercity - ${vehicleClass}`,
          status: "Confirmed"
        });

        const fakeNames = ["Ramesh Kumar", "Vikram Singh", "Suresh Sharma", "Anil Patel", "Rajesh Y"];
        const fakeCars = vehicleClass === "suv" ? ["Toyota Innova", "Mahindra XUV", "Tata Safari", "Maruti Ertiga"] : ["Honda City", "Maruti Dzire", "Hyundai Verna", "Tata Tigor"];
        setDriverDetails({
            name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
            carNo: "DL 1Z " + Math.floor(1000 + Math.random() * 9000),
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
                <div style={{ fontSize: "60px", marginBottom: "10px" }}>✅</div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginBottom: "8px" }}>Trip Booked!</h2>
                <p style={{ color: "#64748b", fontSize: "16px" }}>Your intercity chauffeur has been assigned.</p>
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
                    <strong style={{ fontSize: "15px" }}>{driverDetails?.carModel} ({vehicleClass === "suv" ? "SUV" : "Sedan"})</strong>
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
    <div className="intercity-page-split">
      <div className="intercity-panel">
        <div className="intercity-header">
          <h1>Book an Outstation Trip</h1>
          <p>Premium intercity transfers across India with trusted chauffeurs.</p>
        </div>

        <form className="intercity-form" onSubmit={handleSubmit}>
          
          {/* Route Details */}
          <div className="intercity-section">
            <h3>Your Journey</h3>
            
            <div className="trip-type-toggle">
              <button 
                type="button" 
                className={`trip-type-btn ${tripType === "oneway" ? "active" : ""}`}
                onClick={() => setTripType("oneway")}
              >One Way</button>
              <button 
                type="button" 
                className={`trip-type-btn ${tripType === "roundtrip" ? "active" : ""}`}
                onClick={() => setTripType("roundtrip")}
              >Round Trip</button>
            </div>

            <div className="intercity-row">
              <div className="intercity-col">
                <label>From</label>
                <LocationInput value={pickup} onChange={setPickup} placeholder="Starting city" />
              </div>
            </div>
            <div className="intercity-row">
              <div className="intercity-col">
                <label>To</label>
                <LocationInput value={drop} onChange={setDrop} placeholder="Destination city" />
              </div>
            </div>

            {distance > 0 && (
               <div style={{ marginTop: "16px", color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                   📍 <strong>Base Distance:</strong> {distance} km
               </div>
            )}
          </div>

          {/* Schedule */}
          <div className="intercity-section">
            <h3>Schedule</h3>
            <div className="intercity-row">
              <div className="intercity-col">
                <label>Departure Date</label>
                <input type="date" className="intercity-input" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
              </div>
              {tripType === "roundtrip" && (
                <div className="intercity-col">
                  <label>Return Date</label>
                  <input type="date" className="intercity-input" value={returnDate} min={date || today} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
              )}
              <div className="intercity-col">
                <label>Departure Time</label>
                <input type="time" className="intercity-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Vehicle Class & Passengers */}
          <div className="intercity-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
               <h3 style={{ margin: 0 }}>Vehicle Option</h3>
               <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                 <label style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563" }}>Passengers:</label>
                 <input type="number" min="1" max={vehicleClass === "suv" ? "6" : "4"} 
                   className="intercity-input" 
                   style={{ width: "60px", padding: "6px" }} 
                   value={passengers} 
                   onChange={(e) => setPassengers(Number(e.target.value))} />
               </div>
            </div>
            
            <div className="vehicle-options">
              <div className={`vehicle-card ${vehicleClass === "sedan" ? "selected" : ""}`} onClick={() => { setVehicleClass("sedan"); if (passengers > 4) setPassengers(4); }}>
                <div className="vehicle-icon">🚘</div>
                <div className="vehicle-name">Sedan (AC)</div>
                <div className="vehicle-price">Comfort for up to 4</div>
              </div>
              <div className={`vehicle-card ${vehicleClass === "suv" ? "selected" : ""}`} onClick={() => setVehicleClass("suv")}>
                <div className="vehicle-icon">🚙</div>
                <div className="vehicle-name">Premium SUV</div>
                <div className="vehicle-price">Extra luggage, up to 6</div>
              </div>
            </div>
          </div>

          {/* Payment Configuration */}
          <div className="intercity-section">
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
          <div className="intercity-total">
            <span>Estimated Total</span>
            <strong>{calculatingPricing ? "Calculating..." : currentPrice ? `₹${currentPrice.toLocaleString("en-IN")}` : "Enter locations..."}</strong>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

          <button type="submit" className="intercity-submit" disabled={loading || calculatingPricing || paymentMethod === "card" || !currentPrice}>
            {loading ? "Processing..." : calculatingPricing ? "Calculating..." : "Confirm Intercity Trip"}
          </button>
        </form>
      </div>

      <div className="intercity-map">
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

export default IntercityBooking;
