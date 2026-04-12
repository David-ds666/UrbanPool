import { useParams } from "react-router-dom";
import "./RideWithMap.css";

export default function RideWithMap() {
  const { type } = useParams();

  const titles = {
    ride: "Get a ride",
    reserve: "Reserve a ride",
    intercity: "Intercity travel",
    courier: "Send a package",
    rentals: "Rentals",
    bike: "Bike ride",
  };

  return (
    <div className="ride-page">


      {/* BODY */}
      <div className="ride-body">
        {/* LEFT CARD */}
        <div className="ride-card">
          <h2>{titles[type] || "Get a ride"}</h2>

          <input placeholder="Pickup location" />
          <input placeholder="Dropoff location" />

          <div className="row">
            <select>
              <option>Pickup now</option>
              <option>Schedule later</option>
            </select>

            <select>
              <option>For me</option>
              <option>For someone else</option>
            </select>
          </div>

          <button className="search-btn">Search</button>
        </div>

        {/* MAP */}
        <div className="map-container">
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Chandigarh&output=embed"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}