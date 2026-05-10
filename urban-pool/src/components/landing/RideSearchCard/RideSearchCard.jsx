import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../../common/LocationInput/LocationInput";
import "./RideSearchCard.css";

function RideSearchCard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ride"); // 'ride' | 'carpool'
  const [carpoolType, setCarpoolType] = useState("find"); // 'find' | 'offer'

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  // Default date to today
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("");

  // Compute minimum time (if date is today, block past times)
  const minTime = useMemo(() => {
    if (date === todayStr) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }
    return "00:00";
  }, [date, todayStr]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    setDate(val);
    // Clear time if it's now in the past
    if (val === todayStr && time && time < minTime) {
      setTime("");
    }
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    if (date === todayStr && val < minTime) return; // block past selection
    setTime(val);
  };

  const handleSearch = () => {
    if (!pickup || !drop || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    if (activeTab === "ride") {
      navigate("/results", {
        state: { pickup, drop, date, time },
      });
    } else if (carpoolType === "find") {
      navigate("/carpool/search", {
        state: { pickup, drop, date, time },
      });
    } else {
      navigate("/carpool/offer", {
        state: { pickup, drop, date, time },
      });
    }
  };

  return (
    <div className="search-card">
      <div className="search-tabs">
        <button
          className={`tab-btn ${activeTab === "ride" ? "active" : ""}`}
          onClick={() => setActiveTab("ride")}
        >
          Ride
        </button>
        <button
          className={`tab-btn ${activeTab === "carpool" ? "active" : ""}`}
          onClick={() => setActiveTab("carpool")}
        >
          Carpool
        </button>
      </div>

      {activeTab === "carpool" && (
        <div className="sub-tabs">
          <button
            className={`sub-tab-btn ${carpoolType === "find" ? "active" : ""}`}
            onClick={() => setCarpoolType("find")}
          >
            Find a Ride
          </button>
          <button
            className={`sub-tab-btn ${carpoolType === "offer" ? "active" : ""}`}
            onClick={() => setCarpoolType("offer")}
          >
            Offer a Ride
          </button>
        </div>
      )}

      {activeTab === "ride" ? (
        <div className="tab-header">
          <h2>Request a ride</h2>
          <p>Share rides, save money, and commute smarter with UrbanPool.</p>
        </div>
      ) : (
        <div className="tab-header">
          <h2>Find a carpool</h2>
          <p>Join the largest community of trusted carpoolers.</p>
        </div>
      )}

      <LocationInput
        placeholder="Pickup location"
        value={pickup}
        onChange={(val) => setPickup(val)}
      />

      <LocationInput
        placeholder="Dropoff location"
        value={drop}
        onChange={(val) => setDrop(val)}
      />

      <div className="row">
        <input
          type="date"
          value={date}
          min={todayStr}
          max={tomorrowStr}
          onChange={handleDateChange}
        />
        <input
          type="time"
          value={time}
          min={date === todayStr ? minTime : undefined}
          onChange={handleTimeChange}
        />
      </div>

      <button className="primary-btn search-btn" onClick={handleSearch}>
        {activeTab === "ride" ? "See prices" : "Search Rides"}
      </button>
    </div>
  );
}

export default RideSearchCard;