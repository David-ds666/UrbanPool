import { useNavigate } from "react-router-dom";
import "./ServicePage.css";

export default function ReserveService() {
    const navigate = useNavigate();

    return (
        <div className="svc-page" style={{ "--svc-accent": "#6366f1", "--svc-accent-light": "#eef2ff" }}>

            {/* ── HERO ── */}
            <section className="svc-hero">
                <div className="svc-hero-bg">
                    <img src="/Images/services/reserve-hero.png" alt="" />
                </div>
                <div className="svc-hero-overlay" />

                <div className="svc-hero-content">
                    <div className="svc-hero-text">
                        <span className="svc-badge">Plan Ahead</span>
                        <h1>Reserve your ride in advance</h1>
                        <p>
                            Schedule a pickup up to 30 days ahead. No surge pricing,
                            guaranteed on-time arrival — travel stress-free.
                        </p>
                        <button className="svc-btn-primary" onClick={() => navigate("/reserve-booking")}>
                            📅 Schedule a ride
                        </button>
                    </div>
                </div>
            </section>

            {/* ── HOW SCHEDULING WORKS ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>How scheduling works</h2>
                    <p>Plan ahead and ride with confidence</p>
                </div>

                <div className="svc-steps">
                    <div className="svc-step">
                        <div className="svc-step-number">1</div>
                        <h3>Set your time</h3>
                        <p>Choose your pickup date and time — schedule up to 30 days in advance for any occasion.</p>
                    </div>

                    <div className="svc-step">
                        <div className="svc-step-number">2</div>
                        <h3>Confirm details</h3>
                        <p>Enter your route, select vehicle type, and lock in your fare — no surprises later.</p>
                    </div>

                    <div className="svc-step">
                        <div className="svc-step-number">3</div>
                        <h3>Ride on time</h3>
                        <p>Your driver arrives at the scheduled time. Get reminders so you're always ready.</p>
                    </div>
                </div>
            </section>

            {/* ── BENEFITS ── */}
            <section className="svc-section">
                <div className="svc-section-header">
                    <h2>Why reserve with UrbanPool?</h2>
                    <p>Benefits that make planning ahead worthwhile</p>
                </div>

                <div className="svc-features">
                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">💰</div>
                        <h3>No surge pricing</h3>
                        <p>Lock in your fare at the time of booking. No matter what happens with demand, your price stays the same.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">⏰</div>
                        <h3>Guaranteed pickup</h3>
                        <p>We guarantee a driver will arrive at your scheduled time — or the ride is on us.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">✈️</div>
                        <h3>Perfect for flights</h3>
                        <p>Schedule airport pickups with flight tracking. We adjust if your flight is early or delayed.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">🔔</div>
                        <h3>Smart reminders</h3>
                        <p>Get notified before your pickup so you're never caught off guard. Modify anytime.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">🔄</div>
                        <h3>Free cancellation</h3>
                        <p>Plans changed? Cancel for free up to 1 hour before your pickup with no questions asked.</p>
                    </div>

                    <div className="svc-feature-card">
                        <div className="svc-feature-icon">📊</div>
                        <h3>Ride history</h3>
                        <p>All your reservations in one place. Re-book favorite routes with a single tap.</p>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="svc-section">
                <div className="svc-stats">
                    <div className="svc-stat">
                        <div className="svc-stat-value">30</div>
                        <div className="svc-stat-label">Days advance booking</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">98%</div>
                        <div className="svc-stat-label">On-time arrivals</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">0</div>
                        <div className="svc-stat-label">Surge pricing</div>
                    </div>
                    <div className="svc-stat">
                        <div className="svc-stat-value">1hr</div>
                        <div className="svc-stat-label">Free cancel window</div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-inner">
                    <h2>Plan your next trip today</h2>
                    <p>Whether it's a meeting, a flight, or a special occasion — reserve your ride and relax.</p>
                    <div className="svc-cta-actions">
                        <button className="svc-btn-secondary" onClick={() => navigate("/reserve-booking")}>
                            📅 Schedule now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
