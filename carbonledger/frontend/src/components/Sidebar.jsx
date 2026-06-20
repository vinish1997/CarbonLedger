import React from 'react';
import { LayoutDashboard, Calculator, Trophy, History, Leaf } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'challenges', label: 'Eco Challenges', icon: Trophy },
    { id: 'history', label: 'Action History', icon: History }
  ];

  return (
    <aside className="sidebar">
      <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '10px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf size={24} color="var(--primary)" />
        </div>
        <span className="logo-text" style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CarbonLedger
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 16px',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '16px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
              }}
              className="nav-button"
            >
              <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
              <span className="nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#070a13' }}>
          EV
        </div>
        <div className="logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Eco Hero</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Level 4 • Sapling</span>
        </div>
      </div>
    </aside>
  );
}
