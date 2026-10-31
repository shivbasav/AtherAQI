import React, { useState } from 'react';
import { Coordinates } from '../types/aqi';
import { getAQILevel } from '../utils/aqiUtils';
import { ArrowUpRight, Award, AlertOctagon } from 'lucide-react';

interface LeaderboardCity {
  id: string;
  name: string;
  country: string;
  coords: Coordinates;
  aqi: number;
  dominantPollutant?: string;
  continent?: string;
}

interface GlobalLeaderboardProps {
  stations: LeaderboardCity[];
  onSelectCity: (name: string, country: string, coords: Coordinates) => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  stations,
  onSelectCity,
}) => {
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  const filtered = stations.filter((s) => {
    if (selectedContinent === 'All') return true;
    return s.continent === selectedContinent;
  });

  const sortedCleanest = [...filtered].sort((a, b) => a.aqi - b.aqi).slice(0, 6);
  const sortedPolluted = [...filtered].sort((a, b) => b.aqi - a.aqi).slice(0, 6);

  const continents = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Global Air Quality Leaderboard
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-700">Live Ranking</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time comparative ranking of major world metropolises
          </p>
        </div>

        {/* Continent Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {continents.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedContinent(c)}
              className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedContinent === c
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Cleanest Cities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <Award className="w-4 h-4" />
              <h4 className="text-sm font-bold font-display uppercase tracking-wider">
                Cleanest Air Rankings
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Lowest AQI</span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl bg-slate-50/70 border border-slate-200 overflow-hidden">
            {sortedCleanest.map((city, idx) => {
              const aqiInfo = getAQILevel(city.aqi);
              return (
                <div
                  key={city.id}
                  onClick={() => onSelectCity(city.name, city.country, city.coords)}
                  className="px-4 py-3 flex items-center justify-between hover:bg-white cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 w-4 font-bold tabular-nums">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                        <span>{city.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-slate-500">{city.country}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold tabular-nums"
                      style={{
                        backgroundColor: `${aqiInfo.color}15`,
                        color: aqiInfo.color,
                        border: `1px solid ${aqiInfo.color}40`,
                      }}
                    >
                      {city.aqi} AQI
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Polluted Cities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertOctagon className="w-4 h-4" />
              <h4 className="text-sm font-bold font-display uppercase tracking-wider">
                Highest Pollution Alert
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Highest AQI</span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl bg-slate-50/70 border border-slate-200 overflow-hidden">
            {sortedPolluted.map((city, idx) => {
              const aqiInfo = getAQILevel(city.aqi);
              return (
                <div
                  key={city.id}
                  onClick={() => onSelectCity(city.name, city.country, city.coords)}
                  className="px-4 py-3 flex items-center justify-between hover:bg-white cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 w-4 font-bold tabular-nums">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-rose-700 transition-colors flex items-center gap-1.5">
                        <span>{city.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-slate-500">{city.country}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold tabular-nums"
                      style={{
                        backgroundColor: `${aqiInfo.color}18`,
                        color: aqiInfo.color,
                        border: `1px solid ${aqiInfo.color}40`,
                      }}
                    >
                      {city.aqi} AQI
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
