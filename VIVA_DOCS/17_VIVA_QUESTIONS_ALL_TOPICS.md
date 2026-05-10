# 17 — Expected Viva Questions (All Topics)

## Instructions
- Read each question, close the file, try to answer in your own words
- Then check the answer
- Or paste this into ChatGPT and say: "Ask me these questions one by one and correct me if I'm wrong"

---

## 🏗️ PROJECT-LEVEL QUESTIONS

**Q1: What is your project about?**
A: UrbanPool is a full-stack ride-sharing and carpooling web application. Users can book rides, track drivers in real time, chat with drivers, make payments via wallet, and manage their trips. It has an admin panel for monitoring and an AI-powered chatbot for assistance.

**Q2: What problem does this project solve?**
A: It solves the problem of expensive private transportation and traffic congestion by enabling shared rides (carpooling), making urban travel cheaper and more environment-friendly.

**Q3: Who are the users of this system?**
A: Three types: (1) Passengers who book rides, (2) Drivers who offer rides, (3) Admin who monitors and manages the system.

**Q4: What is the difference between UrbanPool and UrbanGo?**
A: UrbanPool is a shared ride (carpooling) — multiple passengers share the same car, making it cheaper. UrbanGo is a solo affordable ride — only one passenger, similar to a regular cab.

**Q5: What is the most unique/advanced feature in your project?**
A: Real-time driver tracking using Socket.io (WebSockets) combined with simulated GPS movement. Also the AI chatbot powered by Google Gemini API.

---

## 💻 TECHNOLOGY QUESTIONS

**Q6: What is the full technology stack?**
A: Frontend: React.js + Vite. Backend: Node.js + Express.js. Database: MySQL + Sequelize ORM. Authentication: Firebase Auth. Real-time: Socket.io. AI: Google Gemini API.

**Q7: Why did you choose React for the frontend?**
A: React's component-based architecture makes it easy to build reusable UI elements. Its Virtual DOM makes updates fast. It has a large community and ecosystem.

**Q8: Why MySQL instead of MongoDB?**
A: Our data is relational — bookings link to users, transactions link to wallets. MySQL enforces data integrity with foreign keys and is well-suited for this structure.

**Q9: What is an ORM and why did you use Sequelize?**
A: ORM (Object Relational Mapper) lets us use JavaScript objects instead of SQL queries. Sequelize auto-creates tables, handles migrations, and prevents SQL injection.

**Q10: Why Firebase for authentication instead of building your own?**
A: Firebase handles password hashing, session management, Google OAuth, and security automatically. Building all this from scratch is complex and security-critical — Firebase is the industry standard for quick, secure auth.

**Q11: What is Socket.io and why not just use HTTP?**
A: Socket.io enables WebSocket connections that stay open persistently. HTTP closes after each request. For real-time features like driver movement and chat, we need the server to push updates instantly — WebSockets enable this.

---

## 🗄️ DATABASE QUESTIONS

**Q12: How many tables does your database have?**
A: 10 tables: Bookings, UserProfile, Wallet, Transaction, PoolRide, PoolBooking, Message, Review, RideRequest, PriceLog.

**Q13: What is the primary key in your Bookings table?**
A: An auto-incrementing integer `id` column, managed by Sequelize.

**Q14: How do you link users to bookings?**
A: The Bookings table has a `userId` column that stores the Firebase UID. This links to the UserProfile table's `userId` column.

**Q15: What is `sequelize.sync({ alter: true })` and when does it run?**
A: It runs when the server starts. It creates tables that don't exist and updates existing tables if the model definition has changed. `alter: true` is safe because it doesn't delete existing data.

**Q16: How do you prevent SQL injection?**
A: Sequelize parameterizes all queries automatically. For raw SQL we use `{ replacements: [value] }` which also prevents injection.

---

## 🔐 AUTHENTICATION QUESTIONS

**Q17: How does login work step by step?**
A: User enters email/password → Firebase `signInWithEmailAndPassword()` verifies → Firebase returns user object with UID → UID stored in AuthContext → All pages can access user data.

**Q18: What happens if the user refreshes the page?**
A: Firebase automatically persists the session in the browser (localStorage/cookies). `onAuthStateChanged` fires on page load and restores the user object.

**Q19: How are passwords stored?**
A: They're NOT stored in our MySQL database. Firebase handles all password storage using industry-standard bcrypt hashing on their secure servers.

