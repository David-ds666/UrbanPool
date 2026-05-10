# 16 — Technology Deep Dive (Questions & Answers)

## This file covers detailed technology questions your teacher might ask.
## Paste into ChatGPT and say: "Quiz me on each section"

---

## ⚛️ React.js

**Q: What is React.js?**
A: A JavaScript library by Meta (Facebook) for building user interfaces. It lets you build reusable UI components and updates only the parts of the page that change (called the Virtual DOM).

**Q: What is a component in React?**
A: A reusable piece of UI. Like a "Ride Card" component that can be used multiple times with different data. Components are JavaScript functions that return HTML-like code (JSX).

**Q: What is JSX?**
A: JavaScript XML — it lets you write HTML inside JavaScript code. React converts it to real HTML.
```jsx
const MyCard = () => <div className="card">Hello World</div>;
```

**Q: What is useState?**
A: A React "hook" that lets a component remember a value and re-render when it changes.
```js
const [count, setCount] = useState(0); // starts at 0
setCount(5); // updates to 5, component re-renders
```

**Q: What is useEffect?**
A: A hook that runs code when the component loads or when specific values change — used for API calls, timers, subscriptions.
```js
useEffect(() => {
  fetchData(); // runs when component mounts
}, []); // empty array = run once
```

**Q: What is React Router?**
A: A library that handles navigation between pages in React without reloading the browser. Each URL maps to a component.

**Q: What is Context API (AuthContext)?**
A: A way to share data across all components without passing it through every parent → child → grandchild. We use it to share the user, wallet, and notifications globally.

**Q: What is Virtual DOM?**
A: React creates a virtual (fake) copy of the real DOM. When data changes, React compares the old virtual DOM with the new one, finds differences, and only updates the changed parts. This makes React fast.

---

## 🟢 Node.js

**Q: What is Node.js?**
A: A JavaScript runtime that lets you run JavaScript on the server (outside the browser). Normally JS only runs in browsers — Node.js changed that.

**Q: Why use Node.js for the backend?**
A: Same language (JavaScript) for both frontend and backend. Fast for I/O operations (reading files, network requests). Large ecosystem (npm).

**Q: What is npm?**
A: Node Package Manager — used to install third-party libraries like Express, Sequelize, Socket.io.

---

## 🚂 Express.js

**Q: What is Express.js?**
A: A minimal web framework for Node.js. It makes it easy to define API routes, handle requests, and send responses.

**Q: How do you define a route in Express?**
```js
app.post('/api/bookings', async (req, res) => {
  const { pickup, drop } = req.body; // get data from request
  const booking = await Booking.create({ pickup, drop });
  res.json(booking); // send response
});
```

**Q: What is middleware in Express?**
A: Functions that run between the request and response. Examples: `cors()` (allow cross-origin), `express.json()` (parse JSON body), logging.

**Q: What is CORS?**
A: Cross-Origin Resource Sharing. A security rule that blocks browsers from calling APIs on different domains. We enable CORS so our React app (port 5173) can call our Express backend (port 5001).

---

## 🗄️ MySQL & Sequelize

**Q: What is MySQL?**
A: An open-source relational database management system. Data is stored in tables with rows and columns, like a spreadsheet.

**Q: What is a relational database?**
A: A database where tables are connected via relationships. E.g., a Booking table has a userId column that relates to the UserProfile table.

**Q: What is SQL?**
A: Structured Query Language — used to create, read, update, delete data in relational databases.

**Q: What is an ORM?**
A: Object Relational Mapper — maps database tables to JavaScript objects so you don't need to write raw SQL. Sequelize is an ORM for Node.js.

**Q: What is the difference between SQL and NoSQL?**
| SQL (MySQL) | NoSQL (MongoDB) |
|-------------|-----------------|
| Tables with fixed columns | Flexible JSON documents |
| Good for relational data | Good for unstructured data |
| Strong data integrity | More flexible/scalable |
| We used this | Not used in our project |

**Q: What does `sequelize.sync({ alter: true })` do?**
A: Creates tables that don't exist yet, and updates existing tables if columns were added/changed. `alter: true` is safe (doesn't delete data). `force: true` would delete everything and recreate.

---

## 🔥 Firebase

