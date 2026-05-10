import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/timeAgo';
import './MyRides.css';

const API = 'http://localhost:5001';
const ACTIVE_STATUSES = ['confirmed', 'driver_assigned', 'in_progress'];

/** Normalise a backend Booking row to a display-friendly object */
function normaliseBackend(b) {
  return {
    _src:      'backend',
    id:        b.id,
    from:      b.pickup   || b.from || '—',
    to:        b.drop     || b.to   || '—',
    type:      b.rideType || b.type || 'Ride',
    date:      b.date     || (b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'),
    time:      b.time     || (b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    price:     b.price,
    status:    b.status   || 'confirmed',
    isActive:  b.isActive === true,
    driverName:    b.driverName    || null,
    driverVehicle: b.driverVehicle || null,
    createdAt: b.createdAt,
  };
}

/** Normalise a localStorage ride to the same shape */
function normaliseLocal(r) {
  return {
    _src:     'local',
    id:       r.id,
    from:     r.from || r.pickup || '—',
    to:       r.to   || r.drop   || '—',
    type:     r.type || r.rideType || 'Ride',
    date:     r.date || '—',
    time:     r.time || '',
    price:    r.price,
    status:   r.status || 'Confirmed',
    isActive: ACTIVE_STATUSES.includes((r.status || '').toLowerCase()),
    createdAt: null,
  };
}

const STATUS_LABELS = {
  confirmed:       'Confirmed',
  driver_assigned: 'Driver Found',
  in_progress:     'On the Way',
  completed:       'Completed',
  cancelled:       'Cancelled',
};

export default function MyRides() {
  const { user, userProfile, updateRideStatus, addNotification } = useAuth();
  const [rides, setRides]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');
  const [completing, setCompleting] = useState(null); // bookingId being completed

  const userId = user?.uid || user?.userId;

  const fetchAndMerge = useCallback(async () => {
    setLoading(true);
    let backendRides = [];

    if (userId) {
      try {
        const res  = await fetch(`${API}/api/bookings/${userId}`);
        const data = await res.json();
        if (Array.isArray(data)) backendRides = data.map(normaliseBackend);
      } catch { /* backend offline — fall back gracefully */ }
    }

    // Merge: backend is source of truth. Add localStorage rides not already in backend.
    const backendIds = new Set(backendRides.map(b => String(b.id)));
    const localOnly  = (userProfile.rides || [])
      .filter(r => !backendIds.has(String(r.id)))
      .map(normaliseLocal);

    // Sort newest first
    const merged = [...backendRides, ...localOnly].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    setRides(merged);
    setLoading(false);
  }, [userId, userProfile.rides]);

  useEffect(() => { fetchAndMerge(); }, [fetchAndMerge]);

  const handleMarkComplete = async (ride) => {
    if (ride._src !== 'backend' || !ride.id) return;
    setCompleting(ride.id);
    try {
      const res  = await fetch(`${API}/api/bookings/${ride.id}/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        // Update ride list locally
        setRides(prev => prev.map(r =>
          r.id === ride.id ? { ...r, status: 'completed', isActive: false } : r
        ));
        // Sync localStorage
        if (updateRideStatus) updateRideStatus(ride.id, 'Completed');
        addNotification({
          type:    'ride',
          title:   'Ride Completed ✅',
          message: `Your ride #${ride.id} (${ride.from} → ${ride.to}) has been marked complete!`,
        });
      }
    } catch { /* ignore */ }
    finally { setCompleting(null); }
  };

  const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

  const filteredRides = rides.filter(r => {
    if (filter === 'All')       return true;
    if (filter === 'Active')    return r.isActive || ACTIVE_STATUSES.includes((r.status || '').toLowerCase());
    if (filter === 'Completed') return (r.status || '').toLowerCase() === 'completed';
    if (filter === 'Cancelled') return (r.status || '').toLowerCase() === 'cancelled';
    return true;
  });

  const statusLabel = (s) => STATUS_LABELS[(s || '').toLowerCase()] || s || 'Confirmed';
  const statusClass = (s) => (s || '').toLowerCase().replace('_', '-');

  return (
    <div className="rides-container">
      <div className="rides-header">
        <div className="header-content">
          <h1>My Rides</h1>
          <p>Manage and track your trip history</p>
        </div>
        <div className="rides-filter">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === 'Active' && rides.filter(r => r.isActive).length > 0 && (
                <span className="filter-badge">{rides.filter(r => r.isActive).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rides-list">
        {loading ? (
          <div className="rr-loading">
            <div className="rides-spinner" />
            Fetching your trip history…
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="empty-rides">
            <div className="empty-icon">📂</div>
            <h3>No {filter !== 'All' ? filter.toLowerCase() : ''} rides found</h3>
            <p>Your history for this category is empty.</p>
          </div>
        ) : (
          filteredRides.map(ride => (
            <div key={`${ride._src}-${ride.id}`} className={`ride-card ${ride.isActive ? 'active-ride' : ''}`}>

            {/* Top row: active banner (left) + date (right) */}
            <div className="card-top-row">
              {ride.isActive ? (
                <div className="active-ride-banner">
                  <span className="pulse-dot" />
                  Ride in Progress
                </div>
              ) : (
                <span />
              )}
              <span className="ride-badge">{ride.date}</span>
            </div>

              <div className="ride-main">
                <div className="route-viz">
                  <div className="node start" />
                  <div className="connector" />
                  <div className="node end" />
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
                  <div className="ride-price">₹{ride.price ?? '—'}</div>
                  <div className={`ride-status ${statusClass(ride.status)}`}>
                    {statusLabel(ride.status)}
                  </div>
                </div>
              </div>

              {/* Driver info if available */}
              {ride.driverName && (
                <div className="ride-driver-row">
                  <span className="driver-avatar-sm">{ride.driverName.charAt(0)}</span>
                  <span>{ride.driverName}</span>
                  {ride.driverVehicle && <span className="driver-vehicle-sm">• {ride.driverVehicle}</span>}
                </div>
              )}

              <div className="ride-footer">
                <span className="ride-id">#{ride.id} • {ride.type}</span>
                <div className="ride-actions">
                  {ride.isActive ? (
                    <button
                      className="ride-btn complete-btn"
                      onClick={() => handleMarkComplete(ride)}
                      disabled={completing === ride.id}
                    >
                      {completing === ride.id ? (
                        'Updating…'
                      ) : (
                        <><span>✓</span> I've Reached — Complete Ride</>
                      )}
                    </button>
                  ) : (
                    <>
                      <button className="ride-btn secondary">Support</button>
                      <button className="ride-btn primary">Details</button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
