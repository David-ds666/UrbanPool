import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import { calculateDistanceAsync } from "../../utils/distance";
import "./CourierBooking.css";

function CourierBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();

  // If navigated from Package Classes, state will contain pre-filled data
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [packageNotes, setPackageNotes] = useState("");
  const [pkgType, setPkgType] = useState(state?.pkgType || "documents"); // documents, smallbox, largeparcel
  
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

  // Base pricing logic for courier
  const getPrice = () => {
    if (!pickup || !drop) return null;
    let base = 50; 
    let perKm = 10;
    
    if (pkgType === "smallbox") { base = 120; perKm = 15; }
    if (pkgType === "largeparcel") { base = 250; perKm = 25; }
    
    if (distance > 0) {
      return Math.round(base + (distance * perKm));
    }
    return base; // flat base rate if distance is 0
  };

  const currentPrice = getPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pickup || !drop || !receiverName || !receiverPhone) {
      setError("Please fill in all location and receiver contact fields.");
      return;
    }

    if (paymentMethod === "card") {
      setError("Please fill all card details");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < currentPrice) {
      setError("Insufficient Wallet balance to book this delivery.");
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
        rideType: `Courier (${pkgType})`,
        paymentMethod,
        message: `Receiver: ${receiverName} (${receiverPhone}). Notes: ${packageNotes}`,
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
          title: "Courier Booked! 📦",
          message: `Your ${pkgType} delivery is scheduled for pickup.`
        });

        addRide({
          id: result.booking?.id || `cr_${Date.now()}`,
          date: payload.date,
          time: payload.time,
          from: pickup,
          to: drop,
          price: currentPrice,
          type: `Courier - ${pkgType}`,
          status: "Confirmed"
        });

        const fakeNames = ["Mohit Delivery", "Karan Partner", "FastTrack Sunil", "Speedy Rohit"];
        const fakeCars = pkgType === "largeparcel" ? ["Tata Ace Gold", "Mahindra Bolero Pickup"] : ["Hero Splendor", "Honda Activa", "TVS Jupiter"];
        
        setDriverDetails({
            name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
            carNo: "UP 16 " + Math.floor(1000 + Math.random() * 9000),
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
                <div style={{ fontSize: "60px", marginBottom: "10px" }}>📦</div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginBottom: "8px" }}>Delivery Scheduled!</h2>
                <p style={{ color: "#64748b", fontSize: "16px" }}>A delivery partner has been assigned to pick up your package.</p>
            </div>
            
            <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "16px", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>Delivery Partner Details</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#64748b" }}>Partner Name</span>
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
    <div className="courier-page-split">
      <div className="courier-panel">
        <div className="courier-header">
          <h1>Send a Package</h1>
          <p>Fast, reliable, and secure same-day delivery across the city.</p>
        </div>

        <form className="courier-form" onSubmit={handleSubmit}>
          
          {/* Logistics Basics */}
          <div className="courier-section">
            <h3>Delivery Details</h3>

            <div className="courier-row">
              <div className="courier-col">
                <label>Pickup From</label>
                <LocationInput value={pickup} onChange={setPickup} placeholder="Your pickup address" />
              </div>
            </div>
            <div className="courier-row">
              <div className="courier-col">
                <label>Deliver To</label>
                <LocationInput value={drop} onChange={setDrop} placeholder="Receiver's address" />
              </div>
            </div>
            {distance > 0 && (
               <div style={{ marginTop: "16px", color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                   📍 <strong>Distance:</strong> {distance} km
               </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="courier-section">
            <h3>Receiver Information</h3>
            <div className="courier-row">
              <div className="courier-col">
                <label>Receiver Name</label>
                <input type="text" className="courier-input" placeholder="e.g. Rahul Sharma" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
              </div>
              <div className="courier-col">
                <label>Receiver Phone Number</label>
                <input type="tel" className="courier-input" placeholder="+91 xxxxxxxxxx" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
              </div>
            </div>
            <div className="courier-row">
              <div className="courier-col">
                <label>Special Instructions (Optional)</label>
                <input type="text" className="courier-input" placeholder="e.g., Leave at reception, Call upon arriving" value={packageNotes} onChange={(e) => setPackageNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Package Tier */}
          <div className="courier-section">
            <h3>Package Size</h3>
            <div className="pkg-options">
              <div className={`pkg-card ${pkgType === "documents" ? "selected" : ""}`} onClick={() => setPkgType("documents")}>
                <div className="pkg-icon">📄</div>
                <div className="pkg-name">Documents</div>
                <div className="pkg-price">Up to 1 kg · ₹50 base</div>
              </div>
              <div className={`pkg-card ${pkgType === "smallbox" ? "selected" : ""}`} onClick={() => setPkgType("smallbox")}>
                <div className="pkg-icon">📦</div>
                <div className="pkg-name">Small Box</div>
                <div className="pkg-price">Up to 5 kg · ₹120 base</div>
              </div>
              <div className={`pkg-card ${pkgType === "largeparcel" ? "selected" : ""}`} onClick={() => setPkgType("largeparcel")}>
                <div className="pkg-icon">🛋️</div>
                <div className="pkg-name">Large Parcel</div>
                <div className="pkg-price">Up to 15 kg · ₹250 base</div>
              </div>
            </div>
          </div>

          {/* Payment Configuration */}
          <div className="courier-section">
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
          <div className="courier-total">
            <span>Estimated Total</span>
            <strong>{calculatingPricing ? "Calculating..." : currentPrice ? `₹${currentPrice}` : "Enter locations..."}</strong>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

          <button type="submit" className="courier-submit" disabled={loading || calculatingPricing || paymentMethod === "card" || !currentPrice}>
            {loading ? "Processing..." : calculatingPricing ? "Calculating..." : "Confirm Delivery"}
          </button>
        </form>
      </div>
      
      <div className="courier-map">
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

export default CourierBooking;
