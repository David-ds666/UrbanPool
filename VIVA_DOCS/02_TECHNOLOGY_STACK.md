# 02 — Technology Stack

## Frontend (what the user sees)
| Technology | Purpose |
|-----------|---------|
| **React.js** | JavaScript library for building the UI (all pages and components) |
| **React Router DOM** | Handles navigation between pages without reloading |
| **Vite** | Build tool — fast development server and bundler |
| **CSS (Vanilla)** | Styling all components manually without a CSS framework |
| **Socket.io Client** | Receives real-time messages from the server (driver location, chat) |
| **Google Maps Embed API** | Shows route map on the ride results page |

## Backend (server logic)
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime — runs the backend server |
| **Express.js** | Web framework — defines all API routes |
| **Socket.io** | WebSocket library — enables real-time communication |
| **Axios** | Makes HTTP requests from backend to external APIs |
| **dotenv** | Loads secret keys from a .env file |
| **cors** | Allows frontend (port 5173) to talk to backend (port 5001) |

## Database
| Technology | Purpose |
|-----------|---------|
| **MySQL** | Relational database — stores all data |
| **Sequelize ORM** | JavaScript library that talks to MySQL using JavaScript objects instead of raw SQL |

## Authentication
| Technology | Purpose |
|-----------|---------|
| **Firebase Auth** | Google's authentication service — handles login, signup, Google OAuth |
| **Firebase SDK** | JavaScript library to interact with Firebase from React |

## External APIs used
| API | Purpose |
|-----|---------|
| **Google Gemini API** | Powers the AI chatbot (UrbanPool Assistant) |
| **Photon / Komoot API** | Geocodes addresses to lat/lng coordinates (free, no key needed) |
| **OSRM API** | Calculates real road distance and duration (free, open-source) |
| **Google Maps Distance Matrix** | Fallback for distance calculation (needs API key) |

## Development Tools
| Tool | Purpose |
|------|---------|
| **npm** | Package manager — installs all libraries |
| **Git** | Version control |
| **VS Code** | Code editor |

## Ports used
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Key npm packages
```
Frontend:          Backend:
react              express
react-router-dom   sequelize
vite               mysql2
socket.io-client   socket.io
                   axios
                   cors
                   dotenv
                   firebase-admin (optional)
```
