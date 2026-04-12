import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlanForLater.css";

export default function PlanForLater() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Generate time options (every 30 mins)
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      timeOptions.push(`${hh}:${mm}`);
    }
  }

  const handleNext = () => {
    if (!date || !time) {
      alert("Please select both date and time");
      return;
    }
    navigate("/reserve", { state: { date, time } });
  };

  return (
    <section className="plan-wrapper">
      <h2 className="plan-title">Plan for later</h2>

      <div className="plan-section">
        {/* LEFT CARD */}
        <div className="plan-card">
          <div className="plan-left">
            <h3>Get your ride right<br />with UrbanPool Reserve</h3>
            <p className="plan-sub">Choose date and time</p>

            <div className="plan-inputs">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">Time</option>
                {timeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button className="plan-btn" onClick={handleNext}>Next</button>
          </div>

          <div className="plan-right">
            <img src="/public/images/reserve.png" alt="Reserve" />
          </div>
        </div>

        {/* BENEFITS */}
        <div className="plan-benefits">
          <h4>Benefits</h4>
          <ul>
            <li>Choose your exact pickup time up to 90 days in advance</li>
            <li>Extra wait time included to meet your ride</li>
            <li>Cancel at no charge up to 60 minutes in advance</li>
          </ul>
          <span className="plan-terms">See terms</span>
        </div>
      </div>
    </section>
  );
}