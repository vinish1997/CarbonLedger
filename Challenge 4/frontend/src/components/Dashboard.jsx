import React from 'react';
import { Shield, Clock, Utensils, Beer, ShoppingBag, LogOut, Flame } from 'lucide-react';

export default function Dashboard({ gates = [], concessions = [], onSelectConcession }) {
  // Find shortest wait items
  const bestGate = [...gates].sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)[0];
  const bestConcession = [...concessions]
    .filter(c => c.type === 'Food')
    .sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)[0];

  const getIcon = (type) => {
    switch (type) {
      case 'Food': return <Utensils size={16} />;
      case 'Drink': return <Beer size={16} />;
      case 'Merchandise': return <ShoppingBag size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'CLEAR': return 'clear';
      case 'MODERATE': return 'moderate';
      case 'CROWDED': return 'crowded';
      default: return '';
    }
  };

  return (
    <div>
      {/* Smart AI Recommendation Banner */}
      <div className="glass-card glow-border-violet" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(0, 0, 0, 0.3))' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--secondary-violet)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <Flame size={14} className="glow-text-emerald" /> FanFlow AI Quick Advice
        </h4>
        <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
          {bestGate && bestConcession ? (
            <>
              For fast stadium entry, use <strong>{bestGate.name}</strong> ({bestGate.waitTimeMinutes} mins wait). 
              If you are hungry, try <strong>{bestConcession.name}</strong> ({bestConcession.waitTimeMinutes} mins wait) to beat the halftime queues.
            </>
          ) : (
            "Analyzing live queues and bottlenecks. Check back for real-time optimal paths."
          )}
        </p>
      </div>

      {/* Entry Gates wait times */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} style={{ color: 'var(--primary-neon)' }} /> Entrance Gate Queues
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {gates.map(gate => (
            <div key={gate.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600 }}>{gate.name}</span>
                <span className={`status-pill ${getStatusClass(gate.status)}`}>
                  <Clock size={12} /> {gate.waitTimeMinutes} mins
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (gate.waitTimeMinutes / 45) * 100)}%`, 
                    background: gate.status === 'CLEAR' ? 'var(--status-clear)' : gate.status === 'MODERATE' ? 'var(--status-moderate)' : 'var(--status-crowded)',
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease-in-out'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concession Stand statuses */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Utensils size={16} style={{ color: 'var(--secondary-violet)' }} /> Concession & Merchandise Stands
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {concessions.map(c => (
            <div 
              key={c.id} 
              onClick={() => onSelectConcession && onSelectConcession(c)}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0.65rem 0.85rem', 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: '1px solid rgba(255, 255, 255, 0.03)', 
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{getIcon(c.type)}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.location} • {c.type}</div>
                </div>
              </div>
              
              <span className={`status-pill ${getStatusClass(c.status)}`}>
                {c.waitTimeMinutes}m wait
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
