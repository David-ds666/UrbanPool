# 07 — Ride Lifecycle (Confirmed → Completed)

## The 4 stages of a ride

```
[BOOKED] → [DRIVER FOUND] → [ON THE WAY] → [COMPLETED]
  Step 1        Step 2           Step 3         Step 4
```

## What happens at each stage

### Stage 1: BOOKED (status = 'confirmed')
- User has confirmed the booking and paid
- Booking saved in MySQL
- User gets a notification: "Ride Confirmed! ✅"
- Backend starts simulating driver movement via Socket.io
- Sidebar shows: Step 1 highlighted

### Stage 2: DRIVER FOUND (status = 'driver_assigned')
- A driver is assigned (in our app, this is simulated)
- Driver's name and vehicle are added to the booking
- Sidebar shows driver info card
- Sidebar shows: Step 2 highlighted
- In our app, this happens ~3 minutes after booking (time-based auto-advance)

### Stage 3: ON THE WAY (status = 'in_progress')
- Driver is moving toward the user
- DriverTrackerMap shows the moving car on a map
- Socket.io sends `driverLocation` events every second with new coordinates
- "I've Arrived — Mark Complete" button appears in sidebar
- In our app, this happens ~8 minutes after booking

### Stage 4: COMPLETED (status = 'completed')
- User clicks "Mark Complete" or driver marks as done
- `POST /api/bookings/:id/complete` is called
- MySQL updates: `UPDATE Bookings SET status = 'completed'`
- Active ride section collapses after 3-second success message
- Ride appears in "My Rides" with status = Completed
- User receives a "Ride Completed" notification

## Driver simulation (how it works)
Since we don't have real drivers, we simulate movement:
```
backend/server.js → simulateDriverMovement(pickup, userId)
```
1. When booking is created, this function starts
2. It uses the Photon API to get coordinates for pickup location
3. It creates a fake driver location ~2km away
4. Every 1.2 seconds, it moves the driver closer to the pickup
5. It emits `driverLocation` events via Socket.io to the user's room
6. The frontend's DriverTrackerMap component receives these events and moves the car icon

## Status values in database
| Status | Meaning |
|--------|---------|
| `confirmed` | Booking created, driver being found |
| `driver_assigned` | Driver assigned to the ride |
| `in_progress` | Driver is on the way |
| `completed` | Ride finished |
| `cancelled` | Ride was cancelled |

## isActive logic
The backend marks a booking `isActive: true` only if:
1. Status is `confirmed`, `driver_assigned`, or `in_progress`
2. AND it was created within the last 48 hours (to avoid old test bookings showing up)

## Key files
- `backend/server.js` → `simulateDriverMovement()`, `POST /api/bookings/:id/complete`
- `src/components/common/Sidebar/Sidebar.jsx` → step tracker, mark complete button
- `src/components/common/DriverTracker/DriverTrackerMap.jsx` → moving car on map
