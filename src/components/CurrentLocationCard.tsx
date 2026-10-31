import React, { useState } from 'react';
import { LocationAQI } from '../types/aqi';
import { getAQILevel, getHealthAdvice } from '../utils/aqiUtils';
import { 
  MapPin, 
  RefreshCw, 
  Wind, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  AlertCircle, 
  Activity, 
  Home, 
  Heart,
  Navigation
} from 'lucide-react';

interface CurrentLocationCardProps {
  locationData: LocationAQI | null;
  isLoading: boolean;
  onRefresh: () => void;
  onRequestLocation: () => void;
  geoError?: string | null;
  onSelectForDeepDive?: () => void;
}

export const CurrentLocationCard: React.FC<CurrentLocationCardProps> = ({
  locationData,
  isLoading,
  onRefresh,
  onRequestLocation,
  geoError,
  onSelectForDeepDive,
}) => {
  const [activeAdviceTab, setActiveAdviceTab] = useState<'general' | 'outdoors' | 'mask' | 'home'>('general');

  if (isLoading && !locationData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 rounded-xl" />
          <div className="h-44 bg-slate-200 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!locationData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
        <div className="max-w-md mx-auto py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
            Detect Your Local Air Quality
          </h3>
          <p className="text-sm text-slate-600 mb-5">
            Allow location access to instantly view your neighborhood's real-time AQI, dominant pollutants, and personalized health recommendations.
          </p>
          {geoError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-left">
              {geoError}
            </div>
          )}
          <button
            onClick={onRequestLocation}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm shadow-emerald-600/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Enable Geolocation</span>
          </button>
        </div>
      </div>
    );
  }

  const { us_aqi, dominant_pollutant, weather, timestamp } = locationData.current;
  const aqiInfo = getAQILevel(us_aqi);
  const advice = getHealthAdvice(us_aqi);

  // Meter percentage (0 to 350 clamped)
  const meterPercent = Math.min(100, Math.max(0, (us_aqi / 350) * 100));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm relative overflow-hidden">
      {/* Header bar of the card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {locationData.name}
              </h3>
              {locationData.isUserLocation && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Your Current Location
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {locationData.country ? `${locationData.country} · ` : ''}
              <span className="font-mono text-slate-500">
                {locationData.coords.lat.toFixed(3)}°N, {locationData.coords.lng.toFixed(3)}°E
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500">
            Updated {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh AQI reading"
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AQI Big Visual Meter */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-slate-50/80 border border-slate-200">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="uppercase tracking-wider font-semibold text-[11px]">Air Quality Index</span>
              <span className="font-mono text-[11px]">US EPA Standard</span>
            </div>

            <div className="flex items-baseline gap-4 my-2">
              <div
                className="text-5xl font-black font-mono tracking-tight tabular-nums"
                style={{ color: aqiInfo.color }}
              >
                {us_aqi}
              </div>
              <div>
                <div
                  className="text-base font-bold font-display"
                  style={{ color: aqiInfo.color }}
                >
                  {aqiInfo.category}
                </div>
                <div className="text-xs text-slate-600">
                  Dominant: <strong className="text-slate-900">{dominant_pollutant}</strong>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden my-3 relative">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${meterPercent}%`,
                  backgroundColor: aqiInfo.color,
                }}
              />
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {aqiInfo.description}
            </p>
          </div>

          {/* Meteorological context */}
          {weather && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Droplets className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{weather.humidity}% hum</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{weather.windSpeed} km/h</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Health Guidance & Actionable Recommendations */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Advice Tab Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveAdviceTab('general')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeAdviceTab === 'general'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveAdviceTab('outdoors')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeAdviceTab === 'outdoors'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                <span>Exercise & Sports</span>
              </button>
              <button
                onClick={() => setActiveAdviceTab('mask')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeAdviceTab === 'mask'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>Mask Protection</span>
              </button>
              <button
                onClick={() => setActiveAdviceTab('home')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeAdviceTab === 'home'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-amber-600" />
                <span>Home & Ventilation</span>
              </button>
            </div>

            {/* Advice Tab Content */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
              {activeAdviceTab === 'general' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 mb-0.5">Public Health Guidance</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{advice.generalPublic}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 mb-0.5">Sensitive Groups (Asthma, Elderly, Kids)</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{advice.sensitiveGroups}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeAdviceTab === 'outdoors' && (
                <div className="space-y-2">
                  <div className="font-semibold text-xs text-slate-900">Outdoor Cardio & Recreational Exercise</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{advice.outdoorActivities}</p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    During elevated particulate levels, breathing volume increases 5-10x during jogging or cycling, carrying micro-particles deeper into pulmonary alveoli.
                  </p>
                </div>
              )}

              {activeAdviceTab === 'mask' && (
                <div className="space-y-2">
                  <div className="font-semibold text-xs text-slate-900">Respiratory Protection Guideline</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{advice.maskRecommendation}</p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    Note: Standard cloth or surgical masks do not block sub-micron PM2.5 aerosols. Only airtight N95/KN95/FFP2 respirators provide true filtration.
                  </p>
                </div>
              )}

              {activeAdviceTab === 'home' && (
                <div className="space-y-2">
                  <div className="font-semibold text-xs text-slate-900">Indoor Air & Window Ventilation</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{advice.indoorVentilation}</p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    Keep indoor humidity balanced around 40-50% to prevent mucosal drying and enhance natural airway clearance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Deep Dive CTA */}
          {onSelectForDeepDive && (
            <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-200 text-xs">
              <span className="text-slate-500">Want to see past 7 to 90 days historical air trends for this location?</span>
              <button
                onClick={onSelectForDeepDive}
                className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Historical Trends &rarr;</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
