# 14 — Maps and Location

## Technologies used
| Tool | Purpose |
|------|---------|
| Google Maps Embed API | Displays the route map on the ride results page |
| Google Maps Directions API | Shows turn-by-turn route on the map |
| Photon (by Komoot) | Converts address text to GPS coordinates |
| OSRM | Calculates actual road distance between two GPS points |
| Socket.io | Streams driver GPS updates to the frontend in real time |

---

## Location Input (address autocomplete)

### File: `src/components/common/LocationInput/LocationInput.jsx`
- User types a location
- The component calls Photon API to get suggestions
- Photon returns a list of matching addresses
- User picks one → the coordinates are stored for distance calculation

---

## Route Map (on Ride Results page)

### File: `src/pages/Ride/RideResults.jsx`
```js
const mapSrc = `https://www.google.com/maps/embed/v1/directions
  ?key=YOUR_API_KEY
  &origin=Mohali, Punjab
  &destination=Mohali Airport Chowk
  &mode=driving`;
```
- An `<iframe>` embeds the Google Maps route
- Shows the road path, distance, and estimated time
- This is just for display — the actual distance calculation uses OSRM

---

## Driver Location Tracking

### File: `src/components/common/DriverTracker/DriverTrackerMap.jsx`
- Displays a car icon moving on a map
- Uses the Google Maps JavaScript API (or a simple SVG map)
- Receives driver coordinates from Socket.io events

### How the driver moves (simulation)
```
backend → simulateDriverMovement(pickup, userId)
  1. Geocode pickup address to get coordinates
  2. Create a fake driver position 2km away
  3. Every 1.2 seconds, move driver 1 step closer
  4. Emit driverLocation event to user's Socket.io room
frontend → DriverTrackerMap listens for driverLocation events
  1. Updates the car icon position on the map
  2. Shows arrival message when driver is close enough
```

---

## Geocoding (address → GPS coordinates)

### What is geocoding?
Converting a human-readable address like "Mohali, Punjab" into GPS coordinates like `{lat: 30.70, lng: 76.71}`.

### Why do we need it?
- Distance calculation requires GPS coordinates, not text
- Driver simulation requires GPS coordinates to move on a map

### Our geocoding chain
```
1. Photon API (free, India-biased)
   → Returns up to 5 results, we pick the first within India's bounds
   
2. If Photon fails → City name heuristic
   → We have a database of ~100 Indian city coordinates
   → Match city names in the address text
   → Use stored coordinates
```

### India bounds validation
We only accept geocoding results within India:
```
lat: 6.5 to 37.5   (south to north)
lng: 68.0 to 97.5  (west to east)
```
This prevents "Punjab, Pakistan" being used instead of "Punjab, India".

---

## Key files
- `src/utils/distance.js` — frontend geocoding + distance
- `backend/server.js` → `geocodeWithPhoton()`, `getOSRMDistance()`, `simulateDriverMovement()`
- `src/components/common/DriverTracker/DriverTrackerMap.jsx` — moving driver on map
- `src/components/common/LocationInput/LocationInput.jsx` — address autocomplete
