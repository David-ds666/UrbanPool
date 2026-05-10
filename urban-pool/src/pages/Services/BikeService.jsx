import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ServicePage.css";

export default function BikeService() {
    const navigate = useNavigate();
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");

    return (
        <div className="svc-page" style={{ "--svc-accent": "#ec4899", "--svc-accent-light": "#fdf2f8" }}>

            {/* ── HERO ── */}
            <section className="svc-hero">
                <div className="svc-hero-bg">
                    <img src="/Images/services/bike-hero.png" alt="" />
                </div>
                <div className="svc-hero-overlay" />

                <div className="svc-hero-content">
                    <div className="svc-hero-text">
                        <span className="svc-badge">Eco Friendly</span>
                        <h1>Zip through traffic on a bike</h1>
                        <p>
                            The fastest way to get around the city. Affordable,
                            safe, and green — reach your destination in minutes.
                        </p>
                        <button className="svc-btn-primary" onClick={() => navigate("/bike-booking")}>
                            🛵 Book a bike ride
                        </button>
                    </div>
                </div>
            </section>

            {/* ── QUICK BOOK ── */}
            <section className="svc-section" style={{ background: "#f8fafc" }}>
                <div className="svc-quickbook">
                    <h3>Quick Book</h3>
                    <input 
                        placeholder="Enter pickup location" 
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                    />
                    <input 
                        placeholder="Enter destination" 
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                    />
                    <button 
                        className="svc-btn-secondary" 
                        onClick={() => navigate("/bike-booking", { state: { pickup, drop } })}
                    >
                        Go Now
                    </button>
                </div>
            </section>

            {/* ── ECO STATS ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Ride green, save more</h2>
                    <p>Good for the planet, better for your wallet</p>
                </div>

                <div className="svc-eco-stats">
                    <div className="svc-eco-card">
                        <div className="svc-eco-icon">🌱</div>
                        <div className="eco-val">40%</div>
                        <div className="eco-label">Less carbon emission</div>
                    </div>
                    <div className="svc-eco-card">
                        <div className="svc-eco-icon">⌚</div>
                        <div className="eco-val">15m</div>
                        <div className="eco-label">Saved per trip</div>
                    </div>
                    <div className="svc-eco-card">
                        <div className="svc-eco-icon">💰</div>
                        <div className="eco-val">₹15</div>
                        <div className="eco-label">Starts at just</div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-inner">
                    <h2>Ready to zip?</h2>
                    <p>Be the traffic-dodging hero of your city. Fast, safe, and reliable.</p>
                    <div className="svc-cta-actions">
                        <button className="svc-btn-secondary" onClick={() => navigate("/bike-booking")}>
                            🛵 Book a bike now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
