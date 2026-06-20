import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Challenges from './components/Challenges';
import History from './components/History';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCalculationSuccess = () => {
    handleRefresh();
    // Redirect user back to dashboard after completing calculation so they see new scores!
    setTimeout(() => {
      setActiveTab('dashboard');
    }, 1500);
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard triggerRefresh={refreshTrigger} />
        )}
        
        {activeTab === 'calculator' && (
          <Calculator onCalculationSuccess={handleCalculationSuccess} />
        )}
        
        {activeTab === 'challenges' && (
          <Challenges onChallengeAction={handleRefresh} />
        )}
        
        {activeTab === 'history' && (
          <History triggerRefresh={refreshTrigger} />
        )}
      </main>
    </div>
  );
}

export default App;
