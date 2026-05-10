# 01 - Frontend Code Questions

Use this file to ask technical questions about the React frontend.

## App Entry And Routing

### Code References
- `urban-pool/src/main.jsx`
- `urban-pool/src/App.jsx`
- `urban-pool/src/layouts/PublicLayout.jsx`
- `urban-pool/src/layouts/AuthLayout.jsx`
- `urban-pool/src/layouts/RideLayout.jsx`
- `urban-pool/src/layouts/AdminLayout.jsx`
- `urban-pool/src/layouts/DriverLayout.jsx`

### Questions
1. Which file starts the React application?
2. What does `ReactDOM.createRoot()` do in `main.jsx`?
3. Why is `App` wrapped inside `AuthProvider`?
4. What is the purpose of `BrowserRouter` in `App.jsx`?
5. How are routes defined in this project?
6. Which route opens the landing page?
7. Which route opens login and signup pages?
8. Which routes are used for admin pages?
9. Which routes are used for driver pages?
10. Why are layouts used instead of putting Navbar/Footer in every page?
11. What does `Outlet` do in React Router layouts?
12. What is the difference between `PublicLayout`, `AuthLayout`, `RideLayout`, `AdminLayout`, and `DriverLayout`?
13. How does React Router help avoid full page reloads?
14. Why is this project called a single-page application?

## Authentication Frontend

### Code References
- `urban-pool/src/config/firebase.js`
- `urban-pool/src/context/AuthContext.jsx`
- `urban-pool/src/pages/Auth/Login.jsx`
- `urban-pool/src/pages/Auth/Signup.jsx`
- `urban-pool/src/components/common/AuthGate/AuthGate.jsx`
- `urban-pool/src/components/common/Navbar/Navbar.jsx`

### Questions
1. Which file contains Firebase configuration?
2. What are `auth` and `db` exported from `firebase.js`?
3. Which Firebase functions are used for login and signup?
4. What does `onAuthStateChanged` do?
5. Why do we store user state in `AuthContext`?
6. What data is stored in `userProfile`?
7. Why does `AuthContext` use localStorage?
8. How does logout work in this project?
9. How does the Navbar know whether to show Login/Signup or Logout?
10. What is the purpose of `AuthGate`?
11. Which pages check if the user is logged in before continuing?
12. How is Firebase UID used in the frontend?
13. Why should passwords not be stored in our own database?
14. How does the frontend fetch profile data after login?

## Landing Page And Search

### Code References
- `urban-pool/src/pages/Home/Landing.jsx`
- `urban-pool/src/components/landing/RideSearchCard/RideSearchCard.jsx`
- `urban-pool/src/pages/Search/SearchRide.jsx`
- `urban-pool/src/components/common/LocationInput/LocationInput.jsx`
- `urban-pool/src/pages/Ride/RideResults.jsx`
- `urban-pool/src/utils/pricing.js`
- `urban-pool/src/utils/distance.js`

### Questions
1. Which component is the first screen of the website?
2. What is the role of `RideSearchCard`?
3. How does the user enter pickup and drop locations?
4. What happens when the user clicks search?
5. How is data passed from one page to another using `navigate(..., { state })`?
6. Why does `SearchRide` check if the user is logged in?
7. Which component shows ride options and prices?
8. Which utility calculates or fetches ride price?
9. What happens if the backend pricing API is not available?
10. Why does the project have both backend pricing and frontend fallback pricing?
11. What is the role of `calculateRidePrice`?
12. What is the role of `calculateDistanceAsync`?
13. Why is date and time validation needed in ride search?

## Booking Flow Frontend

### Code References
- `urban-pool/src/pages/Booking/Booking.jsx`
- `urban-pool/src/pages/Booking/ReserveBooking.jsx`
- `urban-pool/src/pages/Booking/IntercityBooking.jsx`
- `urban-pool/src/pages/Booking/CourierBooking.jsx`
- `urban-pool/src/pages/Booking/RentalBooking.jsx`
- `urban-pool/src/pages/Booking/BikeBooking.jsx`
- `urban-pool/src/pages/Booking/AirportBooking.jsx`
- `urban-pool/src/pages/Booking/CityBooking.jsx`
- `urban-pool/src/services/bookingService.js`
- `urban-pool/src/components/common/DriverTracker/DriverTrackerMap.jsx`

