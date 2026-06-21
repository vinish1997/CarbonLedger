import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import History from './History';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({
  api: {
    getHistory: vi.fn()
  }
}));

describe('History Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading first and then log records in the table', async () => {
    api.getHistory.mockResolvedValue({
      content: [
        { id: 1, actionName: 'Cycled to Work', carbonSaving: 2.5, category: 'TRANSPORTATION', dateLogged: '2026-06-21' }
      ],
      totalPages: 1,
      totalElements: 1
    });

    render(<History triggerRefresh={0} />);

    expect(screen.getByText('Retrieving details...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Cycled to Work')).toBeInTheDocument();
    });

    expect(screen.getByText(/-2.5 kg CO2e/i)).toBeInTheDocument();
    expect(screen.getByText('TRANSPORTATION')).toBeInTheDocument();
  });

  it('handles page navigation correctly', async () => {
    api.getHistory.mockResolvedValue({
      content: [
        { id: 1, actionName: 'Cycled to Work', carbonSaving: 2.5, category: 'TRANSPORTATION', dateLogged: '2026-06-21' }
      ],
      totalPages: 3,
      totalElements: 3
    });

    render(<History triggerRefresh={0} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith(1, 8);
    });

    // Now that page is 1, the Prev button should be enabled. Let's click it.
    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).not.toBeDisabled();

    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenLastCalledWith(0, 8);
    });
  });

  it('renders empty history state message', async () => {
    api.getHistory.mockResolvedValue({});

    render(<History triggerRefresh={0} />);

    await waitFor(() => {
      expect(screen.getByText(/no actions logged yet/i)).toBeInTheDocument();
    });
  });

  it('handles history fetch error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.getHistory.mockRejectedValue(new Error('Fetch failed'));

    render(<History triggerRefresh={0} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('renders logs with varied categories', async () => {
    api.getHistory.mockResolvedValue({
      content: [
        { id: 1, actionName: 'Act A', carbonSaving: 1.0, category: 'DIET', dateLogged: '2026-06-21' },
        { id: 2, actionName: 'Act B', carbonSaving: 2.0, category: 'ENERGY', dateLogged: '2026-06-21' },
        { id: 3, actionName: 'Act C', carbonSaving: 3.0, category: 'OTHER', dateLogged: '2026-06-21' }
      ],
      totalPages: 1,
      totalElements: 3
    });

    render(<History triggerRefresh={0} />);

    await waitFor(() => {
      expect(screen.getByText('Act A')).toBeInTheDocument();
      expect(screen.getByText('Act B')).toBeInTheDocument();
      expect(screen.getByText('Act C')).toBeInTheDocument();
    });
  });
});
