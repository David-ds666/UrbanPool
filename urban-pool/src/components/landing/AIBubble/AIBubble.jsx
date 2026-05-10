import { useState } from "react";
import "./AIBubble.css";

function AIBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Bubble */}
      <div className="ai-bubble" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {/* Popup */}
      {open && (
        <div className="ai-popup">
          <div className="ai-popup-header">
            UrbanPool AI
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="ai-popup-body">
            🚧 UrbanPool AI is coming soon.
            <br />
            <br />
            We’re working on smart ride assistance, pricing help, and support.
          </div>
        </div>
      )}
    </>
  );
}

export default AIBubble;