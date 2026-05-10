import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../../components/common/LocationInput/LocationInput";
import "./RidePages.css";
import rideHero from "../../assets/images/city_hero.png";

export default function RideHome() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const handleFindRide = () => {
    if (!pickup || !drop) {
      alert("Please enter both pickup and dropoff locations to find a ride.");
      return;
    }
    navigate("/results", { 
      state: { 
        pickup, 
        drop, 
        date: new Date().toLocaleDateString(), 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      } 
    });
  };

  return (
    <div className="ride-page-wrapper">
      <section className="ride-hero">
        <div className="ride-left">
          <h1>Go anywhere with UrbanPool</h1>
          <p>
            Find a ride for every road with access in more than 15,000 cities worldwide.
            From daily commutes to special occasions, choose the ride that fits your style and budget.
          </p>

          <div className="ride-input">
            <div className="location-connect">
              <LocationInput placeholder="Pickup location" value={pickup} onChange={setPickup} />
              <LocationInput placeholder="Dropoff location" value={drop} onChange={setDrop} />
            </div>
          </div>

          <div className="ride-actions">
            <button className="ride-primary-btn" onClick={handleFindRide}>
              Find a ride
            </button>
            <button className="link" onClick={() => navigate("/help")}>Download the app</button>
          </div>
        </div>

        <div className="ride-right">
          <img
            src={rideHero}
            alt="Ride Options"
          />
        </div>
      </section>

      <section className="ride-options-info">
        <div className="info-grid">
          <div className="info-item">
            <h2>Reliable rides, anytime</h2>
            <p>Request a ride in seconds, get picked up in minutes. Available 24/7 across the globe.</p>
          </div>
          <div className="info-item">
            <h2>Your safety is our priority</h2>
            <p>From driver background checks to in-app emergency features, we're committed to your safety.</p>
          </div>
          <div className="info-item">
            <h2>Transparent pricing</h2>
            <p>No hidden fees. See your price upfront before you even request your ride.</p>
          </div>
        </div>
      </section>
    </div>
  );
}