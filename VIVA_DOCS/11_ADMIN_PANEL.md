# 11 — Admin Panel

## What is the admin panel?
A separate section of the app (`/admin`) only accessible to admin users. It gives a complete view of all rides, users, earnings, and system controls.

## How to access it
- URL: `http://localhost:5173/admin`
- Login with admin credentials
- Normal users are redirected away if they try to access `/admin`

## Admin panel pages

### Dashboard (`/admin/dashboard`)
- Total rides today
- Total revenue
- Active drivers
- Average rating
- Recent bookings list (all users)
- Booking status breakdown (confirmed/completed/cancelled)

### Ride Management (`/admin/rides`)
- Table of ALL bookings from ALL users
- Columns: ID, User, Pickup, Drop, Type, Price, Status, Date
- Can filter by status, date, ride type
- Shows both standard rides and carpool rides

### User Management (`/admin/users`)
- List of all registered users
- User details: name, email, phone, join date
- Number of rides per user

### Surge Control (`/admin/surge`)
- Toggle surge pricing ON/OFF manually
- Set surge multiplier (1.3×, 1.5×, 2.0×)
- Add reason text ("High demand", "Raining", etc.)
- Changes apply immediately to all new bookings

### Revenue Analytics
- Total earnings by date range
- Earnings by ride type
- Top routes by revenue

## How admin authentication works
- Admin check: The app checks if the logged-in user's email matches a hardcoded admin email OR if `userProfile.role === 'admin'`
- If not admin → redirected back to home page
- Admin layout (`AdminLayout.jsx`) wraps all admin pages

## Key API endpoints used by admin
| Endpoint | What it returns |
|----------|----------------|
| `GET /api/admin/rides` | All bookings from all users |
| `GET /api/admin/users` | All registered users |
| `GET /api/admin/surge` | Current surge status |
| `POST /api/admin/surge` | Update surge settings |
| `GET /api/admin/revenue` | Revenue statistics |

## Key files
- `src/pages/Admin/AdminDashboard.jsx` — main dashboard
- `src/pages/Admin/AdminRidesTable.jsx` — rides list
- `src/pages/Admin/AdminUsers.jsx` — users list
- `src/pages/Admin/SurgeControl.jsx` — surge pricing control
- `src/layouts/AdminLayout.jsx` — admin wrapper with sidebar
