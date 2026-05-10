# 01 — Project Overview

## What is UrbanPool?
UrbanPool is a ride-sharing / carpooling web application — similar to Ola or Uber — that allows passengers to book rides and drivers to offer rides. It also supports carpooling (sharing a ride with others), intercity travel, bike rides, courier deliveries, and rentals.

## What problem does it solve?
- High cost of private transportation in cities
- Traffic congestion due to too many single-occupancy vehicles
- Lack of affordable, organized shared transport options
- Environmental impact of excess vehicles on the road

## Who are the users?
1. **Passengers** — search for a ride, book, track, pay, and rate
2. **Drivers** — accept ride requests, navigate to pickup, complete rides, earn money
3. **Admin** — monitor all rides, manage users, control surge pricing

## What can a user do?
- Sign up / log in with email or Google
- Search for a ride by entering pickup and drop location
- Choose ride type: UrbanPool (shared), UrbanGo (solo), UrbanXL (large), Premier, Electric, Bike
- Book a ride and pay via Wallet or Cash
- Track driver in real time on a map
- Chat with the driver
- Mark the ride as complete when they arrive
- View all past rides in "My Rides"
- Get notifications (ride confirmed, payment, etc.)
- Use the AI chatbot for help

## What makes it special?
- Real-time driver simulation using Socket.io
- AI chatbot using Google Gemini API
- Surge pricing that increases fare during peak hours
- Carpool matching (connects riders going the same route)
- Full admin dashboard with user management and ride monitoring
- Wallet system for cashless payments
- Firebase Authentication for secure login

## Project type
Full-stack MERN-adjacent web application:
- **M** = MySQL (database)
- **E** = Express.js (backend framework)
- **R** = React.js (frontend)
- **N** = Node.js (runtime)
