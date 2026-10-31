import { AQICategory, AQILevelInfo, PollutantValues } from '../types/aqi';

export const AQI_LEVELS: AQILevelInfo[] = [
  {
    category: 'Good',
    range: [0, 50],
    color: '#10B981', // Emerald-500
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    healthImplications: 'Air quality is ideal for all individuals. Enjoy outdoor activities.',
    cautionaryStatement: 'None. Safe for all groups.',
  },
  {
    category: 'Moderate',
    range: [51, 100],
    color: '#F59E0B', // Amber-500
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/20',
    description: 'Air quality is acceptable; however, some pollutants may cause moderate health concern for sensitive individuals.',
    healthImplications: 'Unusually sensitive individuals may experience minor respiratory symptoms.',
    cautionaryStatement: 'Extremely sensitive individuals should consider reducing prolonged outdoor exertion.',
  },
  {
    category: 'Unhealthy for Sensitive Groups',
    range: [101, 150],
    color: '#F97316', // Orange-500
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/20',
    description: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
    healthImplications: 'People with respiratory or heart disease, elderly, and children are at greater risk from exposure.',
    cautionaryStatement: 'Sensitive groups: reduce prolonged or heavy outdoor exertion. Take frequent breaks.',
  },
  {
    category: 'Unhealthy',
    range: [151, 200],
    color: '#EF4444', // Red-500
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/20',
    description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    healthImplications: 'Increased aggravation of heart or lung diseases. Premature mortality in people with cardiopulmonary disease.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion.',
  },
  {
    category: 'Very Unhealthy',
    range: [201, 300],
    color: '#A855F7', // Purple-500
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/20',
    description: 'Health alert: everyone may experience more serious health effects with elevated risk across the population.',
    healthImplications: 'Significant impairment of lung function, coughing, wheezing, and irritation.',
    cautionaryStatement: 'Active children and adults should avoid all outdoor exertion; everyone else should severely limit outdoor exertion.',
  },
  {
    category: 'Hazardous',
    range: [301, 500],
    color: '#E11D48', // Crimson-600
    bgClass: 'bg-rose-950/40',
    textClass: 'text-rose-300',
    borderClass: 'border-rose-700/50',
    description: 'Health warnings of emergency conditions. The entire population is more likely to be severely affected.',
    healthImplications: 'Serious risk of respiratory distress, cardiovascular events, and acute systemic inflammation.',
    cautionaryStatement: 'Everyone should remain indoors and keep activity levels low. Close windows and run air purifiers.',
  },
];

export function getAQILevel(aqi: number): AQILevelInfo {
  const rounded = Math.round(aqi);
  if (rounded <= 50) return AQI_LEVELS[0];
  if (rounded <= 100) return AQI_LEVELS[1];
  if (rounded <= 150) return AQI_LEVELS[2];
  if (rounded <= 200) return AQI_LEVELS[3];
  if (rounded <= 300) return AQI_LEVELS[4];
  return AQI_LEVELS[5];
}

export interface HealthAdvice {
  generalPublic: string;
  sensitiveGroups: string;
  outdoorActivities: string;
  maskRecommendation: string;
  indoorVentilation: string;
}

export function getHealthAdvice(aqi: number): HealthAdvice {
  if (aqi <= 50) {
    return {
      generalPublic: 'Air quality is ideal. No precautions necessary.',
      sensitiveGroups: 'Perfect condition for outdoor walks and sports.',
      outdoorActivities: 'Ideal conditions for jogging, cycling, and outdoor recreation.',
      maskRecommendation: 'No mask required.',
      indoorVentilation: 'Great time to open windows and let fresh air circulate.',
    };
  }
  if (aqi <= 100) {
    return {
      generalPublic: 'Air quality is acceptable with minimal risk.',
      sensitiveGroups: 'Individuals with severe asthma should keep inhalers handy.',
      outdoorActivities: 'Outdoor exercise is generally safe for healthy individuals.',
      maskRecommendation: 'Not needed for general public. Sensitive individuals may consider a light mask.',
      indoorVentilation: 'Ventilation is generally fine unless in direct roadside zones.',
    };
  }
  if (aqi <= 150) {
    return {
      generalPublic: 'Unhealthy for sensitive groups. General public may notice slight irritation.',
      sensitiveGroups: 'Children, elderly, and those with respiratory issues should limit prolonged outdoor exposure.',
      outdoorActivities: 'Reduce intense cardio outdoors; consider shifting workouts indoors.',
      maskRecommendation: 'N95/KN95 recommended for sensitive individuals when outdoors.',
      indoorVentilation: 'Close windows during rush hours. Run HEPA air filters if available.',
    };
  }
  if (aqi <= 200) {
    return {
      generalPublic: 'Everyone may experience throat or eye irritation and shortness of breath.',
      sensitiveGroups: 'Avoid outdoor activities completely. Stay in filtered indoor environments.',
      outdoorActivities: 'Avoid outdoor jogging or cycling. Switch to gym/indoor exercise.',
      maskRecommendation: 'Wear a certified N95 or FFP2 respirator mask if stepping outside.',
      indoorVentilation: 'Keep windows and doors closed. Use air purifiers on medium/high speed.',
    };
  }
  if (aqi <= 300) {
    return {
      generalPublic: 'Health alert: high risk of respiratory and cardiovascular aggravation.',
      sensitiveGroups: 'Remain strictly indoors with air filtration.',
      outdoorActivities: 'Cancel all outdoor sports, running, and events.',
      maskRecommendation: 'Tight-fitting N95/FFP3 respirator mask is mandatory if you must step outside.',
      indoorVentilation: 'Seal drafts, keep air purifiers running continuously.',
    };
  }
  return {
    generalPublic: 'Hazardous emergency conditions. High toxic exposure risk.',
    sensitiveGroups: 'Medical emergency risk for cardiopulmonary conditions. Seek medical help if breathing is impaired.',
    outdoorActivities: 'Strict ban on outdoor exertion.',
    maskRecommendation: 'Do not go outside without an airtight N95/N99 respirator.',
    indoorVentilation: 'Keep all windows sealed. Maximize indoor HEPA filtration.',
  };
}

