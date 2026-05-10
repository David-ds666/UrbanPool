import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RidePages.css";
import airportHero from "../../assets/images/airport_hero.png";
import airportRes1 from "../../assets/images/airport_reserve_1.png";
import airportRes2 from "../../assets/images/airport_reserve_2.png";
import airportRes3 from "../../assets/images/airport_reserve_3.png";

export default function Airport() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  return (
    <div className="ride-page-wrapper">
      <section className="ride-hero">
        <div className="ride-left">
          <h1>Airport rides are better with UrbanPool</h1>
          <p>
            Request a ride to over 700 airports around the world. In most regions,
            you'll also have the option to schedule an airport pickup or dropoff in advance.
          </p>

          <div className="ride-input">
            <div className="location-connect">
              <input placeholder="Pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} />
              <input placeholder="Dropoff location" value={drop} onChange={(e) => setDrop(e.target.value)} />
            </div>
          </div>

          <div className="ride-actions">
            <button className="ride-primary-btn" onClick={() => navigate("/airport-booking", { state: { pickup, drop } })}>Select pickup location</button>
            <button className="secondary-btn" onClick={() => navigate("/airport-booking")}>Schedule for later</button>
          </div>
        </div>

        <div className="ride-right">
          <img src={airportHero} alt="Airport Runway" />
        </div>
      </section>

      <section className="ride-reserve-section">
        <div className="section-header">
          <h2>Reserve your airport ride in advance</h2>
          <p>Take the stress out of getting to or from the airport by scheduling a ride up to 90 days ahead of time.</p>
          <div className="header-links">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/airport-booking", { state: { pickup, drop } }); }}>Request a ride today</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/airport-booking"); }}>Learn more about UrbanPool Reserve</a>
          </div>
        </div>

        <div className="reserve-grid">
          <div className="reserve-card">
            <img src={airportRes1} alt="Plan your ride" />
            <h3>Plan your ride to the airport</h3>
            <p>Priority matching through UrbanPool Reserve helps you get the ride you need when you need it.*</p>
          </div>

          <div className="reserve-card">
            <img src={airportRes2} alt="Ride waiting" />
            <h3>Have a ride waiting for you when you land**</h3>
            <p>Our flight-tracking technology will let your driver know if your flight is delayed (or early) so they can adjust their pickup time accordingly.</p>
          </div>

          <div className="reserve-card">
            <img src={airportRes3} alt="Book ahead" />
            <h3>Book ahead of time with flexible cancellation</h3>
            <p>Lock in your price when you reserve your ride. If your plans change, cancel for free up to one hour before your scheduled pickup time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}