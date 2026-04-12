import { useNavigate } from "react-router-dom";
import "./Suggestions.css";

const suggestionsData = [
  { title: "Ride", desc: "Go anywhere with UrbanPool.", img: "/Images/ride.png", type: "ride" },
  { title: "Reserve", desc: "Reserve your ride in advance.", img: "/Images/reserve.png", type: "reserve" },
  { title: "Intercity", desc: "Affordable outstation trips.", img: "/Images/intercity.png", type: "intercity" },
  { title: "Courier", desc: "Same-day package delivery.", img: "/Images/courier.png", type: "courier" },
  { title: "Rentals", desc: "Multiple stops, hourly rides.", img: "/Images/rentals.png", type: "rentals" },
  { title: "Bike", desc: "Quick bike rides.", img: "/Images/bike.png", type: "bike" },
];

export default function Suggestions() {
  const navigate = useNavigate();

  return (
    <section className="suggestions-container">
      <h2 className="suggestions-title">Suggestions</h2>

      <div className="suggestions-grid">
        {suggestionsData.map(item => (
          <div
            key={item.type}
            className="suggestion-card"
            onClick={() => navigate(`/ride/${item.type}`)}
          >
            <div className="card-text">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="details-btn">Details</span>
            </div>

            <div className="card-image">
              <img src={item.img} alt={item.title} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}