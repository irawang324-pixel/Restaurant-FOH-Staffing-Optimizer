
import { SalesRecord } from './types';

// Updated historical data: Lunch walk-ins moved to single digits to match typical operational reality
export const INITIAL_DATA: SalesRecord[] = [
  // Friday
  { id: 'w1a', date: '2025-01-24', shift: 'Lunch', sales: 280, fohStaff: 1, covers: 12, reservations: 6, walkins: 6 },
  { id: 'w1b', date: '2025-01-24', shift: 'Dinner', sales: 2090, fohStaff: 3, covers: 95, reservations: 70, walkins: 25 },
  // Saturday
  { id: 'w2a', date: '2025-01-25', shift: 'Lunch', sales: 350, fohStaff: 1, covers: 18, reservations: 10, walkins: 8 },
  { id: 'w2b', date: '2025-01-25', shift: 'Dinner', sales: 2420, fohStaff: 3, covers: 110, reservations: 85, walkins: 25 },
  // Monday
  { id: 'w3a', date: '2025-01-27', shift: 'Lunch', sales: 180, fohStaff: 1, covers: 8, reservations: 4, walkins: 4 },
  { id: 'w3b', date: '2025-01-27', shift: 'Dinner', sales: 1320, fohStaff: 2, covers: 60, reservations: 40, walkins: 20 },
  // Sunday
  { id: 'w4a', date: '2025-02-02', shift: 'Lunch', sales: 520, fohStaff: 2, covers: 28, reservations: 18, walkins: 10 },
  { id: 'w4b', date: '2025-02-02', shift: 'Dinner', sales: 1210, fohStaff: 2, covers: 55, reservations: 35, walkins: 20 },
  // Previous Friday
  { id: 'w5a', date: '2025-01-31', shift: 'Lunch', sales: 260, fohStaff: 1, covers: 11, reservations: 5, walkins: 6 },
  { id: 'w5b', date: '2025-01-31', shift: 'Dinner', sales: 2150, fohStaff: 3, covers: 98, reservations: 72, walkins: 26 },
];

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  accent: '#8b5cf6',
};
