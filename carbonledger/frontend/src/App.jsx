import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Challenges from './components/Challenges';
import History from './components/History';
import './App.css';

/** --- CUSTOM HOOK FOR LOGIC --- */
const useAppNavigation = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleCalculationSuccess = useCallback(() => {
    handleRefresh();
    // Redirect user back to dashboard after completing calculation so they see new scores!
    setTimeout(() => {
      setActiveTab('dashboard');
    }, 1500);
  }, [handleRefresh]);

  return { 
    activeTab, 
    setActiveTab, 
    refreshTrigger, 
    handleRefresh, 
    handleCalculationSuccess 
  };
};

/** --- MAIN COMPONENT --- */
function App() {
  const { 
    activeTab, 
    setActiveTab, 
    refreshTrigger, 
    handleRefresh, 
    handleCalculationSuccess 
  } = useAppNavigation();

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard" style={{ width: '100%' }}>
            <Dashboard triggerRefresh={refreshTrigger} />
          </div>
        )}
        
        {activeTab === 'calculator' && (
          <div role="tabpanel" id="panel-calculator" aria-labelledby="tab-calculator" style={{ width: '100%' }}>
            <Calculator onCalculationSuccess={handleCalculationSuccess} />
          </div>
        )}
        
        {activeTab === 'challenges' && (
          <div role="tabpanel" id="panel-challenges" aria-labelledby="tab-challenges" style={{ width: '100%' }}>
            <Challenges onChallengeAction={handleRefresh} />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div role="tabpanel" id="panel-history" aria-labelledby="tab-history" style={{ width: '100%' }}>
            <History triggerRefresh={refreshTrigger} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
