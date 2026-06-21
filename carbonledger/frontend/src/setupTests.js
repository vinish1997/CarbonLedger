import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
