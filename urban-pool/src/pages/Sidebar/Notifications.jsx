import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, notifTimestamp } from '../../utils/timeAgo';
import './Notifications.css';

const SOCKET_URL = 'http://localhost:5001';

const NOTIF_ICONS = {
  ride_confirmed:   '✅',
  driver_arriving:  '🚕',
  driver_assigned:  '🚗',
  promo:            '🎁',
  addition:         '💰',
  ride:             '🚗',
  bonus:            '⭐',
  info:             'ℹ️',
};

export default function Notifications() {
  const { user, userProfile, updateProfile, addNotification } = useAuth();
  const notifications = userProfile.notifications || [];

  // ── Mark ALL as read when page mounts ──
  useEffect(() => {
    const hasUnread = notifications.some(n => !n.read);
    if (hasUnread) {
      updateProfile({
        notifications: notifications.map(n => ({ ...n, read: true }))
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Real-time socket listener ──
  useEffect(() => {
    const socket = io(SOCKET_URL);
    if (user?.uid) socket.emit('join_room', user.uid);

    socket.on('notification', (newNotif) => {
      addNotification(newNotif);
      if (Notification.permission === 'granted') {
        new Notification(newNotif.title, { body: newNotif.message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    });

    return () => socket.disconnect();
  }, [user, addNotification]);

  const dismiss = (id) => {
    updateProfile({ notifications: notifications.filter(n => n.id !== id) });
  };

  return (
    <div className="notifications-container">
      <div className="notif-header">
        <h1>Notifications</h1>
        <button className="clear-all" onClick={() => updateProfile({ notifications: [] })}>
          Clear All
        </button>
      </div>

      <div className="notif-list">
        {notifications.map(notif => (
          <div key={notif.id} className={`notif-card ${notif.type} ${notif.read ? 'read' : 'unread'}`}>
            <div className="notif-icon">
              {NOTIF_ICONS[notif.type] || '🔔'}
            </div>
            <div className="notif-body">
              <div className="notif-title-row">
                <h3>{notif.title}</h3>
                <span className="notif-time">
                  {timeAgo(notifTimestamp(notif)) || notif.time || ''}
                </span>
              </div>
              <p>{notif.message}</p>
            </div>
            <button className="notif-close" onClick={() => dismiss(notif.id)}>×</button>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="empty-notif">
          <div className="empty-bell">🔔</div>
          <h3>Your inbox is empty</h3>
          <p>We'll notify you when there's an update on your ride or a new offer!</p>
        </div>
      )}
    </div>
  );
}
