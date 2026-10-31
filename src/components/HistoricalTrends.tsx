import React, { useState, useMemo, useRef } from 'react';
import { HistoricalDataPoint, LocationAQI } from '../types/aqi';
import { getAQILevel, exportHistoricalToCSV } from '../utils/aqiUtils';
import { Download, TrendingDown, TrendingUp } from 'lucide-react';

interface HistoricalTrendsProps {
  location: LocationAQI | null;
  extendedHistory?: HistoricalDataPoint[] | null;
  isLoadingHistory?: boolean;
  selectedRange: '24h' | '7d' | '30d' | '90d';
  onRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

type PollutantKey = 'us_aqi' | 'pm2_5' | 'pm10' | 'ozone' | 'nitrogen_dioxide' | 'carbon_monoxide';

interface PollutantOption {
  key: PollutantKey;
  label: string;
  unit: string;
  color: string;
}

const POLLUTANT_OPTIONS: PollutantOption[] = [
  { key: 'us_aqi', label: 'Overall US AQI', unit: 'Index', color: '#059669' },
  { key: 'pm2_5', label: 'PM2.5 (Fine Dust)', unit: 'µg/m³', color: '#0284c7' },
  { key: 'pm10', label: 'PM10 (Coarse Dust)', unit: 'µg/m³', color: '#d97706' },
  { key: 'ozone', label: 'Ozone (O₃)', unit: 'µg/m³', color: '#7c3aed' },
  { key: 'nitrogen_dioxide', label: 'Nitrogen Dioxide (NO₂)', unit: 'µg/m³', color: '#e11d48' },
];

export const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({
  location,
  extendedHistory,
  isLoadingHistory = false,
  selectedRange,
  onRangeChange,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<PollutantKey>('us_aqi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);

  // Active data source: either extendedHistory (for 30d/90d) or location.history (for 7d/24h)
  const rawData = useMemo(() => {
    const list = extendedHistory && extendedHistory.length > 0 
      ? extendedHistory 
      : (location?.history || []);

    if (selectedRange === '24h') {
      return list.slice(-24);
    }
    return list;
  }, [extendedHistory, location?.history, selectedRange]);

  // Compute stats: min, max, average, and clean air compliance
  const stats = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { min: 0, max: 0, avg: 0, cleanDaysPct: 0, trend: 'neutral', changePct: 0 };
    }

    const values = rawData.map((d) => d[selectedMetric] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);

    // Calculate clean days / safe hours (AQI <= 50 or PM2.5 <= 15)
    const safeCount = rawData.filter((d) => {
      if (selectedMetric === 'us_aqi') return d.us_aqi <= 50;
      if (selectedMetric === 'pm2_5') return d.pm2_5 <= 15;
      if (selectedMetric === 'pm10') return d.pm10 <= 45;
      return d[selectedMetric] <= avg;
    }).length;

    const cleanDaysPct = Math.round((safeCount / rawData.length) * 100);

    // Trend direction: compare first third vs last third
    const chunk = Math.max(1, Math.floor(values.length / 3));
    const firstAvg = values.slice(0, chunk).reduce((a, b) => a + b, 0) / chunk;
    const lastAvg = values.slice(-chunk).reduce((a, b) => a + b, 0) / chunk;
    const changePct = firstAvg > 0 ? Math.round(((lastAvg - firstAvg) / firstAvg) * 100) : 0;
    const trend = changePct < -5 ? 'improving' : changePct > 5 ? 'deteriorating' : 'stable';

    return { min, max, avg, cleanDaysPct, trend, changePct };
  }, [rawData, selectedMetric]);

