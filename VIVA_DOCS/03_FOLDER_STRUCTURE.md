# 03 — Folder Structure

## Top-level layout
```
UrbanPool/
├── backend/          ← Node.js + Express server
│   ├── server.js     ← THE main backend file (all routes, DB, sockets)
│   └── .env          ← Secret keys (API keys, DB password) — NOT shared
│
├── urban-pool/       ← React frontend (Vite project)
│   ├── src/          ← All source code
│   └── public/       ← Static files (favicon etc.)
│
└── VIVA_DOCS/        ← This documentation folder
```

## Frontend source (urban-pool/src/)
```
src/
├── main.jsx              ← Entry point — renders App into the browser
├── App.jsx               ← All routes defined here (React Router)
│
├── context/
│   └── AuthContext.jsx   ← Global state: user, wallet, rides, notifications
│
├── pages/                ← Each page = one URL
│   ├── Home/             ← Landing page (/)
│   ├── Auth/             ← Login, Signup pages
│   ├── Ride/             ← RideResults, CarpoolResults, OfferRide
│   ├── Booking/          ← Standard, Intercity, Bike, Rental, Courier bookings
│   ├── Driver/           ← Driver dashboard, earnings
│   ├── Admin/            ← Admin panel pages
│   └── Sidebar/          ← Profile, Wallet, MyRides, Notifications, etc.
│
├── components/
│   ├── common/           ← Reusable components used across pages
│   │   ├── Navbar/       ← Top navigation bar
│   │   ├── Sidebar/      ← Slide-out user menu with active ride
│   │   ├── ChatWidget/   ← AI chatbot bubble
│   │   ├── LocationInput/← Address autocomplete input
│   │   └── DriverTracker/← Real-time map for driver location
│   └── landing/          ← Sections only used on the landing page
│       ├── RideSearchCard/  ← The main "book a ride" form
│       ├── Benefits/        ← Why use UrbanPool section
│       └── Revolution/      ← Carpool revolution section
│
├── utils/
│   ├── distance.js       ← Geocoding + road distance calculation
│   ├── pricing.js        ← Fetch price from backend, with fallback
│   ├── timeAgo.js        ← Converts timestamps to "5 min ago" format
│   └── avatars.js        ← Generates user profile avatars
│
└── layouts/
    ├── AdminLayout.jsx   ← Wrapper for all admin pages
    └── DriverLayout.jsx  ← Wrapper for driver pages
```

## Backend (backend/server.js)
Everything is in ONE file: `server.js`
It contains:
- Database connection (Sequelize + MySQL)
- All model definitions (Booking, UserProfile, Wallet, etc.)
- All API routes (GET/POST for bookings, prices, users, admin, etc.)
- Socket.io event handlers (real-time driver movement, chat)
- Distance calculation functions (Photon geocoding + OSRM)
- Surge pricing logic

## Why one file for backend?
For simplicity in a student project. In a real production app, you'd split this into:
- `models/` — database models
- `routes/` — API route handlers
- `controllers/` — business logic
- `middleware/` — authentication, logging
