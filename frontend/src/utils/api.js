const API_BASE = 'http://localhost:8080/api';

// Fallback seed data stored locally if backend is unavailable
const fallbackChallenges = [
  { id: 1, title: 'Meatless Week', description: 'Avoid meat for 7 consecutive days to lower agricultural demand.', category: 'DIET', carbonSaving: 12.0, difficulty: 'EASY', active: false, completed: false, daysDuration: 7, daysProgress: 0 },
  { id: 2, title: 'Car-Free Commute', description: 'Use public transit, walking, or cycling for all commutes this week.', category: 'TRANSPORTATION', carbonSaving: 35.0, difficulty: 'HARD', active: false, completed: false, daysDuration: 5, daysProgress: 0 },
  { id: 3, title: 'Power Down', description: 'Unplug electronics when not in use and switch off standby mode.', category: 'ENERGY', carbonSaving: 4.5, difficulty: 'EASY', active: false, completed: false, daysDuration: 3, daysProgress: 0 },
  { id: 4, title: 'Zero Single-Use Plastic', description: 'Ditch plastic bottles, bags, and packaging for a full week.', category: 'CONSUMPTION', carbonSaving: 8.0, difficulty: 'MEDIUM', active: false, completed: false, daysDuration: 7, daysProgress: 0 },
  { id: 5, title: 'Cycled Trips (<5km)', description: 'Cycle for all trips under 5 kilometers instead of driving.', category: 'TRANSPORTATION', carbonSaving: 15.0, difficulty: 'MEDIUM', active: false, completed: false, daysDuration: 5, daysProgress: 0 },
  { id: 6, title: 'Cold Wash Only', description: 'Run all laundry loads on cold settings to conserve heating energy.', category: 'ENERGY', carbonSaving: 6.0, difficulty: 'EASY', active: false, completed: false, daysDuration: 7, daysProgress: 0 }
];

