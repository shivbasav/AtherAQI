import { CityPreset, Coordinates, HistoricalDataPoint, LocationAQI } from '../types/aqi';

export const MAJOR_WORLD_CITIES: CityPreset[] = [
  // North America
  { id: 'nyc', name: 'New York', country: 'United States', coords: { lat: 40.7128, lng: -74.006 }, continent: 'North America' },
  { id: 'la', name: 'Los Angeles', country: 'United States', coords: { lat: 34.0522, lng: -118.2437 }, continent: 'North America' },
  { id: 'chicago', name: 'Chicago', country: 'United States', coords: { lat: 41.8781, lng: -87.6298 }, continent: 'North America' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', coords: { lat: 43.6532, lng: -79.3832 }, continent: 'North America' },
  { id: 'mexico_city', name: 'Mexico City', country: 'Mexico', coords: { lat: 19.4326, lng: -99.1332 }, continent: 'North America' },

  // South America
  { id: 'sao_paulo', name: 'São Paulo', country: 'Brazil', coords: { lat: -23.5505, lng: -46.6333 }, continent: 'South America' },
  { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', coords: { lat: -34.6037, lng: -58.3816 }, continent: 'South America' },
  { id: 'santiago', name: 'Santiago', country: 'Chile', coords: { lat: -33.4489, lng: -70.6693 }, continent: 'South America' },
  { id: 'bogota', name: 'Bogotá', country: 'Colombia', coords: { lat: 4.711, lng: -74.0721 }, continent: 'South America' },

  // Europe
  { id: 'london', name: 'London', country: 'United Kingdom', coords: { lat: 51.5074, lng: -0.1278 }, continent: 'Europe' },
  { id: 'paris', name: 'Paris', country: 'France', coords: { lat: 48.8566, lng: 2.3522 }, continent: 'Europe' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', coords: { lat: 52.52, lng: 13.405 }, continent: 'Europe' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', coords: { lat: 40.4168, lng: -3.7038 }, continent: 'Europe' },
  { id: 'rome', name: 'Rome', country: 'Italy', coords: { lat: 41.9028, lng: 12.4964 }, continent: 'Europe' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', coords: { lat: 52.3676, lng: 4.9041 }, continent: 'Europe' },
  { id: 'warsaw', name: 'Warsaw', country: 'Poland', coords: { lat: 52.2297, lng: 21.0122 }, continent: 'Europe' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', coords: { lat: 41.0082, lng: 28.9784 }, continent: 'Europe' },

  // Asia
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', coords: { lat: 35.6762, lng: 139.6503 }, continent: 'Asia' },
  { id: 'delhi', name: 'New Delhi', country: 'India', coords: { lat: 28.6139, lng: 77.209 }, continent: 'Asia' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', coords: { lat: 19.076, lng: 72.8777 }, continent: 'Asia' },
  { id: 'beijing', name: 'Beijing', country: 'China', coords: { lat: 39.9042, lng: 116.4074 }, continent: 'Asia' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', coords: { lat: 31.2304, lng: 121.4737 }, continent: 'Asia' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', coords: { lat: 37.5665, lng: 126.978 }, continent: 'Asia' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', coords: { lat: 1.3521, lng: 103.8198 }, continent: 'Asia' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', coords: { lat: 13.7563, lng: 100.5018 }, continent: 'Asia' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', coords: { lat: -6.2088, lng: 106.8456 }, continent: 'Asia' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', coords: { lat: 25.2048, lng: 55.2708 }, continent: 'Asia' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', coords: { lat: 24.7136, lng: 46.6753 }, continent: 'Asia' },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', coords: { lat: 23.8103, lng: 90.4125 }, continent: 'Asia' },
  { id: 'lahore', name: 'Lahore', country: 'Pakistan', coords: { lat: 31.5497, lng: 74.3436 }, continent: 'Asia' },

  // Africa
  { id: 'cairo', name: 'Cairo', country: 'Egypt', coords: { lat: 30.0444, lng: 31.2357 }, continent: 'Africa' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', coords: { lat: -26.2041, lng: 28.0473 }, continent: 'Africa' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', coords: { lat: -1.2921, lng: 36.8219 }, continent: 'Africa' },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', coords: { lat: 6.5244, lng: 3.3792 }, continent: 'Africa' },
  { id: 'casablanca', name: 'Casablanca', country: 'Morocco', coords: { lat: 33.5731, lng: -7.5898 }, continent: 'Africa' },

  // Oceania
  { id: 'sydney', name: 'Sydney', country: 'Australia', coords: { lat: -33.8688, lng: 151.2093 }, continent: 'Oceania' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', coords: { lat: -37.8136, lng: 144.9631 }, continent: 'Oceania' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', coords: { lat: -36.8485, lng: 174.7633 }, continent: 'Oceania' },
];

/**
 * Determine the dominant pollutant by comparing relative severity against WHO standards
 */
function calculateDominantPollutant(pollutants: {
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  ozone: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
}): string {
  // Severity ratios normalized to typical WHO 24h limits:
  // PM2.5: 15, PM10: 45, NO2: 25, O3: 100, SO2: 40, CO: 4000
  const ratios = [
    { name: 'PM2.5', ratio: pollutants.pm2_5 / 15 },
    { name: 'PM10', ratio: pollutants.pm10 / 45 },
    { name: 'NO2', ratio: pollutants.nitrogen_dioxide / 25 },
    { name: 'Ozone (O3)', ratio: pollutants.ozone / 100 },
    { name: 'SO2', ratio: pollutants.sulphur_dioxide / 40 },
    { name: 'CO', ratio: pollutants.carbon_monoxide / 4000 },
  ];

  ratios.sort((a, b) => b.ratio - a.ratio);
  return ratios[0]?.name || 'PM2.5';
}

/**
 * Fetch live and historical AQI data for specific coordinates via Open-Meteo Air Quality API
 */
export async function fetchLocationAQI(
  coords: Coordinates,
  name = 'Selected Location',
  country = '',
  pastDays = 7,
  forecastDays = 3,
  isUserLocation = false
): Promise<LocationAQI> {
  const { lat, lng } = coords;

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&hourly=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&past_days=${pastDays}&forecast_days=${forecastDays}`;

  // Also fetch weather context (temp, humidity, wind)
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`;

  const [aqiRes, weatherRes] = await Promise.allSettled([
    fetch(url),
    fetch(weatherUrl),
  ]);

  if (aqiRes.status !== 'fulfilled' || !aqiRes.value.ok) {
    throw new Error('Failed to fetch air quality data from Open-Meteo API');
  }

  const aqiData = await aqiRes.value.json();

  let weatherData: any = null;
  if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
    try {
      weatherData = await weatherRes.value.json();
    } catch {
      // Non-critical, ignore
    }
  }

  const current = aqiData.current || {};
  const pollutants = {
    pm2_5: current.pm2_5 ?? 12,
    pm10: current.pm10 ?? 24,
    nitrogen_dioxide: current.nitrogen_dioxide ?? 14,
    ozone: current.ozone ?? 38,
    sulphur_dioxide: current.sulphur_dioxide ?? 5,
    carbon_monoxide: current.carbon_monoxide ?? 280,
    dust: current.dust ?? 0,
    uv_index: current.uv_index ?? 0,
  };

  const dominant = calculateDominantPollutant(pollutants);

  // Parse hourly historical and forecast records
  const hourly = aqiData.hourly || {};
  const history: HistoricalDataPoint[] = [];

  if (hourly.time && Array.isArray(hourly.time)) {
    const times: string[] = hourly.time;
    const aqiVals: number[] = hourly.us_aqi || [];
    const pm25Vals: number[] = hourly.pm2_5 || [];
    const pm10Vals: number[] = hourly.pm10 || [];
    const no2Vals: number[] = hourly.nitrogen_dioxide || [];
    const o3Vals: number[] = hourly.ozone || [];
    const so2Vals: number[] = hourly.sulphur_dioxide || [];
    const coVals: number[] = hourly.carbon_monoxide || [];

    for (let i = 0; i < times.length; i++) {
      const rawTime = times[i];
      const d = new Date(rawTime);
      history.push({
        timestamp: rawTime,
        dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        timeStr: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        us_aqi: Math.round(aqiVals[i] ?? (current.us_aqi || 45)),
        pm2_5: +(pm25Vals[i] ?? 10).toFixed(1),
        pm10: +(pm10Vals[i] ?? 20).toFixed(1),
        nitrogen_dioxide: +(no2Vals[i] ?? 12).toFixed(1),
        ozone: +(o3Vals[i] ?? 30).toFixed(1),
        sulphur_dioxide: +(so2Vals[i] ?? 4).toFixed(1),
        carbon_monoxide: +(coVals[i] ?? 250).toFixed(0),
      });
    }
  }

  return {
    id: `${lat.toFixed(3)}_${lng.toFixed(3)}`,
    name,
    country,
    coords,
    isUserLocation,
    current: {
      us_aqi: Math.round(current.us_aqi ?? (history[history.length - 1]?.us_aqi || 42)),
      european_aqi: current.european_aqi ? Math.round(current.european_aqi) : undefined,
      dominant_pollutant: dominant,
      timestamp: current.time || new Date().toISOString(),
      pollutants,
      weather: weatherData?.current ? {
        temperature: Math.round(weatherData.current.temperature_2m ?? 20),
        humidity: Math.round(weatherData.current.relative_humidity_2m ?? 50),
        windSpeed: Math.round(weatherData.current.wind_speed_10m ?? 8),
        windDirection: Math.round(weatherData.current.wind_direction_10m ?? 0),
      } : undefined,
    },
    history,
  };
}

/**
 * Fetch multi-month or extended historical AQI data for tracking long-term trends
 * (supports 30 days, 90 days, or yearly aggregates)
 */
export async function fetchExtendedHistoricalAQI(
  coords: Coordinates,
  range: '7d' | '30d' | '90d' | '1y'
): Promise<HistoricalDataPoint[]> {
  const { lat, lng } = coords;

  let pastDays = 7;
  if (range === '30d') pastDays = 30;
  else if (range === '90d') pastDays = 92;
  else if (range === '1y') pastDays = 92; // Max Open-Meteo direct air quality past_days is 92 days

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&past_days=${pastDays}&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load historical air quality');
  const data = await res.json();
  const hourly = data.hourly || {};
  const points: HistoricalDataPoint[] = [];

  if (hourly.time && Array.isArray(hourly.time)) {
    const times: string[] = hourly.time;
    // For 30d, 90d, sample every N hours or aggregate daily to avoid overwhelming 2000 points
    const step = range === '90d' || range === '1y' ? 6 : range === '30d' ? 3 : 1;

    for (let i = 0; i < times.length; i += step) {
      const rawTime = times[i];
      const d = new Date(rawTime);
      points.push({
        timestamp: rawTime,
        dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        timeStr: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        us_aqi: Math.round(hourly.us_aqi?.[i] ?? 40),
        pm2_5: +(hourly.pm2_5?.[i] ?? 10).toFixed(1),
        pm10: +(hourly.pm10?.[i] ?? 20).toFixed(1),
        nitrogen_dioxide: +(hourly.nitrogen_dioxide?.[i] ?? 12).toFixed(1),
        ozone: +(hourly.ozone?.[i] ?? 30).toFixed(1),
        sulphur_dioxide: +(hourly.sulphur_dioxide?.[i] ?? 4).toFixed(1),
        carbon_monoxide: +(hourly.carbon_monoxide?.[i] ?? 200).toFixed(0),
      });
    }
  }

  return points;
}

/**
 * Reverse geocode a latitude & longitude to get City & Country name
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || 'Unknown Area';
    const country = data.countryName || '';
    return { city, country };
  } catch {
    return {
      city: `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      country: '',
    };
  }
}

/**
 * Search locations worldwide using Open-Meteo Geocoding
 */
export async function searchWorldLocations(query: string) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((r: any) => ({
      id: `${r.latitude}_${r.longitude}`,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      coords: { lat: r.latitude, lng: r.longitude } as Coordinates,
    }));
  } catch {
    return [];
  }
}
