import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './MyRides.css';

export default function MyRides() {
  const { user, userProfile, updateRideStatus, addNotification } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Synchronize with AuthContext rides for real-time demonstration
    if (userProfile && userProfile.rides) {
      setRides(userProfile.rides);
    }
    setLoading(false);
  }, [userProfile.rides]);
  
  const filteredRides = rides.filter(ride => {
    if (filter === 'All') return true;
    return ride.status === filter;
  });

  const handleCompleteRide = (rideId) => {
    updateRideStatus(rideId, 'Completed');
    addNotification({
      type: 'success',
      title: 'Ride Completed',
      message: `Your ride #${rideId} has been marked as completed. We hope you enjoyed it!`
    });
  };

  return (
    <div className="rides-container">
      <div className="rides-header">
        <div className="header-content">
          <h1>My Rides</h1>
          <p>Manage and track your trip history</p>
        </div>
        <div className="rides-filter">
          {['All', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rides-list">
        {loading ? (
          <div className="rr-loading">Fetching your trip history...</div>
        ) : filteredRides.map(ride => (
          <div key={ride.id} className="ride-card">
            <div className="ride-badge">{ride.date}</div>
            <div className="ride-main">
              <div className="route-viz">
                <div className="node start"></div>
                <div className="connector"></div>
                <div className="node end"></div>
              </div>
              <div className="route-details">
                <div className="location-group">
                  <span className="timestamp">{ride.time}</span>
                  <h4>{ride.from}</h4>
                </div>
                <div className="location-group">
                  <h4>{ride.to}</h4>
                </div>
              </div>
              <div className="price-status">
                <div className="ride-price">₹{ride.price}</div>
                <div className={`ride-status ${ride.status?.toLowerCase() || 'confirmed'}`}>
                  {ride.status || 'Confirmed'}
                </div>
              </div>
            </div>
            <div className="ride-footer">
              <span className="ride-id">#{ride.id} • {ride.type}</span>
              <div className="ride-actions">
                <button className="ride-btn secondary">Support</button>
                {ride.status !== 'Completed' && ride.status !== 'Cancelled' ? (
                  <button 
                    className="ride-btn primary"
                    onClick={() => handleCompleteRide(ride.id)}
                  >
                    Complete Ride
                  </button>
                ) : (
                  <button className="ride-btn primary">Details</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRides.length === 0 && (
        <div className="empty-rides">
          <div className="empty-icon">📂</div>
          <h3>No {filter !== 'All' ? filter.toLowerCase() : ''} rides found</h3>
          <p>Your history for this category is empty.</p>
        </div>
      )}
    </div>
  );
}
