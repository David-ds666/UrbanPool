import { useNavigate } from "react-router-dom";
import "./ServicePage.css";

export default function RideService() {
    const navigate = useNavigate();

    return (
        <div className="svc-page" style={{ "--svc-accent": "#111", "--svc-accent-light": "#f1f5f9" }}>

            {/* ── HERO ── */}
            <section className="svc-hero">
                <div className="svc-hero-bg">
                    <img src="/Images/services/ride-hero.png" alt="" />
                </div>
                <div className="svc-hero-overlay" />

                <div className="svc-hero-content">
                    <div className="svc-hero-text">
                        <span className="svc-badge">Most Popular</span>
                        <h1>Go anywhere with UrbanPool</h1>
                        <p>
                            Request a ride, hop in, and go. Available in 15,000+ cities
                            worldwide — your reliable ride is just a tap away.
                        </p>
                        <div style={{ display: "flex", gap: 16 }}>
                            <button className="svc-btn-primary" onClick={() => navigate("/search")}>
                                🚗 Request a ride
                            </button>
                            <button
                                className="svc-btn-primary"
                                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                                onClick={() => navigate("/")}
                            >
                                Learn more
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>How it works</h2>
                    <p>Get where you need to go in just three easy steps</p>
                </div>

                <div className="svc-steps">
                    <div className="svc-step">
                        <div className="svc-step-number">1</div>
                        <h3>Request</h3>
                        <p>Enter your pickup and drop-off locations, then tap "Request". We'll find the nearest driver for you.</p>
                    </div>

                    <div className="svc-step">
                        <div className="svc-step-number">2</div>
                        <h3>Match</h3>
                        <p>Get matched with a nearby driver in seconds. See their name, car, and real-time arrival on the map.</p>
                    </div>

                    <div className="svc-step">
                        <div className="svc-step-number">3</div>
                        <h3>Ride</h3>
                        <p>Hop in and enjoy the ride. Pay seamlessly through the app — cash or card, your choice.</p>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="svc-section">
                <div className="svc-stats">
                    <div className="svc-stat">
                        <div className="svc-stat-value">15K+</div>
                        <div className="svc-stat-label">Cities worldwide</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">5M+</div>
                        <div className="svc-stat-label">Rides completed</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">4.8★</div>
                        <div className="svc-stat-label">Average rating</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">24/7</div>
                        <div className="svc-stat-label">Always available</div>
                    </div>
                </div>
            </section>

            {/* ── SAFETY FEATURES ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Your safety comes first</h2>
                    <p>Every ride is backed by industry-leading safety features</p>
                </div>

                <div className="svc-features">
                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">🛡️</div>
                        <h3>Verified drivers</h3>
                        <p>Every driver undergoes background checks and regular vehicle inspections for your peace of mind.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">📍</div>
                        <h3>Real-time tracking</h3>
                        <p>Share your trip with loved ones and let them track your journey in real time on the map.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">🆘</div>
                        <h3>24/7 Support</h3>
                        <p>Dedicated safety team available round the clock. In-app emergency button for instant help.</p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-inner">
                    <h2>Ready to ride?</h2>
                    <p>Join millions of riders who travel smarter every day with UrbanPool.</p>
                    <div className="svc-cta-actions">
                        <button className="svc-btn-secondary" onClick={() => navigate("/search")}>
                            🚗 Request a ride now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
