import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthGate from "../../components/common/AuthGate/AuthGate";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import "./SearchRide.css";

function SearchRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [pickup, setPickup] = useState(location.state?.pickup || "");
  const [drop, setDrop] = useState(location.state?.drop || "");
  const [date, setDate] = useState(location.state?.date || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(location.state?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const handleSearch = () => {
    if (!pickup || !drop || !date || !time) {
      setError("Please fill in all fields to search for rides");
      return;
    }
    setError("");

    // Gate: must be logged in to see prices
    if (!user) {
      setShowAuth(true);
      return;
    }

    navigate("/results", {
      state: { pickup, drop, date, time },
    });
  };

  return (
    <div className="search-page">
      <div className="search-card">
        <h2>Request a ride</h2>
        <p>
          Share rides, save money, and commute smarter with UrbanPool.
        </p>

        {error && <div className="search-error">{error}</div>}

        <LocationInput
          placeholder="Pickup location"
          value={pickup}
          onChange={(val) => { setPickup(val); setError(""); }}
        />

        <LocationInput
          placeholder="Dropoff location"
          value={drop}
          onChange={(val) => { setDrop(val); setError(""); }}
        />

        <div className="row">
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError(""); }}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setError(""); }}
          />
        </div>

        <button onClick={handleSearch}>See prices</button>
      </div>

      <AuthGate
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        message="to search for rides"
      />
    </div>
  );
}

export default SearchRide;