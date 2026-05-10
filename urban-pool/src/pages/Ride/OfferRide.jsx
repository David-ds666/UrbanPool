import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import "./OfferRide.css";
const API_BASE = "http://localhost:5001/api";

const PREFERENCES = [
  { key: "ac", label: "AC Available", icon: "❄️" },
  { key: "music", label: "Music", icon: "🎵" },
  { key: "noSmoking", label: "No Smoking", icon: "🚭" },
  { key: "petsAllowed", label: "Pets Allowed", icon: "🐾" },
  { key: "luggageSpace", label: "Luggage Space", icon: "🧳" },
  { key: "ladiesOnly", label: "Ladies Only", icon: "👩" },
];

export default function OfferRide() {
  const { state: navState } = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, addNotification } = useAuth();

  // Step management
  const [step, setStep] = useState(1);

  // Step 1 — Route
  const [pickup, setPickup] = useState(navState?.pickup || "");
  const [destination, setDestination] = useState(navState?.drop || "");
  const [date, setDate] = useState(navState?.date || "");
  const [time, setTime] = useState(navState?.time || "");

  // Step 2 — Ride Details
  const [seats, setSeats] = useState(2);
  const [pricePerSeat, setPricePerSeat] = useState(0);
  const [vehicle, setVehicle] = useState(
    userProfile?.vehicleName
      ? `${userProfile.vehicleName} (${userProfile.vehicleNumber || ""})`
      : ""
  );
  const [preferences, setPreferences] = useState({ ac: true, noSmoking: true });

  // Distance & Earnings
  const [distance, setDistance] = useState(null);
  const [loadingDist, setLoadingDist] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const estimatedEarnings = pricePerSeat * seats;

  // Step 3 — Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // My Offers tab
  const [activeSection, setActiveSection] = useState("offer"); // offer | myoffers
  const [myOffers, setMyOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Fetch distance when going to step 2
  useEffect(() => {
    if (step === 2 && pickup && destination) {
      fetchDistance();
    }
  }, [step]);

  // Fetch my offers
  useEffect(() => {
    if (activeSection === "myoffers" && user) {
      fetchMyOffers();
    }
  }, [activeSection, user]);

  const fetchDistance = async () => {
    setLoadingDist(true);
    try {
      const res = await fetch(`${API_BASE}/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, drop: destination, rideType: "pool" }),
      });
      const data = await res.json();
      const dist = parseFloat(data.distance) || 0;
      setDistance(dist);
      // Suggest: ₹6–10 per km split among seats
      const suggested = Math.round((dist * 8) / seats);
      setSuggestedPrice(suggested);
      if (!pricePerSeat) setPricePerSeat(suggested);
    } catch {
      setDistance(null);
      setSuggestedPrice(0);
    }
    setLoadingDist(false);
  };

  const fetchMyOffers = async () => {
    if (!user) return;
    setLoadingOffers(true);

    // Load from localStorage first (works offline)
    let localOffers = [];
    try {
      const stored = JSON.parse(localStorage.getItem("urbanpool_offers") || "[]");
      localOffers = stored.filter((o) => o.driverId === user.uid);
    } catch { /* ignore */ }

    // Try to fetch from backend and merge
    try {
      const res = await fetch(`${API_BASE}/carpool/my-offers/${user.uid}`);
      if (res.ok) {
        const backendOffers = await res.json();
        const backendIds = new Set((backendOffers || []).map((o) => String(o.id)));
        // Merge: backend offers + local-only offers not yet synced
        const unsynced = localOffers.filter((o) => !backendIds.has(String(o.id)));
        setMyOffers([...(backendOffers || []), ...unsynced]);
      } else {
        setMyOffers(localOffers);
      }
    } catch {
      // Backend down — use localStorage only
      setMyOffers(localOffers);
    }

    setLoadingOffers(false);
  };


  const togglePref = (key) => {
    setPreferences((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleStep1Next = () => {
    if (!pickup || !destination || !date || !time) {
      addNotification({
        type: "info",
        title: "Missing Details",
        message: "Please fill in all route details before continuing.",
      });
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!vehicle) {
      addNotification({
        type: "info",
        title: "Vehicle Required",
        message: "Please enter your vehicle details so passengers know what to look for.",
      });
      return;
    }
    if (!pricePerSeat || pricePerSeat < 10) {
      addNotification({
        type: "info",
        title: "Invalid Price",
        message: "Please set a price of at least ₹10 per seat.",
      });
      return;
    }
    setStep(3);
  };

  const handlePublish = async () => {
    setSubmitting(true);

    const body = {
      driverId: user?.uid || "guest",
      driverName: userProfile?.name || user?.email || "Driver",
      pickup,
      destination,
      date,
      time,
      seatsAvailable: seats,
      pricePerSeat: parseFloat(pricePerSeat),
      vehicle,
      preferences: Object.keys(preferences).filter((k) => preferences[k]).join(", "),
      status: "open",
    };

    let success = false;

    // Try sending to backend
    try {
      const res = await fetch(`${API_BASE}/carpool/rides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        success = true;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn("Server error:", errData.error);
      }
    } catch (err) {
      console.warn("Backend unavailable, saving locally:", err.message);
    }

    // Fallback: always save to localStorage so the UI shows the published ride
    try {
      const stored = JSON.parse(localStorage.getItem("urbanpool_offers") || "[]");
      stored.unshift({ ...body, id: Date.now(), createdAt: new Date().toISOString() });
      localStorage.setItem("urbanpool_offers", JSON.stringify(stored));
      success = true;
    } catch {
      // ignore localStorage errors
    }

    if (success) {
      setSubmitted(true);
      addNotification({
        type: "ride_confirmed",
        title: "Ride Published! 🚗",
        message: `Your carpool from ${pickup} to ${destination} is now live. Passengers can request to join.`,
      });
    } else {
      addNotification({
        type: "info",
        title: "Publish Failed",
        message: "Could not publish your ride. Please check your connection and try again.",
      });
    }

    setSubmitting(false);
  };


  const resetForm = () => {
    setStep(1);
    setPickup("");
    setDestination("");
    setDate("");
    setTime("");
    setSeats(2);
    setPricePerSeat(0);
    setPreferences({ ac: true, noSmoking: true });
    setDistance(null);
    setSubmitted(false);
  };

  const progressPct = ((step - 1) / 2) * 100;

  return (
    <div className="or2-page">
      {/* Hero Header */}
      <div className="or2-hero">
        <div className="or2-hero-inner">
          <div className="or2-hero-text">
            <h1>🚗 Offer a Carpool Ride</h1>
            <p>Share your journey, split the cost, and travel smarter.</p>
          </div>
          <div className="or2-hero-tabs">
            <button
              className={activeSection === "offer" ? "active" : ""}
              onClick={() => setActiveSection("offer")}
            >
              + New Offer
            </button>
            <button
              className={activeSection === "myoffers" ? "active" : ""}
              onClick={() => setActiveSection("myoffers")}
            >
              My Offers
            </button>
          </div>
        </div>
      </div>

      <div className="or2-body">
        {activeSection === "offer" ? (
          <div className="or2-main">
            {/* Left: Form */}
            <div className="or2-form-col">
              {/* Progress Bar */}
              {!submitted && (
                <div className="or2-progress-wrap">
                  <div className="or2-steps-label">
                    {["Plan Route", "Ride Details", "Review & Publish"].map((label, i) => (
                      <span key={i} className={step === i + 1 ? "step-active" : step > i + 1 ? "step-done" : ""}>
                        {step > i + 1 ? "✓ " : `${i + 1}. `}{label}
                      </span>
                    ))}
                  </div>
                  <div className="or2-progress-bar">
                    <div className="or2-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              )}

              {/* ================== SUBMITTED ================== */}
              {submitted ? (
                <div className="or2-success">
                  <div className="or2-success-icon">🎉</div>
                  <h2>Ride Published!</h2>
                  <p>Your carpool from <strong>{pickup}</strong> to <strong>{destination}</strong> is now live. Passengers can request to join.</p>
                  <div className="or2-success-actions">
                    <button className="or2-btn-primary" onClick={() => setActiveSection("myoffers")}>
                      View My Offers
                    </button>
                    <button className="or2-btn-outline" onClick={resetForm}>
                      Offer Another Ride
                    </button>
                  </div>
                </div>
              ) : step === 1 ? (
                /* ================== STEP 1 ================== */
                <div className="or2-card">
                  <div className="or2-card-header">
                    <span className="or2-step-badge">Step 1</span>
                    <h2>Plan Your Route</h2>
                    <p>Where are you heading? Others will find your ride.</p>
                  </div>

                  <div className="or2-field">
                    <label>📍 Pickup Location</label>
                    <LocationInput
                      placeholder="Your starting point"
                      value={pickup}
                      onChange={setPickup}
                    />
                  </div>

                  <div className="or2-field">
                    <label>🏁 Destination</label>
                    <LocationInput
                      placeholder="Where are you going?"
                      value={destination}
                      onChange={setDestination}
                    />
                  </div>

                  <div className="or2-row">
                    <div className="or2-field">
                      <label>📅 Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="or2-field">
                      <label>⏰ Departure Time</label>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                  </div>

                  <button className="or2-btn-primary or2-next-btn" onClick={handleStep1Next}>
                    Continue →
                  </button>
                </div>
              ) : step === 2 ? (
                /* ================== STEP 2 ================== */
                <div className="or2-card">
                  <div className="or2-card-header">
                    <span className="or2-step-badge">Step 2</span>
                    <h2>Ride Details</h2>
                    <p>Tell passengers what to expect.</p>
                  </div>

                  {/* Distance Banner */}
                  {loadingDist ? (
                    <div className="or2-dist-banner loading">Calculating route distance...</div>
                  ) : distance !== null ? (
                    <div className="or2-dist-banner">
                      🗺️ <strong>{distance} km</strong> route · Suggested price: <strong>₹{suggestedPrice}/seat</strong>
                    </div>
                  ) : null}

                  {/* Seats */}
                  <div className="or2-field">
                    <label>💺 Available Seats</label>
                    <div className="or2-counter">
                      <button onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
                      <span>{seats}</span>
                      <button onClick={() => setSeats(Math.min(6, seats + 1))}>+</button>
                      <span className="or2-counter-hint">seats</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="or2-field">
                    <label>
                      ₹ Price per Seat
                      {suggestedPrice > 0 && (
                        <button className="or2-suggest-btn" onClick={() => setPricePerSeat(suggestedPrice)}>
                          Use ₹{suggestedPrice} (suggested)
                        </button>
                      )}
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={pricePerSeat}
                      onChange={(e) => setPricePerSeat(e.target.value)}
                      placeholder="e.g. 150"
                    />
                    {pricePerSeat > 0 && (
                      <span className="or2-earnings-hint">
                        💰 Estimated total: ₹{estimatedEarnings} for {seats} seat{seats > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Vehicle */}
                  <div className="or2-field">
                    <label>🚗 Vehicle Details</label>
                    <input
                      type="text"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      placeholder="e.g. White Swift Dzire (PB-65-XXXX)"
                    />
                  </div>

                  {/* Preferences */}
                  <div className="or2-field">
                    <label>✅ Ride Preferences</label>
                    <div className="or2-prefs-grid">
                      {PREFERENCES.map((p) => (
                        <div
                          key={p.key}
                          className={`or2-pref-tag ${preferences[p.key] ? "selected" : ""}`}
                          onClick={() => togglePref(p.key)}
                        >
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="or2-btn-row">
                    <button className="or2-btn-outline" onClick={() => setStep(1)}>← Back</button>
                    <button className="or2-btn-primary" onClick={handleStep2Next}>Review →</button>
                  </div>
                </div>
              ) : (
                /* ================== STEP 3 ================== */
                <div className="or2-card">
                  <div className="or2-card-header">
                    <span className="or2-step-badge">Step 3</span>
                    <h2>Review & Publish</h2>
                    <p>Double-check your details before going live.</p>
                  </div>

                  <div className="or2-review-grid">
                    <div className="or2-review-item">
                      <span className="label">From</span>
                      <span className="value">{pickup}</span>
                    </div>
                    <div className="or2-review-item">
                      <span className="label">To</span>
                      <span className="value">{destination}</span>
                    </div>
                    <div className="or2-review-item">
                      <span className="label">Date</span>
                      <span className="value">{date}</span>
                    </div>
                    <div className="or2-review-item">
                      <span className="label">Time</span>
                      <span className="value">{time}</span>
                    </div>
                    <div className="or2-review-item">
                      <span className="label">Seats</span>
                      <span className="value">{seats}</span>
                    </div>
                    <div className="or2-review-item">
                      <span className="label">Price / Seat</span>
                      <span className="value">₹{pricePerSeat}</span>
                    </div>
                    <div className="or2-review-item">
                      <span className="label">Vehicle</span>
                      <span className="value">{vehicle}</span>
                    </div>
                    {distance && (
                      <div className="or2-review-item">
                        <span className="label">Distance</span>
                        <span className="value">{distance} km</span>
                      </div>
                    )}
                  </div>

                  {/* Preferences display */}
                  <div className="or2-review-prefs">
                    {PREFERENCES.filter((p) => preferences[p.key]).map((p) => (
                      <span key={p.key} className="or2-pref-chip">
                        {p.icon} {p.label}
                      </span>
                    ))}
                  </div>

                  {/* Earnings highlight */}
                  <div className="or2-earnings-banner">
                    <span>💰 Potential Earnings</span>
                    <strong>₹{estimatedEarnings}</strong>
                    <span className="sub">for {seats} seat{seats > 1 ? "s" : ""} filled</span>
                  </div>

                  <div className="or2-btn-row">
                    <button className="or2-btn-outline" onClick={() => setStep(2)}>← Edit</button>
                    <button
                      className="or2-btn-primary"
                      onClick={handlePublish}
                      disabled={submitting}
                    >
                      {submitting ? "Publishing..." : "🚀 Publish Ride"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info Panel */}
            <div className="or2-info-col">
              <div className="or2-info-card">
                <h3>💡 How It Works</h3>
                <div className="or2-how-steps">
                  <div className="or2-how-step">
                    <div className="or2-how-num">1</div>
                    <div>
                      <strong>Post your route</strong>
                      <p>Share your pickup, destination & timing</p>
                    </div>
                  </div>
                  <div className="or2-how-step">
                    <div className="or2-how-num">2</div>
                    <div>
                      <strong>Get requests</strong>
                      <p>Passengers matching your route request to join</p>
                    </div>
                  </div>
                  <div className="or2-how-step">
                    <div className="or2-how-num">3</div>
                    <div>
                      <strong>Accept & go</strong>
                      <p>Pick them up and share the ride & cost</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="or2-info-card or2-tips-card">
                <h3>🛡️ Safety Tips</h3>
                <ul>
                  <li>Only accept verified UrbanPool users</li>
                  <li>Share your ride with a trusted contact</li>
                  <li>Rate your passengers after the trip</li>
                  <li>No cash — all payments via app</li>
                </ul>
              </div>

              {distance && pricePerSeat > 0 && (
                <div className="or2-info-card or2-calc-card">
                  <h3>📊 Earnings Calculator</h3>
                  <div className="or2-calc-row">
                    <span>Price × Seats</span>
                    <span>₹{pricePerSeat} × {seats}</span>
                  </div>
                  <div className="or2-calc-row">
                    <span>Distance</span>
                    <span>{distance} km</span>
                  </div>
                  <div className="or2-calc-divider" />
                  <div className="or2-calc-row total">
                    <span>You Earn</span>
                    <span>₹{estimatedEarnings}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================== MY OFFERS ================== */
          <div className="or2-offers-section">
            <div className="or2-offers-header">
              <h2>My Carpool Offers</h2>
              <p>All rides you've published for passengers to join.</p>
            </div>

            {loadingOffers ? (
              <div className="or2-loading">Loading your offers...</div>
            ) : myOffers.length === 0 ? (
              <div className="or2-empty">
                <span>🗺️</span>
                <h3>No active offers yet</h3>
                <p>Publish your first carpool ride and start earning!</p>
                <button className="or2-btn-primary" onClick={() => setActiveSection("offer")}>
                  + Offer a Ride
                </button>
              </div>
            ) : (
              <div className="or2-offer-list">
                {myOffers.map((offer) => (
                  <div key={offer.id} className="or2-offer-card">
                    <div className="or2-offer-route">
                      <div className="or2-route-dot from" />
                      <span className="or2-route-text">{offer.pickup}</span>
                      <div className="or2-route-line" />
                      <div className="or2-route-dot to" />
                      <span className="or2-route-text">{offer.destination}</span>
                    </div>
                    <div className="or2-offer-meta">
                      <span>📅 {offer.date}</span>
                      <span>⏰ {offer.time}</span>
                      <span>💺 {offer.seatsAvailable} seats left</span>
                      <span>₹{offer.pricePerSeat}/seat</span>
                    </div>
                    <div className={`or2-offer-status ${offer.status}`}>
                      {offer.status === "open" ? "🟢 Open" : offer.status === "full" ? "🔴 Full" : offer.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
