import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';
import { Leaf, Award, Compass, Zap, Flame, Bike, UtensilsCrossed, Trash2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const QUICK_ACTIONS = [
  { label: 'Cycle instead of car', saving: 2.5, category: 'TRANSPORTATION', icon: Bike, color: '#10b981' },
  { label: 'Eat Vegan Meal', saving: 1.2, category: 'DIET', icon: UtensilsCrossed, color: '#3b82f6' },
  { label: 'Cold wash laundry', saving: 0.8, category: 'ENERGY', icon: Zap, color: '#f59e0b' },
  { label: 'Declined plastic bags', saving: 0.4, category: 'CONSUMPTION', icon: Trash2, color: '#ef4444' }
];

// Custom Hook to manage state, side-effects, and data fetching
function useDashboard(triggerRefresh) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logStatus, setLogStatus] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dbData, histData] = await Promise.all([
        api.getDashboard(),
        api.getHistory(0, 7)
      ]);
      if (isMounted.current) {
        setData(dbData);
        setHistory(histData.content || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [triggerRefresh, fetchDashboardData]);

  const handleQuickLog = useCallback(async (actionName, carbonSaving, category) => {
    if (isMounted.current) {
      setLogStatus(`Logging: ${actionName}...`);
    }
    try {
      await api.logAction({ actionName, carbonSaving, category });
      if (isMounted.current) {
        setLogStatus(`Logged! Saved ${carbonSaving}kg CO2`);
      }
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      if (isMounted.current) {
        setLogStatus('Failed to log action.');
      }
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    if (logStatus && !logStatus.startsWith('Logging:')) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setLogStatus(null);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [logStatus]);

  const profile = data?.profile || {};

  const personalizedInsights = useMemo(() => {
    const insights = [];
    if (!data || !data.profile) {
      return [{
        title: "Complete the Calculator",
        text: "Please visit the Carbon Calculator tab to estimate your baseline carbon footprint and receive personalized insights.",
        type: "neutral"
      }];
    }

    const { transportFootprint, dietFootprint, energyFootprint, consumptionFootprint, totalFootprint } = profile;
    
    if (totalFootprint > 4.0) {
      insights.push({
        title: "Baseline Above Safe Climate Limit",
        text: `Your footprint of ${totalFootprint} tons exceeds the sustainable target of 4.0 tons. Prioritize switching to renewable energy tariffs and reducing car commute miles.`,
        type: "warning"
      });
    } else {
      insights.push({
        title: "Eco Leader Status!",
        text: `Great job! Your annual footprint (${totalFootprint} tons) is within the safe planetary ceiling of 4.0 tons. Keep logging actions to push it even lower!`,
        type: "success"
      });
    }

    const categories = [
      { name: 'Transportation', value: transportFootprint || 0, tip: 'Consider cycling or walking for trips under 5km, using public transit, or exploring electric vehicle options.' },
      { name: 'Diet', value: dietFootprint || 0, tip: 'Swapping beef/pork for poultry, fish, or plant-based proteins even 3 days a week drastically cuts agricultural methane emissions.' },
      { name: 'Home Energy', value: energyFootprint || 0, tip: 'Upgrade to LED bulbs, optimize thermostat settings (lower by 2°C in winter), and look into green or solar power utility tariffs.' },
      { name: 'Consumption', value: consumptionFootprint || 0, tip: 'Embrace a minimalist shopping approach: repair gadgets instead of replacing them, buy local produce, and avoid single-use plastics.' }
    ];
    
    categories.sort((a, b) => b.value - a.value);
    
    const topCat = categories[0];
    if (topCat && topCat.value > 0) {
      insights.push({
        title: `Primary Impact Area: ${topCat.name}`,
        text: `Your highest emission source is ${topCat.name} (${topCat.value.toFixed(2)} Tons). Tip: ${topCat.tip}`,
        type: "primary"
      });
    }

    const secondCat = categories[1];
    if (secondCat && secondCat.value > 1.0) {
      insights.push({
        title: `Secondary Impact Area: ${secondCat.name}`,
        text: `${secondCat.name} contributes ${secondCat.value.toFixed(2)} Tons to your annual footprint. Tip: ${secondCat.tip}`,
        type: "secondary"
      });
    }

    return insights;
  }, [data, profile]);

  const breakdownData = useMemo(() => [
    { name: 'Transportation', value: profile.transportFootprint || 0 },
    { name: 'Diet', value: profile.dietFootprint || 0 },
    { name: 'Energy', value: profile.energyFootprint || 0 },
    { name: 'Consumption', value: profile.consumptionFootprint || 0 }
  ], [profile.transportFootprint, profile.dietFootprint, profile.energyFootprint, profile.consumptionFootprint]);

  const savingsChartData = useMemo(() => history.slice().reverse().map(log => ({
    name: log.actionName.length > 18 ? log.actionName.substring(0, 15) + '...' : log.actionName,
    saving: log.carbonSaving
  })), [history]);

  return {
    data,
    loading,
    logStatus,
    personalizedInsights,
    breakdownData,
    savingsChartData,
    handleQuickLog
  };
}

// Sub-components to enforce Separation of Concerns and Reusability
const StatCard = React.memo(({ title, value, unit, description, icon: Icon, colorClass, iconColor }) => (
  <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>{title}</span>
      <Icon size={20} color={iconColor} />
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span style={{ fontSize: '36px', fontWeight: '800', color: colorClass }}>{value}</span>
      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{unit}</span>
    </div>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
      {description}
    </p>
  </div>
));

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  colorClass: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired
};

StatCard.displayName = 'StatCard';

const InsightCard = React.memo(({ title, text, type }) => {
  const borderLeftColor = useMemo(() => {
    switch (type) {
      case 'warning': return 'var(--warning)';
      case 'success': return 'var(--primary)';
      case 'primary': return 'var(--secondary)';
      default: return 'var(--text-muted)';
    }
  }, [type]);

  return (
    <div 
      style={{
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderLeft: `4px solid ${borderLeftColor}`,
        borderTop: '1px solid var(--border-glass)',
        borderRight: '1px solid var(--border-glass)',
        borderBottom: '1px solid var(--border-glass)'
      }}
    >
      <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        {text}
      </p>
    </div>
  );
});

InsightCard.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

InsightCard.displayName = 'InsightCard';

const EquivalentCard = React.memo(({ title, value, icon: Icon, glowColor, iconColor }) => (
  <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
    <div style={{ background: glowColor, padding: '12px', borderRadius: '12px', color: iconColor, border: `1px solid ${iconColor}` }}>
      <Icon size={24} />
    </div>
    <div>
      <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>{value}</span>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{title}</span>
    </div>
  </div>
));

EquivalentCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType.isRequired,
  glowColor: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired
};

