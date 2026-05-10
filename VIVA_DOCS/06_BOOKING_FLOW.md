# 06 — Booking Flow (How a User Books a Ride)

## Step-by-step flow

### Step 1: Home page — Enter pickup & drop
- User goes to `http://localhost:5173`
- They see the "Request a Ride" form (RideSearchCard component)
- They type a pickup location (autocomplete using LocationInput component)
- They type a drop location
- They select date and time
- They click "Search Rides"

### Step 2: Ride Results page (`/ride-results`)
- Page shows the route on a Google Maps embed
- 6 ride types are shown: UrbanPool, UrbanGo, UrbanXL, Premier, UrbanEV, Bike
- Prices are fetched from backend: `POST /api/price`
- Distance is calculated using Photon geocoding + OSRM road routing
- Surge pricing is applied if high-demand conditions are met
- User selects a ride type
- Clicks "Book [RideName] · ₹[price]"

### Step 3: Booking page (`/booking`)
- User sees the booking confirmation form
- Selects payment method: **Wallet** or **Cash**
- If Wallet: backend checks if balance is sufficient
- Clicks "Confirm Booking"

### Step 4: Booking created
- `POST /api/bookings` sends all details to backend
- Backend creates a row in the `Bookings` MySQL table
- Wallet balance is deducted (if wallet payment)
- A Transaction record is created
- A Socket.io notification is sent to the user: "Ride Confirmed!"
- Backend starts **simulating driver movement** toward the user

### Step 5: Sidebar shows Active Ride
- User can open the sidebar to see the active ride tracker
- Driver location moves on the DriverTrackerMap component
- Status progresses: Confirmed → Driver Found → On the Way

### Step 6: Mark Complete
- User clicks "I've Arrived — Mark Complete" when they reach the destination
- `POST /api/bookings/:id/complete` updates status to 'completed'
- Active ride section disappears from sidebar

## Booking types available
| Type | Route | File |
|------|-------|------|
| Standard ride | `/booking` | Standard booking page |
| Intercity | `/intercity` | Long distance between cities |
| Bike | `/bike-booking` | Bike rides |
| Rental | `/rental` | Hourly car rental |
| Courier | `/courier` | Send a package |
| Carpool | `/carpool-results` | Shared ride with others |

## Key files
- `src/components/landing/RideSearchCard/RideSearchCard.jsx` — search form
- `src/pages/Ride/RideResults.jsx` — ride type selection + pricing
- `src/pages/Booking/` — all booking pages
- `backend/server.js` → `POST /api/bookings` route