export interface PollutantDetail {
  key: keyof PollutantValues;
  name: string;
  chemicalFormula: string;
  unit: string;
  whoStandard: string;
  description: string;
  sources: string;
  healthEffect: string;
}

export const POLLUTANTS_INFO: PollutantDetail[] = [
  {
    key: 'pm2_5',
    name: 'Fine Particulate Matter',
    chemicalFormula: 'PM₂.₅',
    unit: 'µg/m³',
    whoStandard: '15 µg/m³ (24h mean)',
    description: 'Inhalable particles with diameters generally 2.5 micrometers and smaller. They penetrate deep into lung alveoli and enter the bloodstream.',
    sources: 'Vehicle exhaust, industrial emissions, forest fires, cooking, power plants.',
    healthEffect: 'Aggravates asthma, causes reduced lung function, increased heart attack risk.',
  },
  {
    key: 'pm10',
    name: 'Coarse Particulate Matter',
    chemicalFormula: 'PM₁₀',
    unit: 'µg/m³',
    whoStandard: '45 µg/m³ (24h mean)',
    description: 'Inhalable particles with diameters 10 micrometers and smaller, depositing primarily in upper respiratory airways.',
    sources: 'Dust storms, construction sites, unpaved roads, agricultural dust.',
    healthEffect: 'Eye, nose and throat irritation; increases respiratory disease severity.',
  },
  {
    key: 'ozone',
    name: 'Ground-level Ozone',
    chemicalFormula: 'O₃',
    unit: 'µg/m³',
    whoStandard: '100 µg/m³ (8h mean)',
    description: 'Secondary pollutant formed when NOx and volatile organic compounds (VOCs) react in the presence of strong sunlight and heat.',
    sources: 'Photochemical smog from vehicles, refineries, and chemical solvents.',
    healthEffect: 'Triggers chest pain, coughing, throat irritation, and airway constriction.',
  },
  {
    key: 'nitrogen_dioxide',
    name: 'Nitrogen Dioxide',
    chemicalFormula: 'NO₂',
    unit: 'µg/m³',
    whoStandard: '25 µg/m³ (24h mean)',
    description: 'A reddish-brown gas with a pungent, acrid smell produced during high-temperature fuel combustion.',
    sources: 'Motor traffic (especially diesel engines), thermal power plants, heating furnaces.',
    healthEffect: 'Airway inflammation, exacerbates childhood asthma, reduces resistance to respiratory infections.',
  },
  {
    key: 'sulphur_dioxide',
    name: 'Sulphur Dioxide',
    chemicalFormula: 'SO₂',
    unit: 'µg/m³',
    whoStandard: '40 µg/m³ (24h mean)',
    description: 'Toxic, colorless gas with a choking odor released from sulfur-bearing fossil fuels and volcanic activity.',
    sources: 'Coal-fired power generation, metal smelting facilities, maritime ships.',
    healthEffect: 'Causes acute bronchoconstriction within minutes of inhalation, aggravates bronchitis.',
  },
  {
    key: 'carbon_monoxide',
    name: 'Carbon Monoxide',
    chemicalFormula: 'CO',
    unit: 'µg/m³',
    whoStandard: '4,000 µg/m³ (24h mean)',
    description: 'Colorless, odorless, toxic gas formed by incomplete combustion of carbonaceous fuels.',
    sources: 'Traffic congestion, gas heaters, biomass burning, industrial combustion.',
    healthEffect: 'Reduces oxygen delivery to the body organs and heart tissue; causes dizziness and headaches.',
  },
];

export function exportHistoricalToCSV(cityName: string, data: { timestamp: string; dateStr: string; us_aqi: number; pm2_5: number; pm10: number; nitrogen_dioxide: number; ozone: number }[]) {
  const headers = ['Timestamp', 'Date', 'US AQI', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'NO2 (µg/m³)', 'Ozone (µg/m³)'];
  const rows = data.map(d => [
    `"${d.timestamp}"`,
    `"${d.dateStr}"`,
    d.us_aqi,
    d.pm2_5,
    d.pm10,
    d.nitrogen_dioxide,
    d.ozone
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${cityName.toLowerCase().replace(/\s+/g, '_')}_aqi_history.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
