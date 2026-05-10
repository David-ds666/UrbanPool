import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../../common/LocationInput/LocationInput";
import "./RideForm.css";

export default function RideForm() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSearch = () => {
    if (!pickup || !drop || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    navigate("/search", {
      state: { pickup, drop, date, time },
    });
  };

  return (
    <div className="ride-card">
      <h2>Request a ride</h2>
      <p>Share rides, save money, and commute smarter with UrbanPool.</p>

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

      <button className="primary-btn" onClick={handleSearch}>
        See prices
      </button>
    </div>
  );
}