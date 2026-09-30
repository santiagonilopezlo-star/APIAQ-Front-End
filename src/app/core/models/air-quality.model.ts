export type PollutantCode = 'PM2.5' | 'NO₂' | 'O₃';

export interface PollutantReading {
  code: PollutantCode;
  name: string;
  value: number;
  unit: string;
  change: string;
  note: string;
  tone: 'green' | 'amber' | 'blue';
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface AirQualitySnapshot {
  city: string;
  department: string;
  coordinates: string;
  updatedAt: string;
  stationCount: number;
  aqi: number;
  category: string;
  summary: string;
  pollutants: readonly PollutantReading[];
  hourlyTrend: readonly TrendPoint[];
}
