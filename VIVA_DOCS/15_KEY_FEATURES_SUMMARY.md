# 15 — Key Features Summary (Quick Revision Sheet)

## Copy this into ChatGPT and say: "Explain each feature to me simply"

---

## Complete Feature List

### 🔐 Authentication
- Firebase email/password login
- Google OAuth (one-click sign in)
- Session persists after page refresh
- Protected routes (can't book without login)

### 🏠 Landing Page
- Hero section with ride search form
- "Benefits of Carpooling" section
- "Carpool Revolution" section with stats
- "Plan for Later" section for scheduled rides
- Floating AI chatbot button

### 🔍 Ride Search & Booking
- Enter pickup, drop, date, time
- 6 ride types with different pricing
- Real road distance calculated via OSRM API
- Live surge pricing indicator
- Carpool matching (shows how many others are going your way)
- Google Maps route embed

### 💳 Payment System
- UrbanPool Wallet with balance
- Add money via UPI, Credit/Debit Card simulation
- Transaction history
- Cash payment option
- Wallet deducted automatically on booking

### 🚗 Active Ride Tracking
- Sidebar shows active ride after booking
- 4-step progress tracker (Booked → Driver Found → On the Way → Completed)
- Steps auto-advance based on time (3min, 8min intervals)
- "I've Arrived — Mark Complete" button (appears at 8+ minutes)
- Driver simulation with moving car on map

### 💬 Real-time Chat
- Chat with Driver during active ride
- Socket.io WebSockets (instant messaging)
- Message history loaded from database
- "Driver is typing..." indicator

### 🤖 AI Assistant
- Gemini-powered chatbot
- Available on all pages
- Answers questions about the app and rides
- Keeps conversation history

### 🗺️ My Rides Page
- Shows all past and current rides
- Fetched from backend database (not localStorage)
- Filter by: All, Active, Completed, Cancelled
- Active rides show "I've Reached — Complete Ride" button
- Shows driver name and vehicle info

### 🔔 Notifications
- Real-time push via Socket.io
- "Ride Confirmed", "Payment Processed", "Ride Completed" alerts
- Notification badge count on sidebar icon
- Can dismiss individual notifications

### 🚌 Carpool (Pool Rides)
- Drivers can offer shared rides with price per seat
- Passengers can search and book seats
- Route matching algorithm
- Separate booking and management flow

### ✈️ Intercity Rides
- Long-distance travel between cities
- Separate booking form
- Vehicle class selection (sedan, SUV, etc.)

### 🏍️ Other Booking Types
- Bike rides (two-wheelers)
- Car rentals (by the hour)
- Courier delivery

### 👨‍💼 Driver Dashboard
- Driver can view assigned rides
- Earnings tracker
- Ride history

### 🛡️ Admin Panel
- View ALL rides from ALL users
- User management
- Surge pricing control (manual override)
- Revenue analytics

---

## 5 things that make this project impressive for a viva

1. **Real-time features** — Socket.io for live driver movement and chat
2. **AI integration** — Google Gemini API for the chatbot
3. **Full authentication** — Firebase with Google OAuth
4. **Complete payment system** — Wallet, transactions, deductions
5. **Production-quality architecture** — MySQL database, REST API, React frontend, proper state management

---

## Common viva questions and quick answers

**Q: What is the main technology stack?**
A: React.js (frontend), Node.js + Express (backend), MySQL (database), Firebase (auth), Socket.io (real-time)

**Q: How does authentication work?**
A: Firebase Authentication. User logs in → Firebase returns a UID → we use UID to fetch/store data in MySQL

**Q: How is distance calculated?**
A: Photon API geocodes addresses → OSRM gives road distance → Haversine formula as fallback

**Q: What is surge pricing?**
A: Dynamic price multiplier during peak hours (morning/evening rush, rain). Admin can also set it manually.

**Q: How does real-time tracking work?**
A: Socket.io keeps a persistent connection. Backend simulates driver movement and emits coordinates every 1.2 seconds. Frontend updates the map.

**Q: What is Socket.io?**
A: A library for WebSocket connections — allows server to push data to client instantly without the client needing to ask (unlike normal HTTP).

**Q: What is Sequelize?**
A: An ORM (Object Relational Mapper) that lets us interact with MySQL using JavaScript. We define models as JS objects and Sequelize generates SQL automatically.

**Q: What is an API?**
A: Application Programming Interface. A set of URLs the frontend calls to get or send data. Like a waiter between frontend (customer) and database (kitchen).

**Q: How does the carpool matching work?**
A: When a user searches for a ride, we count how many existing RideRequests match the same pickup+drop area. We display this count as "X people near you".

**Q: Why MySQL instead of MongoDB?**
A: Our data is relational — rides link to users, transactions link to wallets, reviews link to bookings. MySQL is better for this structured, relational data.
