import { useNavigate } from "react-router-dom";
import "./AuthGate.css";

/**
 * Overlay modal that prompts unauthenticated users to sign in / sign up.
 * Props:
 *   visible  – boolean to show/hide
 *   onClose  – callback to dismiss
 *   message  – optional context message (e.g. "to book a ride")
 */
export default function AuthGate({ visible, onClose, message = "to continue" }) {
    const navigate = useNavigate();

    if (!visible) return null;

    return (
        <div className="ag-overlay" onClick={onClose}>
            <div className="ag-modal" onClick={(e) => e.stopPropagation()}>
                <button className="ag-close" onClick={onClose}>✕</button>

                <div className="ag-icon">🔒</div>
                <h2>Sign in required</h2>
                <p>You need to log in or create an account {message}.</p>

                <button
                    className="ag-btn ag-btn-primary"
                    onClick={() => navigate("/login")}
                >
                    Log in
                </button>

                <button
                    className="ag-btn ag-btn-secondary"
                    onClick={() => navigate("/signup")}
                >
                    Create an account
                </button>

                <p className="ag-footer">
                    It only takes a few seconds to get started
                </p>
            </div>
        </div>
    );
}
