# UrbanPool

UrbanPool is a full-stack ride-sharing and carpooling web application built for urban travel. It lets passengers search and book rides, drivers manage ride requests, and admins monitor rides, users, pricing, and platform activity.

## Author

**Davinder Singh**  
GitHub: [David-ds666](https://github.com/David-ds666)

## Project Overview

UrbanPool is similar to a simplified Ola/Uber-style platform with extra student-project features like carpool matching, wallet payments, real-time driver tracking, driver chat, admin controls, and viva documentation.

The project is organized as:

```text
UrbanPool/
├── urban-pool/       # React + Vite frontend
├── backend/          # Node.js + Express + Socket.io backend
├── VIVA_DOCS/        # Viva explanation and technical question material
└── README.md
```

## Features

- Passenger signup/login with Firebase Authentication
- Ride search with pickup, drop, date, and time
- Multiple ride categories such as UrbanPool, UrbanGo, XL, Premier, Electric, Bike, Intercity, Courier, Rentals, Airport, and City rides
- Dynamic fare calculation using distance, ride type, ETA, and surge multiplier
- Booking confirmation with wallet, cash, UPI/QR, and card UI
- UrbanPool wallet with balance and transaction history
- Active ride tracking in the sidebar
- Real-time driver chat using Socket.io
- Simulated driver movement and status updates
- Driver portal with online status, ride requests, active rides, and earnings
- Admin dashboard for rides, users, revenue stats, and surge pricing control
- AI/help chatbot UI
- Viva documentation for project explanation and technical questions

## Tech Stack

### Frontend

- React
- Vite / Rolldown Vite
- React Router
- Firebase Authentication
- Socket.io Client
- Recharts
- Lucide React
- Google Maps related packages

### Backend

- Node.js
- Express.js
- Socket.io
- MySQL
- Sequelize ORM
- Axios
- CORS
- dotenv

## Main Code Areas

| Area | File/Folder |
| --- | --- |
| Frontend entry | `urban-pool/src/main.jsx` |
| Frontend routes | `urban-pool/src/App.jsx` |
| Authentication context | `urban-pool/src/context/AuthContext.jsx` |
| Firebase setup | `urban-pool/src/config/firebase.js` |
| Landing page | `urban-pool/src/pages/Home/Landing.jsx` |
| Ride search | `urban-pool/src/pages/Search/SearchRide.jsx` |
| Booking pages | `urban-pool/src/pages/Booking/` |
| Sidebar features | `urban-pool/src/components/common/Sidebar/Sidebar.jsx` |
| Driver portal | `urban-pool/src/pages/Driver/` |
| Admin panel | `urban-pool/src/pages/Admin/` |
| Frontend pricing utilities | `urban-pool/src/utils/pricing.js` and `urban-pool/src/utils/distance.js` |
| Backend server | `backend/server.js` |
| Viva notes | `VIVA_DOCS/` |

## Frontend Setup

```bash
cd urban-pool
npm install
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

## Backend Setup

```bash
cd backend
npm install
node server.js
```

The backend normally runs on:

```text
http://localhost:5001
```

## Database Setup

The backend uses MySQL with Sequelize.

Default database name:

```text
urbanpool
```

The backend attempts to create the database and sync tables automatically when `backend/server.js` starts.

Main Sequelize models include:

- `Booking`
- `UserProfile`
- `Wallet`
- `Transaction`
- `PoolRide`
- `PoolBooking`
- `Message`
- `Review`
- `RideRequest`
- `PriceLog`

## Important API Groups

| Feature | Example Routes |
| --- | --- |
| Pricing | `POST /api/price` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/:userId` |
| Wallet | `GET /api/wallet/:userId`, `POST /api/wallet/add` |
| Profile | `GET /api/profile/:userId`, `POST /api/profile/:userId` |
| Chat | `GET /api/chat/:rideId` |
| Carpool | `/api/carpool/...` |
| Driver | `/api/driver/...` |
| Admin | `/api/admin/...` |

## Real-Time Features

Socket.io is used for:

- Joining user-specific rooms
- Joining ride chat rooms
- Sending and receiving driver chat messages
- Driver typing indicator
- Driver status updates
- Simulated live driver location updates

Important events include:

- `join_room`
- `join_chat`
- `send_message`
- `receive_message`
- `driver_typing`
- `driver_typing_stop`
- `driverLocation`
- `driverStatus`

## Viva Documentation

The `VIVA_DOCS/` folder contains explanation material for college viva preparation.

Useful files:

- `VIVA_DOCS/01_PROJECT_OVERVIEW.md`
- `VIVA_DOCS/02_TECHNOLOGY_STACK.md`
- `VIVA_DOCS/13_API_ENDPOINTS.md`
- `VIVA_DOCS/16_TECHNOLOGY_QUESTIONS.md`
- `VIVA_DOCS/17_VIVA_QUESTIONS_ALL_TOPICS.md`
- `VIVA_DOCS/TECHNICAL_QUESTIONS/`

## Notes

- The main frontend project is inside `urban-pool/`.
- The backend is inside `backend/`.
- For best results, run frontend and backend in separate terminals.
- Dependency folders such as `node_modules/` and build output such as `dist/` are intentionally ignored. Run `npm install` inside `urban-pool/` and `backend/` after cloning.

## Attribution

This project was created by **Davinder Singh**.

GitHub: [https://github.com/David-ds666](https://github.com/David-ds666)

If you use, modify, or reference this project, please keep proper credit to the original author.
