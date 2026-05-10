# 03 - Feature Flow And Code Mapping

Use this file when teacher asks: "Which code does this work?"

## User Opens Website

### Flow
1. Browser loads `urban-pool/index.html`.
2. React starts from `urban-pool/src/main.jsx`.
3. `main.jsx` renders `App`.
4. `App.jsx` defines all frontend routes.
5. Public pages use `PublicLayout`, which shows Navbar, Sidebar, Footer, ChatBot, and page content.

### Main Files
- `urban-pool/index.html`
- `urban-pool/src/main.jsx`
- `urban-pool/src/App.jsx`
- `urban-pool/src/layouts/PublicLayout.jsx`

### Questions To Ask AI
- Explain the full startup flow of my React app.
- Explain why `main.jsx` wraps `App` in `AuthProvider`.
- Explain how `App.jsx` controls navigation.

## User Signup/Login

### Flow
1. User opens `/signup` or `/login`.
2. Auth page calls Firebase auth functions.
3. Firebase returns user object with UID.
4. `AuthContext` listens through `onAuthStateChanged`.
5. Profile is fetched from backend using Firebase UID.
6. Navbar/sidebar update based on logged-in state.

### Main Files
- `urban-pool/src/pages/Auth/Login.jsx`
- `urban-pool/src/pages/Auth/Signup.jsx`
- `urban-pool/src/config/firebase.js`
- `urban-pool/src/context/AuthContext.jsx`
- `backend/server.js` profile routes

### Questions To Ask AI
- Explain login flow with Firebase and AuthContext.
- Explain why Firebase UID is important in this project.
- Explain how frontend and backend user profiles are connected.

## User Searches For Ride

### Flow
1. User enters pickup, drop, date, and time.
2. Landing page or search page navigates to results.
3. Ride results call pricing utility.
4. Pricing utility calls backend `/api/price`.
5. Backend calculates distance, fare, ETA, and surge.
6. Frontend displays ride options.

### Main Files
- `urban-pool/src/components/landing/RideSearchCard/RideSearchCard.jsx`
- `urban-pool/src/pages/Search/SearchRide.jsx`
- `urban-pool/src/pages/Ride/RideResults.jsx`
- `urban-pool/src/utils/pricing.js`
- `urban-pool/src/utils/distance.js`
- `backend/server.js` `/api/price`

### Questions To Ask AI
- Explain how ride search moves from frontend input to backend price result.
- Explain how route state is passed between pages.
- Explain what happens if backend price API fails.

## Price And Distance Calculation

### Flow
1. Frontend calls `calculateRidePrice`.
2. `calculateRidePrice` sends pickup/drop/rideType to backend.
3. Backend calls `getRealRouteData`.
4. It tries Google Maps if key exists.
5. Then Photon geocoding plus OSRM routing.
6. Then Haversine/heuristic fallback.
7. Backend applies base fare, per-km rate, ETA multiplier, and surge multiplier.

### Main Files
- `urban-pool/src/utils/pricing.js`
- `urban-pool/src/utils/distance.js`
- `backend/server.js`

### Important Backend Functions
- `getRealRouteData`
- `geocodeWithPhoton`
- `getOSRMDistance`
- `haversineDistance`
- `calculateHeuristicDistance`
- `getEffectiveSurge`

### Questions To Ask AI
- Explain my three-level distance calculation system.
- Explain how fare is calculated in my backend.
- Explain why I used fallback distance logic.

## User Confirms Booking

### Flow
1. User selects a ride option.
2. User reaches booking page with pickup/drop/price/type in route state.
3. User chooses payment method.
4. Booking page calls `saveBooking`.
5. `saveBooking` sends POST request to `/api/bookings`.
6. Backend saves booking.
7. If wallet payment, backend updates wallet and transaction.
8. Backend starts driver movement simulation.
9. Frontend shows booking success and driver tracker.
10. AuthContext adds local notification and ride entry.

### Main Files
- `urban-pool/src/pages/Booking/Booking.jsx`
- `urban-pool/src/services/bookingService.js`
- `urban-pool/src/context/AuthContext.jsx`
- `urban-pool/src/components/common/DriverTracker/DriverTrackerMap.jsx`
- `backend/server.js` booking routes

### Questions To Ask AI
- Explain booking flow from button click to database save.
- Explain how wallet payment is processed.
- Explain how notification and My Rides are updated after booking.

## Active Ride In Sidebar

### Flow
1. User opens sidebar.
2. Sidebar calls `/api/bookings/:userId`.
3. Backend returns bookings with `isActive` flag.
4. Sidebar selects active booking.
5. Sidebar shows booking steps.
6. User can open driver chat.
7. User can mark ride completed.

### Main Files
- `urban-pool/src/components/common/Sidebar/Sidebar.jsx`
- `backend/server.js` booking routes and chat route
- `urban-pool/src/utils/timeAgo.js`

### Questions To Ask AI
- Explain how sidebar active ride is fetched.
- Explain how the active ride step tracker works.
- Explain how ride completion works from sidebar to backend.

