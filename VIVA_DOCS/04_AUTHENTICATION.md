# 04 — Authentication (Login / Logout)

## What technology is used?
**Firebase Authentication** — a service by Google that handles all login/signup securely.

## How login works (step by step)

### Email/Password login:
1. User enters email + password on the Login page
2. React calls `signInWithEmailAndPassword(auth, email, password)` from Firebase SDK
3. Firebase verifies credentials on their server
4. If correct, Firebase returns a **user object** with a unique `uid` (user ID)
5. This user object is stored in `AuthContext` so ALL pages can access it
6. The user is now logged in — the app shows their name and profile

### Google Sign-In:
1. User clicks "Continue with Google"
2. Firebase opens a Google popup
3. User selects their Google account
4. Firebase returns the user object automatically
5. Same as above — stored in AuthContext

### Signup:
1. User fills in name, email, password
2. React calls `createUserWithEmailAndPassword(auth, email, password)`
3. Firebase creates a new account
4. We also store extra info (name, phone) in MySQL via `POST /api/profile`

## How logout works
1. User clicks "Log Out" in the sidebar
2. React calls `signOut(auth)` from Firebase
3. Firebase clears the session
4. AuthContext sets user to null
5. App redirects to login/home page

## How the app knows the user is logged in
Firebase provides `onAuthStateChanged(auth, callback)` — this runs automatically whenever the login state changes. We put this in `AuthContext.jsx`:
```js
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser); // null if logged out
  });
  return unsubscribe; // cleanup
}, []);
```

## AuthContext — what it provides to the whole app
- `user` — the Firebase user object (or null if not logged in)
- `userProfile` — extra data from MySQL (notifications, rides, wallet)
- `logout()` — logs out the user
- `updateProfile()` — saves profile changes
- `addNotification()` — adds a new notification
- `updateRideStatus()` — marks a ride as completed

## Protected routes
Some pages (like booking) check `if (!user) navigate('/login')` to prevent access without login.

## Session persistence
Firebase automatically saves the session in the browser. So if you refresh the page, you stay logged in. Firebase restores the session from localStorage/cookies.

## Security
- Passwords are NEVER stored in our MySQL database — Firebase handles all password storage with encryption
- We only store the Firebase `uid` as a reference in our MySQL tables

## Key file
`urban-pool/src/context/AuthContext.jsx` — contains all auth logic
