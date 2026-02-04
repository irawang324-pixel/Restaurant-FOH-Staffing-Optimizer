
export interface SalesRecord {
  id: string;
  date: string;
  sales: number;
  fohStaff: number;
  covers: number;
  reservations: number;
  walkins: number;
  shift: 'Lunch' | 'Dinner';
}

export interface ShiftPrediction {
  predictedSales: number;
  predictedCovers: number;
  predictedWalkins: number;
  suggestedStaff: number;
  status: 'Understaffed' | 'Optimal' | 'Surplus';
  peakTime: string;
}

export interface DailyPrediction {
  lunch: ShiftPrediction;
  dinner: ShiftPrediction;
  totalCovers: number;
  totalSales: number;
}

export interface AIRecommendation {
  rawResponse: string;
  sources: { title: string; uri: string }[];
  footfallIndex: number;
}
