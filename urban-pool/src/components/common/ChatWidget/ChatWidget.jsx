import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import './ChatWidget.css';

export default function ChatWidget({ rideId, driverName = "Driver" }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [socket, setSocket] = useState(null);
  const [isDriverTyping, setIsDriverTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const userId = user?.userId || user?.uid || 'guest';

  // Ensure scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isDriverTyping]);

  // Load chat history & connect to socket
  useEffect(() => {
    if (!rideId) return;

    // Fetch historical messages
    fetch(`http://localhost:5001/api/chat/${rideId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error);

    // Establish Socket Connection
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_chat", rideId);
    });

    newSocket.on("receive_message", (msg) => {
      setIsDriverTyping(false);
      setMessages(prev => [...prev, msg]);
      
      // Auto-open chat if message from driver
      if (msg.senderId !== userId && !isOpen) {
        setIsOpen(true);
      }
    });

    newSocket.on("driver_typing", () => {
      setIsDriverTyping(true);
    });

    newSocket.on("driver_typing_stop", () => {
      setIsDriverTyping(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [rideId, userId, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || !socket) return;

    socket.emit("send_message", {
      rideId,
      senderId: userId,
      text: inputVal
    });

    setInputVal("");
  };

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <span className="chat-icon">💬</span>
          <span className="chat-label">Message {driverName}</span>
          {messages.length > 0 && messages[messages.length-1].senderId !== userId && (
            <span className="chat-badge">1</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="chat-window shadow-xl">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🚘</div>
              <div className="chat-title">
                <h4>{driverName}</h4>
                <p>On the way</p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-empty-state">Secure chat with {driverName}</p>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`chat-bubble-wrapper ${msg.senderId === userId ? 'sent' : 'received'}`}
                >
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />

            {isDriverTyping && (
              <div className="chat-bubble-wrapper received">
                <div className="chat-bubble typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button type="submit" disabled={!inputVal.trim()}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
