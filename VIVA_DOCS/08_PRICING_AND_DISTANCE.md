# 08 — Pricing and Distance Calculation

## How price is calculated

### Formula
```
Price = Base Fare + (Distance in km × Rate per km)
```

### Base fares and rates per km
| Ride Type | Base Fare | Rate/km |
|-----------|-----------|---------|
| UrbanPool (shared) | ₹40 | ₹12/km |
| UrbanGo (solo) | ₹60 | ₹15/km |
| UrbanXL (large) | ₹100 | ₹22/km |
| Premier | ₹150 | ₹30/km |
| UrbanEV (electric) | ₹80 | ₹14/km |
| Bike | ₹15 | ₹7/km |

### Example
Route = 9 km, UrbanGo selected:
```
Price = 60 + (9 × 15) = 60 + 135 = ₹195
```

## How distance is calculated (3-tier system)

### Tier 1: Google Maps Distance Matrix API (most accurate)
- Uses Google's real road data
- Requires an API key in `.env`
- Returns exact road distance and travel time

### Tier 2: Photon Geocoding + OSRM (free, no key needed)
- **Photon** converts address text → GPS coordinates (lat/lng)
- Example: "Mohali, Punjab" → lat: 30.70, lng: 76.71
- **OSRM** (Open Source Routing Machine) calculates road distance between two lat/lng points
- Both are free APIs — no API key required

### Tier 3: Heuristic (city name matching — last resort)
- If geocoding fails, we have a database of ~100 Indian cities with their coordinates
- We match city names in the address text
- Calculate Haversine formula (straight-line × 1.4 road factor)
- Returns an approximate distance

## Haversine formula (math used)
The Haversine formula calculates the distance between two points on Earth given their latitude and longitude:
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c     (R = 6371 km, Earth's radius)
```
We multiply by 1.3–1.4 to account for roads not being straight lines.

## Surge Pricing

### What is it?
During high demand, prices increase by a multiplier (like Uber surge pricing).

### When does surge activate?
- Time-based: Morning rush (7–9am), Evening rush (5–8pm)
- Weather: If it's raining (checked via weather API)
- High booking volume: Many rides being booked at once
- Manual: Admin can turn surge on/off from admin panel

### How it works
```
POST /api/price → getEffectiveSurge() → 
  returns { isSurge: true, multiplier: 1.5, reasons: ["Evening rush"] }
Final Price = Base Price × multiplier
```

### Surge levels
| Multiplier | Meaning |
|-----------|---------|
| 1.0× | Normal pricing |
| 1.3× | Moderate surge |
| 1.5× | High surge |
| 2.0× | Peak surge |

## Key files
- `src/utils/pricing.js` — fetches price from backend with fallback
- `src/utils/distance.js` — geocoding + distance calculation (frontend)
- `backend/server.js` → `getRealRouteData()`, `getEffectiveSurge()`, `POST /api/price`