## Driver Chat

### Flow
1. Sidebar opens active ride chat.
2. Frontend fetches old chat messages from `/api/chat/:rideId`.
3. Frontend connects to Socket.io.
4. Frontend emits `join_chat`.
5. User sends message with `send_message`.
6. Backend saves message in `Message` table.
7. Backend emits `receive_message` to chat room.
8. Backend may send automatic driver reply.

### Main Files
- `urban-pool/src/components/common/Sidebar/Sidebar.jsx`
- `backend/server.js`

### Important Events
- `join_chat`
- `send_message`
- `receive_message`
- `driver_typing`
- `driver_typing_stop`

### Questions To Ask AI
- Explain how Socket.io chat works in my project.
- Explain how messages are saved and broadcast.
- Explain the automatic driver reply logic.

## Live Driver Tracking

### Flow
1. After booking, backend starts `simulateDriverMovement`.
2. Backend calculates or simulates driver path.
3. Backend emits `driverLocation` repeatedly.
4. Frontend map component listens and updates driver marker.
5. Backend also emits `driverStatus` messages.

### Main Files
- `backend/server.js`
- `urban-pool/src/components/common/DriverTracker/DriverTrackerMap.jsx`
- `urban-pool/src/pages/Booking/Booking.jsx`

### Questions To Ask AI
- Explain how driver tracking is simulated.
- Explain why Socket.io is used for location updates.
- Explain what data is sent in `driverLocation`.

## Wallet

### Flow
1. Wallet page requests `/api/wallet/:userId`.
2. Backend finds or creates wallet.
3. User can add money using `/api/wallet/add`.
4. Backend validates amount/reference.
5. Backend updates wallet balance and creates transaction.
6. Booking can deduct from wallet when payment method is wallet.

### Main Files
- `urban-pool/src/pages/Sidebar/Wallet.jsx`
- `urban-pool/src/pages/Booking/Booking.jsx`
- `backend/server.js` wallet and booking routes

### Questions To Ask AI
- Explain wallet balance flow.
- Explain how wallet transaction is stored.
- Explain why wallet logic should be on backend.

## Driver Portal

### Flow
1. Driver opens `/driver`.
2. Driver can set online/offline.
3. Driver fetches ride requests.
4. Driver accepts a booking.
5. Booking gets driver details and status `driver_assigned`.
6. Driver can update ride status.
7. Driver stats and earnings are calculated from completed rides.

### Main Files
- `urban-pool/src/pages/Driver/DriverDashboard.jsx`
- `urban-pool/src/pages/Driver/DriverActiveRides.jsx`
- `urban-pool/src/pages/Driver/DriverEarnings.jsx`
- `backend/server.js` driver routes

### Questions To Ask AI
- Explain driver dashboard backend flow.
- Explain how a driver accepts a ride.
- Explain how driver earnings are calculated.

## Carpool

### Flow
1. Driver offers a carpool ride.
2. Backend saves it in `PoolRide`.
3. Passenger searches available rides.
4. Passenger books seats.
5. Backend creates `PoolBooking`.
6. Seat count is reduced.
7. Driver can start, complete, or cancel ride.

### Main Files
- `urban-pool/src/pages/Ride/OfferRide.jsx`
- `urban-pool/src/pages/Ride/CarpoolResults.jsx`
- `backend/server.js` carpool routes

### Questions To Ask AI
- Explain carpool offer and booking flow.
- Explain difference between normal booking and carpool booking.
- Explain how seats are managed.

## Admin Panel

### Flow
1. Admin opens `/admin`.
2. Dashboard calls `/api/admin/stats`.
3. Rides page calls `/api/admin/rides`.
4. Users page calls `/api/admin/users`.
5. Surge page calls `/api/admin/surge`.
6. Admin can update surge conditions.

### Main Files
- `urban-pool/src/pages/Admin/AdminDashboard.jsx`
- `urban-pool/src/pages/Admin/AdminRidesTable.jsx`
- `urban-pool/src/pages/Admin/AdminUsers.jsx`
- `urban-pool/src/pages/Admin/SurgeControl.jsx`
- `backend/server.js` admin routes

### Questions To Ask AI
- Explain admin dashboard data flow.
- Explain how surge control works.
- Explain how admin sees all rides and users.

## AI Chatbot

### Flow
1. User opens chatbot component.
2. User sends question.
3. Frontend sends message to backend AI/chat endpoint if implemented.
4. Backend or frontend returns assistant response.
5. Driver chat has separate rule-based automatic replies in Socket.io.

### Main Files
- `urban-pool/src/components/common/ChatBot/ChatBot.jsx`
- `urban-pool/src/components/common/ChatWidget/ChatWidget.jsx`
- `backend/server.js`

### Questions To Ask AI
- Explain difference between AI chatbot and driver chat.
- Explain how a system prompt can restrict AI answers.
- Explain how rule-based replies are different from Gemini replies.

