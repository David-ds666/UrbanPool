# 12 — Database (MySQL + Sequelize)

## Database name: `urbanpool`
## Type: Relational (SQL) database
## Tool: MySQL + Sequelize ORM

## What is Sequelize?
Sequelize is a JavaScript library (ORM = Object Relational Mapper) that lets you interact with MySQL using JavaScript objects instead of writing raw SQL queries.

Instead of:
```sql
INSERT INTO Bookings (userId, pickup, drop) VALUES ('abc', 'Mohali', 'Delhi');
```
You write:
```js
await Booking.create({ userId: 'abc', pickup: 'Mohali', drop: 'Delhi' });
```

## Database Tables (Models)

### 1. Bookings
Stores every ride booking.
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| userId | STRING | Firebase user ID |
| pickup | STRING | Pickup location text |
| drop | STRING | Drop location text |
| date | STRING | Ride date |
| time | STRING | Ride time |
| rideType | STRING | e.g., 'UrbanGo', 'Premier' |
| price | FLOAT | Amount charged |
| status | STRING | confirmed/driver_assigned/in_progress/completed/cancelled |
| driverName | STRING | Assigned driver's name |
| driverVehicle | STRING | Car model |
| driverPhone | STRING | Driver contact |
| paymentMethod | STRING | 'wallet' or 'cash' |
| createdAt | DATE | When booking was made |

### 2. UserProfile
Extra user data beyond what Firebase stores.
| Column | Description |
|--------|-------------|
| userId | Firebase UID (links to Firebase user) |
| name | Display name |
| phone | Phone number |
| avatar | Profile photo URL |
| role | 'user' or 'admin' |

### 3. Wallet
One wallet per user.
| Column | Description |
|--------|-------------|
| userId | Firebase UID |
| balance | Current balance in ₹ |

### 4. Transaction
Every money movement.
| Column | Description |
|--------|-------------|
| userId | Who the transaction belongs to |
| amount | ₹ amount |
| type | 'credit' or 'debit' |
| paymentMethod | UPI, Card, Wallet, etc. |
| description | e.g., "Ride: Mohali → Delhi" |

### 5. PoolRide
Carpool rides offered by drivers.
| Column | Description |
|--------|-------------|
| driverName | Name of driver offering the ride |
| origin | Starting city |
| destination | Ending city |
| date, time | When the ride is |
| seatsAvailable | How many passengers can join |
| pricePerSeat | ₹ per person |

### 6. PoolBooking
When a passenger joins a carpool ride.
| Column | Description |
|--------|-------------|
| userId | Passenger who booked |
| poolRideId | Which PoolRide they joined |
| seatsBooked | How many seats they took |

### 7. Message
Chat messages between driver and passenger.
| Column | Description |
|--------|-------------|
| rideId | Which booking this chat belongs to |
| senderId | Firebase UID of sender |
| text | Message content |
| sentAt | Timestamp |

### 8. Review
Ratings after a ride.
| Column | Description |
|--------|-------------|
| bookingId | Which ride was reviewed |
| userId | Who left the review |
| rating | 1–5 stars |
| comment | Optional text |

### 9. RideRequest
Stores search requests for carpool matching.
| Column | Description |
|--------|-------------|
| pickup | Where they want to go from |
| drop | Where they want to go |
| date, time | When |
| rideType | Type requested |

### 10. PriceLog
Logs all price calculations (for analytics).
| Column | Description |
|--------|-------------|
| pickup, drop | Locations |
| price | Price calculated |
| rideType | Type |

## How Sequelize sync works
On server startup:
```js
await sequelize.sync({ alter: true });
```
This automatically creates tables if they don't exist, and updates columns if the model changes. `alter: true` is safer than `force: true` (which would delete all data).

## Key file
`backend/server.js` — all model definitions are at the top of this file