### Questions
1. Which file handles normal ride booking confirmation?
2. What data is received by `Booking.jsx` through route state?
3. Why does booking require login?
4. How are payment methods displayed?
5. Which payment methods are supported in UI?
6. How is wallet balance fetched?
7. Which service sends booking data to backend?
8. What does `saveBooking` do?
9. What fallback happens if backend booking is unavailable?
10. How is a notification added after successful booking?
11. How is a ride added to `My Rides` after booking?
12. What is the role of `DriverTrackerMap`?
13. How does the frontend connect to Socket.io after booking?
14. Which booking pages are made for special services like bike, courier, rental, airport, city, and intercity?

## Sidebar, Wallet, Notifications, My Rides

### Code References
- `urban-pool/src/components/common/Sidebar/Sidebar.jsx`
- `urban-pool/src/pages/Sidebar/Profile.jsx`
- `urban-pool/src/pages/Sidebar/Wallet.jsx`
- `urban-pool/src/pages/Sidebar/MyRides.jsx`
- `urban-pool/src/pages/Sidebar/Notifications.jsx`
- `urban-pool/src/utils/timeAgo.js`
- `urban-pool/src/utils/avatars.js`

### Questions
1. Which component opens the sidebar menu?
2. How does Navbar toggle the sidebar?
3. What data is shown in the sidebar header?
4. How does the sidebar check whether backend is online?
5. How does the sidebar fetch active booking?
6. What statuses are treated as active rides?
7. How does the active ride progress tracker work?
8. What is `BOOKING_STEPS` used for?
9. What does `getStepIndex` do?
10. How can a user mark a ride as completed?
11. How does driver chat open inside the sidebar?
12. How are chat messages loaded?
13. How are unread notifications counted?
14. What is the use of `timeAgo`?
15. What is stored in the wallet page?
16. How does profile update sync with backend?

## Driver Portal Frontend

### Code References
- `urban-pool/src/layouts/DriverLayout.jsx`
- `urban-pool/src/pages/Driver/DriverDashboard.jsx`
- `urban-pool/src/pages/Driver/DriverActiveRides.jsx`
- `urban-pool/src/pages/Driver/DriverEarnings.jsx`

### Questions
1. Which routes are used for driver portal?
2. What does Driver Dashboard show?
3. How does a driver go online/offline?
4. How does a driver fetch available ride requests?
5. Which API is called when a driver accepts a ride?
6. How are driver active rides displayed?
7. How can driver update ride status?
8. How are driver earnings calculated and shown?
9. Which chart library is used for earnings/admin charts?
10. Why is driver portal separated from normal user pages?

## Admin Panel Frontend

### Code References
- `urban-pool/src/layouts/AdminLayout.jsx`
- `urban-pool/src/pages/Admin/AdminDashboard.jsx`
- `urban-pool/src/pages/Admin/AdminRidesTable.jsx`
- `urban-pool/src/pages/Admin/AdminUsers.jsx`
- `urban-pool/src/pages/Admin/SurgeControl.jsx`

### Questions
1. Which routes open admin pages?
2. What does Admin Dashboard show?
3. Which API gives admin statistics?
4. Which page shows all rides?
5. Which page shows all users?
6. Which page controls surge pricing?
7. How does frontend update surge condition?
8. Why is admin panel important in this project?
9. What charts or KPIs are shown to admin?
10. How is admin different from passenger and driver?

## Common Components

### Code References
- `urban-pool/src/components/common/Navbar/Navbar.jsx`
- `urban-pool/src/components/common/Footer/Footer.jsx`
- `urban-pool/src/components/common/ChatBot/ChatBot.jsx`
- `urban-pool/src/components/common/ChatWidget/ChatWidget.jsx`
- `urban-pool/src/components/common/MapView.jsx`
- `urban-pool/src/components/common/LocationInput/LocationInput.jsx`

### Questions
1. Why do we create reusable components?
2. What is the role of Navbar?
3. What is the role of Footer?
4. What is the difference between AI chatbot and driver chat widget?
5. Which component handles location input?
6. Which component displays map-related UI?
7. How does component-based design reduce repeated code?
8. What props are passed between parent and child components?
9. Give one example of state being used in a common component.
10. Give one example of event handling in a common component.

