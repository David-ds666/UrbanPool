import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigation, CheckCircle2 } from "lucide-react";

export default function DriverActiveRides() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const driverId = user?.userId || user?.uid || "driver_system";
      const res = await fetch(`http://localhost:5001/api/driver/rides/${driverId}`);
      const data = await res.json();
      setRides(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/driver/status/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchRides(); // Refresh list to reflect changes
      }
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  const activeRides = rides.filter(r => r.status === 'driver_assigned' || r.status === 'in_progress');
  const pastRides = rides.filter(r => r.status === 'completed');

  return (
    <div className="driver-active-rides">
      <h2 style={{fontSize: '24px', marginBottom: '24px', color: '#111827'}}>Active Assignments</h2>

      {loading ? (
        <p>Loading your rides...</p>
      ) : activeRides.length === 0 ? (
        <div className="offline-state" style={{border: '1px dashed #cbd5e1', borderRadius: '16px', height: '250px'}}>
          <h3 style={{fontSize: '18px'}}>No active rides</h3>
          <p>Go to your Live Requests to accept a trip.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {activeRides.map(ride => (
            <div key={ride.id} className="request-card" style={{borderTop: '4px solid #3b82f6'}}>
              <div className="req-price-tag">₹{ride.price}</div>
              <div className="req-meta" style={{color: '#3b82f6'}}>
                {ride.status === 'driver_assigned' ? 'Heading to pickup' : 'On Trip'}
              </div>

              <div className="req-locations" style={{marginBottom: '16px'}}>
                <div className="req-loc-text">
                  <span>From</span>
                  <strong>{ride.pickup}</strong>
                </div>
                <div className="req-loc-text" style={{marginTop:'8px'}}>
                  <span>To</span>
                  <strong>{ride.drop}</strong>
                </div>
              </div>

              <div className="req-actions" style={{marginTop: 'auto'}}>
                {ride.status === 'driver_assigned' ? (
                  <button className="req-btn" style={{background: '#000', color: '#fff'}} onClick={() => updateStatus(ride.id, 'in_progress')}>
                    <Navigation size={18} style={{marginRight:'6px', display:'inline', verticalAlign: 'text-bottom'}} />
                    Start Trip
                  </button>
                ) : (
                  <button className="req-btn" style={{background: '#10b981', color: '#fff'}} onClick={() => updateStatus(ride.id, 'completed')}>
                    <CheckCircle2 size={18} style={{marginRight:'6px', display:'inline', verticalAlign: 'text-bottom'}} />
                    Complete Trip
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{fontSize: '24px', marginTop: '40px', marginBottom: '24px', color: '#111827'}}>Completed Trips</h2>
      {pastRides.length === 0 ? (
         <p style={{color: '#64748b'}}>No completed trips yet.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {pastRides.map(ride => (
            <div key={ride.id} style={{padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <strong style={{display: 'block', fontSize: '15px'}}>{ride.pickup} ➔ {ride.drop}</strong>
                <span style={{fontSize: '12px', color: '#64748b'}}>{new Date(ride.createdAt).toLocaleString()}</span>
              </div>
              <div style={{fontSize: '18px', fontWeight: '700', color: '#10b981'}}>+₹{ride.price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
