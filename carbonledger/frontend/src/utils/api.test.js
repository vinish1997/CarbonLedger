import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api';

describe('API Client Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // Re-seed localStorage defaults since module-level init ran once
    localStorage.setItem('carbonledger_profile', JSON.stringify({ id: 1, totalFootprint: 7.35 }));
    localStorage.setItem('carbonledger_challenges', JSON.stringify([]));
    localStorage.setItem('carbonledger_logs', JSON.stringify([]));
  });

  describe('getProfile', () => {
    it('should return profile from backend on success', async () => {
      const mockProfile = { id: 1, totalFootprint: 5.5 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      });

      const profile = await api.getProfile();
      expect(profile).toEqual(mockProfile);
    });

    it('should fallback to localStorage on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      const fallbackProfile = { id: 1, totalFootprint: 7.35 };
      localStorage.setItem('carbonledger_profile', JSON.stringify(fallbackProfile));

      const profile = await api.getProfile();
      expect(profile).toEqual(fallbackProfile);
    });
  });

  describe('calculateFootprint', () => {
    it('should submit formula data to backend on success', async () => {
      const mockProfile = { id: 1, totalFootprint: 8.8 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      });

      const profile = await api.calculateFootprint({ carKmPerWeek: 100 });
      expect(profile).toEqual(mockProfile);
    });

    it('should calculate footprint locally on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      const formData = {
        carKmPerWeek: 200,
        carType: 'PETROL',
        transitHoursPerWeek: 5,
        flightsPerYear: 2,
        dietType: 'VEGAN',
        householdSize: 2,
        homeEnergySource: 'GRID',
        heatingType: 'GAS',
        shoppingHabits: 'MINIMAL',
      };

      const result = await api.calculateFootprint(formData);
      expect(result.id).toBe(1);
      expect(result.dietFootprint).toBe(0.9);
      expect(result.consumptionFootprint).toBe(0.4);
      expect(result.totalFootprint).toBeGreaterThan(0);
    });

    it('should cover all local calculator branch variations', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      
      // Setup combination A
      const combA = await api.calculateFootprint({
        carKmPerWeek: 100,
        carType: 'DIESEL',
        transitHoursPerWeek: 2,
        flightsPerYear: 1,
        dietType: 'VEGETARIAN',
        householdSize: 0, // Math.max(1, householdSize) fallback
        homeEnergySource: 'RENEWABLE',
        heatingType: 'OIL',
        shoppingHabits: 'AVERAGE'
      });
      expect(combA.totalFootprint).toBeGreaterThan(0);

      // Setup combination B
      const combB = await api.calculateFootprint({
        carKmPerWeek: 100,
        carType: 'HYBRID',
        transitHoursPerWeek: 2,
        flightsPerYear: 1,
        dietType: 'PESCATARIAN',
        householdSize: 1,
        homeEnergySource: 'GRID',
        heatingType: 'ELECTRIC',
        shoppingHabits: 'LUXURY'
      });
      expect(combB.totalFootprint).toBeGreaterThan(0);

      // Setup combination C
      const combC = await api.calculateFootprint({
        carKmPerWeek: 100,
        carType: 'ELECTRIC',
        transitHoursPerWeek: 2,
        flightsPerYear: 1,
        dietType: 'MEAT_LIGHT',
        householdSize: 1,
        homeEnergySource: 'GRID',
        heatingType: 'OTHER',
        shoppingHabits: 'OTHER'
      });
      expect(combC.totalFootprint).toBeGreaterThan(0);

      // Setup combination D (defaults/unknown values)
      const combD = await api.calculateFootprint({
        carKmPerWeek: 100,
        carType: 'UNKNOWN',
        transitHoursPerWeek: 2,
        flightsPerYear: 1,
        dietType: 'UNKNOWN',
        householdSize: 1,
        homeEnergySource: 'GRID',
        heatingType: 'OTHER',
        shoppingHabits: 'OTHER'
      });
      expect(combD.totalFootprint).toBeGreaterThan(0);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard metadata on success', async () => {
      const mockData = { totalSavingsKg: 50.0 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const data = await api.getDashboard();
      expect(data).toEqual(mockData);
    });

    it('should synthesize stats locally on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_logs', JSON.stringify([
        { id: 1, carbonSaving: 10.0, category: 'DIET' },
        { id: 2, carbonSaving: 15.0, category: 'TRANSPORTATION' },
      ]));

      const data = await api.getDashboard();
      expect(data.totalSavingsKg).toBe(25.0);
      expect(data.savingsByCategory.DIET).toBe(10.0);
      expect(data.savingsByCategory.TRANSPORTATION).toBe(15.0);
      expect(data.equivalentTreesPlanted).toBe(1.1);
      expect(data.equivalentSmartphonesCharged).toBe(3000);
      expect(data.equivalentGasSavedLiters).toBe(10.9);
    });
  });

  describe('logAction', () => {
    it('should post action log successfully', async () => {
      const newLog = { id: 1, actionName: 'Recycled' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => newLog,
      });

      const log = await api.logAction({ actionName: 'Recycled', carbonSaving: 2.0, category: 'DIET' });
      expect(log).toEqual(newLog);
    });

    it('should save log to localStorage on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      const newLogData = { actionName: 'Recycled', carbonSaving: 2.5, category: 'consumption' };

      const log = await api.logAction(newLogData);
      expect(log.actionName).toBe('Recycled');
      expect(log.carbonSaving).toBe(2.5);
      expect(log.category).toBe('CONSUMPTION');
      
      const savedLogs = JSON.parse(localStorage.getItem('carbonledger_logs'));
      expect(savedLogs[0].actionName).toBe('Recycled');
    });
  });

  describe('getHistory', () => {
    it('should query history page successfully', async () => {
      const pageData = { content: [], totalPages: 1 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => pageData,
      });

      const data = await api.getHistory(0, 10);
      expect(data).toEqual(pageData);
    });

    it('should return paginated localStorage logs on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_logs', JSON.stringify([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
      ]));

      const data = await api.getHistory(0, 2);
      expect(data.content.length).toBe(2);
      expect(data.totalPages).toBe(2);
      expect(data.totalElements).toBe(4);
    });
  });

  describe('getChallenges', () => {
    it('should fetch all challenges', async () => {
      const challenges = [{ id: 1 }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => challenges,
      });

      const result = await api.getChallenges();
      expect(result).toEqual(challenges);
    });

    it('should fallback to localStorage on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_challenges', JSON.stringify([{ id: 9 }]));

      const result = await api.getChallenges();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(9);
    });
  });

  describe('acceptChallenge', () => {
    it('should post accept payload successfully', async () => {
      const updated = { id: 1, active: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => updated,
      });

      const result = await api.acceptChallenge(1);
      expect(result).toEqual(updated);
    });

    it('should update local challenges on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_challenges', JSON.stringify([{ id: 10, active: false }]));

      const result = await api.acceptChallenge(10);
      expect(result.active).toBe(true);
      expect(result.daysProgress).toBe(0);
    });

    it('should return undefined if challenge is not found locally', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_challenges', JSON.stringify([{ id: 10, active: false }]));

      const result = await api.acceptChallenge(999);
      expect(result).toBeUndefined();
    });
  });

  describe('completeChallenge', () => {
    it('should post complete payload successfully', async () => {
      const updated = { id: 1, completed: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => updated,
      });

      const result = await api.completeChallenge(1);
      expect(result).toEqual(updated);
    });

    it('should complete local challenge and save log on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_challenges', JSON.stringify([{ id: 10, active: true, title: 'Meatless Week', carbonSaving: 10, daysDuration: 7 }]));
      localStorage.setItem('carbonledger_logs', JSON.stringify([]));

      const result = await api.completeChallenge(10);
      expect(result.completed).toBe(true);
      expect(result.active).toBe(false);

      const logs = JSON.parse(localStorage.getItem('carbonledger_logs'));
      expect(logs.length).toBe(1);
      expect(logs[0].actionName).toBe('Completed Challenge: Meatless Week');
    });

    it('should return undefined if challenge to complete is not found locally', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_challenges', JSON.stringify([{ id: 10, active: true }]));

      const result = await api.completeChallenge(999);
      expect(result).toBeUndefined();
    });
  });

  describe('rotateChallenges', () => {
    it('should post rotate payload successfully', async () => {
      const list = [{ id: 1 }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => list,
      });

      const result = await api.rotateChallenges();
      expect(result).toEqual(list);
    });

    it('should rotate challenges locally on backend failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('carbonledger_challenges', JSON.stringify([
        { id: 1, title: 'Meatless Week', active: true }
      ]));

      const result = await api.rotateChallenges();
      expect(result.length).toBe(4); // 1 active kept + 3 new added
      expect(result[0].title).toBe('Meatless Week');
    });

    it('should rotate locally correctly when challenge saturation is high', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      // Mark all challenges as completed so eligible challenges are < 3
      const allActiveOrCompleted = [
        { id: 1, title: 'Meatless Week', active: true },
        { id: 2, title: 'Car-Free Commute', completed: true },
        { id: 3, title: 'Power Down', completed: true },
        { id: 4, title: 'Zero Single-Use Plastic', completed: true },
        { id: 5, title: 'Cycled trips (<5km)', completed: true },
        { id: 6, title: 'Cold Wash Only', completed: true },
        { id: 7, title: 'Line Dry Laundry', completed: true },
        { id: 8, title: 'Plant-Based Weekdays', completed: true },
        { id: 9, title: 'Zero Food Waste', completed: true },
        { id: 10, title: 'Digital Declutter', completed: true },
        { id: 11, title: 'Buy Nothing Week', completed: true },
        { id: 12, title: 'Public Transit Only', completed: true },
        { id: 13, title: 'Lower Thermostat by 2C', completed: true },
        { id: 14, title: 'Local Produce Only', completed: true },
        { id: 15, title: 'BYO Container', completed: true },
        { id: 16, title: 'Carpool Commute', completed: true }
      ];
      localStorage.setItem('carbonledger_challenges', JSON.stringify(allActiveOrCompleted));

      const result = await api.rotateChallenges();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should fallback to defaultVal parameter in rotateChallenges when storage is empty', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      localStorage.removeItem('carbonledger_challenges');

      const result = await api.rotateChallenges();
      expect(result.length).toBe(3); // default fallbackChallenges.slice(0, 3)
    });
  });

  describe('handleResponse errors', () => {
    it('should parse JSON error messages from non-ok responses', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Custom API error message' }),
      });

      await api.getProfile();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Backend profile api failed, returning local storage baseline:',
        'Custom API error message'
      );
      consoleWarnSpy.mockRestore();
    });

    it('should fallback to status code error message when JSON parsing fails', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => { throw new Error('parse error'); },
      });

      await api.getProfile();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Backend profile api failed, returning local storage baseline:',
        'API error: 500'
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('module initialization and environment config', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });

    it('should initialize local storage when empty', async () => {
      localStorage.clear();
      
      await import(`./api.js?nocache=1`);
      
      expect(localStorage.getItem('carbonledger_profile')).not.toBeNull();
      expect(localStorage.getItem('carbonledger_challenges')).not.toBeNull();
      expect(localStorage.getItem('carbonledger_logs')).not.toBeNull();
    });

    it('should configure VITE_API_BASE on localhost', async () => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'localhost',
          port: '5173',
          href: 'http://localhost:5173/',
        },
      });

      const { api: freshApi } = await import(`./api.js?nocache=2`);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await freshApi.getProfile();
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/calculator/profile');
    });

    it('should configure VITE_API_BASE on non-localhost production host', async () => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'carbonledger.org',
          port: '',
          href: 'https://carbonledger.org/',
        },
      });

      const { api: freshApi } = await import(`./api.js?nocache=3`);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await freshApi.getProfile();
      expect(global.fetch).toHaveBeenCalledWith('/api/calculator/profile');
    });
  });
});
