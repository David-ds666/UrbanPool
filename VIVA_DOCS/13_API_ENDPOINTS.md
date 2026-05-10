# 13 — API Endpoints (Backend Routes)

## What is an API?
API (Application Programming Interface) = a set of URL addresses the frontend can call to get or send data. Our backend exposes these URLs on `http://localhost:5001`.

## HTTP Methods used
- **GET** = fetch data (read)
- **POST** = send data (create/update)

---

## Pricing & Distance
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/price` | Calculate price + distance for a ride |

---

## Bookings
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/:userId` | Get all bookings for a user (with isActive flag) |
| POST | `/api/bookings/:bookingId/complete` | Mark a booking as completed |

---

## Carpool
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/carpool/rides` | Driver offers a new carpool ride |
| GET | `/api/carpool/rides` | Get all available carpool rides |
| POST | `/api/carpool/rides/:rideId/book` | Passenger books a seat in a carpool |
| GET | `/api/carpool/my-pool-bookings/:userId` | Get carpool bookings for a user |
| POST | `/api/carpool/rides/:rideId/complete` | Complete a carpool ride |
| DELETE | `/api/carpool/rides/:rideId` | Delete a carpool ride |

---

## User Profile
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/profile/:userId` | Get a user's profile |
| POST | `/api/profile` | Create or update a user's profile |

---

## Wallet
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/wallet/:userId` | Get wallet balance |
| POST | `/api/wallet/add` | Add money to wallet |
| GET | `/api/wallet/transactions/:userId` | Get transaction history |

---

## Reviews
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/reviews` | Submit a ride review |
| GET | `/api/reviews/:bookingId` | Get reviews for a booking |

---

## Chat
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/chat/:rideId` | Load chat history for a ride |
| POST | `/api/chat/ai` | Send message to AI chatbot |

---

## Admin
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/admin/rides` | All rides (all users) |
| GET | `/api/admin/users` | All registered users |
| GET | `/api/admin/surge` | Current surge pricing settings |
| POST | `/api/admin/surge` | Update surge settings |
| GET | `/api/admin/revenue` | Revenue statistics |

---

## Real-time (Socket.io events — not REST)
| Event | Direction | What it does |
|-------|-----------|-------------|
| `join_chat` | Client → Server | Join a ride's chat room |
| `send_message` | Client → Server | Send a chat message |
| `receive_message` | Server → Client | Receive a chat message |
| `driver_typing` | Server → Client | Driver is typing indicator |
| `driverLocation` | Server → Client | Driver GPS coordinates update |
| `driverStatus` | Server → Client | Driver status update (Arriving, etc.) |
| `notification` | Server → Client | Push notification to user |
| `join` | Client → Server | Join personal notification room |

---

## Example: What happens when you book a ride

1. **POST /api/price** — get price for the ride
2. User confirms → **POST /api/bookings** — creates booking, deducts wallet
3. Server emits `notification` via Socket.io — "Ride Confirmed!"
4. Server starts `simulateDriverMovement()` — emits `driverLocation` every 1.2s
5. User opens sidebar → **GET /api/bookings/:userId** — fetches active booking
6. User marks complete → **POST /api/bookings/:id/complete** — status → 'completed'
