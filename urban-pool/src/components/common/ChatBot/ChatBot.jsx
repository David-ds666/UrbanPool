import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../../../pages/Help/helpData';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! I\'m your UrbanPool AI assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const findAnswer = (query) => {
        const lowerQuery = query.toLowerCase();

        // Search in all FAQs across categories
        for (const category of CATEGORIES) {
            for (const faq of category.faqs) {
                if (lowerQuery.includes(faq.q.toLowerCase()) ||
                    faq.q.toLowerCase().includes(lowerQuery)) {
                    return faq.a;
                }

                // Keyword matching in answers too
                const keywords = lowerQuery.split(' ');
                if (keywords.some(k => k.length > 3 && faq.q.toLowerCase().includes(k))) {
                    return faq.a;
                }
            }
        }

        // Default fallbacks
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            return "Hello! I can help you with rides, payments, safety, or account questions. What's on your mind?";
        }
        if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('fare')) {
            return "Fares are calculated based on distance, time, and demand. You'll see an upfront estimate before you book!";
        }
        if (lowerQuery.includes('safety')) {
            return "Safety is our priority. We have verified drivers, SOS buttons, and live trip sharing in the app.";
        }

        return "I'm not sure I have a specific answer for that. You can check our Help center or contact support at support@urbanpool.com.";
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const answer = findAnswer(userMsg);
            setMessages(prev => [...prev, { type: 'bot', text: answer }]);
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Bubble */}
            <div className="chatbot-bubble" onClick={() => setIsOpen(!isOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">🤖</div>
                            <div>
                                <h3>UrbanPool AI</h3>
                                <div className="chatbot-status">Online</div>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`msg ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chatbot-typing">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-footer">
                        <div className="chatbot-input-wrap">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoFocus
                            />
                            <button
                                className="chatbot-send"
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
