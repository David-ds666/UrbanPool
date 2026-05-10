/**
 * Pricing utility — fetches from backend, with robust client-side fallback.
 * Uses Nominatim + OSRM for accurate distance when backend is down.
 */

import { calculateDistanceAsync, calculateDistance } from './distance';

const API_BASE = "http://localhost:5001/api";

const BASE_FARES  = { pool: 40, go: 60, xl: 100, premier: 150, electric: 80, bike: 15 };
const RATE_PER_KM = { pool: 12, go: 15, xl: 22,  premier: 30,  electric: 14, bike: 7 };
const ETA_MULT    = { pool: 1.3, go: 1.0, xl: 1.1, premier: 0.9, electric: 1.0, bike: 0.7 };

function buildResponse(rideType, dist) {
    const isAvailable = dist <= 100 && dist > 0;
    const base = BASE_FARES[rideType] || 50;
    const rate = RATE_PER_KM[rideType] || 15;
    const price = isAvailable ? Math.round(base + (dist * rate)) : 0;
    const durationMin = Math.round(dist * 1.8 + 5);
    const mult = ETA_MULT[rideType] || 1.0;
    const eta = isAvailable ? `${Math.round(durationMin * mult)} min` : "N/A";

    return {
        price, basePrice: price, eta, distance: dist,
        available: isAvailable, matchCount: 0,
        isSurge: false, surgeMultiplier: 1, surgeReasons: [],
    };
}

export const calculateRidePrice = async (rideType, pickup, drop) => {
    try {
        const response = await fetch(`${API_BASE}/price`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rideType, pickup, drop })
        });
        const data = await response.json();
        const backendDist = parseFloat(data.distance) || 0;

        // If backend returned a valid distance, trust it
        if (backendDist > 0) return data;

        // Backend returned 0 — calculate client-side
        console.warn("Backend returned 0 distance, using client-side calculation");
    } catch (error) {
        console.warn("Backend unavailable:", error.message);
    }

    // Client-side fallback with real geocoding
    const dist = await calculateDistanceAsync(pickup, drop);
    return buildResponse(rideType, dist);
};

export const getEstimateETA = async (rideType, pickup, drop) => {
    const data = await calculateRidePrice(rideType, pickup, drop);
    return data.eta || "5 min";
};
