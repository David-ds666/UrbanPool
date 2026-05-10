import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RidePages.css";
import cityHero from "../../assets/images/city_hero.png";

const SUPPORTED_CITIES = [
  'new york', 'london', 'mumbai', 'delhi', 'chandigarh', 'mohali', 
  'san francisco', 'toronto', 'sydney', 'paris', 'tokyo', 'dubai', 'singapore'
];

export default function Cities() {
    const navigate = useNavigate();
    const [pickup, setPickup] = useState("");
    const [searchedCity, setSearchedCity] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);

    const handleSearch = () => {
        if (!pickup.trim()) return;
        const cityLower = pickup.trim().toLowerCase();
        const found = SUPPORTED_CITIES.some(c => cityLower.includes(c) || c.includes(cityLower));
        setSearchedCity(pickup);
        setIsAvailable(found);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="ride-page-wrapper">
            <section className="ride-hero">
                <div className="ride-left">
                    <h1>Find your way in 15,000+ cities</h1>
                    <p>
                        UrbanPool connects people in thousands of cities around the world.
                        Whether you're commuting to work or exploring a new destination,
                        we're here to help you move with confidence.
                    </p>

                    <div className="ride-input">
                        <input 
                            placeholder="Enter city name" 
                            value={pickup} 
                            onChange={(e) => {
                                setPickup(e.target.value);
                                setSearchedCity(null);
                            }} 
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="ride-actions">
                        <button className="ride-primary-btn" onClick={handleSearch}>
                            Check city availability
                        </button>
                    </div>

                    {searchedCity && (
                        <div className="city-search-results fadeIn">
                            {isAvailable ? (
                                <div className="city-available-box">
                                    <div className="city-status-header">
                                        <span className="status-icon success">✓</span>
                                        <h3>UrbanPool is available in {searchedCity}!</h3>
                                    </div>
                                    <p>Experience reliable rides, anytime you need them.</p>
                                    
                                    <div className="city-services-grid">
                                        <div className="service-badge">🚗 Standard</div>
                                        <div className="service-badge">🚙 SUV</div>
                                        <div className="service-badge">✨ Premier</div>
                                        <div className="service-badge">🛺 Auto</div>
                                        <div className="service-badge">🏍️ Bike</div>
                                        <div className="service-badge">📦 Courier</div>
                                    </div>
                                    
                                    <button className="book-now-btn" onClick={() => navigate("/city-booking", { state: { pickup: searchedCity } })}>
                                        Book a ride in {searchedCity}
                                    </button>
                                </div>
                            ) : (
                                <div className="city-unavailable-box">
                                    <div className="city-status-header">
                                        <span className="status-icon warning">📍</span>
                                        <h3>We're not in {searchedCity} yet</h3>
                                    </div>
                                    <p>UrbanPool is growing rapidly! We're constantly expanding to new cities and hope to serve you there soon.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="ride-right">
                    <img src={cityHero} alt="Global Cities" />
                </div>
            </section>

            <section className="ride-info-section">
                <div className="ride-info-content">
                    <h2>Always around the corner</h2>
                    <p>
                        Wherever you go, UrbanPool is likely already there. From major metropolitan
                        hubs to quiet suburban streets, our network of drivers ensures you can
                        always find a ride when you need one.
                    </p>

                    <div className="city-stats-grid">
                        <div className="stat-card">
                            <h3>70+ Countries</h3>
                            <p>Operating across continents to bridge distances.</p>
                        </div>
                        <div className="stat-card">
                            <h3>150M+ Users</h3>
                            <p>A global community of riders and drivers.</p>
                        </div>
                        <div className="stat-card">
                            <h3>24/7 Availability</h3>
                            <p>Reliable transportation at any hour of the day.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
