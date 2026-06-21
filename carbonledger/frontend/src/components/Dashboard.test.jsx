import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({
  api: {
    getDashboard: vi.fn(),
    getHistory: vi.fn(),
    logAction: vi.fn()
  }
}));

vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    Tooltip: (props) => {
      if (props.formatter) {
        props.formatter(10);
      }
      return <div data-testid="mock-tooltip" />;
    }
  };
});

describe('Dashboard Component', () => {
  const mockDashboardData = {
    profile: {
      totalFootprint: 7.35,
      transportFootprint: 2.90,
      dietFootprint: 1.70,
      energyFootprint: 1.75,
      consumptionFootprint: 1.00
    },
    totalSavingsKg: 25.4,
    equivalentTreesPlanted: 1.2,
    equivalentSmartphonesCharged: 3048,
    equivalentGasSavedLiters: 11.0,
    savingsByCategory: {
      TRANSPORTATION: 15.0,
      DIET: 10.4
    }
  };

  const mockHistoryData = {
    content: [
      { id: 1, actionName: 'Cycle instead of car', carbonSaving: 2.5, category: 'TRANSPORTATION', dateLogged: '2026-06-21' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getDashboard.mockResolvedValue(mockDashboardData);
    api.getHistory.mockResolvedValue(mockHistoryData);
  });

  it('renders overall carbon status and stats', async () => {
    render(<Dashboard triggerRefresh={0} />);

    expect(screen.getByText('Loading Carbon Metrics...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('7.35')).toBeInTheDocument();
    });
    
    // Check equivalents
    expect(screen.getByText('1.2')).toBeInTheDocument(); // trees
    expect(screen.getByText('3048')).toBeInTheDocument(); // phones
    expect(screen.getByText('11')).toBeInTheDocument(); // gas
  });

  it('triggers quick log actions on template clicks', async () => {
    api.logAction.mockResolvedValue({ id: 10 });

    render(<Dashboard triggerRefresh={0} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log action: cycle instead of car/i })).toBeInTheDocument();
    });
    
    const cycleBtn = screen.getByRole('button', { name: /log action: cycle instead of car/i });
    fireEvent.click(cycleBtn);
    
    expect(api.logAction).toHaveBeenCalledWith({
      actionName: 'Cycle instead of car',
      carbonSaving: 2.5,
      category: 'TRANSPORTATION'
     });

    // Wait for state updates to settle
    await waitFor(() => {
      expect(cycleBtn).not.toBeDisabled();
    });
  });

  it('displays personalized insights based on carbon footprint profile', async () => {
    // 1. High footprint profile (Default Mock)
    const { rerender } = render(<Dashboard triggerRefresh={0} />);
    await waitFor(() => {
      expect(screen.getByText('Baseline Above Safe Climate Limit')).toBeInTheDocument();
      expect(screen.getByText('Primary Impact Area: Transportation')).toBeInTheDocument();
      expect(screen.getByText('Secondary Impact Area: Home Energy')).toBeInTheDocument();
    });

    // 2. Low footprint profile (Eco Leader)
    const lowFootprintData = {
      profile: {
        totalFootprint: 3.2,
        transportFootprint: 0.5,
        dietFootprint: 0.5,
        energyFootprint: 1.2,
        consumptionFootprint: 1.0
      },
      totalSavingsKg: 10.0,
      equivalentTreesPlanted: 0.5,
      equivalentSmartphonesCharged: 1200,
      equivalentGasSavedLiters: 4.0,
      savingsByCategory: {}
    };
    api.getDashboard.mockResolvedValue(lowFootprintData);
    rerender(<Dashboard triggerRefresh={1} />);
    await waitFor(() => {
      expect(screen.getByText('Eco Leader Status!')).toBeInTheDocument();
      expect(screen.getByText('Primary Impact Area: Home Energy')).toBeInTheDocument();
    });

    // 3. No profile data
    const emptyDashboardData = {
      profile: null,
      totalSavingsKg: 0,
      equivalentTreesPlanted: 0,
      equivalentSmartphonesCharged: 0,
      equivalentGasSavedLiters: 0,
      savingsByCategory: {}
    };
    api.getDashboard.mockResolvedValue(emptyDashboardData);
    rerender(<Dashboard triggerRefresh={2} />);
    await waitFor(() => {
      expect(screen.getByText('Complete the Calculator')).toBeInTheDocument();
    });
  });

  it('handles dashboard API fetch errors and quick log failures gracefully', async () => {
    // Check dashboard fetch failure
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.getDashboard.mockRejectedValue(new Error('Fetch failed'));
    
    render(<Dashboard triggerRefresh={0} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('handles quick log failure gracefully', async () => {
    api.logAction.mockRejectedValue(new Error('Log failed'));
    render(<Dashboard triggerRefresh={0} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log action: cycle instead of car/i })).toBeInTheDocument();
    });

    const cycleBtn = screen.getByRole('button', { name: /log action: cycle instead of car/i });
    fireEvent.click(cycleBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to log action.')).toBeInTheDocument();
      expect(cycleBtn).not.toBeDisabled();
    });
  });
});
