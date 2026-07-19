import React, { useState } from 'react';
import { Shield, Sparkles, Send, Megaphone, CheckCircle } from 'lucide-react';

export default function AdminPanel({ gates = [], concessions = [], onUpdateGate, onUpdateConcession, onDraftAnnouncement }) {
  const [selectedGate, setSelectedGate] = useState(gates[0]?.id || 'gate-a');
  const [gateTime, setGateTime] = useState(15);
  
  const [selectedCon, setSelectedCon] = useState(concessions[0]?.id || 'con-1');
  const [conTime, setConTime] = useState(15);

  const [incidentText, setIncidentText] = useState('Gate B ticket scanners offline causing crowd build-up');
  const [draftedAlert, setDraftedAlert] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGateSubmit = (e) => {
    e.preventDefault();
    onUpdateGate(selectedGate, gateTime);
    triggerSuccessGlow();
  };

  const handleConSubmit = (e) => {
    e.preventDefault();
    onUpdateConcession(selectedCon, conTime);
    triggerSuccessGlow();
  };

  const triggerSuccessGlow = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const handleDraftAnnouncement = async () => {
    if (!incidentText.trim() || isDrafting) return;
    setIsDrafting(true);
    try {
      const res = await onDraftAnnouncement(incidentText);
      setDraftedAlert(res);
    } catch (e) {
      setDraftedAlert("Failed to draft announcement. Verify server is online.");
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div>
      {/* Simulation status bar */}
      <div className={`glass-card ${isSuccess ? 'glow-border-violet' : ''}`} style={{ transition: 'all 0.3s ease' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--primary-neon)' }} /> Stadium Simulation Center
        </h3>
        
        {/* Gate wait times simulator */}
        <form onSubmit={handleGateSubmit} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alter Entry Gate Queues</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select 
              value={selectedGate} 
              onChange={(e) => setSelectedGate(e.target.value)}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '0.4rem', color: 'white', outline: 'none' }}
            >
              {gates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input 
              type="number" 
              value={gateTime} 
              onChange={(e) => setGateTime(parseInt(e.target.value) || 0)}
              style={{ width: '70px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '0.4rem', color: 'white', textAlign: 'center', outline: 'none' }}
              min="0"
              max="120"
            />
            <span style={{ fontSize: '0.75rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>min</span>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}>
            Update Gate Simulation
          </button>
        </form>

        {/* Concessions wait times simulator */}
        <form onSubmit={handleConSubmit}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alter Concession Queues</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select 
              value={selectedCon} 
              onChange={(e) => setSelectedCon(e.target.value)}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '0.4rem', color: 'white', outline: 'none' }}
            >
              {concessions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              type="number" 
              value={conTime} 
              onChange={(e) => setConTime(parseInt(e.target.value) || 0)}
              style={{ width: '70px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '0.4rem', color: 'white', textAlign: 'center', outline: 'none' }}
              min="0"
              max="120"
            />
            <span style={{ fontSize: '0.75rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>min</span>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}>
            Update Concession Simulation
          </button>
        </form>
      </div>

      {/* Operations GenAI Announcement Generator */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Megaphone size={16} style={{ color: 'var(--secondary-violet)' }} /> GenAI Announcement Builder
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Stadium staff can draft natural-sounding announcement messages based on real-time incident descriptions.
        </p>
        
        <textarea
          value={incidentText}
          onChange={(e) => setIncidentText(e.target.value)}
          rows="3"
          placeholder="Describe stadium incident..."
          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.6rem', color: 'white', outline: 'none', fontSize: '0.8rem', resize: 'none', marginBottom: '0.75rem' }}
        />

        <button 
          onClick={handleDraftAnnouncement}
          disabled={isDrafting || !incidentText.trim()}
          className="btn-primary" 
          style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem', justifyContent: 'center' }}
        >
          <Sparkles size={14} className="glow-text-emerald" /> {isDrafting ? 'Drafting Announcement...' : 'Draft Official PA Alert'}
        </button>

        {draftedAlert && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px dashed var(--secondary-violet)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary-violet)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
              <Megaphone size={12} /> DRAFTED SYSTEM ANNOUNCEMENT
            </div>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              "{draftedAlert}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                onClick={() => {
                  alert("Announcement sent to stadium screens!");
                  setDraftedAlert('');
                }}
                className="btn-outline" 
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <CheckCircle size={10} style={{ color: 'var(--primary-neon)' }} /> Broadcast to Screens
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