const getLocalData = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const saveLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize fallback state if not already set
if (!localStorage.getItem('ecotrace_profile')) {
  saveLocalData('ecotrace_profile', {
    id: 1,
    totalFootprint: 7.35,
    transportFootprint: 2.9,
    dietFootprint: 1.7,
    energyFootprint: 1.75,
    consumptionFootprint: 1.0,
    carKmPerWeek: 150,
    carType: 'PETROL',
    transitHoursPerWeek: 3,
    flightsPerYear: 2,
    dietType: 'MEAT_LIGHT',
    householdSize: 2,
    homeEnergySource: 'GRID',
    heatingType: 'GAS',
    shoppingHabits: 'AVERAGE'
  });
}
if (!localStorage.getItem('ecotrace_challenges')) {
  saveLocalData('ecotrace_challenges', fallbackChallenges);
}
if (!localStorage.getItem('ecotrace_logs')) {
  saveLocalData('ecotrace_logs', [
    { id: 101, actionName: 'Cycled to Work', carbonSaving: 2.5, category: 'TRANSPORTATION', dateLogged: new Date().toISOString().split('T')[0] },
    { id: 102, actionName: 'Ate Plant-Based Lunch', carbonSaving: 1.1, category: 'DIET', dateLogged: new Date().toISOString().split('T')[0] }
  ]);
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const api = {
  getProfile: async () => {
    try {
      const res = await fetch(`${API_BASE}/calculator/profile`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend profile api failed, returning local storage baseline:', err.message);
      return getLocalData('ecotrace_profile');
    }
  },

  calculateFootprint: async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/calculator/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await handleResponse(res);
      saveLocalData('ecotrace_profile', data);
      return data;
    } catch (err) {
      console.warn('Backend calculate api failed, performing calculations locally:', err.message);
      // Fallback calculation logic mirroring backend
      const { carKmPerWeek, carType, transitHoursPerWeek, flightsPerYear, dietType, householdSize, homeEnergySource, heatingType, shoppingHabits } = formData;
      
      const carFactor = carType === 'PETROL' ? 0.18 : carType === 'DIESEL' ? 0.17 : carType === 'HYBRID' ? 0.10 : carType === 'ELECTRIC' ? 0.05 : 0;
      const tFootprint = ((carKmPerWeek * 52 * carFactor) + (transitHoursPerWeek * 52 * 1.5)) / 1000.0 + (flightsPerYear * 0.5);
      
      const dFootprint = dietType === 'VEGAN' ? 0.9 : dietType === 'VEGETARIAN' ? 1.2 : dietType === 'PESCATARIAN' ? 1.4 : dietType === 'MEAT_LIGHT' ? 1.7 : 2.5;
      
      const eSource = homeEnergySource === 'RENEWABLE' ? 0.2 : 2.0;
      const hType = heatingType === 'GAS' ? 1.5 : heatingType === 'OIL' ? 2.2 : 1.0;
      const eFootprint = (eSource + hType) / Math.max(1, householdSize);
      
      const cFootprint = shoppingHabits === 'MINIMAL' ? 0.4 : shoppingHabits === 'AVERAGE' ? 1.0 : 2.0;
      
      const total = tFootprint + dFootprint + eFootprint + cFootprint;
      
      const newProfile = {
        ...formData,
        id: 1,
        totalFootprint: Math.round(total * 100) / 100,
        transportFootprint: Math.round(tFootprint * 100) / 100,
        dietFootprint: Math.round(dFootprint * 100) / 100,
        energyFootprint: Math.round(eFootprint * 100) / 100,
        consumptionFootprint: Math.round(cFootprint * 100) / 100
      };
      saveLocalData('ecotrace_profile', newProfile);
      return newProfile;
    }
  },

  getDashboard: async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend dashboard api failed, synthesizing dashboard stats locally:', err.message);
      const profile = getLocalData('ecotrace_profile');
      const logs = getLocalData('ecotrace_logs');
      
      const totalSavingsKg = logs.reduce((sum, l) => sum + l.carbonSaving, 0);
      
      const savingsByCategory = {};
      logs.forEach(l => {
        savingsByCategory[l.category] = (savingsByCategory[l.category] || 0) + l.carbonSaving;
      });

      return {
        profile,
        totalSavingsKg: Math.round(totalSavingsKg * 100) / 100,
        savingsByCategory,
        recentLogsCount: logs.length,
        equivalentTreesPlanted: Math.round((totalSavingsKg / 22.0) * 10) / 10,
        equivalentSmartphonesCharged: Math.round(totalSavingsKg * 120),
        equivalentGasSavedLiters: Math.round((totalSavingsKg / 2.3) * 10) / 10
      };
    }
  },

  logAction: async (actionData) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend logging failed, updating local logs:', err.message);
      const logs = getLocalData('ecotrace_logs');
      const newLog = {
        id: Date.now(),
        actionName: actionData.actionName,
        carbonSaving: actionData.carbonSaving,
        category: actionData.category.toUpperCase(),
        dateLogged: new Date().toISOString().split('T')[0]
      };
      logs.unshift(newLog);
      saveLocalData('ecotrace_logs', logs);
      return newLog;
    }
  },

  getHistory: async (page = 0, size = 10) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/history?page=${page}&size=${size}`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend history fetching failed, returning local logs paginated:', err.message);
      const logs = getLocalData('ecotrace_logs');
      const start = page * size;
      const paginatedLogs = logs.slice(start, start + size);
      return {
        content: paginatedLogs,
        totalPages: Math.ceil(logs.length / size),
        totalElements: logs.length,
        size,
        number: page
      };
    }
  },

  getChallenges: async () => {
    try {
      const res = await fetch(`${API_BASE}/challenges`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend challenges fetching failed, returning local storage challenges:', err.message);
      return getLocalData('ecotrace_challenges');
    }
  },

  acceptChallenge: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/challenges/${id}/accept`, { method: 'POST' });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend accept challenge failed, updating local storage:', err.message);
      const challenges = getLocalData('ecotrace_challenges');
      const challenge = challenges.find(c => c.id === id);
      if (challenge) {
        challenge.active = true;
        challenge.completed = false;
        challenge.daysProgress = 0;
      }
      saveLocalData('ecotrace_challenges', challenges);
      return challenge;
    }
  },

  completeChallenge: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/challenges/${id}/complete`, { method: 'POST' });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend complete challenge failed, updating local storage:', err.message);
      const challenges = getLocalData('ecotrace_challenges');
      const challenge = challenges.find(c => c.id === id);
      if (challenge) {
        challenge.active = false;
        challenge.completed = true;
        challenge.daysProgress = challenge.daysDuration;
        
        // Log equivalent action
        const logs = getLocalData('ecotrace_logs');
        logs.unshift({
          id: Date.now(),
          actionName: `Completed Challenge: ${challenge.title}`,
          carbonSaving: challenge.carbonSaving,
          category: challenge.category,
          dateLogged: new Date().toISOString().split('T')[0]
        });
        saveLocalData('ecotrace_logs', logs);
      }
      saveLocalData('ecotrace_challenges', challenges);
      return challenge;
    }
  }
};
