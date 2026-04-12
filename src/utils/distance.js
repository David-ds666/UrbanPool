/**
 * Client-side distance calculator — uses Nominatim geocoding for accuracy.
 * Falls back to heuristic city matching only if geocoding fails.
 */

// ── Photon geocoding (free, reliable alternative to Nominatim) ──
async function geocode(address) {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates; // [lng, lat]
      return { lat: coords[1], lng: coords[0] };
    }
    return null;
  } catch {
    return null;
  }
}

// ── OSRM road distance (free, no API key needed) ──
async function getOSRMDistance(lat1, lng1, lat2, lng2) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.code === 'Ok' && data.routes.length > 0) {
      return {
        distance: parseFloat((data.routes[0].distance / 1000).toFixed(1)),
        duration: Math.round(data.routes[0].duration / 60),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Haversine formula ──
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c * 1.3).toFixed(1)); // ×1.3 road factor
}

// ── Heuristic fallback: city-name matching ──
const COORDS_DB = {
  'tamil nadu': { lat: 11.1271, lng: 78.6569 }, 'kerala': { lat: 10.8505, lng: 76.2711 },
  'karnataka': { lat: 15.3173, lng: 75.7139 }, 'andhra pradesh': { lat: 15.9129, lng: 79.74 },
  'telangana': { lat: 18.1124, lng: 79.0193 }, 'maharashtra': { lat: 19.7515, lng: 75.7139 },
  'gujarat': { lat: 22.2587, lng: 71.1924 }, 'rajasthan': { lat: 27.0238, lng: 74.2179 },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569 }, 'uttar pradesh': { lat: 26.8467, lng: 80.9462 },
  'bihar': { lat: 25.0961, lng: 85.3131 }, 'west bengal': { lat: 22.9868, lng: 87.855 },
  'odisha': { lat: 20.9517, lng: 85.0985 }, 'jharkhand': { lat: 23.6102, lng: 85.2799 },
  'chhattisgarh': { lat: 21.2787, lng: 81.8661 }, 'goa': { lat: 15.2993, lng: 74.124 },
  'punjab': { lat: 31.1471, lng: 75.3412 }, 'haryana': { lat: 29.0588, lng: 76.0856 },
  'himachal pradesh': { lat: 31.1048, lng: 77.1734 }, 'uttarakhand': { lat: 30.0668, lng: 79.0193 },
  'assam': { lat: 26.2006, lng: 92.9376 }, 'sikkim': { lat: 27.533, lng: 88.5122 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 }, 'mohali': { lat: 30.7046, lng: 76.7179 },
  'sahibzada': { lat: 30.7046, lng: 76.7179 }, 'ajit singh': { lat: 30.7046, lng: 76.7179 },
  'kharar': { lat: 30.746, lng: 76.6499 }, 'zirakpur': { lat: 30.6428, lng: 76.8174 },
  'panchkula': { lat: 30.6942, lng: 76.8606 }, 'patiala': { lat: 30.3398, lng: 76.3869 },
  'ludhiana': { lat: 30.901, lng: 75.8573 }, 'jalandhar': { lat: 31.326, lng: 75.5762 },
  'amritsar': { lat: 31.634, lng: 74.8723 }, 'bathinda': { lat: 30.211, lng: 74.9455 },
  'delhi': { lat: 28.7041, lng: 77.1025 }, 'new delhi': { lat: 28.6139, lng: 77.209 },
  'mumbai': { lat: 19.076, lng: 72.8777 }, 'pune': { lat: 18.5204, lng: 73.8567 },
  'bangalore': { lat: 12.9716, lng: 77.5946 }, 'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.385, lng: 78.4867 }, 'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 }, 'lucknow': { lat: 26.8467, lng: 80.9462 },
  'jaipur': { lat: 26.9124, lng: 75.7873 }, 'noida': { lat: 28.5355, lng: 77.391 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 }, 'shimla': { lat: 31.1048, lng: 77.1734 },
  'manali': { lat: 32.2396, lng: 77.1887 }, 'agra': { lat: 27.1767, lng: 78.0081 },
  'varanasi': { lat: 25.3176, lng: 82.9739 }, 'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'sector': { lat: 30.7333, lng: 76.7794 }, 'phase': { lat: 30.7046, lng: 76.7179 },
};

function heuristicDistance(pickupStr, dropStr) {
  const p = pickupStr.toLowerCase();
  const d = dropStr.toLowerCase();
  const keys = Object.keys(COORDS_DB).sort((a, b) => b.length - a.length);

  const find = (text) => {
    for (const k of keys) { if (text.includes(k)) return COORDS_DB[k]; }
    return null;
  };

  const pC = find(p), dC = find(d);
  if (pC && dC) {
    const dist = haversine(pC.lat, pC.lng, dC.lat, dC.lng);
    // If coordinates match perfectly (same city), return 8.0 km instead of 0 km
    // to prevent the ride from becoming unavailable.
    return dist === 0 ? 8.0 : dist;
  }
  return 8.0; // General safe fallback if not found
}

/**
 * Calculate distance between two addresses (ASYNC).
 * Uses: Nominatim geocoding → OSRM road distance → Haversine → heuristic
 */
export async function calculateDistanceAsync(pickupStr, dropStr) {
  // Try Photon geocoding first
  const [pickupCoords, dropCoords] = await Promise.all([
    geocode(pickupStr),
    geocode(dropStr),
  ]);

  if (pickupCoords && dropCoords) {
    // Try OSRM for actual road distance
    const osrm = await getOSRMDistance(
      pickupCoords.lat, pickupCoords.lng,
      dropCoords.lat, dropCoords.lng
    );
    if (osrm) return osrm.distance;

    // OSRM failed — Haversine with geocoded coords
    return haversine(pickupCoords.lat, pickupCoords.lng, dropCoords.lat, dropCoords.lng);
  }

  // Geocoding failed — heuristic fallback
  return heuristicDistance(pickupStr, dropStr);
}

/**
 * Synchronous heuristic distance (for immediate fallback).
 */
export function calculateDistance(pickupStr, dropStr) {
  return heuristicDistance(pickupStr, dropStr);
}
