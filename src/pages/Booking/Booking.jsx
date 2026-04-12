import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { saveBooking } from "../../services/bookingService";
import AuthGate from "../../components/common/AuthGate/AuthGate";
import ChatWidget from "../../components/common/ChatWidget/ChatWidget";
import DriverTrackerMap from "../../components/common/DriverTracker/DriverTrackerMap";
import "./Booking.css";

function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification, addRide } = useAuth();
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [driverStatusMessage, setDriverStatusMessage] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch Wallet Balance
  useEffect(() => {
    if (user && state) {
      const fetchWallet = async () => {
        try {
          const userId = user?.userId || user?.uid || "mock_user_1";
          const res = await fetch(`http://localhost:5001/api/wallet/${userId}`);
          const data = await res.json();
          setWalletBalance(data.balance || 0);
        } catch (err) { }
      };
      fetchWallet();
    }
  }, [user, state]);

  // Socket connection effect (only when booked)
  useEffect(() => {
    let socket;
    if (booked && user) {
      // Connect to the backend socket server
      socket = io("http://localhost:5001");
      
      const userId = user.userId || user.uid;
      
      socket.on("connect", () => {
        console.log("Connected to socket server");
        // Join the personal room
        socket.emit("join_room", userId);
      });

      // Listen for driver updates
      socket.on("driverStatus", (data) => {
        console.log("Received driver status:", data);
        setDriverStatusMessage(data.message);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [booked, user]);

  if (!state) {
    return (
      <div className="bk-container">
        <div className="bk-empty">
          <span className="bk-empty-icon">📭</span>
          <h2>No booking data found</h2>
          <p>Please search for a ride first.</p>
          <button className="bk-btn" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const { pickup, drop, date, time, price, rideType } = state;

  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

  const handleConfirm = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    // We remove the UPI ID validation since we rely on the manual scan now
    if (paymentMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      setError("Please fill all card details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await saveBooking(user.userId || user.uid, {
        pickup,
        drop,
        date,
        time,
        price,
        rideType,
        paymentMethod, // Include payment method in booking
      });

      setLoading(false);

      if (result && result.success) {
        // Dynamic Notifications
        addNotification({
          type: 'success',
          title: 'Ride Confirmed',
          message: `Your ${rideType} from ${pickup} to ${drop} is booked.`
        });

        if (paymentMethod === 'wallet') {
          addNotification({
            type: 'info',
            title: 'Payment Processed',
            message: `₹${price} was successfully deducted from your UrbanPool Wallet.`
          });
          setWalletBalance(prev => prev - price);
        } else if (paymentMethod !== 'cash') {
          addNotification({
            type: 'info',
            title: 'Payment Processed',
            message: `Your payment of ₹${price} via ${paymentMethod.toUpperCase()} was successful.`
          });
        }

        const newId = result.booking?.id || `bk_${Date.now()}`;
        setBookingId(newId);

        // Add ride to local context for My Rides
        addRide({
          id: newId,
          date,
          time,
          from: pickup,
          to: drop,
          price,
          type: rideType,
          status: 'Confirmed'
        });

        setBooked(true);
      } else {
        setError(result?.error || "Insufficient Wallet balance or scheduling failed.");
      }
    } catch (err) {
      console.error("Error in handleConfirm:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bk-container">
      {!booked ? (
        <>
          <h2 className="bk-title">Confirm your ride</h2>

          {/* Ride summary */}
          <div className="bk-card">
            <div className="bk-route">
              <div className="bk-route-dots">
                <div className="bk-dot green" />
                <div className="bk-route-line" />
                <div className="bk-dot red" />
              </div>
              <div className="bk-route-info">
                <div className="bk-route-row">
                  <span className="bk-route-label">Pickup</span>
                  <span className="bk-route-value">{pickup}</span>
                </div>
                <div className="bk-route-row">
                  <span className="bk-route-label">Dropoff</span>
                  <span className="bk-route-value">{drop}</span>
                </div>
              </div>
            </div>

            <div className="bk-divider" />

            <div className="bk-details">
              <div className="bk-detail-row">
                <span>Ride type</span>
                <strong>{rideType}</strong>
              </div>
              <div className="bk-detail-row">
                <span>Date</span>
                <strong>{date}</strong>
              </div>
              <div className="bk-detail-row">
                <span>Time</span>
                <strong>{time}</strong>
              </div>
              <div className="bk-detail-row bk-price-row">
                <span>Total</span>
                <strong className="bk-price">₹{price}</strong>
              </div>
            </div>
          </div>

          {/* Payment options */}
          <div className="bk-card bk-payment">
            <h3>Payment method</h3>
            <div className="bk-pay-options">
              <label className={`bk-pay-option ${paymentMethod === 'wallet' ? 'bk-pay-selected' : ''}`}>
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === 'wallet'} 
                  onChange={() => setPaymentMethod('wallet')} 
                /> UrbanPool Wallet
              </label>
              <label className={`bk-pay-option ${paymentMethod === 'cash' ? 'bk-pay-selected' : ''}`}>
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === 'cash'} 
                  onChange={() => setPaymentMethod('cash')} 
                /> Cash
              </label>
              <label className={`bk-pay-option ${paymentMethod === 'upi' ? 'bk-pay-selected' : ''}`}>
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === 'upi'} 
                  onChange={() => setPaymentMethod('upi')} 
                /> UPI / QR
              </label>
              <label className={`bk-pay-option ${paymentMethod === 'card' ? 'bk-pay-selected' : ''}`}>
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')} 
                /> Card
              </label>
            </div>

            {/* Dynamic Payment Details UI */}
            {paymentMethod === 'wallet' && (
              <div className="bk-pay-details upi-details fadeIn" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: "14px", fontWeight: "600", color: "#334155"}}>Available Balance:</span>
                  <span style={{fontSize: "18px", fontWeight: "700", color: walletBalance >= state?.price ? "#10b981" : "#ef4444"}}>
                    ₹{walletBalance.toFixed(2)}
                  </span>
                </div>
                {walletBalance < state?.price && (
                  <p style={{color: '#ef4444', fontSize: '13px', marginTop: '8px'}}>
                    Insufficient funds! Add money to your wallet in the Sidebar before booking.
                  </p>
                )}
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div className="bk-pay-details upi-details fadeIn">
                <div className="qr-container">
                  <img src="/qr-payment.jpg" alt="Scan to pay" className="qr-image" 
                       onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="qr-placeholder" style={{display: 'none'}}>
                    <span>QR Code</span>
                  </div>
                </div>
                <div className="upi-input-group" style={{marginTop: "8px"}}>
                  <span style={{fontSize: "13px", fontWeight: "600", color: "#111827", display: "block", marginBottom: "4px"}}>
                    Scan securely with any UPI App
                  </span>
                  <span style={{fontSize: "12px", color: "#6b7280"}}>
                    After scanning and paying, click Confirm below!
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bk-pay-details card-details fadeIn" style={{ textAlign: "center", padding: "20px 0", color: "#666" }}>
                <span style={{ fontSize: "15px", fontWeight: "500" }}>💳 Credit/Debit Card payments are coming soon! Please select Cash or UPI / QR to confirm your booking.</span>
              </div>
            )}
          </div>

          {error && <div className="bk-error">{error}</div>}

          <button
            className={`bk-btn bk-confirm ${loading ? "loading" : ""} ${paymentMethod === 'card' ? "disabled-btn" : ""}`}
            onClick={handleConfirm}
            disabled={loading || paymentMethod === 'card'}
          >
            {loading ? "Confirming..." : (paymentMethod === 'upi' ? `I've Paid ₹${price} · Confirm` : `Confirm booking · ₹${price}`)}
          </button>
        </>
      ) : (
        /* ── SUCCESS MODAL ─────────────────────── */
        <div className="bk-success">
          <div className="bk-success-icon">✓</div>
          <h2>Ride Confirmed!</h2>
          
          {paymentMethod === 'upi' && (
            <div style={{ marginTop: '10px', marginBottom: '10px', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981', textAlign: 'center' }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>✅</span>
              <strong style={{ color: '#047857' }}>UPI Payment Accepted!</strong>
            </div>
          )}
          
          {/* Live Driver Tracking Map */}
          <DriverTrackerMap pickup={state?.pickup} driverName={`${rideType} Driver`} />

          <p className="bk-success-sub">Your ride details</p>

          <div className="bk-success-details">
            <div className="bk-success-row">
              <span>From</span><strong>{pickup}</strong>
            </div>
            <div className="bk-success-row">
              <span>To</span><strong>{drop}</strong>
            </div>
            <div className="bk-success-row">
              <span>Amount</span><strong className="bk-price">₹{price}</strong>
            </div>
          </div>

          <button className="bk-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>

          {/* Real-time Chat Widget */}
          <ChatWidget rideId={bookingId} driverName={`${rideType} Driver`} />
        </div>
      )}

      <AuthGate
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        message="to confirm your booking"
      />
    </div>
  );
}

export default Booking;