# 05 — Sidebar

## What is the sidebar?
A slide-out panel on the left side of the screen, opened by clicking the hamburger menu (☰) or the user avatar. It contains navigation links, an active ride tracker, chat with driver, and notifications.

## How to open it
Click the hamburger icon (☰) in the top-left of the navbar, OR click the user avatar button.

## Sidebar menu items
| Icon | Option | What it does |
|------|--------|-------------|
| 👤 | Profile | Edit name, phone, avatar |
| 🔔 | Notifications | View all alerts (ride confirmed, payment, etc.) |
| 💳 | Wallet | View balance, add money, see transaction history |
| 🚗 | My Rides | View all past and active rides |
| ⭐ | Promos | See available discount codes |
| ⚙️ | Settings | App preferences |
| ❓ | Help | Contact support |

## Active Ride Section (most important feature)

### When does it appear?
ONLY when the user has an **active booking** in the database. The sidebar checks the backend on open:
```
GET /api/bookings/:userId → finds booking with isActive: true
```

### What does it show?
- Pickup and drop location
- Ride ID, type, price
- Driver name and vehicle (once assigned)
- A **4-step progress tracker**: Booked → Driver Found → On the Way → Completed

### How the steps auto-advance
The step tracker advances automatically based on time elapsed since booking:
- 0–3 minutes → "Booked" (step 1)
- 3–8 minutes → "Driver Found" (step 2)
- 8+ minutes → "On the Way" (step 3) → **"I've Arrived" button appears**

### "I've Arrived — Mark Complete" button
- Only visible when ride reaches "On the Way" step (8+ min)
- Clicking it calls `POST /api/bookings/:id/complete`
- Backend updates status to 'completed' in MySQL
- Frontend shows a ✅ success message for 3 seconds
- Active ride section disappears automatically
- On next page refresh, the section is gone (DB is source of truth)

### Chat with Driver
- A green "Chat with Driver" button appears below the menu (only during active ride)
- Clicking opens a chat panel inside the sidebar
- Uses Socket.io for real-time messaging
- Shows "Driver is typing..." indicator
- Auto-scrolls to newest message

## Key file
`urban-pool/src/components/common/Sidebar/Sidebar.jsx`
