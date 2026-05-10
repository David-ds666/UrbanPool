import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import { timeAgo, notifTimestamp } from '../../../utils/timeAgo';
import './Sidebar.css';

const BOOKING_STEPS = [
  { key: 'confirmed',       label: 'Booked',      icon: '📋' },
  { key: 'driver_assigned', label: 'Driver Found', icon: '🚗' },
  { key: 'in_progress',     label: 'On the Way',   icon: '🛣️' },
  { key: 'completed',       label: 'Completed',    icon: '✅' },
];

function getStepIndex(status) {
  const s = (status || '').toLowerCase();
  if (s === 'completed')       return 3;
  if (s === 'in_progress')     return 2;
  if (s === 'driver_assigned') return 1;
  return 0;
}

const ACTIVE_STATUSES = ['confirmed', 'driver_assigned', 'in_progress'];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, userProfile, updateProfile, updateRideStatus } = useAuth();
  const [isBackendUp, setIsBackendUp]     = useState(false);

  // Live booking — ONLY from backend, no localStorage fallback
  const [liveBooking, setLiveBooking]     = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [completing, setCompleting]       = useState(false);
  const [completedMsg, setCompletedMsg]   = useState(false);
  const [completeError, setCompleteError] = useState('');

  // Chat — scoped to active booking only
  const [chatOpen, setChatOpen]           = useState(false);
  const [chatMessages, setChatMessages]   = useState([]);
  const [chatInput, setChatInput]         = useState('');
  const [socket, setSocket]               = useState(null);
  const [isDriverTyping, setIsDriverTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const userId = user?.userId || user?.uid || 'guest';

  // ── Backend health check ──
  useEffect(() => {
    const check = async () => {
      try { const r = await fetch('http://localhost:5001/api/admin/surge'); setIsBackendUp(r.ok); }
      catch { setIsBackendUp(false); }
    };
    check();
    const iv = setInterval(check, 10000);
    return () => clearInterval(iv);
  }, []);

  // ── Fetch active booking from backend when sidebar opens ──
  // Only 'confirmed', 'driver_assigned', 'in_progress' count as active
  // 'completed' and 'cancelled' bookings are intentionally excluded
  const fetchActiveBooking = () => {
    if (!user) return;
    setBookingLoading(true);
    fetch(`http://localhost:5001/api/bookings/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setLiveBooking(null); return; }
        // Backend now returns isActive flag — use it directly
        const active = data.find(b => b.isActive === true);
        setLiveBooking(active || null);
        if (active) {
          setCompletedMsg(false);
          setCompleteError('');
        }
      })
      .catch(() => setLiveBooking(null))
      .finally(() => setBookingLoading(false));
  };

  useEffect(() => {
    if (isOpen) fetchActiveBooking();
    // Close chat panel when sidebar closes
    if (!isOpen) {
      setChatOpen(false);
      setChatMessages([]);
    }
  }, [isOpen, userId]);

  // ── Mark ride as completed ──
  const handleMarkComplete = async () => {
    if (!liveBooking?.id) {
      setCompleteError('No booking ID found. Try reopening the sidebar.');
      return;
    }
    setCompleting(true);
    setCompleteError('');
    try {
      const res = await fetch(
        `http://localhost:5001/api/bookings/${liveBooking.id}/complete`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Update local booking state → shows completed step + success message
        setLiveBooking(prev => ({ ...prev, status: 'completed' }));
        setCompletedMsg(true);
        // Also sync localStorage ride status so /my-rides page is consistent
        if (updateRideStatus) updateRideStatus(liveBooking.id, 'completed');
        // After 3s, collapse the entire Active Ride section (ride is done)
        setTimeout(() => setLiveBooking(null), 3000);
      } else {
        setCompleteError(data.error || `Server returned ${res.status}. Try again.`);
      }
    } catch (err) {
      console.error('[UrbanPool] Mark complete error:', err);
      setCompleteError('Cannot reach backend. Is the server running on port 5001?');
    } finally {
      setCompleting(false);
    }
  };

  // ── Socket chat — only connects when there's an active booking and chat is open ──
  useEffect(() => {
    if (!liveBooking?.id || !chatOpen) return;

    fetch(`http://localhost:5001/api/chat/${liveBooking.id}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setChatMessages(d); })
      .catch(() => {});

    const s = io('http://localhost:5001', { transports: ['websocket'] });
    setSocket(s);
    s.on('connect', () => s.emit('join_chat', liveBooking.id));
    s.on('receive_message', m => { setIsDriverTyping(false); setChatMessages(p => [...p, m]); });
    s.on('driver_typing',      () => setIsDriverTyping(true));
    s.on('driver_typing_stop', () => setIsDriverTyping(false));
    return () => { s.disconnect(); setSocket(null); };
  }, [liveBooking?.id, chatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isDriverTyping]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !liveBooking?.id) return;
    if (socket?.connected) {
      socket.emit('send_message', { rideId: liveBooking.id, senderId: userId, text: chatInput });
    } else {
      setChatMessages(p => [...p, { id: `l_${Date.now()}`, senderId: userId, text: chatInput, sentAt: Date.now() }]);
    }
    setChatInput('');
  };

  const fmtTime = (msg) => {
    const ts = msg.sentAt || msg.createdAt;
    return ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const menuItems = [
    { icon: '👤', label: 'Profile',       path: '/profile' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '💳', label: 'Wallet',        path: '/wallet' },
    { icon: '🚗', label: 'My Rides',      path: '/my-rides' },
    { icon: '⭐', label: 'Promos',        path: '/promos' },
    { icon: '⚙️', label: 'Settings',      path: '/settings' },
    { icon: '❓', label: 'Help',          path: '/help' },
  ];

  // ── Time-based step auto-advance ──
  // Advances the tracker step based on how long ago the booking was made:
  //   0–3 min  → Booked (step 0)
  //   3–8 min  → Driver Found (step 1)
  //   8+ min   → On the Way (step 2) — "I've Arrived" button appears here
  // The DB status is also respected: we take whichever is higher.
  const [localStep, setLocalStep] = useState(0);

  const calcLocalStep = (booking) => {
    if (!booking?.createdAt) return 0;
    const elapsedMin = (Date.now() - new Date(booking.createdAt).getTime()) / 60000;
    if (elapsedMin >= 8) return 2;  // On the Way
    if (elapsedMin >= 3) return 1;  // Driver Found
    return 0;                        // Booked
  };

  // Recalculate every 30 s while sidebar is open
  useEffect(() => {
    if (!liveBooking) { setLocalStep(0); return; }
    setLocalStep(calcLocalStep(liveBooking));
    const iv = setInterval(() => setLocalStep(calcLocalStep(liveBooking)), 30_000);
    return () => clearInterval(iv);
  }, [liveBooking]);

  const unreadCount    = (userProfile.notifications || []).filter(n => !n.read).length;
  const dbStep         = getStepIndex(liveBooking?.status);       // from DB status
  const stepIndex      = Math.max(dbStep, localStep);             // whichever is further along
  const canMarkComplete = stepIndex >= 2;                         // only at "On the Way" or later

  // Show section when: booking exists (any status including completed for success msg)
  const showActiveRide = !!liveBooking;

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>

        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar-large">{userProfile.emoji}</div>
            <div className="user-info">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {userProfile.name || 'Set up your profile'}
                <span title={isBackendUp ? 'Backend Online' : 'Backend Offline'} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: isBackendUp ? '#22c55e' : '#ef4444',
                  display: 'inline-block', flexShrink: 0,
                }} />
              </h3>
            </div>
          </div>
          <button className="close-sidebar" onClick={onClose}>×</button>
        </div>

        <div className="sidebar-content">

          {/* ── Nav menu ── */}
          <ul className="sidebar-menu">
            {menuItems.map((item, i) => (
              <li key={i}>
                <Link to={item.path} className="sidebar-link" onClick={onClose}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="menu-badge">{unreadCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* ══════════════════════════════════════════
              ACTIVE RIDE — tracker + chat
              Shows ONLY when a ride is booked and active.
              Disappears on completion and on refresh if no active booking in DB.
          ══════════════════════════════════════════ */}
          {showActiveRide && (
            <div className="driver-comm-section">
              <p className="driver-comm-eyebrow">
                <span className="driver-comm-eyebrow-dot" /> Active Ride
              </p>

              {/* ── Booking tracker card ── */}
              <div className="active-booking-card">

                {/* Route */}
                <div className="ab-route">
                  <div className="ab-loc">
                    <span className="ab-dot ab-dot-start" />
                    <span className="ab-loc-text">{liveBooking.pickup}</span>
                  </div>
                  <div className="ab-line" />
                  <div className="ab-loc">
                    <span className="ab-dot ab-dot-end" />
                    <span className="ab-loc-text">{liveBooking.drop}</span>
                  </div>
                </div>

                {/* Meta chips */}
                <div className="ab-meta">
                  <span>#{liveBooking.id}</span>
                  {liveBooking.rideType && <span>{liveBooking.rideType}</span>}
                  {liveBooking.price    && <span>₹{liveBooking.price}</span>}
                </div>

                {/* Driver info — shown only when a driver is assigned */}
                {liveBooking.driverName && (
                  <div className="ab-driver-info">
                    <div className="ab-driver-avatar">
                      {liveBooking.driverName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ab-driver-text">
                      <strong>{liveBooking.driverName}</strong>
                      {liveBooking.driverVehicle && <span>{liveBooking.driverVehicle}</span>}
                      {liveBooking.driverPhone   && <span>📞 {liveBooking.driverPhone}</span>}
                    </div>
                  </div>
                )}

                {/* 4-step progress tracker */}
                <div className="ab-steps">
                  {BOOKING_STEPS.map((step, i) => (
                    <div key={step.key}
                      className={`ab-step ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'current' : ''}`}>
                      <div className="ab-step-circle">
                        {i <= stepIndex
                          ? step.icon
                          : <span className="ab-step-num">{i + 1}</span>}
                      </div>
                      <span className="ab-step-label">{step.label}</span>
                      {i < BOOKING_STEPS.length - 1 && (
                        <div className={`ab-step-line ${i < stepIndex ? 'done' : ''}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Manual completion — main purpose of this feature */}
                {completedMsg ? (
                  <div className="ab-completed-msg">✅ Ride completed! Section will close shortly.</div>
                ) : (
                  <>
                    <button
                      className="ab-complete-btn"
                      onClick={handleMarkComplete}
                      disabled={completing}
                    >
                      {completing ? 'Updating…' : '✓ I\'ve Arrived — Mark Complete'}
                    </button>
                    {completeError && (
                      <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '6px', textAlign: 'center' }}>
                        ⚠️ {completeError}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* ── Chat with Driver — ONLY visible during active ride ── */}
              <button
                id="sidebar-driver-chat-btn"
                className={`driver-comm-card ${chatOpen ? 'expanded' : ''}`}
                onClick={() => setChatOpen(v => !v)}
                style={{ marginTop: '10px' }}
              >
                <span className="driver-comm-shimmer" aria-hidden="true" />
                <div className="driver-comm-avatar">🚘</div>
                <div className="driver-comm-info">
                  <span className="driver-comm-title">Chat with Driver</span>
                  <span className="driver-comm-sub">{liveBooking.pickup} → {liveBooking.drop}</span>
                </div>
                <div className="driver-comm-right">
                  <span className="driver-live-pill"><span className="driver-live-dot-inner" />Live</span>
                  <span className={`driver-comm-chevron ${chatOpen ? 'open' : ''}`}>›</span>
                </div>
              </button>

              {/* Inline chat panel */}
              <div id="sidebar-chat-panel" className={`sidebar-inline-chat ${chatOpen ? 'open' : ''}`}>
                <div className="sic-header">
                  <div className="sic-header-avatar">🚘</div>
                  <div className="sic-header-info">
                    <span className="sic-header-name">{liveBooking.rideType || 'Your'} Driver</span>
                    <span className="sic-header-route">{liveBooking.pickup} → {liveBooking.drop}</span>
                  </div>
                  <span className="sic-header-status"><span className="sic-status-dot" />Connected</span>
                </div>

                <div className="sic-messages">
                  {chatMessages.length === 0 ? (
                    <div className="sic-empty">
                      <span className="sic-empty-icon">🔒</span>
                      <p>End-to-end secure chat</p>
                      <small>Only you and your driver can see these messages</small>
                    </div>
                  ) : chatMessages.map(msg => (
                    <div key={msg.id || msg._id} className="sic-bubble-wrap">
                      <div className={`sic-bubble ${msg.senderId === userId ? 'sent' : 'received'}`}>
                        {msg.text}
                      </div>
                      {fmtTime(msg) && (
                        <span className={`sic-time ${msg.senderId === userId ? 'sent' : 'received'}`}>
                          {fmtTime(msg)}
                        </span>
                      )}
                    </div>
                  ))}
                  {isDriverTyping && (
                    <div className="sic-bubble received sic-typing"><span /><span /><span /></div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="sic-input-form" onSubmit={handleSendChat}>
                  <input
                    id="sidebar-chat-input"
                    type="text"
                    placeholder="Message your driver…"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    autoComplete="off"
                  />
                  <button id="sidebar-chat-send" type="submit" disabled={!chatInput.trim()}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Latest Alerts ── */}
          <div className="sidebar-section">
            <h4 className="section-title">Latest Alerts</h4>
            <div className="notification-mini-list">
              {userProfile.notifications?.slice(0, 3).map(notif => (
                <div key={notif.id} className={`notif-mini-card ${notif.type}`}>
                  <div className="notif-header">
                    <span className="notif-title">{notif.title}</span>
                    <button className="notif-dismiss" onClick={() => updateProfile({
                      notifications: userProfile.notifications.filter(n => n.id !== notif.id)
                    })}>×</button>
                  </div>
                  <p className="notif-msg">{notif.message}</p>
                  <span className="notif-time">
                    {timeAgo(notifTimestamp(notif)) || notif.time || ''}
                  </span>
                </div>
              ))}
              {(!userProfile.notifications || userProfile.notifications.length === 0) && (
                <p className="empty-text">No new notifications</p>
              )}
            </div>
          </div>

          {/* ── Recent Rides ── */}
          <div className="sidebar-section">
            <h4 className="section-title">My Recent Rides</h4>
            <div className="ride-mini-list">
              {userProfile.rides?.slice(0, 2).map(ride => (
                <div key={ride.id} className="ride-mini-card">
                  <div className="ride-route"><span className="dot start" /><span className="location">{ride.from}</span></div>
                  <div className="ride-route"><span className="dot end" /><span className="location">{ride.to}</span></div>
                  <div className="ride-meta">
                    <span className="ride-status">{ride.status}</span>
                    <span className="ride-date">{ride.date}</span>
                  </div>
                </div>
              ))}
              {(!userProfile.rides || userProfile.rides.length === 0) && (
                <p className="empty-text">No rides booked yet</p>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="sidebar-footer">
          {user ? (
            <button className="sidebar-logout" onClick={() => { logout(); onClose(); }}>Log Out</button>
          ) : (
            <Link to="/login" className="sidebar-login" onClick={onClose}>Log In</Link>
          )}
          <div className="sidebar-app-info">
            <span>UrbanPool v1.2</span>
            <span style={{ display: 'block', fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
              © 2026 UrbanPool | Developed by Davinder Singh
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
