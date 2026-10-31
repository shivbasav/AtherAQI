import React from 'react';
import { Wind, Navigation, Info } from 'lucide-react';

interface HeaderProps {
  onLocateMe: () => void;
  isLocating: boolean;
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenGuide: () => void;
  userCityName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLocateMe,
  isLocating,
  activeSection,
  onNavigate,
  onOpenGuide,
  userCityName,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onNavigate('map')}>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Wind className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-display tracking-tight text-slate-900 whitespace-nowrap">
              AetherAir
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-600">AQI</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('map')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeSection === 'map' ? 'text-emerald-600 font-semibold' : 'text-slate-600'
            }`}
          >
            World Map
          </button>
          <button
            onClick={() => onNavigate('local')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 flex items-center gap-1.5 ${
              activeSection === 'local' ? 'text-emerald-600 font-semibold' : 'text-slate-600'
            }`}
          >
            <span>Local Air</span>
            {userCityName && (
              <span className="text-xs text-slate-500 font-mono">({userCityName})</span>
            )}
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeSection === 'history' ? 'text-emerald-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Historical Trends
          </button>
          <button
            onClick={() => onNavigate('leaderboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeSection === 'leaderboard' ? 'text-emerald-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Global Rankings
          </button>
          <button
            onClick={onOpenGuide}
            className="transition-colors whitespace-nowrap shrink-0 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-xs"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Standards & API</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Locate My AQI'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
