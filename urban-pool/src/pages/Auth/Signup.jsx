import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  // -------------------------
  // Form state
  // -------------------------
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // -------------------------
  // UI state
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone validation: exactly 10 digits
  const isPhoneValid = /^\d{10}$/.test(phone);

  // -------------------------
  // Signup handler
  // -------------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name || !phone || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // Firebase signup
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Persist displayName to Firebase Auth
      const { updateProfile: fbUpdateProfile } = await import("firebase/auth");
      await fbUpdateProfile(cred.user, { displayName: name });

      // Persist to MySQL backend
      await fetch(`http://localhost:5001/api/profile/${cred.user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: `+91 ${phone}` })
      });

      // Save to local context too
      updateProfile({ name, phone: `+91 ${phone}` });

      // Redirect after success
      navigate("/login");
    } catch (err) {
      // Firebase error handling
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSignup}>
        <h1>Create account</h1>
        <p>Sign up to start using UrbanPool</p>

        {error && <div className="auth-error">{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="phone-input-group">
          <span className="phone-prefix">+91</span>
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPhone(val);
            }}
          />
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="auth-btn"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Log in</span>
        </p>
      </form>
    </div>
  );
}

export default Signup;