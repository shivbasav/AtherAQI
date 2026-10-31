export interface Coordinates {
  lat: number;
  lng: number;
}

export type AQICategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface AQILevelInfo {
  category: AQICategory;
  range: [number, number];
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  healthImplications: string;
  cautionaryStatement: string;
}

export interface PollutantValues {
  pm2_5: number; // µg/m³
  pm10: number; // µg/m³
  nitrogen_dioxide: number; // µg/m³
  ozone: number; // µg/m³
  sulphur_dioxide: number; // µg/m³
  carbon_monoxide: number; // µg/m³
  dust?: number;
  uv_index?: number;
}

export interface CurrentAQIData {
  us_aqi: number;
  european_aqi?: number;
  dominant_pollutant: string;
  timestamp: string;
  pollutants: PollutantValues;
  weather?: {
    temperature: number; // °C
    humidity: number; // %
    windSpeed: number; // km/h
    windDirection: number; // degrees
  };
}

export interface HistoricalDataPoint {
  timestamp: string;
  dateStr: string;
  timeStr: string;
  us_aqi: number;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  ozone: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
}

export interface LocationAQI {
  id: string;
  name: string;
  country: string;
  admin1?: string; // State or region
  coords: Coordinates;
  current: CurrentAQIData;
  history?: HistoricalDataPoint[];
  isUserLocation?: boolean;
}

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  coords: Coordinates;
  continent: 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania';
}

export interface StationItem {
  id: string;
  name: string;
  country: string;
  coords: Coordinates;
  aqi: number;
  dominantPollutant?: string;
  continent?: string;
  isUserLocation?: boolean;
}