EquivalentCard.displayName = 'EquivalentCard';

const QuickActionLogger = React.memo(({ handleQuickLog }) => (
  <div className="glass-card">
    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Log a Green Action</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
      Did you make an eco-friendly choice today? Select a quick template below to log your instant carbon savings!
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
      {QUICK_ACTIONS.map((action, idx) => {
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
));

QuickActionLogger.propTypes = {
  handleQuickLog: PropTypes.func.isRequired
};

QuickActionLogger.displayName = 'QuickActionLogger';

export default function Dashboard({ triggerRefresh }) {
  const {
    data,
    loading,
    logStatus,
    personalizedInsights,
    breakdownData,
    savingsChartData,
    handleQuickLog
  } = useDashboard(triggerRefresh);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading Carbon Metrics...</div>;
  }

  const profile = data?.profile || {};

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
        <StatCard 
          title="Baseline Footprint"
          value={profile.totalFootprint}
          unit="Tons CO2e/Yr"
          description="Your baseline footprint is based on onboarding responses."
          icon={Leaf}
          colorClass="var(--text-primary)"
          iconColor="var(--primary)"
        />
        <StatCard 
          title="Total Saved Carbon"
          value={data?.totalSavingsKg}
          unit="kg CO2e"
          description="Accumulated from active challenges and quick action logging."
          icon={Award}
          colorClass="var(--primary)"
          iconColor="var(--secondary)"
        />
        <StatCard 
          title="Eco Benchmark Comparison"
          value={profile.totalFootprint > 4.0 ? 'Above Target' : 'Below Target'}
          unit=""
          description="Global safe climate ceiling is ~4.0 tons. Global average is ~4.8 tons."
          icon={Compass}
          colorClass="var(--warning)"
          iconColor="var(--warning)"
        />
      </div>

      {/* Personalized Insights Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={22} color="var(--primary)" />
          Personalized Eco Insights
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Tailored recommendations generated from your unique carbon baseline answers:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {personalizedInsights.map((insight, idx) => (
            <InsightCard 
              key={idx} 
              title={insight.title}
              text={insight.text}
              type={insight.type}
            />
          ))}
        </div>
      </div>

      {/* Real World equivalents grid */}
      <div>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Saved Carbon is Equivalent To</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <EquivalentCard 
            title="Trees growing (1 yr)"
            value={data?.equivalentTreesPlanted}
            icon={Leaf}
            glowColor="var(--primary-glow)"
            iconColor="var(--primary)"
          />
          <EquivalentCard 
            title="Smartphones charged"
            value={data?.equivalentSmartphonesCharged}
            icon={Zap}
            glowColor="var(--secondary-glow)"
            iconColor="var(--secondary)"
          />
          <EquivalentCard 
            title="Liters of Petrol saved"
            value={data?.equivalentGasSavedLiters}
            icon={Flame}
            glowColor="var(--warning-glow)"
            iconColor="var(--warning)"
          />
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

      <QuickActionLogger handleQuickLog={handleQuickLog} />
    </div>
  );
}

Dashboard.propTypes = {
  triggerRefresh: PropTypes.any
};
