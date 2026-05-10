import { useState, useEffect } from "react";
import "./Admin.css";

export default function SurgeControl() {
  const [conditions, setConditions] = useState({});
  const [multiplier, setMultiplier] = useState(1.0);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/admin/surge")
      .then(res => res.json())
      .then(data => {
        setConditions(data.conditions);
        setMultiplier(data.effectiveMultiplier);
        setReasons(data.reasons);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const toggleCondition = async (key, currentActive) => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/surge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: key, active: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        setConditions(prev => ({
          ...prev,
          [key]: { ...prev[key], active: !currentActive }
        }));
        setMultiplier(data.effectiveMultiplier);
        setReasons(data.reasons);
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  if (loading) return <div className="admin-loading">Loading Surge Controls...</div>;

  const isSurge = multiplier > 1.0;

  return (
    <div className="surge-control-page">
      {/* Effective Multiplier Badge */}
      <div className={`surge-multiplier-badge ${isSurge ? "active" : ""}`}>
        <div className="surge-badge-label">Effective Surge Multiplier</div>
        <div className="surge-badge-value">
          {isSurge && <span className="surge-lightning">⚡</span>}
          {multiplier}×
        </div>
        {isSurge ? (
          <div className="surge-badge-reasons">
            Active: {reasons.join(" + ")}
          </div>
        ) : (
          <div className="surge-badge-reasons inactive">No surge active — Standard pricing</div>
        )}
      </div>

      {/* Toggle Cards */}
      <div className="surge-cards-grid">
        {Object.entries(conditions).map(([key, cond]) => (
          <div key={key} className={`surge-card ${cond.active ? "surge-card-active" : ""}`}>
            <div className="surge-card-header">
              <span className="surge-card-icon">{cond.icon}</span>
              <span className="surge-card-label">{cond.label}</span>
            </div>
            <div className="surge-card-multiplier">{cond.multiplier}× fare</div>
            <p className="surge-card-desc">
              {key === "rushHour" && "Simulates peak morning and evening commute hours with moderate fare increase."}
              {key === "heavyRain" && "Simulates low driver availability during heavy rainfall with significant fare increase."}
              {key === "festival" && "Simulates extreme demand during festivals and events with maximum fare increase."}
            </p>
            <button
              className={`surge-toggle-btn ${cond.active ? "surge-toggle-on" : ""}`}
              onClick={() => toggleCondition(key, cond.active)}
            >
              <span className="surge-toggle-knob" />
              <span className="surge-toggle-text">{cond.active ? "ACTIVE" : "OFF"}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="surge-info-footer">
        <span>💡</span>
        <p>Toggle conditions to simulate real-world surge pricing. Changes are applied instantly to all new price calculations across the platform.</p>
      </div>
    </div>
  );
}
