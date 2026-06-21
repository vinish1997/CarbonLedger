import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Leaf, Award, Compass, Zap, Flame, Bike, UtensilsCrossed, Trash2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard({ triggerRefresh }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logStatus, setLogStatus] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const dbData = await api.getDashboard();
      const histData = await api.getHistory(0, 7);
      setData(dbData);
      setHistory(histData.content || []);
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [triggerRefresh]);

  const handleQuickLog = async (actionName, carbonSaving, category) => {
    try {
      setLogStatus(`Logging: ${actionName}...`);
      await api.logAction({ actionName, carbonSaving, category });
      setLogStatus(`Logged! Saved ${carbonSaving}kg CO2`);
      setTimeout(() => setLogStatus(null), 3000);
      fetchDashboardData(); // Refresh stats
    } catch (err) {
      console.error(err);
      setLogStatus('Failed to log action.');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading Carbon Metrics...</div>;
  }

  const profile = data?.profile || {};
  const breakdownData = [
    { name: 'Transportation', value: profile.transportFootprint || 0 },
    { name: 'Diet', value: profile.dietFootprint || 0 },
    { name: 'Energy', value: profile.energyFootprint || 0 },
    { name: 'Consumption', value: profile.consumptionFootprint || 0 }
  ];

  // Convert history array to a format compatible with Recharts (savings over last 7 entries)
  const savingsChartData = history.slice().reverse().map(log => ({
    name: log.actionName.length > 18 ? log.actionName.substring(0, 15) + '...' : log.actionName,
    saving: log.carbonSaving
  }));

  const quickActions = [
    { label: 'Cycle instead of car', saving: 2.5, category: 'TRANSPORTATION', icon: Bike, color: '#10b981' },
    { label: 'Eat Vegan Meal', saving: 1.2, category: 'DIET', icon: UtensilsCrossed, color: '#3b82f6' },
    { label: 'Cold wash laundry', saving: 0.8, category: 'ENERGY', icon: Zap, color: '#f59e0b' },
    { label: 'Declined plastic bags', saving: 0.4, category: 'CONSUMPTION', icon: Trash2, color: '#ef4444' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Climate Impact Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor your ecological footprint, review recent logs, and track carbon savings.
        </p>
      </div>

      {logStatus && (
        <div className="alert-container alert-success" style={{ margin: 0 }}>
          <span>{logStatus}</span>
        </div>
      )}

      {/* Main Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Baseline Footprint Card */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Baseline Footprint</span>
            <Leaf size={20} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>{profile.totalFootprint}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Tons CO2e/Yr</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Your baseline footprint is based on onboarding responses.
          </p>
        </div>

        {/* Carbon Savings Card */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Saved Carbon</span>
            <Award size={20} color="var(--secondary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary)' }}>{data?.totalSavingsKg}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>kg CO2e</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Accumulated from active challenges and quick action logging.
          </p>
        </div>

        {/* Climate Target Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Eco Benchmark Comparison</span>
            <Compass size={20} color="var(--warning)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--warning)' }}>
              {profile.totalFootprint > 4.0 ? 'Above' : 'Below'} Target
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Global safe climate ceiling is ~4.0 tons. Global average is ~4.8 tons.
          </p>
        </div>
      </div>

      {/* Real World equivalents grid */}
      <div>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Saved Carbon is Equivalent To</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '12px', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
              <Leaf size={24} />
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>{data?.equivalentTreesPlanted}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Trees growing (1 yr)</span>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ background: 'var(--secondary-glow)', padding: '12px', borderRadius: '12px', color: 'var(--secondary)', border: '1px solid var(--secondary)' }}>
              <Zap size={24} />
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>{data?.equivalentSmartphonesCharged}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Smartphones charged</span>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ background: 'var(--warning-glow)', padding: '12px', borderRadius: '12px', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
              <Flame size={24} />
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>{data?.equivalentGasSavedLiters}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Liters of Petrol saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Visualization Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Footprint Breakdown Pie */}
        <div className="glass-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Annual Footprint Breakdown</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [`${val} Tons CO2e`, 'Annual Impact']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carbon Savings History Bar Chart */}
        <div className="glass-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Carbon Savings History</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {savingsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={savingsChartData}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-secondary)" label={{ value: 'Saved (kg)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="saving" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {savingsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Log actions below to see your progress chart!</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Logger */}
      <div className="glass-card">
        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Log a Green Action</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Did you make an eco-friendly choice today? Select a quick template below to log your instant carbon savings!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleQuickLog(action.label, action.saving, action.category)}
                aria-label={`Log action: ${action.label}. Saves ${action.saving} kilograms of carbon.`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                className="btn-quick-log"
              >
                <div style={{ background: `${action.color}15`, padding: '10px', borderRadius: '10px', color: action.color, border: `1px solid ${action.color}30` }}>
                  <Icon size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>{action.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>-{action.saving} kg CO2e</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
