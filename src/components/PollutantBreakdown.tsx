import React from 'react';
import { PollutantValues } from '../types/aqi';
import { POLLUTANTS_INFO } from '../utils/aqiUtils';
import { Info } from 'lucide-react';

interface PollutantBreakdownProps {
  pollutants: PollutantValues;
  locationName: string;
  onOpenGuide?: () => void;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({
  pollutants,
  locationName,
  onOpenGuide,
}) => {
  // WHO guideline limits for comparison
  const WHO_LIMITS: Record<string, number> = {
    pm2_5: 15,
    pm10: 45,
    ozone: 100,
    nitrogen_dioxide: 25,
    sulphur_dioxide: 40,
    carbon_monoxide: 4000,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Atmospheric Pollutant Spectrum
            </h3>
            <span className="text-xs text-slate-500 font-mono">— {locationName}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time concentration measurements compared against WHO Air Quality Guidelines (2021 update)
          </p>
        </div>

        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Understanding Particulates</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {POLLUTANTS_INFO.map((item) => {
          const val = pollutants[item.key] ?? 0;
          const limit = WHO_LIMITS[item.key] || 50;
          const ratio = val / limit;
          const exceeds = ratio > 1;
          const pctOfLimit = Math.round(ratio * 100);

          return (
            <div
              key={item.key}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header: Name and Chemical Symbol */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900 font-display">
                      {item.chemicalFormula}
                    </span>
                    <span className="text-xs text-slate-600 ml-1.5 font-sans">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      exceeds
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {exceeds ? `${pctOfLimit}% WHO limit` : 'Safe Level'}
                  </span>
                </div>

                {/* Main numeric value */}
                <div className="flex items-baseline gap-1.5 my-2">
                  <span className="text-3xl font-black font-mono text-slate-900 tabular-nums tracking-tight">
                    {val.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {item.unit}
                  </span>
                </div>

                {/* Progress bar vs WHO guideline */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      exceeds ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, pctOfLimit)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>WHO Standard</span>
                  <span className="font-mono text-slate-700 font-medium">{item.whoStandard}</span>
                </div>
              </div>

              {/* Biological / environmental note */}
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <span className="text-slate-800 font-semibold">Source: </span>
                {item.sources}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
