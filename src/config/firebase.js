// Firebase core
import { initializeApp } from "firebase/app";

// Firebase Auth
import { getAuth } from "firebase/auth";

// Firebase Firestore
import { getFirestore } from "firebase/firestore";

// 🔐 Your Firebase config (paste from console)
const firebaseConfig = {
  apiKey: "AIzaSyBJs0qTfAUmMKXXnjj2BYK13nwrSiVRyWo",
  authDomain: "urbanpool-d4d37.firebaseapp.com",
  projectId: "urbanpool-d4d37",
  storageBucket: "urbanpool-d4d37.firebasestorage.app",
  messagingSenderId: "276279865552",
  appId: "1:276279865552:web:a69c4b6f7d92e5f7f02ed5",
  measurementId: "G-MMNHB7S2XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db instances
export const auth = getAuth(app);
export const db = getFirestore(app);