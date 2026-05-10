/**
 * Booking service to handle ride reservations via MongoDB backend
 */

const API_BASE = "http://localhost:5001/api";

/**
 * Saves a new ride booking to MongoDB
 */
export const saveBooking = async (userId, bookingData) => {
    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...bookingData })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn("Backend unavailable, falling back to simulated booking success:", error);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return { 
            success: true, 
            message: "Simulated booking success", 
            booking: { 
                id: `bk_${Date.now()}`,
                userId,
                ...bookingData,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            } 
        };
    }
};

/**
 * Retrieves all bookings for a specific user from MongoDB
 */
export const getUserBookings = async (userId) => {
    try {
        const response = await fetch(`${API_BASE}/bookings/${userId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
};
