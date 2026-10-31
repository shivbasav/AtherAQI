import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Coordinates, LocationAQI } from '../types/aqi';
import { getAQILevel } from '../utils/aqiUtils';
import { Compass, Layers, ZoomIn, ZoomOut, RotateCcw, CheckCircle2 } from 'lucide-react';

interface WorldStation {
  id: string;
  name: string;
  country: string;
  coords: Coordinates;
  aqi: number;
  dominantPollutant?: string;
  isUserLocation?: boolean;
}

interface WorldMapProps {
  stations: WorldStation[];
  selectedLocation: LocationAQI | null;
  onSelectStation: (name: string, country: string, coords: Coordinates) => void;
  onProbeMapPoint: (coords: Coordinates) => void;
  userCoords: Coordinates | null;
  isProbing?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  stations,
  selectedLocation,
  onSelectStation,
  onProbeMapPoint,
  userCoords,
  isProbing = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<'osm' | 'esri'>('osm');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'good' | 'moderate' | 'sensitive' | 'unhealthy'>('all');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: L.LatLngExpression = [25, 10];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 2.3,
      minZoom: 2,
      maxZoom: 17,
      zoomControl: false,
      worldCopyJump: true,
      attributionControl: false,
    });

    // Clean, high-resolution OpenStreetMap and ESRI tiles (100% free, no API key or watermark)
    const isOSM = mapTheme === 'osm';
    const tileUrl = isOSM
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains: isOSM ? 'abc' : '',
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Map click handler to probe any point on earth
    map.on('click', (e: L.LeafletMouseEvent) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      onProbeMapPoint(coords);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map tile layer when mapTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const isOSM = mapTheme === 'osm';
    const newUrl = isOSM
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    tileLayerRef.current.setUrl(newUrl);
  }, [mapTheme]);

  // Update station markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    const filtered = stations.filter((s) => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'good') return s.aqi <= 50;
      if (categoryFilter === 'moderate') return s.aqi > 50 && s.aqi <= 100;
      if (categoryFilter === 'sensitive') return s.aqi > 100 && s.aqi <= 150;
      if (categoryFilter === 'unhealthy') return s.aqi > 150;
      return true;
    });

    filtered.forEach((station) => {
      const aqiInfo = getAQILevel(station.aqi);
      const isSelected = selectedLocation && Math.abs(selectedLocation.coords.lat - station.coords.lat) < 0.1 && Math.abs(selectedLocation.coords.lng - station.coords.lng) < 0.1;
      const isUser = station.isUserLocation;

      const size = isSelected || isUser ? 36 : 28;
      const fontSize = isSelected || isUser ? 12 : 11;

      const markerHtml = `
        <div class="relative group cursor-pointer">
          ${isUser || station.aqi > 150 ? `
            <div class="absolute -inset-1 rounded-full animate-ping opacity-35" style="background-color: ${aqiInfo.color};"></div>
          ` : ''}
          <div 
            class="aqi-marker-pin"
            style="
              width: ${size}px; 
              height: ${size}px; 
              background-color: ${aqiInfo.color};
              font-size: ${fontSize}px;
              border: ${isSelected ? '3px solid #0f172a' : isUser ? '2.5px solid #0284c7' : '2px solid #ffffff'};
              box-shadow: 0 4px 10px rgba(0,0,0,0.22);
            "
          >
            ${station.aqi}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'aqi-custom-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([station.coords.lat, station.coords.lng], {
        icon: customIcon,
        title: `${station.name}: AQI ${station.aqi} (${aqiInfo.category})`,
      });

      // Interactive light-themed popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3.5 min-w-[210px] text-slate-900';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-3 mb-1.5">
          <h4 class="font-bold text-sm text-slate-900">${station.name}</h4>
          ${isUser ? '<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-300">You</span>' : ''}
        </div>
        <p class="text-xs text-slate-500 mb-2.5">${station.country}</p>
        
        <div class="flex items-baseline gap-2.5 mb-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
          <span class="text-2xl font-bold font-mono tabular-nums" style="color: ${aqiInfo.color}">${station.aqi}</span>
          <div class="text-xs">
            <div class="font-bold text-slate-800">${aqiInfo.category}</div>
            <div class="text-[10px] text-slate-500">US EPA Standard</div>
          </div>
        </div>

        <button 
          id="btn-inspect-${station.id}"
          class="w-full mt-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors text-center font-sans cursor-pointer shadow-xs"
        >
          View Trends & Breakdown
        </button>
      `;

      popupContent.querySelector(`#btn-inspect-${station.id}`)?.addEventListener('click', () => {
        onSelectStation(station.name, station.country, station.coords);
        marker.closePopup();
      });

      marker.bindPopup(popupContent, {
        closeButton: true,
        offset: [0, -10],
      });

      marker.addTo(layer);
    });
  }, [stations, categoryFilter, selectedLocation]);

  // Center on selected location when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    mapInstanceRef.current.flyTo(
      [selectedLocation.coords.lat, selectedLocation.coords.lng],
      Math.max(mapInstanceRef.current.getZoom(), 5),
      { duration: 1.2 }
    );
  }, [selectedLocation?.coords.lat, selectedLocation?.coords.lng]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([25, 10], 2.3, { duration: 1 });
  };
  const handleGoToUser = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 8, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Probing Overlay indicator */}
      {isProbing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-white/95 border border-emerald-500 shadow-xl backdrop-blur-md text-xs text-emerald-700 font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Sampling atmospheric air quality at coordinate...</span>
        </div>
      )}

      {/* Top Controls: Category Filter Tabs */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-white/95 border border-slate-200/90 backdrop-blur-md shadow-md max-w-[calc(100%-120px)]">
        <span className="text-[11px] font-semibold text-slate-500 px-2 py-1">Filter AQI:</span>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
            categoryFilter === 'all' ? 'bg-slate-900 text-white font-medium shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Stations ({stations.length})
        </button>
        <button
          onClick={() => setCategoryFilter('good')}
          className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            categoryFilter === 'good' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600 hover:text-emerald-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Good (&le;50)</span>
        </button>
        <button
          onClick={() => setCategoryFilter('moderate')}
          className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            categoryFilter === 'moderate' ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-slate-600 hover:text-amber-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Moderate (51-100)</span>
        </button>
        <button
          onClick={() => setCategoryFilter('unhealthy')}
          className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            categoryFilter === 'unhealthy' ? 'bg-rose-100 text-rose-800 font-semibold' : 'text-slate-600 hover:text-rose-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Unhealthy (101+)</span>
        </button>
      </div>

      {/* Floating Map Actions (Right side) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setMapTheme(mapTheme === 'osm' ? 'esri' : 'osm')}
          title="Toggle Map Style (OpenStreetMap / Clean Gray Canvas)"
          className="p-2 rounded-lg bg-white/95 hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-md backdrop-blur-md transition-colors cursor-pointer"
        >
          <Layers className="w-4 h-4" />
        </button>
        {userCoords && (
          <button
            onClick={handleGoToUser}
            title="Focus On My Location"
            className="p-2 rounded-lg bg-white/95 hover:bg-slate-50 text-sky-600 hover:text-sky-700 border border-slate-200 shadow-md backdrop-blur-md transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleResetView}
          title="Reset World View"
          className="p-2 rounded-lg bg-white/95 hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-md backdrop-blur-md transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="flex flex-col rounded-lg bg-white/95 border border-slate-200 shadow-md backdrop-blur-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors border-b border-slate-200 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Tip & Legend */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-emerald-700 font-semibold">Tip:</span>
          <span>Click anywhere on the world map to probe live AQI at that exact spot</span>
        </div>

        {/* AQI Range Legend */}
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">0-50</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 font-medium">51-100</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-700 font-medium">101-150</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-700 font-medium">151-200</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-700 font-medium">201-300</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-700" />
            <span className="text-slate-700 font-medium">301+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
