import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ShieldCheck, Calendar, Zap, AlertCircle } from 'lucide-react';

export default function Challenges({ onChallengeAction }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChallenges = async () => {
    try {
      const data = await api.getChallenges();
      setChallenges(data);
    } catch (err) {
      setError('Failed to fetch challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleAccept = async (id) => {
    try {
      await api.acceptChallenge(id);
      fetchChallenges();
      if (onChallengeAction) onChallengeAction();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.completeChallenge(id);
      fetchChallenges();
      if (onChallengeAction) onChallengeAction();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading eco-challenges...</div>;
  }

  const activeChallenges = challenges.filter((c) => c.active);
  const availableChallenges = challenges.filter((c) => !c.active && !c.completed);
  const completedChallenges = challenges.filter((c) => c.completed);

  const getCategoryColor = (cat) => {
    switch (cat.toUpperCase()) {
      case 'TRANSPORTATION': return '#10b981';
      case 'DIET': return '#3b82f6';
      case 'ENERGY': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Eco Challenges</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Commit to green lifestyle goals, log completion parameters, and secure carbon points.
        </p>
      </div>

      {error && (
        <div className="alert-container alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Challenges Section */}
      <div>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--primary)" />
          Active Challenges ({activeChallenges.length})
        </h3>
        {activeChallenges.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {activeChallenges.map((c) => (
              <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px', borderColor: 'var(--primary)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: getCategoryColor(c.category), background: `${getCategoryColor(c.category)}15`, padding: '4px 8px', borderRadius: '4px', fontWeight: '700', border: `1px solid ${getCategoryColor(c.category)}20` }}>
                      {c.category}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.difficulty}</span>
                  </div>
                  <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{c.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>{c.description}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                    <span>Savings: <b>-{c.carbonSaving}kg</b></span>
                    <span>Duration: <b>{c.daysDuration} days</b></span>
                  </div>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleComplete(c.id)}>
                    Complete & Claim Points
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No challenges active right now. Pick one from the list below to get started!
          </div>
        )}
      </div>

      {/* Available Challenges Section */}
      <div>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Available Goals</h3>
        {availableChallenges.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {availableChallenges.map((c) => (
              <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: getCategoryColor(c.category), background: `${getCategoryColor(c.category)}15`, padding: '4px 8px', borderRadius: '4px', fontWeight: '700', border: `1px solid ${getCategoryColor(c.category)}20` }}>
                      {c.category}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.difficulty}</span>
                  </div>
                  <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{c.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>{c.description}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                    <span>Savings: <b>-{c.carbonSaving}kg</b></span>
                    <span>Duration: <b>{c.daysDuration} days</b></span>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%' }} onClick={() => handleAccept(c.id)}>
                    Accept Goal
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Awesome! You have accepted all available goals.
          </div>
        )}
      </div>

      {/* Completed Challenges Section */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            Completed Goals
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {completedChallenges.map((c) => (
              <div key={c.id} className="glass-card" style={{ opacity: 0.7, background: 'rgba(14, 20, 36, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                    {c.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>✓ Saved {c.carbonSaving}kg</span>
                </div>
                <h4 style={{ fontSize: '18px', marginBottom: '8px', textDecoration: 'line-through' }}>{c.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
