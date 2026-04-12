import { useNavigate } from "react-router-dom";
import "./ServicePage.css";

export default function CourierService() {
    const navigate = useNavigate();

    return (
        <div className="svc-page" style={{ "--svc-accent": "#f59e0b", "--svc-accent-light": "#fffbeb" }}>

            {/* ── HERO ── */}
            <section className="svc-hero">
                <div className="svc-hero-bg">
                    <img src="/Images/services/courier-hero.png" alt="" />
                </div>
                <div className="svc-hero-overlay" />

                <div className="svc-hero-content">
                    <div className="svc-hero-text">
                        <span className="svc-badge">Same Day Delivery</span>
                        <h1>Send anything across the city</h1>
                        <p>
                            Fast, reliable, and secure package delivery. From documents
                            to gifts — we'll get it there today.
                        </p>
                        <button className="svc-btn-primary" onClick={() => navigate("/courier-booking")}>
                            📦 Send a package
                        </button>
                    </div>
                </div>
            </section>

            {/* ── PACKAGE SIZES ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Choose your package size</h2>
                    <p>Transparent pricing based on weight and dimensions</p>
                </div>

                <div className="svc-package-cards">
                    <div className="svc-package-card" onClick={() => navigate("/courier-booking", { state: { pkgType: "documents" } })} style={{ cursor: "pointer" }}>
                        <div className="svc-package-icon">📄</div>
                        <h3>Small</h3>
                        <p className="pkg-dims">Up to 2 kg (Envelopes, etc.)</p>
                        <p className="pkg-price">₹49</p>
                    </div>

                    <div className="svc-package-card" onClick={() => navigate("/courier-booking", { state: { pkgType: "smallbox" } })} style={{ cursor: "pointer" }}>
                        <div className="svc-package-icon">📦</div>
                        <h3>Medium</h3>
                        <p className="pkg-dims">Up to 7 kg (Shoe boxes, etc.)</p>
                        <p className="pkg-price">₹129</p>
                    </div>

                    <div className="svc-package-card" onClick={() => navigate("/courier-booking", { state: { pkgType: "largeparcel" } })} style={{ cursor: "pointer" }}>
                        <div className="svc-package-icon">🏠</div>
                        <h3>Large</h3>
                        <p className="pkg-dims">Up to 15 kg (Large boxes, etc.)</p>
                        <p className="pkg-price">₹249</p>
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Track your delivery</h2>
                    <p>Real-time updates from pickup to drop-off</p>
                </div>

                <div className="svc-timeline">
                    <div className="svc-timeline-step">
                        <div className="svc-timeline-dot">1</div>
                        <h4>Pickup</h4>
                        <p>Driver arrives at your door</p>
                    </div>
                    <div className="svc-timeline-step">
                        <div className="svc-timeline-dot">2</div>
                        <h4>Transit</h4>
                        <p>Live tracking on map</p>
                    </div>
                    <div className="svc-timeline-step">
                        <div className="svc-timeline-dot">3</div>
                        <h4>Delivered</h4>
                        <p>Photo proof of delivery</p>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="svc-section">
                <div className="svc-stats">
                    <div className="svc-stat">
                        <div className="svc-stat-value">60m</div>
                        <div className="svc-stat-label">Avg. delivery time</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">100%</div>
                        <div className="svc-stat-label">Insured packages</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">1M+</div>
                        <div className="svc-stat-label">Delivered safely</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">24/7</div>
                        <div className="svc-stat-label">Support available</div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-inner">
                    <h2>Need to send something?</h2>
                    <p>From a forgotten document to a surprise gift — we'll get it there today.</p>
                    <div className="svc-cta-actions">
                        <button className="svc-btn-secondary" onClick={() => navigate("/courier-booking")}>
                            📦 Send a package now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
