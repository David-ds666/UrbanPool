import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../../common/LocationInput/LocationInput";
import "./RideSearchCard.css";

function RideSearchCard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ride"); // 'ride' | 'carpool'
  const [carpoolType, setCarpoolType] = useState("find"); // 'find' | 'offer'

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

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
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <button className="primary-btn search-btn" onClick={handleSearch}>
        {activeTab === "ride" ? "See prices" : "Search Rides"}
      </button>
    </div>
  );
}

export default RideSearchCard;