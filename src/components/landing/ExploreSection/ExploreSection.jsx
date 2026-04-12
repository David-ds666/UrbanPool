import { useNavigate } from "react-router-dom";
import "./ExploreSection.css";

export default function ExploreSection() {
  const navigate = useNavigate();

  const rideImg = "/Images/explore/ride.png";
  const airportImg = "/Images/explore/airport.png";
  const cityImg = "/Images/explore/city.png";

  return (
    <section className="explore">
      <h2 className="explore-heading">
        Use the UrbanPool app to help you travel your way
      </h2>

      <div className="explore-grid">
        {/* CARD 1 */}
        <div className="explore-card">
          <img src={rideImg} alt="Ride options" />
          <h3>Ride options</h3>
          <p>
            There’s more than one way to move with UrbanPool, no matter
            where you are or where you’re headed next.
          </p>
          <button
            type="button"
            onClick={() => navigate("/ride")}
          >
            Search ride options
          </button>
        </div>

        {/* CARD 2 */}
        <div className="explore-card">
          <img src={airportImg} alt="Airports" />
          <h3>700+ airports</h3>
          <p>
            Request a ride to and from most major airports.
            Schedule ahead for peace of mind.
          </p>
          <button
            type="button"
            onClick={() => navigate("/ride/airport")}
          >
            Search airports
          </button>
        </div>

        {/* CARD 3 */}
        <div className="explore-card">
          <img src={cityImg} alt="Cities" />
          <h3>15,000+ cities</h3>
          <p>
            UrbanPool works in thousands of cities worldwide,
            so you’re never stuck.
          </p>
          <button
            type="button"
            onClick={() => navigate("/ride/cities")}
          >
            Search cities
          </button>
        </div>
      </div>
    </section>
  );
}