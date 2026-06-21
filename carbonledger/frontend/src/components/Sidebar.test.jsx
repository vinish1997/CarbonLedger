import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  it('renders correctly with heading and menu tabs', () => {
    render(<Sidebar activeTab="dashboard" setActiveTab={() => {}} />);
    
    // Check heading logo
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CarbonLedger');
    
    // Check tab list and elements
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
    expect(dashboardTab).toBeInTheDocument();
    expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
    expect(dashboardTab).toHaveAttribute('aria-controls', 'panel-dashboard');
  });

  it('triggers setActiveTab callback when a tab is clicked', () => {
    const handleSetActiveTab = vi.fn();
    render(<Sidebar activeTab="dashboard" setActiveTab={handleSetActiveTab} />);
    
    const calculatorTab = screen.getByRole('tab', { name: /calculator/i });
    fireEvent.click(calculatorTab);
    
    expect(handleSetActiveTab).toHaveBeenCalledWith('calculator');
  });
});
