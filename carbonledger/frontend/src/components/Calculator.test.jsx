import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Calculator from './Calculator';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({
  api: {
    calculateFootprint: vi.fn()
  }
}));

describe('Calculator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Step 1 by default and allows navigation to Step 4', async () => {
    render(<Calculator onCalculationSuccess={() => {}} />);
    
    // Step 1: Transport
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText(/primary car fuel type/i)).toBeInTheDocument();
    
    // Go to Step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText(/which best describes your diet/i)).toBeInTheDocument();
    
    // Go to Step 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText(/household size/i)).toBeInTheDocument();
    
    // Go to Step 4
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText(/clothing, gadgets, and homewares/i)).toBeInTheDocument();

    // Go back to Step 3
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
  });

  it('validates negative/invalid inputs', () => {
    render(<Calculator onCalculationSuccess={() => {}} />);
    
    const kmInput = screen.getByLabelText(/weekly commute/i);
    fireEvent.change(kmInput, { target: { value: '-50' } });
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Validation warning should show
    expect(screen.getByText(/commute distance cannot be negative/i)).toBeInTheDocument();
  });

  it('submits form successfully and calls callback', async () => {
    const handleSuccess = vi.fn();
    const mockResult = { totalFootprint: 4.8 };
    api.calculateFootprint.mockResolvedValue(mockResult);

    render(<Calculator onCalculationSuccess={handleSuccess} />);
    
    // Step 1 -> 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 2 -> 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 3 -> 4
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit calculator/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.calculateFootprint).toHaveBeenCalled();
    });

    expect(handleSuccess).toHaveBeenCalledWith(mockResult);
    expect(screen.getByText('Calculation Complete!')).toBeInTheDocument();

    // Test recalculate button resets to Step 1
    const recalcBtn = screen.getByRole('button', { name: /recalculate/i });
    fireEvent.click(recalcBtn);
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  it('displays global error on API failure', async () => {
    api.calculateFootprint.mockRejectedValue(new Error('Network error'));

    render(<Calculator onCalculationSuccess={() => {}} />);
    
    // Step 1 -> 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 2 -> 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 3 -> 4
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit calculator/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to calculate. Please check inputs.')).toBeInTheDocument();
    });
  });
});
