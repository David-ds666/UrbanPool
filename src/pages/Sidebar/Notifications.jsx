import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import './Notifications.css';

const SOCKET_URL = 'http://localhost:5001';

export default function Notifications() {
  const { user, userProfile, updateProfile, addNotification } = useAuth();
  const notifications = userProfile.notifications || [];

  useEffect(() => {
    const socket = io(SOCKET_URL);

    // Join personal room if user exists
    if (user?.uid) {
      socket.emit('join_room', user.uid);
    }

    socket.on('notification', (newNotif) => {
      console.log('New real-time notification:', newNotif);
      addNotification(newNotif);
      
      // Browser Notification if supported
      if (Notification.permission === 'granted') {
        new Notification(newNotif.title, { body: newNotif.message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    });

    return () => socket.disconnect();
  }, [user, addNotification]);

  const markAsRead = (id) => {
    updateProfile({
      notifications: notifications.filter(n => n.id !== id)
    });
  };

  return (
    <div className="notifications-container">
      <div className="notif-header">
        <h1>Notifications</h1>
        <button className="clear-all" onClick={() => updateProfile({ notifications: [] })}>Clear All</button>
      </div>

      <div className="notif-list">
        {notifications.map(notif => (
          <div key={notif.id} className={`notif-card ${notif.type}`}>
            <div className="notif-icon">
              {notif.type === 'ride_confirmed' ? '✅' : notif.type === 'driver_arriving' ? '🚕' : notif.type === 'promo' ? '🎁' : '🔔'}
            </div>
            <div className="notif-body">
              <div className="notif-title-row">
                <h3>{notif.title}</h3>
                <span className="notif-time">{notif.time}</span>
              </div>
              <p>{notif.message}</p>
            </div>
            <button className="notif-close" onClick={() => markAsRead(notif.id)}>×</button>
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