**Q: What is Firebase?**
A: A platform by Google that provides backend services: Authentication, Database, Storage, Hosting. We use only Firebase Authentication.

**Q: What is Firebase Authentication?**
A: A secure system for login/signup that handles password encryption, session management, and OAuth (Google login) automatically.

**Q: What is OAuth?**
A: Open Authorization — a protocol that lets users login with their existing Google/Facebook/GitHub account without creating a new password. Firebase handles all of this.

**Q: What is a Firebase UID?**
A: A unique ID Firebase assigns to each user (e.g., `9QYfRz2zLlawlTClRNDcG6n0GI02`). We use this as the primary key to link users across all our MySQL tables.

**Q: What is `onAuthStateChanged`?**
A: A Firebase listener that fires whenever the login state changes. We use this to know if a user is logged in or not across the entire app.

---

## 🔌 Socket.io (WebSockets)

**Q: What is the difference between HTTP and WebSockets?**
| HTTP | WebSocket |
|------|-----------|
| Client asks, server answers | Both can send at any time |
| Connection closes after response | Connection stays open |
| One direction at a time | Full duplex (two-way) |
| Used for: loading pages, API calls | Used for: chat, live tracking |

**Q: What is Socket.io?**
A: A JavaScript library that makes WebSocket connections easy. Works in both Node.js (server) and React (client). Falls back to HTTP polling if WebSockets aren't supported.

**Q: What is a Socket.io room?**
A: A named group that sockets can join. Messages sent to a room are received by all members. We use booking ID as the room name for chat, and user ID as the room for notifications.

**Q: How do you emit and listen to events?**
```js
// Server sends:
io.to(userId).emit('notification', { title: 'Ride Confirmed!' });

// Client receives:
socket.on('notification', (data) => {
  console.log(data.title); // "Ride Confirmed!"
});
```

---

## 🤖 Google Gemini API

**Q: What is Gemini?**
A: Google's large language model (LLM) — an AI that understands and generates human language. Similar to ChatGPT.

**Q: What is an LLM?**
A: Large Language Model — an AI trained on massive amounts of text data, capable of understanding questions and generating intelligent responses.

**Q: What is a system prompt?**
A: Initial instructions given to the AI before the conversation starts. We tell Gemini: "You are UrbanPool's assistant. Only answer questions about our ride-sharing app."

**Q: What is a REST API?**
A: Representational State Transfer — a standard way to build web APIs using HTTP methods (GET, POST, PUT, DELETE) and JSON data format.

---

## 🗺️ Mapping APIs

**Q: What is Photon?**
A: A free geocoding API by Komoot. It converts text addresses to GPS coordinates. Based on OpenStreetMap data.

**Q: What is OSRM?**
A: Open Source Routing Machine — a free routing engine that calculates road distances and travel times between GPS coordinates. Uses OpenStreetMap road network.

**Q: What is the Haversine formula?**
A: A mathematical formula to calculate the shortest distance between two points on Earth using their latitude and longitude coordinates. Used as a fallback when OSRM is unavailable.

**Q: What is the difference between geocoding and routing?**
- **Geocoding**: address text → GPS coordinates ("Mohali" → lat: 30.70, lng: 76.71)
- **Routing**: GPS coordinates → road distance and path (30.70,76.71 → 30.67,76.79 = 9 km by road)

---

## 🏗️ Vite

**Q: What is Vite?**
A: A modern frontend build tool that provides an extremely fast development server. Alternative to Create React App (CRA). Starts almost instantly.

**Q: What does a build tool do?**
A: Bundles all your JavaScript files, CSS, and assets into optimized files for production. Also provides a development server with hot reload.

---

## 📦 Key npm Packages Explained

| Package | What it does |
|---------|-------------|
| `react` | Core React library |
| `react-dom` | Renders React components into the browser DOM |
| `react-router-dom` | Navigation between pages |
| `socket.io-client` | WebSocket connection from browser |
| `express` | Web server framework |
| `sequelize` | ORM for MySQL |
| `mysql2` | MySQL database driver for Node.js |
| `socket.io` | WebSocket server |
| `axios` | Makes HTTP requests from Node.js |
| `cors` | Enables cross-origin requests |
| `dotenv` | Loads environment variables from .env file |
| `firebase` | Firebase SDK for frontend |
