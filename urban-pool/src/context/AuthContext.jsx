import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initial state helper
  const getInitialProfile = () => {
    const saved = localStorage.getItem('urbanpool_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: "",
      phone: "",
      emoji: "😎",
      balance: 265.00,
      transactions: [
        { id: 1, type: 'bonus', amount: 50, date: '2025-10-25', description: 'Welcome Bonus from UrbanPool', status: 'completed' },
        { id: 2, type: 'deduction', amount: 165, date: '2025-10-24', description: 'Ride to Chandigarh Sector 17', status: 'completed' },
      ],
      rides: [
        { id: 'UP-10293', date: '25 Oct 2025', time: '14:30', from: 'Mohali Phase 7', to: 'Chandigarh Sector 17', price: 165, type: 'UrbanPool', status: 'Completed' },
      ],
      notifications: [
        { id: 1, type: 'info', title: 'Welcome to UrbanPool', message: 'Explore our new features and enjoy your rides!', createdAt: Date.now() - 172800000, read: true },
      ]
    };
  };

  const [userProfile, setUserProfile] = useState(getInitialProfile());

  // Persist profile changes to localStorage
  useEffect(() => {
    localStorage.setItem('urbanpool_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // One-time migration: normalise old notifications that lack read/createdAt fields
  useEffect(() => {
    setUserProfile(prev => {
      const needsMigration = (prev.notifications || []).some(n => n.read === undefined || n.createdAt === undefined);
      if (!needsMigration) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map(n => ({
          // If id looks like a ms timestamp (> year 2020), use it as createdAt
          createdAt: n.createdAt !== undefined
            ? n.createdAt
            : (typeof n.id === 'number' && n.id > 1577836800000)
              ? n.id
              : Date.now() - 7 * 24 * 60 * 60 * 1000, // default: 7 days ago
          read: n.read !== undefined ? n.read : true, // old = already read
          ...n,
        }))
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch profile from backend (source of truth)
        try {
          const res = await fetch(`http://localhost:5001/api/profile/${currentUser.uid}`);
          const data = await res.json();
          if (data.profile) {
            setUserProfile(prev => ({
              ...prev,
              name: data.profile.name || '',
              phone: data.profile.phone || prev.phone,
              avatar: data.profile.avatar || prev.avatar || 'avatar1',
              isDriver: data.profile.isDriver || false,
              vehicleNumber: data.profile.vehicleNumber || '',
              vehicleName: data.profile.vehicleName || '',
              licenseId: data.profile.licenseId || '',
              city: data.profile.city || '',
            }));
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
          // Don't fallback to email prefix — keep name empty if not set
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    // Optional: clear profile or keep it? Usually keep for persistence, but clear on actual logout if security bound.
    // For this app, we'll keep it for the "wow" factor of persistence unless it's a shared device.
  };

  const updateProfile = (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    // Also persist to backend
    if (auth.currentUser) {
      fetch(`http://localhost:5001/api/profile/${auth.currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(err => console.error('Profile sync error:', err));
    }
  };

  const addTransaction = (tx) => {
    setUserProfile(prev => ({
      ...prev,
      balance: prev.balance + (tx.type === 'addition' || tx.type === 'bonus' ? tx.amount : -tx.amount),
      transactions: [{ id: Date.now(), ...tx }, ...prev.transactions]
    }));
  };

  const addNotification = (notif) => {
    setUserProfile(prev => ({
      ...prev,
      notifications: [
        { id: Date.now(), createdAt: Date.now(), read: false, ...notif },
        ...prev.notifications
      ]
    }));
  };

  const addRide = (ride) => {
    setUserProfile(prev => ({
      ...prev,
      rides: [{ id: ride.id, ...ride }, ...prev.rides]
    }));
  };

  const updateRideStatus = (rideId, newStatus) => {
    setUserProfile(prev => ({
      ...prev,
      rides: prev.rides.map(ride => 
        ride.id === rideId ? { ...ride, status: newStatus } : ride
      )
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, userProfile, updateProfile, 
      addTransaction, logout, addNotification, 
      addRide, updateRideStatus 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);