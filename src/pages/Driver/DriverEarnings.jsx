import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function DriverEarnings() {
  const { user } = useAuth();
  const driverId = user?.uid || "driver_system";

  const [data, setData] = useState({
    summary: { today: 0, week: 0, month: 0, allTime: 0, totalTrips: 0 },
    chartData: [],
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("week");

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5001/api/driver/earnings/${driverId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

  const { summary, chartData, transactions } = data;

  // Find max earnings for chart scaling
  const maxEarning = Math.max(...chartData.map(d => d.earnings), 1);

  const SUMMARY_CARDS = [
    { label: "Today", value: summary.today, color: "#10b981" },
    { label: "This Week", value: summary.week, color: "#3b82f6" },
    { label: "This Month", value: summary.month, color: "#8b5cf6" },
    { label: "All Time", value: summary.allTime, color: "#f59e0b" },
  ];

  if (loading) {
    return (
      <div className="earnings-page">
        <div className="earnings-loading">Loading earnings data...</div>
      </div>
    );
  }

  return (
    <div className="earnings-page">
      <div className="earnings-header">
        <h2>Earnings Overview</h2>
        <div className="earnings-total-trips">
          <span className="earnings-trip-icon">🚗</span>
          <span>{summary.totalTrips} total trips completed</span>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="earnings-summary-grid">
        {SUMMARY_CARDS.map((card, i) => (
          <div key={i} className="earnings-summary-card" style={{ borderTop: `3px solid ${card.color}` }}>
            <span className="earnings-card-label">{card.label}</span>
            <span className="earnings-card-value" style={{ color: card.color }}>₹{card.value}</span>
          </div>
        ))}
      </div>

      {/* ── CHART ── */}
      <div className="earnings-chart-section">
        <div className="earnings-chart-header">
          <h3>Last 7 Days</h3>
          <div className="earnings-chart-tabs">
            <button
              className={`chart-tab ${activeTab === "earnings" ? "active" : ""}`}
              onClick={() => setActiveTab("earnings")}
            >
              Earnings
            </button>
            <button
              className={`chart-tab ${activeTab === "rides" ? "active" : ""}`}
              onClick={() => setActiveTab("rides")}
            >
              Rides
            </button>
          </div>
        </div>

        <div className="earnings-chart">
          {chartData.map((d, i) => {
            const value = activeTab === "rides" ? d.rides : d.earnings;
            const maxVal = activeTab === "rides"
              ? Math.max(...chartData.map(x => x.rides), 1)
              : maxEarning;
            const height = maxVal > 0 ? Math.max((value / maxVal) * 100, 4) : 4;
            const isToday = i === chartData.length - 1;

            return (
              <div key={i} className={`chart-bar-group ${isToday ? "today" : ""}`}>
                <span className="chart-bar-value">
                  {activeTab === "rides" ? value : `₹${value}`}
                </span>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      height: `${height}%`,
                      background: isToday
                        ? "linear-gradient(180deg, #10b981, #059669)"
                        : "linear-gradient(180deg, #cbd5e1, #94a3b8)",
                    }}
                  />
                </div>
                <span className="chart-bar-label">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TRANSACTIONS ── */}
      <div className="earnings-transactions">
        <h3>Recent Transactions</h3>

        {transactions.length === 0 ? (
          <div className="earnings-empty">
            <span>💸</span>
            <p>No completed trips yet. Start driving to earn!</p>
          </div>
        ) : (
          <div className="earnings-tx-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="earnings-tx-card">
                <div className="earnings-tx-left">
                  <div className="earnings-tx-route">
                    <span className="tx-dot green"></span>
                    <span className="tx-location">{tx.pickup?.substring(0, 30)}{tx.pickup?.length > 30 ? '...' : ''}</span>
                  </div>
                  <div className="earnings-tx-route">
                    <span className="tx-dot red"></span>
                    <span className="tx-location">{tx.drop?.substring(0, 30)}{tx.drop?.length > 30 ? '...' : ''}</span>
                  </div>
                  <div className="earnings-tx-meta">
                    {tx.rideType} • {tx.date} at {tx.time}
                  </div>
                </div>
                <div className="earnings-tx-amount">+₹{tx.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
