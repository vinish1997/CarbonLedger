import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { api } from './utils/api';

// Mock the API client
vi.mock('./utils/api', () => ({
  api: {
    getDashboard: vi.fn(),
    getProfile: vi.fn(),
    getChallenges: vi.fn(),
    getHistory: vi.fn(),
    calculateFootprint: vi.fn(),
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock resolved values
    api.getDashboard.mockResolvedValue({
      profile: { totalFootprint: 7.35 },
      totalSavingsKg: 25.4,
      equivalentTreesPlanted: 1.2,
      equivalentSmartphonesCharged: 3048,
      equivalentGasSavedLiters: 11.0,
      savingsByCategory: {}
    });
    api.getProfile.mockResolvedValue({
      carKmPerWeek: 150,
      carType: 'PETROL'
    });
    api.getChallenges.mockResolvedValue([]);
    api.getHistory.mockResolvedValue({ content: [], totalPages: 0 });
  });

  it('renders and allows tab switching', async () => {
    render(<App />);
    
    // Verify default view is Dashboard
    await waitFor(() => {
      expect(screen.getByText('7.35')).toBeInTheDocument();
    });
    
    // Switch to Calculator tab
    const calcTab = screen.getByRole('tab', { name: /calculator/i });
    fireEvent.click(calcTab);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/weekly commute/i)).toBeInTheDocument();
    });

    // Switch to Challenges tab
    const challengesTab = screen.getByRole('tab', { name: /challenges/i });
    fireEvent.click(challengesTab);
    
    await waitFor(() => {
      expect(screen.getByText(/pick one from the list below to get started/i)).toBeInTheDocument();
    });

    // Switch to History tab
    const historyTab = screen.getByRole('tab', { name: /history/i });
    fireEvent.click(historyTab);
    
    await waitFor(() => {
      expect(screen.getByText(/no actions logged yet/i)).toBeInTheDocument();
    });
  });

  it('redirects to Dashboard after successful calculation', async () => {
    api.calculateFootprint.mockResolvedValue({ totalFootprint: 4.8 });

    render(<App />);

    // Go to Calculator
    fireEvent.click(screen.getByRole('tab', { name: /calculator/i }));

    // Step 1 -> 2
    await waitFor(() => {
      expect(screen.getByLabelText(/weekly commute/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 2 -> 3
    await waitFor(() => {
      expect(screen.getByLabelText(/which best describes your diet/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 3 -> 4
    await waitFor(() => {
      expect(screen.getByLabelText(/household size/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Submit form
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit calculator/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /submit calculator/i }));

    await waitFor(() => {
      expect(screen.getByText('Calculation Complete!')).toBeInTheDocument();
    });

    await waitFor(() => {
      // Check that we are back to Dashboard
      expect(screen.getByText('Climate Impact Dashboard')).toBeInTheDocument();
    }, { timeout: 2500 });
  });
});
