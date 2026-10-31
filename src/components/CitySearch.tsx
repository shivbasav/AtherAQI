import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { searchWorldLocations } from '../services/aqiApi';
import { Coordinates } from '../types/aqi';

interface CitySearchResult {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  coords: Coordinates;
}

interface CitySearchProps {
  onSelectCity: (name: string, country: string, coords: Coordinates) => void;
}

const QUICK_SUGGESTIONS = [
  { name: 'Tokyo', country: 'Japan', coords: { lat: 35.6762, lng: 139.6503 } },
  { name: 'New Delhi', country: 'India', coords: { lat: 28.6139, lng: 77.2090 } },
  { name: 'New York', country: 'United States', coords: { lat: 40.7128, lng: -74.0060 } },
  { name: 'London', country: 'United Kingdom', coords: { lat: 51.5074, lng: -0.1278 } },
  { name: 'Beijing', country: 'China', coords: { lat: 39.9042, lng: 116.4074 } },
  { name: 'Sydney', country: 'Australia', coords: { lat: -33.8688, lng: 151.2093 } },
];

export const CitySearch: React.FC<CitySearchProps> = ({ onSelectCity }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchWorldLocations(query);
      setResults(res as CitySearchResult[]);
      setLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string, country: string, coords: Coordinates) => {
    onSelectCity(name, country, coords);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any world city, country, or coordinates..."
          className="w-full bg-white text-sm text-slate-900 pl-10 pr-9 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-sans shadow-xs"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : loading ? (
          <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 animate-spin" />
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
          {loading && (
            <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Searching global air stations...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.name, item.country || '', item.coords)}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-emerald-600">
                        {item.name}
                      </span>
                      {item.admin1 && (
                        <span className="text-xs text-slate-500 ml-1.5">
                          {item.admin1}
                        </span>
                      )}
                      {item.country && (
                        <span className="text-xs text-slate-400 ml-1.5">
                          · {item.country}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {item.coords.lat.toFixed(2)}°, {item.coords.lng.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-4 text-xs text-slate-500 text-center">
              No matching locations found. Try searching by major metropolis or coordinate.
            </div>
          )}

          {/* Quick recommendations */}
          {(!query || query.length < 2) && (
            <div className="p-3 bg-slate-50">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                Popular Metropolises
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSelect(item.name, item.country, item.coords)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded border border-slate-200 transition-colors cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
