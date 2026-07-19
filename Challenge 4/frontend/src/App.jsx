import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Shield, Compass, MapPin } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StadiumMap from './components/StadiumMap';
import ChatAssist from './components/ChatAssist';
import AdminPanel from './components/AdminPanel';

const API_BASE = 'http://localhost:8080';

export default function App() {
  const [activeTab, setActiveTab] = useState(0); // 0: Dashboard, 1: Chat, 2: Admin
  const [gates, setGates] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('gate-a');
  const [activeRoute, setActiveRoute] = useState([]);

  // Fetch initial stadium queue status
  const fetchStadiumStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stadium/status`);
      if (res.ok) {
        const data = await res.json();
        setGates(data.gates || []);
        setConcessions(data.concessions || []);
      }
    } catch (err) {
      console.error("Failed to fetch stadium status, retrying in 5 seconds...", err);
    }
  };

  useEffect(() => {
    fetchStadiumStatus();
    // Poll queue status every 10 seconds for real-time operations
    const interval = setInterval(fetchStadiumStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update simulator settings
  const handleUpdateGate = async (id, waitTime) => {
    try {
      const res = await fetch(`${API_BASE}/api/stadium/simulate/gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, waitTimeMinutes: waitTime })
      });
      if (res.ok) {
        fetchStadiumStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConcession = async (id, waitTime) => {
    try {
      const res = await fetch(`${API_BASE}/api/stadium/simulate/concession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, waitTimeMinutes: waitTime })
      });
      if (res.ok) {
        fetchStadiumStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate public alert announcement using GenAI
  const handleDraftAnnouncement = async (triggerEvent) => {
    try {
      const res = await fetch(`${API_BASE}/api/announcements/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerEvent })
      });
      if (res.ok) {
        const data = await res.json();
        return data.announcementText;
      }
    } catch (err) {
      console.error(err);
    }
    return '';
  };

  // Send a chat message to FanFlow AI
  const handleSendMessage = async (messageText) => {
    // Append user message immediately
    const userMsg = { role: 'user', text: messageText };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, currentLocation })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg = {
          role: 'assistant',
          text: data.reply,
          navigationPath: data.navigationPath || [],
          suggestedAlternative: data.suggestedAlternative
        };

        // If path was returned, auto-highlight it on the map
        if (data.navigationPath && data.navigationPath.length > 0) {
          setActiveRoute(data.navigationPath);
        }

        setChatHistory(prev => [...prev, assistantMsg]);
      } else {
        throw new Error("Bad response from chat server");
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: "I'm having trouble reaching the main host right now. Please check your server connection."
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleSelectConcession = (concession) => {
    // Switch to chat and query direction to this concession
    setActiveTab(1);
    handleSendMessage(`How do I get to ${concession.name}?`);
  };

  const handleRouteSelected = (path) => {
    setActiveRoute(path);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <Compass size={22} style={{ color: 'var(--primary-neon)' }} className="glow-text-emerald" />
          <span className="logo-text">FanFlow AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Location Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <MapPin size={12} style={{ color: 'var(--primary-neon)' }} />
            <select
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.7rem', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="gate-a">Gate A</option>
              <option value="gate-b">Gate B</option>
              <option value="gate-c">Gate C</option>
              <option value="gate-d">Gate D</option>
            </select>
          </div>
          <span className="badge-wc">FIFA 26</span>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="content-body">
        {/* Persistent Map on top (interactive layout representation) */}
        <StadiumMap 
          gates={gates} 
          concessions={concessions} 
          activePath={activeRoute} 
        />

        {/* Tab switching content */}
        {activeTab === 0 && (
          <Dashboard 
            gates={gates} 
            concessions={concessions} 
            onSelectConcession={handleSelectConcession}
          />
        )}

        {activeTab === 1 && (
          <ChatAssist 
            onSendMessage={handleSendMessage}
            chatHistory={chatHistory}
            isLoading={isLoadingChat}
            onRouteSelected={handleRouteSelected}
          />
        )}

        {activeTab === 2 && (
          <AdminPanel 
            gates={gates} 
            concessions={concessions} 
            onUpdateGate={handleUpdateGate}
            onUpdateConcession={handleUpdateConcession}
            onDraftAnnouncement={handleDraftAnnouncement}
          />
        )}
      </main>

      {/* Bottom Navigation Menu */}
      <nav className="tab-navigation">
        <button 
          onClick={() => setActiveTab(0)} 
          className={`nav-btn ${activeTab === 0 ? 'active' : ''}`}
        >
          <Home size={20} className="nav-btn-icon" />
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab(1)} 
          className={`nav-btn ${activeTab === 1 ? 'active' : ''}`}
        >
          <MessageSquare size={20} className="nav-btn-icon" />
          <span>Chat Guide</span>
        </button>

        <button 
          onClick={() => setActiveTab(2)} 
          className={`nav-btn ${activeTab === 2 ? 'active' : ''}`}
        >
          <Shield size={20} className="nav-btn-icon" />
          <span>Ops Simulator</span>
        </button>
      </nav>
    </div>
  );
}
