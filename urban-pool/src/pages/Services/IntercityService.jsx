import { useNavigate } from "react-router-dom";
import "./ServicePage.css";

const popularRoutes = [
    { from: "Delhi", to: "Jaipur", distance: "280 km", price: "₹2,499", time: "~4.5 hrs" },
    { from: "Mumbai", to: "Pune", distance: "150 km", price: "₹1,799", time: "~3 hrs" },
    { from: "Chandigarh", to: "Delhi", distance: "250 km", price: "₹2,199", time: "~4 hrs" },
    { from: "Bangalore", to: "Mysore", distance: "150 km", price: "₹1,699", time: "~3 hrs" },
    { from: "Chennai", to: "Pondicherry", distance: "160 km", price: "₹1,899", time: "~3 hrs" },
    { from: "Hyderabad", to: "Warangal", distance: "150 km", price: "₹1,599", time: "~2.5 hrs" },
];

export default function IntercityService() {
    const navigate = useNavigate();

    return (
        <div className="svc-page" style={{ "--svc-accent": "#0ea5e9", "--svc-accent-light": "#e0f2fe" }}>

            {/* ── HERO ── */}
            <section className="svc-hero">
                <div className="svc-hero-bg">
                    <img src="/Images/services/intercity-hero.png" alt="" />
                </div>
                <div className="svc-hero-overlay" />

                <div className="svc-hero-content">
                    <div className="svc-hero-text">
                        <span className="svc-badge">Long Distance</span>
                        <h1>Travel between cities, affordably</h1>
                        <p>
                            Comfortable outstation trips at fixed fares. AC cars, professional
                            drivers, and rest stops along the way.
                        </p>
                        <button className="svc-btn-primary" onClick={() => navigate("/intercity-booking")}>
                            🛣️ Book intercity trip
                        </button>
                    </div>
                </div>
            </section>

            {/* ── POPULAR ROUTES ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Popular routes</h2>
                    <p>Most booked intercity trips with transparent pricing</p>
                </div>

                <div className="svc-grid-cards">
                    {popularRoutes.map((r, i) => (
                        <div 
                          className="svc-grid-card" 
                          key={i}
                          onClick={() => navigate("/intercity-booking", {
                              state: {
                                  pickup: r.from,
                                  drop: r.to,
                                  price: parseInt(r.price.replace(/[^\d]/g, ''), 10)
                              }
                          })}
                          style={{ cursor: "pointer" }}
                        >
                            <div className="svc-grid-card-body">
                                <h3>{r.from} → {r.to}</h3>
                                <p>{r.distance} · {r.time}</p>
                                <span className="svc-grid-card-price">From {r.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── JOURNEY FEATURES ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>A better way to travel long distance</h2>
                    <p>Everything you need for a comfortable journey</p>
                </div>

                <div className="svc-features">
                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">❄️</div>
                        <h3>AC cars only</h3>
                        <p>Every intercity ride is in a fully air-conditioned, well-maintained vehicle for maximum comfort.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">🧳</div>
                        <h3>Generous luggage</h3>
                        <p>Plenty of trunk space for your bags, suitcases, and travel gear — no extra charges.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">☕</div>
                        <h3>Rest stop included</h3>
                        <p>Scheduled rest stops every 2 hours for refreshments so you arrive fresh and energized.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">💳</div>
                        <h3>Fixed pricing</h3>
                        <p>No surprises — pay the fare you see at booking time. Includes tolls and fuel charges.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">🧑‍✈️</div>
                        <h3>Expert drivers</h3>
                        <p>Highway-experienced drivers who know the routes. Trained for long-distance safety.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">📱</div>
                        <h3>Live trip updates</h3>
                        <p>Track your journey in real time. Share live location with family for peace of mind.</p>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="svc-section">
                <div className="svc-stats">
                    <div className="svc-stat">
                        <div className="svc-stat-value">500+</div>
                        <div className="svc-stat-label">Routes available</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">₹6/km</div>
                        <div className="svc-stat-label">Starting rate</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">4.9★</div>
                        <div className="svc-stat-label">Driver rating</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">100%</div>
                        <div className="svc-stat-label">AC guaranteed</div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-inner">
                    <h2>Plan your next outstation trip</h2>
                    <p>Fixed fares, comfortable cars, and professional drivers — intercity travel made easy.</p>
                    <div className="svc-cta-actions">
                        <button className="svc-btn-secondary" onClick={() => navigate("/intercity-booking")}>
                            🛣️ Search routes
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
