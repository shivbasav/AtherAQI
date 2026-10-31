import React from 'react';
import { X, Wind, CheckCircle2, KeyRound } from 'lucide-react';
import { AQI_LEVELS } from '../utils/aqiUtils';

interface PollutantGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PollutantGuideModal: React.FC<PollutantGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Air Quality Index (AQI) & Architecture Guide
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Atmospheric pollutant standards, WHO guidelines, and open map infrastructure details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Callout: Map & Data API Key Details */}
        <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1.5 text-sm">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Do We Need an API Key for the Map or Data?</span>
          </div>
          <p className="text-emerald-900 leading-relaxed">
            <strong>No API key is required!</strong> Everything in this application runs on 100% free, open atmospheric and cartographic infrastructure:
          </p>
          <ul className="mt-2 space-y-1.5 text-emerald-950 list-disc list-inside">
            <li>
              <strong>World Map Tiles:</strong> Served by CartoDB (Voyager / Positron) & OpenStreetMap raster tile servers without requiring any tokens or billing setup.
            </li>
            <li>
              <strong>Air Quality & Historical Trends:</strong> Powered by <strong>Open-Meteo Air Quality API</strong> (coupled with the European Union's Copernicus Atmosphere Monitoring Service - CAMS), which is completely open-access with no API key or credit card needed.
            </li>
            <li>
              <strong>Global Geocoding & Search:</strong> Handled by Open-Meteo's open geocoding engine with zero rate-limit hurdles for standard web usage.
            </li>
          </ul>
        </div>

        {/* Section 1: EPA Category Reference */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            US EPA AQI Standard Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AQI_LEVELS.map((lvl) => (
              <div
                key={lvl.category}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-bold text-sm font-display"
                    style={{ color: lvl.color }}
                  >
                    {lvl.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                    {lvl.range[0]} - {lvl.range[1]}+
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {lvl.description}
                </p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span className="text-slate-800 font-semibold">Advisory: </span>
                  {lvl.cautionaryStatement}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Particulate Scale Comparison */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 font-display mb-2">
            Micron Scale: Why PM2.5 Matters Most
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Airborne particulates are classified by diameter. The smaller the particle, the deeper it travels into human pulmonary physiology:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="font-bold text-slate-800 mb-1">Human Hair (~70 µm)</div>
              <p className="text-slate-500 text-[11px]">
                Visible to the naked eye. Blocked easily by nasal cilia and mucus membranes.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="font-bold text-amber-700 mb-1">PM10 (Coarse Dust &lt;10 µm)</div>
              <p className="text-slate-500 text-[11px]">
                Pollen, construction dust. Inhalable into the upper trachea and bronchi.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="font-bold text-rose-700 mb-1">PM2.5 (Fine Smoke &lt;2.5 µm)</div>
              <p className="text-slate-500 text-[11px]">
                Combustion particles, industrial fumes. Enters alveolar sacs and the bloodstream directly.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Safe Protection Guidelines */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Practical Protection Protocol
          </h3>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>N95 / KN95 / FFP2 Masks:</strong> When AQI exceeds 150, standard cloth masks provide zero PM2.5 protection. Only certified electrostatic respirators filter sub-micron aerosols.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>HEPA H13 Filtration:</strong> Run mechanical true HEPA purifiers in bedrooms. Ensure CADR (Clean Air Delivery Rate) matches room volume.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Ventilation Timing:</strong> Avoid opening windows during rush hours (8-10 AM, 6-8 PM) and during thermal morning inversions when pollutants hover closest to the ground.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
