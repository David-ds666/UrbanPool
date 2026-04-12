import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ChatBot from "../ChatBot/ChatBot";
import "./Navbar.css";

function Navbar({ onToggleSidebar }) {
  const { user, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
        <Link to="/" className="logo">
          Urban<span className="logo-accent">Pool</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* Driver Portal Link */}
        <Link to="/driver" className="nav-btn">
          Driver
        </Link>
        
        {/* Help is ALWAYS visible */}
        <Link to="/help" className="nav-btn">
          Help
        </Link>
        <ChatBot />

        {!user ? (
          <>
            <Link to="/login" className="nav-btn">
              Log in
            </Link>

            <Link to="/signup" className="nav-btn primary">
              Sign up
            </Link>
          </>
        ) : (
          <>
            <button
              className="nav-btn primary"
              onClick={handleLogout}
            >
              Logout
            </button>

            {/* Avatar circle */}
            <div className="user-avatar" title={user.email}>
              {(userProfile.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;