import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Sparkles, Navigation, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  "Where is the shortest line for tacos?",
  "How do I walk to the Metro Train station?",
  "Is there a quiet sensory room in the stadium?",
  "Show restrooms and accessibility guides near me"
];

export default function ChatAssist({ onSendMessage, chatHistory = [], isLoading, onRouteSelected }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (suggestion) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  // Convert raw message text with simple markdown replacement
  const formatMessageText = (text) => {
    if (!text) return '';
    // Replace markdown bold **text** with <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace newlines with <br />
    return formatted.split('\n').map((str, index) => (
      <span key={index}>
        {str}
        <br />
      </span>
    ));
  };

  return (
    <div className="chat-window">
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.75rem' }}>
        <Sparkles size={16} className="glow-text-emerald" style={{ color: 'var(--primary-neon)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          FanFlow AI Assistant (GenAI Enabled)
        </span>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <Sparkles size={24} style={{ color: 'var(--secondary-violet)' }} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem' }}>How can I help you, Champion?</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '280px' }}>
              Ask me about live queues, restrooms, quick routes, transport, and accessibility.
            </p>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <div>
                  <p style={{ margin: 0 }}>{formatMessageText(msg.text)}</p>
                  
                  {/* Dynamic Route Display inside bubble */}
                  {msg.navigationPath && msg.navigationPath.length > 0 && (
                    <div className="route-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-neon)', marginBottom: '0.5rem' }}>
                        <Navigation size={12} /> RECOMMENDED NAVIGATION PATH
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        {msg.navigationPath.map((step, idx) => (
                          <div key={idx}>
                            <div className="route-step">
                              <MapPin size={12} style={{ color: idx === 0 ? 'var(--primary-neon)' : idx === msg.navigationPath.length - 1 ? 'var(--secondary-violet)' : 'var(--text-secondary)' }} />
                              <span>{step}</span>
                            </div>
                            {idx < msg.navigationPath.length - 1 && <div className="route-step-connector" />}
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => onRouteSelected && onRouteSelected(msg.navigationPath)}
                        className="btn-primary" 
                        style={{ width: '100%', fontSize: '0.7rem', padding: '0.4rem', borderRadius: '6px', marginTop: '0.65rem', justifyContent: 'center' }}
                      >
                        Overlay Route on Map
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI is scanning stadium layout</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1.4s infinite 0.2s' }}></span>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1.4s infinite 0.4s' }}></span>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1.4s infinite 0.6s' }}></span>
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
            `}</style>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {chatHistory.length < 3 && !isLoading && (
        <div className="suggestions-list">
          {SUGGESTIONS.map((sug, i) => (
            <button key={i} className="suggestion-chip" onClick={() => handleSuggestionClick(sug)}>
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FanFlow AI..."
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
