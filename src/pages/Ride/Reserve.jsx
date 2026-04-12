import "./RidePages.css";

export default function Reserve() {
  return (
    <section className="ride-hero">
      <div className="ride-left">
        <h1>Reserve a ride in advance</h1>
        <p>Plan ahead and ride stress-free.</p>

        <button className="ride-primary-btn" onClick={() => navigate("/search")}>
          Find a ride
        </button>
      </div>

      <div className="ride-right">
        <img src="/images/reserve.jpg" alt="Reserve" />
      </div>
    </section>
  );
}