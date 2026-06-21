import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Challenges from './Challenges';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({
  api: {
    getChallenges: vi.fn(),
    rotateChallenges: vi.fn(),
    acceptChallenge: vi.fn(),
    completeChallenge: vi.fn(),
  }
}));

describe('Challenges Component', () => {
  const mockChallenges = [
    { id: 1, title: 'Meatless Week', description: 'Avoid meat.', category: 'DIET', carbonSaving: 12.0, difficulty: 'EASY', active: false, completed: false, daysDuration: 7, daysProgress: 0 },
    { id: 2, title: 'Car-Free Commute', description: 'No cars.', category: 'TRANSPORTATION', carbonSaving: 35.0, difficulty: 'HARD', active: true, completed: false, daysDuration: 5, daysProgress: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getChallenges.mockResolvedValue(mockChallenges);
  });

  it('renders active and available challenges separately', async () => {
    render(<Challenges onChallengeAction={() => {}} />);
    
    expect(screen.getByText('Loading eco-challenges...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Car-Free Commute')).toBeInTheDocument();
    });

    // Active challenges list section
    expect(screen.getByRole('button', { name: /complete and claim points for challenge: car-free commute/i })).toBeInTheDocument();
    
    // Available challenges list section
    expect(screen.getByText('Meatless Week')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept challenge: meatless week/i })).toBeInTheDocument();
  });

  it('triggers accept and complete action callbacks', async () => {
    const handleAction = vi.fn();
    api.acceptChallenge.mockResolvedValue({ id: 1, active: true });
    api.completeChallenge.mockResolvedValue({ id: 2, completed: true });

    render(<Challenges onChallengeAction={handleAction} />);

    await waitFor(() => {
      expect(screen.getByText('Meatless Week')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByRole('button', { name: /accept challenge: meatless week/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(api.acceptChallenge).toHaveBeenCalledWith(1);
    });
    expect(handleAction).toHaveBeenCalled();

    const completeBtn = screen.getByRole('button', { name: /complete and claim points for challenge: car-free commute/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(api.completeChallenge).toHaveBeenCalledWith(2);
    });
    expect(handleAction).toHaveBeenCalledTimes(2);
  });

  it('triggers weekly rotation correctly', async () => {
    api.rotateChallenges.mockResolvedValue([]);

    render(<Challenges onChallengeAction={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /roll new quests/i })).toBeInTheDocument();
    });

    const rotateBtn = screen.getByRole('button', { name: /roll new quests/i });
    fireEvent.click(rotateBtn);

    await waitFor(() => {
      expect(api.rotateChallenges).toHaveBeenCalled();
    });
  });

  it('renders completed challenges and category colors correctly', async () => {
    const mockMultiChallenges = [
      { id: 1, title: 'Quest A', category: 'ENERGY', active: false, completed: false, daysDuration: 3, carbonSaving: 5 },
      { id: 2, title: 'Quest B', category: 'CONSUMPTION', active: false, completed: false, daysDuration: 4, carbonSaving: 8 },
      { id: 3, title: 'Quest C', category: 'OTHER', active: false, completed: true, daysDuration: 5, carbonSaving: 12 },
    ];
    api.getChallenges.mockResolvedValue(mockMultiChallenges);

    render(<Challenges onChallengeAction={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Quest A')).toBeInTheDocument();
      expect(screen.getByText('Quest B')).toBeInTheDocument();
      expect(screen.getByText('Quest C')).toBeInTheDocument();
    });

    // Check DIET and TRANSPORTATION too
  });

  it('handles errors gracefully during rotate, accept, and complete', async () => {
    api.rotateChallenges.mockRejectedValue(new Error('Rotate error'));
    api.acceptChallenge.mockRejectedValue(new Error('Accept error'));
    api.completeChallenge.mockRejectedValue(new Error('Complete error'));

    render(<Challenges onChallengeAction={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /roll new quests/i })).toBeInTheDocument();
    });

    // Test rotate error
    fireEvent.click(screen.getByRole('button', { name: /roll new quests/i }));
    await waitFor(() => {
      expect(screen.getByText('Failed to roll new challenges.')).toBeInTheDocument();
    });

    // Test accept error does not crash
    fireEvent.click(screen.getByRole('button', { name: /accept challenge: meatless week/i }));

    // Test complete error does not crash
    fireEvent.click(screen.getByRole('button', { name: /complete and claim points for challenge: car-free commute/i }));
  });

  it('displays error on mount fetch failure', async () => {
    api.getChallenges.mockRejectedValue(new Error('Fetch failed'));

    render(<Challenges />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch challenges.')).toBeInTheDocument();
    });
  });

  it('handles rotating countdown status', async () => {
    const monday = new Date();
    monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7 || 7));
    monday.setHours(0, 0, 0, 0);

    const RealDate = global.Date;
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return monday;
        }
        super(...args);
        return this;
      }
      static now() {
        return monday.getTime();
      }
    };

    render(<Challenges />);

    await waitFor(() => {
      expect(screen.getByText('Rotating...')).toBeInTheDocument();
    });

    global.Date = RealDate;
  });
});