  // Chart dimensions & scaling
  const width = 800;
  const height = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const chartData = useMemo(() => {
    if (!rawData || rawData.length < 2) return null;

    const values = rawData.map((d) => d[selectedMetric] as number);
    const maxVal = Math.max(...values, selectedMetric === 'us_aqi' ? 120 : 50);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const points = rawData.map((d, i) => {
      const val = d[selectedMetric] as number;
      const x = padLeft + (i / (rawData.length - 1)) * plotW;
      const y = padTop + plotH - ((val - minVal) / range) * plotH;
      return { x, y, val, item: d };
    });

    // Create SVG path string
    const linePath = points.reduce((path, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');

    // Area path closed to bottom
    const areaPath = `${linePath} L ${padLeft + plotW} ${padTop + plotH} L ${padLeft} ${padTop + plotH} Z`;

    return { points, linePath, areaPath, maxVal, minVal };
  }, [rawData, selectedMetric, plotW, plotH, padLeft, padTop]);

  // Handle SVG Mouse Move to update scrubber tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData || !chartSvgRef.current) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = (clientX - (padLeft / width) * rect.width) / ((plotW / width) * rect.width);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const idx = Math.round(clampedRatio * (chartData.points.length - 1));
    setHoverIndex(idx);
  };

  const activeHoverItem = hoverIndex !== null && chartData ? chartData.points[hoverIndex] : null;

  const currentOption = POLLUTANT_OPTIONS.find((p) => p.key === selectedMetric) || POLLUTANT_OPTIONS[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Air Quality Long-Term Trends
            </h3>
            {location && (
              <span className="text-xs text-slate-500 font-mono">
                — {location.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly and multi-day atmospheric pollution tracking with WHO and US EPA threshold bands
          </p>
        </div>

        {/* Action Toolbar: Range Selector & Export */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Range tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onRangeChange(range)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                  selectedRange === range
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => {
              if (location && rawData.length > 0) {
                exportHistoricalToCSV(location.name, rawData);
              }
            }}
            disabled={!location || rawData.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download CSV historical data"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Switcher Tabs */}
      <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1">
        {POLLUTANT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedMetric(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
              selectedMetric === opt.key
                ? 'bg-white text-slate-900 border-slate-300 shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: opt.color }}
            />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Chart Viewport */}
      <div className="relative w-full rounded-xl bg-slate-50/70 border border-slate-200 p-3 overflow-hidden">
        {isLoadingHistory && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20 text-xs text-slate-700 gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Aggregating historical atmospheric timeline...</span>
          </div>
        )}

        {chartData && (
          <svg
            ref={chartSvgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentOption.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={currentOption.color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yVal = padTop + plotH * (1 - ratio);
              const val = Math.round(chartData.minVal + ratio * (chartData.maxVal - chartData.minVal));
              return (
                <g key={ratio}>
                  <line
                    x1={padLeft}
                    y1={yVal}
                    x2={padLeft + plotW}
                    y2={yVal}
                    stroke="#e2e8f0"
                    strokeDasharray={ratio > 0 && ratio < 1 ? '4 4' : undefined}
                  />
                  <text
                    x={padLeft - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* EPA 50 "Good" threshold line if metric is US AQI */}
            {selectedMetric === 'us_aqi' && chartData.maxVal >= 50 && (
              <g>
                {(() => {
                  const y50 = padTop + plotH - (50 / chartData.maxVal) * plotH;
                  return (
                    <>
                      <line
                        x1={padLeft}
                        y1={y50}
                        x2={padLeft + plotW}
                        y2={y50}
                        stroke="#059669"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                      <text
                        x={padLeft + plotW - 4}
                        y={y50 - 4}
                        textAnchor="end"
                        fill="#059669"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        fontWeight="600"
                      >
                        Safe Standard (50 AQI)
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Area Fill */}
            <path d={chartData.areaPath} fill="url(#chartGradientLight)" />

            {/* Main Trend Line */}
            <path
              d={chartData.linePath}
              fill="none"
              stroke={currentOption.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Date labels on X axis */}
            {chartData.points
              .filter((_, idx) => idx % Math.max(1, Math.floor(chartData.points.length / 6)) === 0)
              .map((pt, i) => (
                <text
                  key={i}
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="DM Sans"
                >
                  {selectedRange === '24h' ? pt.item.timeStr : pt.item.dateStr}
                </text>
              ))}

            {/* Interactive hover scrubber */}
            {activeHoverItem && (
              <g>
                <line
                  x1={activeHoverItem.x}
                  y1={padTop}
                  x2={activeHoverItem.x}
                  y2={padTop + plotH}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.7"
                />
                <circle
                  cx={activeHoverItem.x}
                  cy={activeHoverItem.y}
                  r="5"
                  fill={currentOption.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                />
              </g>
            )}
          </svg>
        )}

        {/* Hover Floating Tooltip */}
        {activeHoverItem && (
          <div
            className="absolute top-4 left-4 pointer-events-none p-3 rounded-lg bg-white border border-slate-200 shadow-xl text-xs z-30 transition-all font-sans"
          >
            <div className="flex items-center justify-between gap-4 text-slate-500 mb-1">
              <span>{activeHoverItem.item.dateStr} · {activeHoverItem.item.timeStr}</span>
              {selectedMetric === 'us_aqi' && (
                <span className="font-semibold" style={{ color: getAQILevel(activeHoverItem.val).color }}>
                  {getAQILevel(activeHoverItem.val).category}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {activeHoverItem.val}
              </span>
              <span className="text-slate-500 text-xs">
                {currentOption.unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Average {currentOption.label.split(' ')[0]}
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.avg} <span className="text-xs font-normal text-slate-500">{currentOption.unit}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Over {selectedRange}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Cleanest Period
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {stats.min} <span className="text-xs font-normal text-slate-500">{currentOption.unit}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lowest recorded</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Peak Smog Event
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 tabular-nums">
            {stats.max} <span className="text-xs font-normal text-slate-500">{currentOption.unit}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Maximum concentration</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Period Trajectory
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {stats.trend === 'improving' ? (
              <>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-600">Improving ({Math.abs(stats.changePct)}%)</span>
              </>
            ) : stats.trend === 'deteriorating' ? (
              <>
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-rose-600">Worsening (+{stats.changePct}%)</span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-700">Stable (&plusmn;{Math.abs(stats.changePct)}%)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{stats.cleanDaysPct}% safe hours</div>
        </div>
      </div>
    </div>
  );
};