**Q20: What is Google OAuth?**
A: Open Authorization — lets users sign in with their Google account. Firebase manages the entire OAuth flow (redirect to Google, get token, create user).

**Q21: How do you protect pages from unauthorized access?**
A: We check `if (!user) navigate('/login')` at the start of protected components. The `AuthContext` provides the `user` object (null if not logged in).

---

## 📡 API QUESTIONS

**Q22: What is a REST API?**
A: Representational State Transfer API — a set of HTTP endpoints that follow conventions: GET for reading, POST for creating, PUT for updating, DELETE for removing data. Data is exchanged in JSON format.

**Q23: How does the frontend communicate with the backend?**
A: Through HTTP fetch requests to `http://localhost:5001/api/...`. The frontend sends JSON data and receives JSON responses.

**Q24: What is the difference between GET and POST?**
A: GET retrieves data (no body, parameters in URL). POST sends data to create/update (data in request body, hidden from URL).

**Q25: How does surge pricing work technically?**
A: The backend has a `getEffectiveSurge()` function that checks time, weather, and booking volume. It returns a multiplier. `POST /api/price` applies this multiplier to the base price before returning it.

---

## ⚡ REAL-TIME QUESTIONS

**Q26: How does real-time driver tracking work?**
A: When a booking is created, `simulateDriverMovement()` starts in the backend. Every 1.2 seconds, it calculates a new position (moving closer to pickup) and emits `driverLocation` via Socket.io to the user's room. The frontend receives this and moves the car icon on the map.

**Q27: What is a WebSocket?**
A: A protocol that maintains a persistent, bidirectional connection between client and server. Unlike HTTP (request → response → close), WebSocket stays open — both sides can send messages anytime.

**Q28: What is a Socket.io room?**
A: A named channel. Sockets join rooms by name. When a message is emitted to a room, all connected sockets in that room receive it. We use booking ID as the chat room name.

**Q29: How does the chat with driver work?**
A: Both driver and passenger join a Socket.io room named by booking ID. When one sends a message (`send_message` event), the backend saves it to MySQL and broadcasts it to the room (`receive_message` event). Both sides receive it instantly.

---

## 🤖 AI QUESTIONS

**Q30: What AI technology did you use?**
A: Google Gemini API — a large language model (LLM) by Google. Similar to ChatGPT.

**Q31: How do you customize the AI to only answer ride-related questions?**
A: We provide a "system prompt" before every conversation: instructions that tell Gemini to act as UrbanPool's assistant and only answer questions about the app.

**Q32: What is the difference between the AI chatbot and the driver chat?**
A: AI chatbot uses Google Gemini API (HTTP request to Google servers, async). Driver chat uses Socket.io (persistent connection, real-time). AI bot is always available; driver chat only during active rides.

---

## 🗺️ DISTANCE/MAPS QUESTIONS

**Q33: How is distance calculated?**
A: Three-tier system: (1) Google Maps API if key available, (2) Photon geocoding + OSRM road routing (free), (3) Haversine formula with city name matching (fallback).

**Q34: What is geocoding?**
A: Converting a text address ("Mohali, Punjab") to GPS coordinates (lat: 30.70, lng: 76.71).

**Q35: What is the Haversine formula used for?**
A: Calculating straight-line distance between two GPS points on Earth's curved surface. We multiply by 1.3-1.4 to approximate road distance.

**Q36: Why do you add an India bounds check for geocoding?**
A: Photon (global geocoder) might return "Punjab, Pakistan" instead of "Punjab, India" for ambiguous queries. We only accept results where lat is 6.5-37.5 and lng is 68-97 (India's geographic bounds).

---

## 🏢 SYSTEM DESIGN QUESTIONS

**Q37: How is the project structured (MVC pattern)?**
A: Frontend follows component-based architecture (React). Backend is in a single server.js file with models, routes, and business logic. In production, we'd separate into Model-View-Controller pattern.

**Q38: What is the difference between frontend and backend?**
A: Frontend (React) = what users see and interact with in the browser. Backend (Node.js/Express) = server-side logic, database operations, API, security.

**Q39: Why do you use two different ports (5173 and 5001)?**
A: Vite runs the React dev server on port 5173. Express runs the API server on port 5001. CORS is enabled to allow communication between them.

**Q40: How would you improve this project in the future?**
A: (1) Real driver GPS integration using device location, (2) Payment gateway (Razorpay/Stripe), (3) Mobile app using React Native, (4) Machine learning for better surge pricing prediction, (5) Email/SMS notifications.
