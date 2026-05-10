import { useNavigate } from "react-router-dom";
import "./ServicePage.css";

export default function RentalsService() {
    const navigate = useNavigate();

    return (
        <div className="svc-page" style={{ "--svc-accent": "#10b981", "--svc-accent-light": "#ecfdf5" }}>

            {/* ── HERO ── */}
            <section className="svc-hero">
                <div className="svc-hero-bg">
                    <img src="/Images/services/rentals-hero.png" alt="" />
                </div>
                <div className="svc-hero-overlay" />

                <div className="svc-hero-content">
                    <div className="svc-hero-text">
                        <span className="svc-badge">By the Hour</span>
                        <h1>Your car, for as long as you need</h1>
                        <p>
                            Rent a car with a driver for errands, meetings, or sightseeing.
                            Flexible hourly packages starting at ₹249.
                        </p>
                        <button className="svc-btn-primary" onClick={() => navigate("/rental-booking")}>
                            🕒 Browse rentals
                        </button>
                    </div>
                </div>
            </section>

            {/* ── VEHICLE CARDS ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Choose your vehicle</h2>
                    <p>All vehicles come with AC and a professional driver</p>
                </div>

                <div className="svc-vehicle-cards">
                    <div className="svc-vehicle-card" onClick={() => navigate("/rental-booking", { state: { vehicleType: "hatchback" } })} style={{ cursor: "pointer" }}>
                        <div className="svc-vehicle-icon">🚗</div>
                        <h3>Hatchback</h3>
                        <p className="v-seats">4 Seats · AC</p>
                        <p className="v-price">Starting at</p>
                        <p className="v-rate">₹249</p>
                        <p className="v-per">per hour</p>
                    </div>

                    <div className="svc-vehicle-card" onClick={() => navigate("/rental-booking", { state: { vehicleType: "sedan" } })} style={{ cursor: "pointer" }}>
                        <div className="svc-vehicle-icon">🚘</div>
                        <h3>Sedan</h3>
                        <p className="v-seats">4 Seats · AC · Premium</p>
                        <p className="v-price">Starting at</p>
                        <p className="v-rate">₹399</p>
                        <p className="v-per">per hour</p>
                    </div>

                    <div className="svc-vehicle-card" onClick={() => navigate("/rental-booking", { state: { vehicleType: "suv" } })} style={{ cursor: "pointer" }}>
                        <div className="svc-vehicle-icon">🚐</div>
                        <h3>SUV</h3>
                        <p className="v-seats">6 Seats · AC · Extra space</p>
                        <p className="v-price">Starting at</p>
                        <p className="v-rate">₹599</p>
                        <p className="v-per">per hour</p>
                    </div>
                </div>
            </section>

            {/* ── WHAT'S INCLUDED ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>What's included</h2>
                    <p>Transparent rentals with no hidden charges</p>
                </div>

                <div className="svc-included">
                    <div className="svc-included-item"><span>⛽</span> <span>Fuel & Driver charges</span></div>
                    <div className="svc-included-item"><span>🛑</span> <span>Unlimited stops</span></div>
                    <div className="svc-included-item"><span>💳</span> <span>Tolls & Parking (standard)</span></div>
                    <div className="svc-included-item"><span>🛡️</span> <span>Full trip insurance</span></div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-inner">
                    <h2>Need a car for the day?</h2>
                    <p>Multiple errands, shopping trips, or just exploring the city — we've got you covered.</p>
                    <div className="svc-cta-actions">
                        <button className="svc-btn-secondary" onClick={() => navigate("/rental-booking")}>
                            🕒 Book a rental
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
