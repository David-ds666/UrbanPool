# 02 - Backend, API, Database Questions

Use this file to ask technical questions about `backend/server.js`.

## Backend Setup

### Code References
- `backend/server.js`
- `backend/package.json`

### Questions
1. Which file starts the backend server?
2. Which package is used to create the Express app?
3. Why do we use `http.createServer(app)`?
4. Why is Socket.io attached to the HTTP server?
5. What is the backend port number?
6. What is the purpose of `cors()`?
7. What is the purpose of `express.json()`?
8. What does the request logging middleware do?
9. Why do we use `dotenv`?
10. What packages are used for database connection?
11. Why is backend written in CommonJS `require()` style?

## Database Initialization And Models

### Code References
- `initializeDatabase()` in `backend/server.js`
- Sequelize model definitions in `backend/server.js`

### Questions
1. Which function initializes the database?
2. What database name is used?
3. How is the database created if it does not exist?
4. What does Sequelize do in this project?
5. What does `sequelize.sync({ alter: true })` do?
6. Why are models stored in `app.locals.models`?
7. What is the purpose of the `Booking` model?
8. What is the purpose of the `UserProfile` model?
9. What is the purpose of the `Wallet` model?
10. What is the purpose of the `Transaction` model?
11. What is the purpose of the `Message` model?
12. What is the purpose of `PoolRide` and `PoolBooking`?
13. What is the purpose of the `Review` model?
14. What is the purpose of the `PriceLog` model?
15. Why is Firebase UID stored as `userId`?
16. Which fields are stored for a driver profile?
17. Which fields are stored for a booking?
18. What is the difference between normal booking and pool booking?

## Pricing And Distance API

### Code References
- `POST /api/price`
- `getRealRouteData()`
- `calculateHeuristicDistance()`
- `geocodeWithPhoton()`
- `getOSRMDistance()`
- `haversineDistance()`
- `getEffectiveSurge()`
- `BASE_FARES`, `RATE_PER_KM`, `ETA_MULTIPLIER`

### Questions
1. Which API calculates ride price?
2. What data does frontend send to `/api/price`?
3. How is base fare selected?
4. How is rate per kilometer selected?
5. How is final price calculated?
6. How is ETA calculated?
7. What is the maximum distance limit for availability?
8. What is surge pricing?
9. Which function calculates active surge multiplier?
10. What are surge conditions in the backend?
11. Why does backend save a `PriceLog`?
12. What is the three-step distance fallback system?
13. When is Google Maps API used?
14. What is Photon used for?
15. What is OSRM used for?
16. What is Haversine distance used for?
17. Why does code check whether coordinates are inside India?
18. Why is heuristic city matching used as the last fallback?

## Booking APIs

### Code References
- `POST /api/bookings`
- `GET /api/bookings/:userId`
- `POST /api/bookings/:bookingId/complete`
- `simulateDriverMovement()`

### Questions
1. Which API creates a booking?
2. What booking data comes from frontend?
3. How does wallet payment get handled during booking?
4. What happens if wallet balance is insufficient?
5. How is a transaction created after wallet payment?
6. How is booking saved in database?
7. How is driver simulation started after booking?
8. What response does backend send after successful booking?
9. Which API fetches all bookings for a user?
10. How does backend decide which booking is active?
11. Which booking statuses are active?
12. Which API marks a booking as completed?
13. Why is completion done through backend instead of only frontend state?
14. How does booking status affect sidebar active ride?

## Socket.io And Real-Time Features

### Code References
- `io.on('connection')`
- `join_room`
- `join_chat`
- `send_message`
- `receive_message`
- `driver_typing`
- `driver_typing_stop`
- `simulateDriverMovement()`
- `driverLocation`
- `driverStatus`

### Questions
1. What is Socket.io used for in this project?
2. What happens when a socket connects?
3. What is the purpose of `join_room`?
4. What is the purpose of `join_chat`?
5. How does driver chat send messages?
6. How are messages saved to database?
7. How are messages broadcast to chat room?
8. How does automatic driver reply work?
9. What are keyword-based chatbot rules in driver chat?
10. Why is typing indicator used?
11. How does driver movement simulation send live location?
12. What is `driverLocation` event used for?
13. What is `driverStatus` event used for?
14. Why are Socket.io rooms better than broadcasting to all users?

## Carpool APIs

### Code References
- `POST /api/carpool/rides`
- `GET /api/carpool/search`
- `POST /api/carpool/book`
- `GET /api/carpool/my-offers/:userId`
- `POST /api/carpool/booking/:bookingId/status`
- `POST /api/carpool/ride/:rideId/cancel`
- `POST /api/carpool/ride/:rideId/start`
- `POST /api/carpool/ride/:rideId/complete`

### Questions
1. Which API lets a driver offer a carpool ride?
2. Which API searches available carpool rides?
3. What filters are used in carpool search?
4. Which API books seats in a carpool ride?
5. How does backend check seat availability?
6. How is total fare calculated for carpool?
7. How are seats reduced after booking?
8. Which API fetches a driver's offered rides?
9. How can a carpool booking be confirmed or cancelled?
10. How can a driver start a carpool ride?
11. How can a driver complete a carpool ride?
12. What is the difference between `PoolRide` and `PoolBooking`?

## Driver APIs

### Code References
- `POST /api/driver/online`
- `GET /api/driver/online/:driverId`
- `GET /api/driver/requests`
- `POST /api/driver/accept/:id`
- `GET /api/driver/rides/:driverId`
- `POST /api/driver/status/:id`
- `GET /api/driver/stats/:driverId`
- `GET /api/driver/earnings/:driverId`

### Questions
1. Which API changes driver online status?
2. Where is driver online status stored?
3. Which API gets available ride requests?
4. Which booking statuses are shown as requests?
5. Which API accepts a ride?
6. What driver details are attached to a booking after accepting?
7. Which API gets all rides assigned to a driver?
8. Which API updates driver ride status?
9. How are driver stats calculated?
10. How are today's earnings calculated?
11. How are weekly and monthly earnings calculated?
12. Why does driver module need separate APIs?

## Admin APIs

### Code References
- `GET /api/admin/surge`
- `POST /api/admin/surge`
- `GET /api/admin/stats`
- `GET /api/admin/rides`
- `GET /api/admin/users`

### Questions
1. Which API returns current surge settings?
2. Which API updates surge condition?
3. How does backend store surge state?
4. Which API gives admin dashboard stats?
5. What data is included in admin stats?
6. Which API gives all rides?
7. How are normal rides and pool rides combined for admin?
8. Which API gives all users?
9. Why does admin need total revenue and ride count?
10. Why is surge control an admin feature?

## Profile And Wallet APIs

### Code References
- `GET /api/profile/:userId`
- `POST /api/profile/:userId`
- `GET /api/wallet/:userId`
- `POST /api/wallet/add`

### Questions
1. Which API fetches a user profile?
2. Which API updates a user profile?
3. What fields can be updated in user profile?
4. How are profile ride counts calculated?
5. How is average rating calculated?
6. Which API fetches wallet balance?
7. What happens if wallet does not exist yet?
8. Which API adds money to wallet?
9. How is payment reference ID validated?
10. How is wallet transaction history returned?
11. Why should wallet changes happen in backend?

## Reviews And Chat History APIs

### Code References
- `POST /api/reviews`
- `GET /api/reviews/:userId`
- `GET /api/chat/:rideId`

### Questions
1. Which API creates a review?
2. Which model stores reviews?
3. Which API fetches reviews for a user?
4. How is chat history loaded?
5. Which model stores chat messages?
6. Why is chat saved in database even though it is real-time?

