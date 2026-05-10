const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// --- Socket.io Logic ---
io.on('connection', (socket) => {
  console.log('A user connected via socket:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('join_chat', (rideId) => {
    socket.join(`chat_${rideId}`);
    console.log(`User joined chat room: chat_${rideId}`);
  });

  socket.on('send_message', async (data) => {
    // expected data format: { rideId, senderId, text }
    try {
      const { Message } = app.locals.models;
      if (Message) {
        const newMsg = await Message.create({
          rideId: data.rideId,
          senderId: data.senderId,
          text: data.text
        });
        
        // Broadcast to everyone in the chat room including sender
        io.to(`chat_${data.rideId}`).emit('receive_message', newMsg);
        
        // Smart keyword-based driver chatbot
        if (data.senderId !== 'driver_system') {
          const userText = data.text.toLowerCase().trim();
          let reply = null;

          // Keyword matching rules (checked in priority order)
          const CHATBOT_RULES = [
            { keywords: ['where', 'location', 'far', 'how far', 'kahan'],       reply: "I'm about 2 minutes away! You can track me on the map. 📍" },
            { keywords: ['late', 'delay', 'slow', 'waiting', 'hurry'],           reply: "Apologies for the wait! Traffic is a bit heavy. I'll be there very soon. 🙏" },
            { keywords: ['cancel', 'don\'t come', 'abort'],                      reply: "Please use the cancel button in the app if you'd like to cancel. I'm already on my way!" },
            { keywords: ['call', 'phone', 'ring', 'contact'],                    reply: "I'm driving right now, so I can't take calls. Please message me here — I'll respond quickly! 🚗" },
            { keywords: ['otp', 'code', 'pin', 'verify'],                        reply: "I'll ask for the OTP when I arrive. Please keep it ready! 🔐" },
            { keywords: ['thank', 'thanks', 'thx', 'great', 'awesome', 'nice'],  reply: "You're welcome! Happy to help. See you shortly! 😊" },
            { keywords: ['hello', 'hi', 'hey', 'hii'],                           reply: "Hey there! I'm on my way to pick you up. ETA ~2 min. 👋" },
            { keywords: ['extra', 'stop', 'detour', 'another'],                  reply: "Sure, I can make a short stop if needed. Please share the location in chat. 📌" },
            { keywords: ['luggage', 'bag', 'suitcase', 'trunk', 'boot'],         reply: "No worries, I have plenty of trunk space. I'll help you load them! 🧳" },
            { keywords: ['pay', 'cash', 'payment', 'change', 'upi'],             reply: "Payment is handled through the app. You can also pay via cash — I'll have change. 💵" },
            { keywords: ['share', 'number', 'plate'],                            reply: "I'm driving a white Maruti Dzire — plate number PB01AB1234. Look for me! 🚘" },
            { keywords: ['ac', 'cold', 'hot', 'temperature'],                    reply: "AC is running! I'll adjust the temperature to your comfort when you board. ❄️" },
          ];

          for (const rule of CHATBOT_RULES) {
            if (rule.keywords.some(kw => userText.includes(kw))) {
              reply = rule.reply;
              break;
            }
          }

          // Default fallback if no keyword matches
          if (!reply) {
            const FALLBACKS = [
              "Got it! I'll be there shortly. 🚗",
              "Noted! I'm on my way. See you in a bit!",
              "Sure thing! Almost there. 👍",
              "Copy that! Tracking your location now.",
            ];
            reply = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
          }

          // Simulate typing indicator then send reply
          const typingDelay = 1500 + Math.random() * 2000; // 1.5s - 3.5s
          io.to(`chat_${data.rideId}`).emit('driver_typing', { rideId: data.rideId });

          setTimeout(async () => {
            io.to(`chat_${data.rideId}`).emit('driver_typing_stop', { rideId: data.rideId });
            const autoReply = await Message.create({
              rideId: data.rideId,
              senderId: 'driver_system',
              text: reply
            });
            io.to(`chat_${data.rideId}`).emit('receive_message', autoReply);
          }, typingDelay);
        }
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- Database Initialization ---
let sequelize;
const dbName = 'urbanpool';

async function initializeDatabase() {
  try {
    try {
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.end();
    } catch (dbErr) {
      console.error('Initial DB creation step failed - proceeding to Sequelize', dbErr.message);
    }

    // 2. Connect via Sequelize
    sequelize = new Sequelize(dbName, 'root', '', {
      host: '127.0.0.1',
      dialect: 'mysql',
      logging: false, // Set to console.log to see SQL queries
    });

    // 3. Define Models
    const PriceLog = sequelize.define('PriceLog', {
      pickup: DataTypes.STRING,
      drop: DataTypes.STRING,
      price: DataTypes.FLOAT,
      rideType: DataTypes.STRING,
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    const Booking = sequelize.define('Booking', {
      userId: DataTypes.STRING,
      driverId:      { type: DataTypes.STRING, allowNull: true },
      driverName:    { type: DataTypes.STRING, allowNull: true },
      driverVehicle: { type: DataTypes.STRING, allowNull: true },
      driverPhone:   { type: DataTypes.STRING, allowNull: true },
      pickup: DataTypes.STRING,
      drop: DataTypes.STRING,
      price: DataTypes.FLOAT,
      rideType: DataTypes.STRING,
      date: DataTypes.STRING,
      time: DataTypes.STRING,
      paymentMethod: DataTypes.STRING,
      status: { type: DataTypes.STRING, defaultValue: 'confirmed' },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    const RideRequest = sequelize.define('RideRequest', {
      pickup: DataTypes.STRING,
      drop: DataTypes.STRING,
      date: DataTypes.STRING,
      time: DataTypes.STRING,
      rideType: DataTypes.STRING,
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    const PoolRide = sequelize.define('PoolRide', {
      driverId: DataTypes.STRING,
      driverName: DataTypes.STRING,
      pickup: DataTypes.STRING,
      destination: DataTypes.STRING,
      date: DataTypes.STRING,
      time: DataTypes.STRING,
      seatsAvailable: DataTypes.INTEGER,
      pricePerSeat: DataTypes.FLOAT,
      status: { type: DataTypes.STRING, defaultValue: 'open' },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    const PoolBooking = sequelize.define('PoolBooking', {
      passengerId: DataTypes.STRING,
      passengerName: DataTypes.STRING,
      rideId: DataTypes.INTEGER,
      seatsBooked: DataTypes.INTEGER,
      totalFare: DataTypes.FLOAT,
      status: { type: DataTypes.STRING, defaultValue: 'confirmed' },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    const Review = sequelize.define('Review', {
      fromUserId: DataTypes.STRING,
      toUserId: DataTypes.STRING,
      fromUserName: DataTypes.STRING,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      targetType: DataTypes.STRING,
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    const Message = sequelize.define('Message', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      rideId: { type: DataTypes.STRING, allowNull: false },
      senderId: { type: DataTypes.STRING, allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    const Wallet = sequelize.define('Wallet', {
      userId: DataTypes.STRING,
      balance: { type: DataTypes.FLOAT, defaultValue: 200.0 }
    });

    const Transaction = sequelize.define('Transaction', {
      userId: DataTypes.STRING,
      transactionId: { type: DataTypes.STRING, unique: true },
      amount: DataTypes.FLOAT,
      type: DataTypes.STRING, // addition, deduction, bonus
      description: DataTypes.STRING,
      paymentMethod: { type: DataTypes.STRING, defaultValue: '' },
      date: { type: DataTypes.STRING, defaultValue: () => new Date().toISOString().split('T')[0] },
      status: { type: DataTypes.STRING, defaultValue: 'completed' },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });
    const UserProfile = sequelize.define('UserProfile', {
      userId:        { type: DataTypes.STRING,  unique: true, allowNull: false },
      name:          { type: DataTypes.STRING,  defaultValue: '' },
      phone:         { type: DataTypes.STRING,  defaultValue: '' },
      avatar:        { type: DataTypes.STRING,  defaultValue: 'avatar1' },
      isDriver:      { type: DataTypes.BOOLEAN, defaultValue: false },
      driverOnline:  { type: DataTypes.BOOLEAN, defaultValue: false },
      vehicleNumber: { type: DataTypes.STRING,  defaultValue: '' },
      vehicleName:   { type: DataTypes.STRING,  defaultValue: '' },
      vehicleType:   { type: DataTypes.STRING,  defaultValue: '' },
      vehicleColor:  { type: DataTypes.STRING,  defaultValue: '' },
      licenseId:     { type: DataTypes.STRING,  defaultValue: '' },
      city:          { type: DataTypes.STRING,  defaultValue: '' },
      createdAt:     { type: DataTypes.DATE,    defaultValue: DataTypes.NOW }
    });

    // Attach models to app locals to use in routes
    app.locals.models = { PriceLog, Booking, RideRequest, PoolRide, PoolBooking, Review, Message, Wallet, Transaction, UserProfile };

    // 4. Sync Database
    await sequelize.sync({ alter: true });

    console.log('MySQL Database Connected and Synced');

    // 5. Start Server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Map utils
const calculateHeuristicDistance = (pickup, drop) => {
  const p = pickup.toLowerCase();
  const d = drop.toLowerCase();

  // Comprehensive India coordinates database — states + cities
  const CITY_COORDS = {
    // ── Indian States (approximate centers) ──
    'tamil nadu':        { lat: 11.1271, lng: 78.6569 },
    'tamilnadu':         { lat: 11.1271, lng: 78.6569 },
    'kerala':            { lat: 10.8505, lng: 76.2711 },
    'karnataka':         { lat: 15.3173, lng: 75.7139 },
    'andhra pradesh':    { lat: 15.9129, lng: 79.7400 },
    'telangana':         { lat: 18.1124, lng: 79.0193 },
    'maharashtra':       { lat: 19.7515, lng: 75.7139 },
    'gujarat':           { lat: 22.2587, lng: 71.1924 },
    'rajasthan':         { lat: 27.0238, lng: 74.2179 },
    'madhya pradesh':    { lat: 22.9734, lng: 78.6569 },
    'uttar pradesh':     { lat: 26.8467, lng: 80.9462 },
    'bihar':             { lat: 25.0961, lng: 85.3131 },
    'west bengal':       { lat: 22.9868, lng: 87.8550 },
    'odisha':            { lat: 20.9517, lng: 85.0985 },
    'orissa':            { lat: 20.9517, lng: 85.0985 },
    'jharkhand':         { lat: 23.6102, lng: 85.2799 },
    'chhattisgarh':      { lat: 21.2787, lng: 81.8661 },
    'goa':               { lat: 15.2993, lng: 74.1240 },
    'punjab':            { lat: 31.1471, lng: 75.3412 },
    'haryana':           { lat: 29.0588, lng: 76.0856 },
    'himachal pradesh':  { lat: 31.1048, lng: 77.1734 },
    'uttarakhand':       { lat: 30.0668, lng: 79.0193 },
    'jammu':             { lat: 32.7266, lng: 74.8570 },
    'kashmir':           { lat: 34.0837, lng: 74.7973 },
    'assam':             { lat: 26.2006, lng: 92.9376 },
    'meghalaya':         { lat: 25.4670, lng: 91.3662 },
    'manipur':           { lat: 24.6637, lng: 93.9063 },
    'mizoram':           { lat: 23.1645, lng: 92.9376 },
    'tripura':           { lat: 23.9408, lng: 91.9882 },
    'nagaland':          { lat: 26.1584, lng: 94.5624 },
    'arunachal pradesh': { lat: 28.2180, lng: 94.7278 },
    'sikkim':            { lat: 27.5330, lng: 88.5122 },

    // ── Punjab & Chandigarh ──
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'mohali':     { lat: 30.7046, lng: 76.7179 },
    'sas nagar':  { lat: 30.7046, lng: 76.7179 },
    'sahibzada':  { lat: 30.7046, lng: 76.7179 },
    'ajit singh': { lat: 30.7046, lng: 76.7179 },
    'kharar':     { lat: 30.7460, lng: 76.6499 },
    'zirakpur':   { lat: 30.6428, lng: 76.8174 },
    'panchkula':  { lat: 30.6942, lng: 76.8606 },
    'patiala':    { lat: 30.3398, lng: 76.3869 },
    'ludhiana':   { lat: 30.9010, lng: 75.8573 },
    'jalandhar':  { lat: 31.3260, lng: 75.5762 },
    'amritsar':   { lat: 31.6340, lng: 74.8723 },
    'bathinda':   { lat: 30.2110, lng: 74.9455 },
    'bhatinda':   { lat: 30.2110, lng: 74.9455 },
    'dera bassi': { lat: 30.5893, lng: 76.8487 },
    'rajpura':    { lat: 30.4837, lng: 76.5945 },
    'kurali':     { lat: 30.8377, lng: 76.5526 },
    'ropar':      { lat: 30.9660, lng: 76.5232 },
    'rupnagar':   { lat: 30.9660, lng: 76.5232 },
    'abohar':     { lat: 30.1453, lng: 74.1983 },
    'fazilka':    { lat: 30.4036, lng: 74.0284 },
    'moga':       { lat: 30.8182, lng: 75.1726 },
    'barnala':    { lat: 30.3819, lng: 75.5472 },
    'sangrur':    { lat: 30.2446, lng: 75.8421 },
    'kapurthala': { lat: 31.3796, lng: 75.3809 },
    'hoshiarpur': { lat: 31.5316, lng: 75.9114 },
    'nawanshahr': { lat: 31.1250, lng: 76.1185 },
    'phagwara':   { lat: 31.2240, lng: 75.7708 },
    'pathankot':  { lat: 32.2746, lng: 75.6522 },
    'muktsar':    { lat: 30.4748, lng: 74.5134 },
    'firozpur':   { lat: 30.9336, lng: 74.6134 },
    'ferozepur':  { lat: 30.9336, lng: 74.6134 },
    'mansa':      { lat: 29.9974, lng: 75.3927 },
    'fatehgarh sahib': { lat: 30.6440, lng: 76.3920 },
    'gurdaspur':  { lat: 32.0414, lng: 75.4028 },
    'tarn taran': { lat: 31.4527, lng: 74.9279 },

    // ── Haryana ──
    'ambala':      { lat: 30.3782, lng: 76.7767 },
    'karnal':      { lat: 29.6857, lng: 76.9905 },
    'panipat':     { lat: 29.3909, lng: 76.9635 },
    'kurukshetra': { lat: 29.9695, lng: 76.8783 },
    'hisar':       { lat: 29.1492, lng: 75.7217 },
    'rohtak':      { lat: 28.8955, lng: 76.5796 },
    'sirsa':       { lat: 29.5349, lng: 75.0288 },
    'sonipat':     { lat: 28.9931, lng: 77.0151 },
    'yamunanagar': { lat: 30.1290, lng: 77.2674 },
    'faridabad':   { lat: 28.4089, lng: 77.3178 },

    // ── Himachal ──
    'shimla':      { lat: 31.1048, lng: 77.1734 },
    'dharamshala': { lat: 32.2190, lng: 76.3234 },
    'manali':      { lat: 32.2396, lng: 77.1887 },
    'kullu':       { lat: 31.9579, lng: 77.1096 },
    'solan':       { lat: 30.9045, lng: 77.0967 },

    // ── Rajasthan ──
    'jaipur':  { lat: 26.9124, lng: 75.7873 },
    'jodhpur': { lat: 26.2389, lng: 73.0243 },
    'udaipur': { lat: 24.5854, lng: 73.7125 },
    'ajmer':   { lat: 26.4499, lng: 74.6399 },
    'bikaner': { lat: 28.0229, lng: 73.3119 },
    'kota':    { lat: 25.2138, lng: 75.8648 },

    // ── Major metros / cities ──
    'delhi':         { lat: 28.7041, lng: 77.1025 },
    'new delhi':     { lat: 28.6139, lng: 77.2090 },
    'mumbai':        { lat: 19.0760, lng: 72.8777 },
    'noida':         { lat: 28.5355, lng: 77.3910 },
    'gurgaon':       { lat: 28.4595, lng: 77.0266 },
    'gurugram':      { lat: 28.4595, lng: 77.0266 },
    'pune':          { lat: 18.5204, lng: 73.8567 },
    'bangalore':     { lat: 12.9716, lng: 77.5946 },
    'bengaluru':     { lat: 12.9716, lng: 77.5946 },
    'hyderabad':     { lat: 17.3850, lng: 78.4867 },
    'kolkata':       { lat: 22.5726, lng: 88.3639 },
    'chennai':       { lat: 13.0827, lng: 80.2707 },
    'lucknow':       { lat: 26.8467, lng: 80.9462 },
    'ahmedabad':     { lat: 23.0225, lng: 72.5714 },
    'surat':         { lat: 21.1702, lng: 72.8311 },
    'kanpur':        { lat: 26.4499, lng: 80.3319 },
    'nagpur':        { lat: 21.1458, lng: 79.0882 },
    'indore':        { lat: 22.7196, lng: 75.8577 },
    'bhopal':        { lat: 23.2599, lng: 77.4126 },
    'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'vizag':         { lat: 17.6868, lng: 83.2185 },
    'patna':         { lat: 25.6093, lng: 85.1376 },
    'vadodara':      { lat: 22.3072, lng: 73.1812 },
    'guwahati':      { lat: 26.1445, lng: 91.7362 },
    'ranchi':        { lat: 23.3441, lng: 85.3096 },
    'coimbatore':    { lat: 11.0168, lng: 76.9558 },
    'madurai':       { lat: 9.9252,  lng: 78.1198 },
    'kochi':         { lat: 9.9312,  lng: 76.2673 },
    'trivandrum':    { lat: 8.5241,  lng: 76.9366 },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
    'mysore':        { lat: 12.2958, lng: 76.6394 },
    'mysuru':        { lat: 12.2958, lng: 76.6394 },
    'mangalore':     { lat: 12.9141, lng: 74.8560 },
    'mangaluru':     { lat: 12.9141, lng: 74.8560 },
    'varanasi':      { lat: 25.3176, lng: 82.9739 },
    'agra':          { lat: 27.1767, lng: 78.0081 },
    'dehradun':      { lat: 30.3165, lng: 78.0322 },
    'bhubaneswar':   { lat: 20.2961, lng: 85.8245 },
    'raipur':        { lat: 21.2514, lng: 81.6296 },
    'thane':         { lat: 19.2183, lng: 72.9781 },
    'navi mumbai':   { lat: 19.0330, lng: 73.0297 },

    // ── Sector / Phase default to Chandigarh/Mohali ──
    'sector': { lat: 30.7333, lng: 76.7794 },
    'phase':  { lat: 30.7046, lng: 76.7179 },
  };

  // Find matching city — longest key match first for accuracy
  const sortedKeys = Object.keys(CITY_COORDS).sort((a, b) => b.length - a.length);

  const findCity = (text) => {
    // Try substring match (longest first — e.g. "tamil nadu" before "nadu")
    for (const key of sortedKeys) {
      if (text.includes(key)) return CITY_COORDS[key];
    }
    // Try individual word match
    const words = text.split(/[,\s]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
    for (const word of words) {
      if (CITY_COORDS[word]) return CITY_COORDS[word];
    }
    return null;
  };

  const pickupCoords = findCity(p);
  const dropCoords = findCity(d);

  if (pickupCoords && dropCoords) {
    // Haversine formula for accuracy
    const R = 6371;
    const dLat = (dropCoords.lat - pickupCoords.lat) * Math.PI / 180;
    const dLng = (dropCoords.lng - pickupCoords.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickupCoords.lat * Math.PI/180) * Math.cos(dropCoords.lat * Math.PI/180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLine = R * c;
    let roadDist = straightLine * 1.4;
    // If coordinates match perfectly (same city), return 8.0 km instead of 2 km
    if (roadDist === 0) roadDist = 8.0;
    return parseFloat(roadDist.toFixed(1));
  }

  // Fallback — moderate distance estimate
  return 8.0;
};


// India bounding box — any geocode result outside this is wrong and discarded
const INDIA_BOUNDS = { latMin: 6.5, latMax: 37.5, lngMin: 68.0, lngMax: 97.5 };
const withinIndia  = (lat, lng) =>
  lat >= INDIA_BOUNDS.latMin && lat <= INDIA_BOUNDS.latMax &&
  lng >= INDIA_BOUNDS.lngMin && lng <= INDIA_BOUNDS.lngMax;

// ── Geocode using Photon — India-biased, validated within India bounds ──
const geocodeWithPhoton = async (address) => {
  try {
    // lat/lon bias centres on India; limit=5 so we can scan for a valid result
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=5&lang=en&lat=22.0&lon=78.0`;
    const response = await axios.get(url, { timeout: 5000 });
    const features = response.data?.features || [];
    for (const feat of features) {
      const [lng, lat] = feat.geometry.coordinates;
      if (withinIndia(parseFloat(lat), parseFloat(lng))) {
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      }
    }
    console.warn(`[GEOCODE] No Indian result for: "${address}"`);
    return null;
  } catch (err) {
    console.error('Photon geocoding failed:', err.message);
    return null;
  }
};

// ── Get actual road distance using OSRM (free, no API key) ──
const getOSRMDistance = async (lat1, lng1, lat2, lng2) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const response = await axios.get(url, { timeout: 5000 });
    if (response.data && response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: parseFloat((route.distance / 1000).toFixed(1)), // meters → km
        duration: Math.round(route.duration / 60), // seconds → minutes
      };
    }
    return null;
  } catch (err) {
    console.error('OSRM routing failed:', err.message);
    return null;
  }
};

// ── Haversine distance between two lat/lng pairs ──
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c * 1.3).toFixed(1)); // ×1.3 road factor
};

/**
 * ROBUST distance calculation — 3-tier fallback chain:
 * 1. Google Maps Distance Matrix API (if key exists)
 * 2. Nominatim geocoding + OSRM road distance (free, no key)
 * 3. Heuristic city-name matching (last resort)
 */
const getRealRouteData = async (pickup, drop) => {
  // ── Tier 1: Google Maps Distance Matrix ──
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey && apiKey !== "YOUR_API_KEY_HERE") {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickup)}&destinations=${encodeURIComponent(drop)}&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data;
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        const dist = element.distance.value / 1000;
        const dur = Math.round(element.duration.value / 60);
        console.log(`[DISTANCE] Google Maps: ${pickup} → ${drop} = ${dist.toFixed(1)} km`);
        return { distance: parseFloat(dist.toFixed(1)), duration: dur };
      }
      console.warn('[DISTANCE] Google Maps returned invalid status, trying Nominatim+OSRM...');
    } catch (err) {
      console.warn('[DISTANCE] Google Maps failed:', err.message, '— trying Nominatim+OSRM...');
    }
  }

  // ── Tier 2: Photon geocoding + OSRM road distance (free, no key) ──
  try {
    const [pickupCoords, dropCoords] = await Promise.all([
      geocodeWithPhoton(pickup),
      geocodeWithPhoton(drop),
    ]);

    if (pickupCoords && dropCoords) {
      // Try OSRM for actual road distance
      const osrmResult = await getOSRMDistance(
        pickupCoords.lat, pickupCoords.lng,
        dropCoords.lat, dropCoords.lng
      );

      if (osrmResult) {
        console.log(`[DISTANCE] OSRM: ${pickup} → ${drop} = ${osrmResult.distance} km`);
        return osrmResult;
      }

      // OSRM failed — use Haversine with geocoded coordinates
      const dist = haversineDistance(
        pickupCoords.lat, pickupCoords.lng,
        dropCoords.lat, dropCoords.lng
      );
      // Sanity check: if both coords are within India but haversine > 500 km,
      // geocoding likely returned a wrong city — fall through to heuristic
      if (dist > 500) {
        console.warn(`[DISTANCE] Haversine gave suspicious ${dist} km — falling back to heuristic`);
        throw new Error('Suspiciously large haversine result');
      }
      const duration = Math.round(dist * 1.5 + 5);
      console.log(`[DISTANCE] Photon+Haversine: ${pickup} → ${drop} = ${dist} km`);
      return { distance: dist, duration };
    }
    console.warn('[DISTANCE] Photon geocoding failed, using heuristic...');
  } catch (err) {
    console.warn('[DISTANCE] Photon+OSRM chain failed:', err.message);
  }

  // ── Tier 3: Heuristic city-name matching (last resort) ──
  const dist = calculateHeuristicDistance(pickup, drop);
  console.log(`[DISTANCE] Heuristic: ${pickup} → ${drop} = ${dist} km`);
  return {
    distance: parseFloat(dist.toFixed(1)),
    duration: Math.round(dist * 1.8 + 5)
  };
};


const BASE_FARES = { pool: 40, go: 60, xl: 100, premier: 150, electric: 80, bike: 15 };
const RATE_PER_KM = { pool: 12, go: 15, xl: 22, premier: 30, electric: 14, bike: 7 };
const ETA_MULTIPLIER = { pool: 1.3, go: 1.0, xl: 1.1, premier: 0.9, electric: 1.0, bike: 0.7 };

// --- Surge Pricing State (In-Memory) ---
const SURGE_CONDITIONS = {
  rushHour:  { label: 'Rush Hour',  icon: '⚡', multiplier: 1.5, active: false },
  heavyRain: { label: 'Heavy Rain', icon: '🌧️', multiplier: 1.8, active: false },
  festival:  { label: 'Festival',   icon: '🎉', multiplier: 2.0, active: false },
};

function getEffectiveSurge() {
  let multiplier = 1.0;
  const activeReasons = [];
  for (const [key, cond] of Object.entries(SURGE_CONDITIONS)) {
    if (cond.active) {
      multiplier *= cond.multiplier;
      activeReasons.push(cond.label);
    }
  }
  return { multiplier: Math.round(multiplier * 10) / 10, isSurge: multiplier > 1.0, reasons: activeReasons };
}

// --- Driver Simulation Utils ---
function decodePolyline(encoded) {
  if (!encoded) return [];
  var poly = [];
  var index = 0, len = encoded.length;
  var lat = 0, lng = 0;
  while (index < len) {
    var b, shift = 0, result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0; result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    poly.push({ lat: lat / 1E5, lng: lng / 1E5 });
  }
  return poly;
}

function calculateHeading(p1, p2) {
  if (!p1 || !p2) return 0;
  const lat1 = p1.lat * Math.PI / 180;
  const lng1 = p1.lng * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;
  const lng2 = p2.lng * Math.PI / 180;
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = Math.atan2(y, x);
  return (brng * 180 / Math.PI + 360) % 360;
}

const simulateDriverMovement = async (pickupStr, userId) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  let path = [];
  
  if (apiKey && apiKey !== "YOUR_API_KEY_HERE") {
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickupStr)}&key=${apiKey}`;
      const geoRes = await axios.get(geoUrl);
      if (geoRes.data.status === 'OK' && geoRes.data.results[0]) {
        const destLoc = geoRes.data.results[0].geometry.location;
        const startLat = destLoc.lat - 0.025;
        const startLng = destLoc.lng - 0.025;
        
        const dirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${destLoc.lat},${destLoc.lng}&key=${apiKey}`;
        const dirRes = await axios.get(dirUrl);
        
        if (dirRes.data.status === 'OK' && dirRes.data.routes[0]) {
          path = decodePolyline(dirRes.data.routes[0].overview_polyline.points);
          io.to(userId).emit('driver_route', path);
        }
      }
    } catch (err) {
      console.error("Simulation API Error:", err.message);
    }
  }
  
  // Fallback if API fails or no key
  if (path.length === 0) {
    let startLat = 30.7333, startLng = 76.7794; 
    for(let i=0; i<30; i++) {
       path.push({ lat: startLat + (i*0.001), lng: startLng + (i*0.001) });
    }
    io.to(userId).emit('driver_route', path);
  }

  let step = 0;
  io.to(userId).emit("driverStatus", { 
    status: "Driver Assigned", 
    message: "Rahul is arriving in a white Dzire (PB01AB1234)",
    step: 1
  });
  io.to(userId).emit('notification', {
    id: Date.now() + 1,
    type: 'info',
    title: 'Driver Assigned 🚕',
    message: 'Rahul (PB01AB1234) has accepted your ride request.',
    time: 'Just now'
  });

  const intervalId = setInterval(() => {
    if (step < path.length) {
      const pos = path[step];
      const heading = step > 0 ? calculateHeading(path[step-1], pos) : 0;
      io.to(userId).emit('driver_location_update', {
        lat: pos.lat,
        lng: pos.lng,
        heading: heading,
        eta: Math.max(1, Math.round((path.length - step) / 10)) + " min"
      });
      step++;
      
      if (step === Math.floor(path.length / 2)) {
         io.to(userId).emit("driverStatus", { 
          status: "On the way", 
          message: "Driver is 2 minutes away.",
          step: 2
        });
        io.to(userId).emit('notification', {
          id: Date.now() + 2,
          type: 'driver_arriving',
          title: 'Driver is Near! 📍',
          message: 'Your driver is just nearby. Please be ready!',
          time: 'Just now'
        });
      }
    } else {
      clearInterval(intervalId);
      io.to(userId).emit('driver_arrived', { message: 'Driver has arrived at pickup location.' });
      io.to(userId).emit("driverStatus", { 
        status: "Arrived", 
        message: "Driver is outside!",
        step: 3
      });
    }
  }, 1200);
};

// --- ROUTES ---

app.post('/api/price', async (req, res) => {
  const { pickup, drop, rideType } = req.body;
  if (!pickup || !drop) return res.status(400).json({ error: 'Locations required' });

  const routeData = await getRealRouteData(pickup, drop);
  const { distance, duration } = routeData;
  const isAvailable = distance <= 100;
  const base = BASE_FARES[rideType] || 50;
  const rate = RATE_PER_KM[rideType] || 15;
  const basePrice = isAvailable ? Math.round(base + (distance * rate)) : 0;
  const etaMult = ETA_MULTIPLIER[rideType] || 1.0;
  const adjustedDuration = Math.round(duration * etaMult);
  const eta = isAvailable ? `${adjustedDuration} min` : "N/A";

  // Apply surge pricing
  const surge = getEffectiveSurge();
  const price = surge.isSurge ? Math.round(basePrice * surge.multiplier) : basePrice;

  let matchCount = 0;
  try {
    const { RideRequest } = req.app.locals.models;
    const { Op } = require('sequelize');
    await RideRequest.create({ pickup, drop, date: req.body.date, time: req.body.time, rideType });
    matchCount = await RideRequest.count({
      where: {
        pickup: { [Op.like]: `%${pickup}%` },
        drop: { [Op.like]: `%${drop}%` }
      }
    });
    matchCount = Math.max(0, matchCount - 1);
  } catch (err) { console.error(err) }

  res.json({ price, basePrice, eta, distance, available: isAvailable, matchCount, surgeMultiplier: surge.multiplier, isSurge: surge.isSurge, surgeReasons: surge.reasons });
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { Booking, Wallet, Transaction } = req.app.locals.models;
    const bodyArgs = req.body;

    // Helper to generate unique transaction ID
    const generateTxnId = () => 'TXN' + Math.floor(10000 + Math.random() * 90000);

    // Deduct from Wallet if payment method is wallet
    if (bodyArgs.paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ where: { userId: bodyArgs.userId }});
      if (!wallet || wallet.balance < bodyArgs.price) {
        return res.status(400).json({ error: 'Insufficient UrbanPool Wallet balance.' });
      }
      wallet.balance -= bodyArgs.price;
      await wallet.save();
      
      await Transaction.create({
        userId: bodyArgs.userId,
        transactionId: generateTxnId(),
        amount: bodyArgs.price,
        type: 'deduction',
        paymentMethod: 'Wallet',
        description: `Ride: ${bodyArgs.pickup.substring(0, 20)} → ${bodyArgs.drop.substring(0, 20)}`
      });
    }

    const booking = await Booking.create(bodyArgs);
    
    const userId = req.body.userId;
    if (userId) {
      io.to(userId).emit('notification', {
        id: Date.now(),
        type: 'ride_confirmed',
        title: 'Ride Confirmed! ✅',
        message: `Your ride from ${req.body.pickup} to ${req.body.drop} is scheduled.`,
        time: 'Just now'
      });
      
      // Start the simulated driver journey central to backend!
      simulateDriverMovement(req.body.pickup, userId);
    }
    res.status(201).json({ success: true, id: booking.id, booking });
  } catch (err) {
    console.error('Error saving booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const bookings = await Booking.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    // Mark which bookings are truly active:
    // status must be active AND created within last 48h or booking date is today/future
    const ACTIVE_STATUSES = ['confirmed', 'driver_assigned', 'in_progress'];
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const activeIds = new Set(
      bookings
        .filter(b => {
          if (!ACTIVE_STATUSES.includes((b.status || '').toLowerCase())) return false;
          const createdAt   = new Date(b.createdAt);
          const bookingDate = b.date ? new Date(b.date) : null;
          const today = new Date(); today.setHours(0, 0, 0, 0);
          return createdAt >= cutoff || (bookingDate && bookingDate >= today);
        })
        .map(b => b.id)
    );
    res.json(bookings.map(b => ({ ...b.toJSON(), isActive: activeIds.has(b.id) })));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Passenger marks their booking as completed
app.post('/api/bookings/:bookingId/complete', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const [rowsUpdated] = await Booking.update(
      { status: 'completed' },
      {
        where: { id: req.params.bookingId },
        fields: ['status'],   // only update status — avoids updatedAt column issues
        silent: true          // skip automatic timestamp update
      }
    );
    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ success: true, rowsUpdated });
  } catch (err) {
    console.error('Booking complete error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/carpool/rides', async (req, res) => {
  try {
    const { PoolRide } = req.app.locals.models;
    const ride = await PoolRide.create(req.body);
    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/carpool/search', async (req, res) => {
  const { pickup, destination, date } = req.query;
  const { Op } = require('sequelize');
  const query = { status: 'open' };
  
  if (pickup) query.pickup = { [Op.like]: `%${pickup}%` };
  if (destination) query.destination = { [Op.like]: `%${destination}%` };
  if (date) query.date = date;

  try {
    const { PoolRide } = req.app.locals.models;
    const rides = await PoolRide.findAll({ where: query, order: [['time', 'ASC']] });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/carpool/book', async (req, res) => {
  const { rideId, passengerId, passengerName, seatsBooked } = req.body;
  
  try {
    const { PoolRide, PoolBooking } = req.app.locals.models;
    const ride = await PoolRide.findByPk(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.seatsAvailable < seatsBooked) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const totalFare = ride.pricePerSeat * seatsBooked;
    const booking = await PoolBooking.create({
      rideId, passengerId, passengerName, seatsBooked, totalFare
    });

    ride.seatsAvailable -= seatsBooked;
    if (ride.seatsAvailable === 0) ride.status = 'full';
    await ride.save();

    io.to(ride.driverId).emit('notification', {
      id: Date.now(),
      type: 'info',
      title: 'New Booking! 🧍',
      message: `${passengerName} booked ${seatsBooked} seat(s) for your ride to ${ride.destination}.`,
      time: 'Just now'
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/carpool/my-offers/:userId', async (req, res) => {
  try {
    const { PoolRide, PoolBooking } = req.app.locals.models;
    const rides = await PoolRide.findAll({
      where: { driverId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    // Attach booking counts to each ride
    const ridesWithCounts = await Promise.all(rides.map(async r => {
      const bookings = await PoolBooking.findAll({ where: { rideId: r.id } });
      const confirmedSeats = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((s, b) => s + (b.seatsBooked || 0), 0);
      return { ...r.toJSON(), bookings: bookings.map(b => b.toJSON()), confirmedSeats };
    }));
    res.json(ridesWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm or cancel a seat booking (driver action)
app.post('/api/carpool/booking/:bookingId/status', async (req, res) => {
  try {
    const { PoolBooking, PoolRide } = req.app.locals.models;
    const { status } = req.body; // 'confirmed' or 'cancelled'
    const booking = await PoolBooking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const prevStatus = booking.status;
    booking.status = status;
    await booking.save();

    // If cancelling a confirmed booking, restore the seats
    if (prevStatus === 'confirmed' && status === 'cancelled') {
      const ride = await PoolRide.findByPk(booking.rideId);
      if (ride) {
        ride.seatsAvailable += booking.seatsBooked;
        if (ride.status === 'full') ride.status = 'open';
        await ride.save();
      }
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel / close an entire offered ride
app.post('/api/carpool/ride/:rideId/cancel', async (req, res) => {
  try {
    const { PoolRide, PoolBooking } = req.app.locals.models;
    const ride = await PoolRide.findByPk(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    ride.status = 'cancelled';
    await ride.save();
    // Cancel all pending bookings for this ride
    await PoolBooking.update({ status: 'cancelled' }, { where: { rideId: ride.id, status: 'confirmed' } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark offered ride as completed
app.post('/api/carpool/ride/:rideId/complete', async (req, res) => {
  try {
    const { PoolRide } = req.app.locals.models;
    const ride = await PoolRide.findByPk(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    ride.status = 'completed';
    await ride.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start a ride — set status to in_progress
app.post('/api/carpool/ride/:rideId/start', async (req, res) => {
  try {
    const { PoolRide } = req.app.locals.models;
    const ride = await PoolRide.findByPk(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    ride.status = 'in_progress';
    await ride.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { Review } = req.app.locals.models;
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews/:userId', async (req, res) => {
  try {
    const { Review } = req.app.locals.models;
    const reviews = await Review.findAll({ 
      where: { toUserId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// Surge Control
app.get('/api/admin/surge', (req, res) => {
  const surge = getEffectiveSurge();
  const conditions = {};
  for (const [key, cond] of Object.entries(SURGE_CONDITIONS)) {
    conditions[key] = { label: cond.label, icon: cond.icon, multiplier: cond.multiplier, active: cond.active };
  }
  res.json({ conditions, effectiveMultiplier: surge.multiplier, isSurge: surge.isSurge, reasons: surge.reasons });
});

app.post('/api/admin/surge', (req, res) => {
  const { condition, active } = req.body;
  if (!SURGE_CONDITIONS[condition]) {
    return res.status(400).json({ error: 'Invalid surge condition' });
  }
  SURGE_CONDITIONS[condition].active = !!active;
  const surge = getEffectiveSurge();
  
  // Broadcast to all connected clients so price displays update live
  io.emit('surge_update', { 
    condition, 
    active: SURGE_CONDITIONS[condition].active,
    effectiveMultiplier: surge.multiplier, 
    isSurge: surge.isSurge, 
    reasons: surge.reasons 
  });
  
  console.log(`[SURGE] ${SURGE_CONDITIONS[condition].label} ${active ? 'ACTIVATED' : 'DEACTIVATED'} — Effective multiplier: ${surge.multiplier}x`);
  res.json({ success: true, effectiveMultiplier: surge.multiplier, isSurge: surge.isSurge, reasons: surge.reasons });
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { Booking, PoolBooking, UserProfile } = req.app.locals.models;
    const bookings = await Booking.findAll();
    const poolBookings = await PoolBooking.findAll();

    const totalRides = bookings.length + poolBookings.length;
    let totalRevenue = 0;
    bookings.forEach(b => totalRevenue += (b.price || 0));
    poolBookings.forEach(pb => totalRevenue += (pb.totalFare || 0));

    // Active users from DB
    const activeUsers = await UserProfile.count();

    // Last 7 days revenue chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      let dayRev = 0;
      bookings.forEach(b => {
        if (b.createdAt && b.createdAt.toISOString().startsWith(dateString)) dayRev += (b.price || 0);
      });
      poolBookings.forEach(pb => {
        if (pb.createdAt && pb.createdAt.toISOString().startsWith(dateString)) dayRev += (pb.totalFare || 0);
      });
      chartData.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: dayRev });
    }

    res.json({ totalRides, totalRevenue, activeUsers, chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/rides', async (req, res) => {
  try {
    const { Booking, PoolBooking, PoolRide } = req.app.locals.models;
    const bookings     = await Booking.findAll({ order: [['createdAt', 'DESC']] });
    const poolBookings = await PoolBooking.findAll({ order: [['createdAt', 'DESC']] });

    // Enrich pool bookings with route from parent PoolRide
    const enrichedPool = await Promise.all(poolBookings.map(async pb => {
      const ride = await PoolRide.findByPk(pb.rideId);
      return {
        id: pb.id,
        type: 'Carpool',
        pickup: ride ? ride.pickup : 'Unknown',
        drop:   ride ? ride.destination : 'Unknown',
        price:  pb.totalFare,
        seats:  pb.seatsBooked,
        passenger: pb.passengerName,
        date:   new Date(pb.createdAt).toLocaleDateString('en-IN'),
        status: pb.status,
      };
    }));

    const formatted = [
      ...bookings.map(b => ({
        id:        b.id,
        type:      b.rideType || 'Private Ride',
        pickup:    b.pickup,
        drop:      b.drop,
        price:     b.price,
        driver:    b.driverName || '—',
        vehicle:   b.driverVehicle || '—',
        date:      new Date(b.createdAt).toLocaleDateString('en-IN'),
        status:    b.status,
      })),
      ...enrichedPool,
    ];

    res.json(formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- CHAT ROUTES ---
app.get('/api/chat/:rideId', async (req, res) => {
  try {
    const { Message } = req.app.locals.models;
    const messages = await Message.findAll({ 
      where: { rideId: req.params.rideId },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DRIVER ROUTES ---
// Get pending requests
// ── Persist driver online/offline status ──
app.post('/api/driver/online', async (req, res) => {
  try {
    const { UserProfile } = req.app.locals.models;
    const { driverId, isOnline } = req.body;
    if (!driverId) return res.status(400).json({ error: 'driverId required' });

    let [profile] = await UserProfile.findOrCreate({
      where: { userId: driverId },
      defaults: { driverOnline: isOnline }
    });
    profile.driverOnline = isOnline;
    await profile.save();
    res.json({ success: true, driverOnline: isOnline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get driver online status ──
app.get('/api/driver/online/:driverId', async (req, res) => {
  try {
    const { UserProfile } = req.app.locals.models;
    const profile = await UserProfile.findOne({ where: { userId: req.params.driverId } });
    res.json({ driverOnline: profile ? profile.driverOnline : false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/driver/requests', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const pending = await Booking.findAll({
      where: { status: 'confirmed' }, // 'confirmed' means user booked it, but no driver yet
      order: [['createdAt', 'DESC']]
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept Request — stores driver profile info on booking for admin visibility
app.post('/api/driver/accept/:id', async (req, res) => {
  try {
    const { Booking, UserProfile } = req.app.locals.models;
    const { driverId } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Ride not found' });

    // Fetch driver profile to store human-readable info on booking
    const driverProfile = await UserProfile.findOne({ where: { userId: driverId } });

    booking.driverId      = driverId;
    booking.driverName    = driverProfile?.name    || 'Driver';
    booking.driverVehicle = driverProfile?.vehicleName
      ? `${driverProfile.vehicleName} (${driverProfile.vehicleNumber || ''})`
      : null;
    booking.driverPhone   = driverProfile?.phone   || null;
    booking.status        = 'driver_assigned';
    await booking.save();

    res.json({ message: 'Ride accepted successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Diver's Active/Past Rides
app.get('/api/driver/rides/:driverId', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const rides = await Booking.findAll({
      where: { driverId: req.params.driverId },
      order: [['createdAt', 'DESC']]
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Ride Status
app.post('/api/driver/status/:id', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const { status } = req.body; // e.g., 'in_progress', 'completed'
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Ride not found' });
    
    booking.status = status;
    await booking.save();
    
    res.json({ message: `Ride status updated to ${status}`, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver Stats (for dashboard cards)
app.get('/api/driver/stats/:driverId', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const { Op } = require('sequelize');
    const { driverId } = req.params;

    const allRides = await Booking.findAll({ where: { driverId } });
    const completedRides = allRides.filter(r => r.status === 'completed');
    const activeRides = allRides.filter(r => r.status === 'driver_assigned' || r.status === 'in_progress');

    // Today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRides = completedRides.filter(r => new Date(r.createdAt) >= todayStart);
    const todayEarnings = todayRides.reduce((sum, r) => sum + (r.price || 0), 0);

    // Acceptance rate (completed / total assigned)
    const totalAssigned = allRides.length;
    const acceptanceRate = totalAssigned > 0 ? Math.round((completedRides.length / totalAssigned) * 100) : 100;

    res.json({
      todayEarnings,
      todayRides: todayRides.length,
      totalCompleted: completedRides.length,
      activeRides: activeRides.length,
      acceptanceRate,
      totalRides: allRides.length,
    });
  } catch (err) {
    console.error('Driver stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Driver Earnings (for earnings page)
app.get('/api/driver/earnings/:driverId', async (req, res) => {
  try {
    const { Booking } = req.app.locals.models;
    const { driverId } = req.params;

    const completedRides = await Booking.findAll({
      where: { driverId, status: 'completed' },
      order: [['createdAt', 'DESC']]
    });

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now); monthStart.setDate(now.getDate() - 30);

    let todayTotal = 0, weekTotal = 0, monthTotal = 0, allTimeTotal = 0;
    completedRides.forEach(r => {
      const amt = r.price || 0;
      const d = new Date(r.createdAt);
      allTimeTotal += amt;
      if (d >= monthStart) monthTotal += amt;
      if (d >= weekStart) weekTotal += amt;
      if (d >= todayStart) todayTotal += amt;
    });

    // Last 7 days chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      let dayEarnings = 0, dayCount = 0;
      completedRides.forEach(r => {
        if (new Date(r.createdAt).toISOString().startsWith(dateStr)) {
          dayEarnings += (r.price || 0);
          dayCount++;
        }
      });
      chartData.push({ day: dayLabel, date: dateStr, earnings: dayEarnings, rides: dayCount });
    }

    // Transaction list (last 20)
    const transactions = completedRides.slice(0, 20).map(r => ({
      id: r.id,
      pickup: r.pickup,
      drop: r.drop,
      price: r.price,
      rideType: r.rideType,
      date: new Date(r.createdAt).toLocaleDateString('en-IN'),
      time: new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }));

    res.json({
      summary: {
        today: Math.round(todayTotal),
        week: Math.round(weekTotal),
        month: Math.round(monthTotal),
        allTime: Math.round(allTimeTotal),
        totalTrips: completedRides.length,
      },
      chartData,
      transactions,
    });
  } catch (err) {
    console.error('Driver earnings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- USER PROFILE API ROUTES ---

app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { UserProfile, Booking, PoolBooking, Review } = req.app.locals.models;
    const { userId } = req.params;

    let [profile, created] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { name: '', phone: '', avatar: 'avatar1' }
    });

    // Real stats from DB
    const totalBookings = await Booking.count({ where: { userId } });
    const totalPoolBookings = await PoolBooking.count({ where: { passengerId: userId } });
    const totalRides = totalBookings + totalPoolBookings;

    const reviews = await Review.findAll({ where: { toUserId: userId } });
    let avgRating = 0;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      avgRating = Math.round(avgRating * 10) / 10;
    }

    const memberSince = profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : 'Recently';

    res.json({
      profile: {
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
        isDriver: profile.isDriver,
        vehicleNumber: profile.vehicleNumber,
        vehicleName: profile.vehicleName,
        licenseId: profile.licenseId,
        city: profile.city,
      },
      stats: {
        totalRides,
        memberSince,
        avgRating: avgRating || 4.9,
        reviewCount: reviews.length,
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile/:userId', async (req, res) => {
  try {
    const { UserProfile } = req.app.locals.models;
    const { userId } = req.params;
    const { name, phone, avatar, isDriver, vehicleNumber, vehicleName, vehicleType, vehicleColor, licenseId, city } = req.body;

    let [profile, created] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { name: name || '', phone: phone || '', avatar: avatar || 'avatar1' }
    });

    if (!created) {
      if (name          !== undefined) profile.name          = name;
      if (phone         !== undefined) profile.phone         = phone;
      if (avatar        !== undefined) profile.avatar        = avatar;
      if (isDriver      !== undefined) profile.isDriver      = isDriver;
      if (vehicleNumber !== undefined) profile.vehicleNumber = vehicleNumber;
      if (vehicleName   !== undefined) profile.vehicleName   = vehicleName;
      if (vehicleType   !== undefined) profile.vehicleType   = vehicleType;
      if (vehicleColor  !== undefined) profile.vehicleColor  = vehicleColor;
      if (licenseId     !== undefined) profile.licenseId     = licenseId;
      if (city          !== undefined) profile.city          = city;
      await profile.save();
    }

    res.json({ success: true, profile });
  } catch (err) {
    console.error('Error saving profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- WALLET API ROUTES ---

app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const { Wallet, Transaction } = req.app.locals.models;
    const { userId } = req.params;
    
    // Find or create
    let [wallet, created] = await Wallet.findOrCreate({
      where: { userId },
      defaults: { balance: 200.0 }
    });

    // Insert sign-up bonus history conditionally
    if (created) {
      await Transaction.create({
        userId,
        transactionId: 'TXN' + Math.floor(10000 + Math.random() * 90000),
        amount: 200,
        type: 'bonus',
        paymentMethod: 'System',
        description: 'Welcome Bonus from UrbanPool'
      });
    }

    let transactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    // Retroactive fix for users who didn't get bonus
    if (!created && transactions.length === 0 && wallet.balance === 0) {
       wallet.balance = 200.0;
       await wallet.save();
       await Transaction.create({
         userId,
         transactionId: 'TXN' + Math.floor(10000 + Math.random() * 90000),
         amount: 200,
         type: 'bonus',
         paymentMethod: 'System',
         description: 'Welcome Bonus from UrbanPool'
       });
       transactions = await Transaction.findAll({
         where: { userId },
         order: [['createdAt', 'DESC']]
       });
    }

    // Calculate wallet summary
    let totalAdded = 0;
    let totalSpent = 0;
    transactions.forEach(tx => {
      if ((tx.type === 'addition' || tx.type === 'bonus') && tx.status === 'completed') {
        totalAdded += tx.amount;
      } else if (tx.type === 'deduction' && tx.status === 'completed') {
        totalSpent += tx.amount;
      }
    });

    res.json({ balance: wallet.balance, transactions, totalAdded, totalSpent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wallet/add', async (req, res) => {
  try {
    const { Wallet, Transaction } = req.app.locals.models;
    const { Op } = require('sequelize');
    const { userId, amount, paymentMethod, referenceId } = req.body;
    const parsedAmount = parseFloat(amount);

    // ── Input Validation ──
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ error: 'Please enter a valid amount.' });
    if (parsedAmount < 10)
      return res.status(400).json({ error: 'Minimum add amount is ₹10.' });
    if (parsedAmount > 10000)
      return res.status(400).json({ error: 'Maximum add amount per transaction is ₹10,000.' });

    // ── Reference ID Validation ──
    const REF_PATTERNS = {
      'UPI':         { pattern: /^[A-Z0-9]{10,22}$/i, label: 'UTR / Reference Number (10–22 alphanumeric characters)' },
      'Card':        { pattern: /^[A-Z0-9]{6}$/i,     label: 'Bank Auth Code (6 alphanumeric characters)' },
      'Net Banking': { pattern: /^[A-Z0-9]{8,22}$/i,  label: 'Bank Reference Number (8–22 alphanumeric characters)' },
    };
    const methodLabel = paymentMethod || 'UPI';
    const refCfg = REF_PATTERNS[methodLabel] || REF_PATTERNS['UPI'];
    const cleanRef = (referenceId || '').trim().toUpperCase();

    if (!cleanRef) {
      return res.status(400).json({ error: 'Reference / UTR number is required. Please enter the reference from your payment app.' });
    }
    if (!refCfg.pattern.test(cleanRef)) {
      return res.status(400).json({ error: `Invalid reference format. Expected: ${refCfg.label}` });
    }

    // ── Daily Add Limit: max ₹20,000 per user per day ──
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTransactions = await Transaction.findAll({
      where: {
        userId,
        type: 'addition',
        status: 'completed',
        createdAt: { [Op.gte]: todayStart }
      }
    });
    const todayAdded = todayTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    if (todayAdded + parsedAmount > 20000) {
      const remaining = Math.max(0, 20000 - todayAdded);
      return res.status(400).json({
        error: `Daily wallet limit reached. You can add up to ₹${remaining.toFixed(0)} more today.`
      });
    }

    const transactionId = 'TXN' + Math.floor(10000 + Math.random() * 90000);

    // ── Realistic Payment Gateway Simulation ──
    // Simulate network delay (2–3.5 seconds)
    const delay = 2000 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Weighted outcome: 80% success, 20% failure
    const roll = Math.random();
    const isSuccess = roll < 0.80;

    // Realistic decline reasons by payment method
    const DECLINE_REASONS = {
      UPI: [
        'Payment timed out. Your UPI app did not respond in time.',
        'Transaction declined by your bank. Please retry.',
        'UPI PIN entered incorrectly. Please try again.',
        'Insufficient balance in linked bank account.',
      ],
      Card: [
        'Card declined by issuing bank. Please contact your bank.',
        'Incorrect card details. Please check and retry.',
        'Card limit exceeded for today.',
        'Transaction flagged by fraud detection. Please retry.',
      ],
      'Net Banking': [
        'Session expired. Please refresh and try again.',
        'Bank server temporarily unavailable. Try in a few minutes.',
        'Net banking transaction declined. Please contact your bank.',
      ],
    };

    const reasons = DECLINE_REASONS[methodLabel] || DECLINE_REASONS['UPI'];
    const declineReason = reasons[Math.floor(Math.random() * reasons.length)];

    // ── Find or create wallet ──
    let [wallet] = await Wallet.findOrCreate({ where: { userId }, defaults: { balance: 200.0 } });

    if (isSuccess) {
      wallet.balance = parseFloat(wallet.balance) + parsedAmount;
      await wallet.save();
    }

    // ── Always log the transaction (success or failed) ──
    const tx = await Transaction.create({
      userId,
      transactionId,
      amount: parsedAmount,
      type: 'addition',
      paymentMethod: methodLabel,
      description: isSuccess
        ? `₹${parsedAmount} added via ${methodLabel} — Ref: ${cleanRef}`
        : `Payment declined — ${declineReason}`,
      status: isSuccess ? 'completed' : 'failed'
    });

    // ── Use HTTP 402 for payment failure so frontend can distinguish ──
    if (!isSuccess) {
      return res.status(402).json({
        success: false,
        transactionId,
        status: 'failed',
        reason: declineReason,
        message: declineReason,
        bankRef: cleanRef,
        balance: parseFloat(wallet.balance),
        transaction: { ...tx.toJSON(), referenceId: cleanRef }
      });
    }

    return res.status(200).json({
      success: true,
      transactionId,
      status: 'completed',
      message: `₹${parsedAmount} added successfully to your UrbanPool Wallet.`,
      bankRef: cleanRef,
      balance: parseFloat(wallet.balance),
      transaction: { ...tx.toJSON(), referenceId: cleanRef }
    });

  } catch (err) {
    console.error('[WALLET] Add funds error:', err);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// --- ADMIN USERS ROUTE ---
app.get('/api/admin/users', async (req, res) => {
  try {
    const { UserProfile, Booking, Wallet } = req.app.locals.models;

    // Fetch all data in parallel
    const [profiles, wallets, allBookings] = await Promise.all([
      UserProfile.findAll({ order: [['createdAt', 'DESC']] }),
      Wallet.findAll(),
      Booking.findAll({ attributes: ['userId'], raw: true }),
    ]);

    // Build count map (bookings per user)
    const bookingCountMap = {};
    allBookings.forEach(b => {
      if (b.userId) bookingCountMap[b.userId] = (bookingCountMap[b.userId] || 0) + 1;
    });

    // Build lookup maps
    const walletMap = {};
    wallets.forEach(w => { walletMap[w.userId] = parseFloat(w.balance || 0); });

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId] = p; });

    // Union of all known userIds
    const allUserIds = new Set([
      ...profiles.map(p => p.userId),
      ...wallets.map(w => w.userId),
      ...Object.keys(bookingCountMap),
    ]);

    const users = [...allUserIds].map(userId => {
      const profile = profileMap[userId];
      return {
        userId,
        name: profile?.name || 'Unregistered',
        phone: profile?.phone || '-',
        avatar: profile?.avatar || 'avatar1',
        isDriver: profile?.isDriver || false,
        city: profile?.city || '-',
        vehicleName: profile?.vehicleName || '',
        memberSince: profile?.createdAt
          ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
          : 'Unknown',
        bookingCount: bookingCountMap[userId] || 0,
        walletBalance: walletMap[userId] || 0,
      };
    }).sort((a, b) => b.bookingCount - a.bookingCount);

    res.json({ users, total: users.length });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: err.message });
  }
});

initializeDatabase();

