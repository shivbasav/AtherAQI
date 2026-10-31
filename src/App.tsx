import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Coordinates, 
  LocationAQI, 
  HistoricalDataPoint,
  StationItem
} from './types/aqi';
import { 
  fetchLocationAQI, 
  fetchExtendedHistoricalAQI, 
  reverseGeocodeCoords, 
  MAJOR_WORLD_CITIES 
} from './services/aqiApi';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { WorldMap } from './components/WorldMap';
import { CurrentLocationCard } from './components/CurrentLocationCard';
import { HistoricalTrends } from './components/HistoricalTrends';
import { PollutantBreakdown } from './components/PollutantBreakdown';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';
import { PollutantGuideModal } from './components/PollutantGuideModal';
import { Wind, ShieldCheck, MapPin, Globe } from 'lucide-react';

// Baseline realistic seed for world stations for instant map responsiveness
const INITIAL_STATIONS: StationItem[] = MAJOR_WORLD_CITIES.map((city) => {
  // Diverse realistic AQI profiles
  const baseAQIs: Record<string, number> = {
    nyc: 42,
    la: 68,
    chicago: 38,
    toronto: 26,
    mexico_city: 118,
    sao_paulo: 74,
    buenos_aires: 35,
    santiago: 89,
    bogota: 56,
    london: 34,
    paris: 41,
    berlin: 32,
    madrid: 45,
    rome: 58,
    amsterdam: 29,
    warsaw: 78,
    istanbul: 92,
    tokyo: 28,
    delhi: 265,
    mumbai: 142,
    beijing: 135,
    shanghai: 98,
    seoul: 64,
    singapore: 48,
    bangkok: 112,
    jakarta: 145,
    dubai: 126,
    riyadh: 138,
    dhaka: 210,
    lahore: 285,
    cairo: 158,
    johannesburg: 62,
    nairobi: 38,
    lagos: 132,
    casablanca: 54,
    sydney: 22,
    melbourne: 25,
    auckland: 18,
  };

  return {
    id: city.id,
    name: city.name,
    country: city.country,
    coords: city.coords,
    aqi: baseAQIs[city.id] || 45,
    dominantPollutant: 'PM2.5',
    continent: city.continent,
  };
});

export default function App() {
  // User Geolocation & AQI State
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [userLocationData, setUserLocationData] = useState<LocationAQI | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Selected Location for Deep Dive & Historical Trends
  const [selectedLocation, setSelectedLocation] = useState<LocationAQI | null>(null);

  // World Stations
  const [stations, setStations] = useState<StationItem[]>(INITIAL_STATIONS);

  // Historical Trends State
  const [selectedRange, setSelectedRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [extendedHistory, setExtendedHistory] = useState<HistoricalDataPoint[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // UI state
  const [activeSection, setActiveSection] = useState<'map' | 'local' | 'history' | 'leaderboard'>('map');
  const [isProbing, setIsProbing] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Section references for smooth scrolling
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const localSectionRef = useRef<HTMLDivElement>(null);
  const historySectionRef = useRef<HTMLDivElement>(null);
  const leaderboardSectionRef = useRef<HTMLDivElement>(null);

  // Load User Location via Geolocation API
  const handleLocateMe = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserCoords(coords);

          // Reverse geocode
          const geo = await reverseGeocodeCoords(coords.lat, coords.lng);
          const locationAQI = await fetchLocationAQI(
            coords,
            geo.city || 'Your Location',
            geo.country || '',
            7,
            3,
            true
          );

          setUserLocationData(locationAQI);
          setSelectedLocation(locationAQI);

          // Add user station to world stations list
          setStations((prev) => {
            const withoutUser = prev.filter((s) => s.id !== 'user-station');
            return [
              {
                id: 'user-station',
                name: geo.city || 'Your Location',
                country: geo.country || '',
                coords,
                aqi: locationAQI.current.us_aqi,
                dominantPollutant: locationAQI.current.dominant_pollutant,
                isUserLocation: true,
              },
              ...withoutUser,
            ];
          });

          setIsLocating(false);
          setBannerNotice(`Detected local air quality for ${geo.city || 'your area'}`);
          setTimeout(() => setBannerNotice(null), 5000);
        } catch {
          setIsLocating(false);
          setGeoError('Unable to retrieve local atmospheric data. Displaying global stations.');
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission was denied. You can search your city in the search bar above.');
        } else {
          setGeoError('Location request timed out. Please try again or search your city.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Initial Load: Try geolocation once & initialize default selected location
  useEffect(() => {
    // Set initial fallback selected location to New York while locating
    const defaultCoords = { lat: 40.7128, lng: -74.0060 };
    fetchLocationAQI(defaultCoords, 'New York', 'United States', 7, 3, false)
      .then((data) => {
        setSelectedLocation(data);
      })
      .catch(() => {});

    // Trigger user location lookup
    handleLocateMe();

    // Fetch live data for a subset of major capitals in background to update stations
    const sampleCities = [
      { id: 'delhi', coords: { lat: 28.6139, lng: 77.2090 } },
      { id: 'tokyo', coords: { lat: 35.6762, lng: 139.6503 } },
      { id: 'london', coords: { lat: 51.5074, lng: -0.1278 } },
      { id: 'beijing', coords: { lat: 39.9042, lng: 116.4074 } },
      { id: 'sydney', coords: { lat: -33.8688, lng: 151.2093 } },
    ];

    sampleCities.forEach((city) => {
      fetchLocationAQI(city.coords, '', '', 1, 1)
        .then((data) => {
          setStations((prev) =>
            prev.map((s) => (s.id === city.id ? { ...s, aqi: data.current.us_aqi } : s))
          );
        })
        .catch(() => {});
    });
  }, [handleLocateMe]);

  // Load Extended History when user switches range to 30d or 90d
  useEffect(() => {
    if (!selectedLocation) return;

    if (selectedRange === '30d' || selectedRange === '90d') {
      setIsLoadingHistory(true);
      fetchExtendedHistoricalAQI(selectedLocation.coords, selectedRange)
        .then((hist) => {
          setExtendedHistory(hist);
          setIsLoadingHistory(false);
        })
        .catch(() => {
          setIsLoadingHistory(false);
        });
    } else {
      setExtendedHistory(null);
    }
  }, [selectedLocation?.coords.lat, selectedLocation?.coords.lng, selectedRange]);

  // Handle City Selection from Search or Leaderboard
  const handleSelectCity = async (name: string, country: string, coords: Coordinates) => {
    try {
      setIsProbing(true);
      const data = await fetchLocationAQI(coords, name, country, 7, 3, false);
      setSelectedLocation(data);
      setIsProbing(false);

      // Scroll to map or analysis
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      setIsProbing(false);
    }
  };

  // Handle probe when user clicks ANYWHERE on the world map
  const handleProbeMapPoint = async (coords: Coordinates) => {
    try {
      setIsProbing(true);
      const geo = await reverseGeocodeCoords(coords.lat, coords.lng);
      const data = await fetchLocationAQI(
        coords,
        geo.city || `Coordinate (${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°)`,
        geo.country || '',
        7,
        3,
        false
      );

      setSelectedLocation(data);
      setIsProbing(false);

      // Add to stations temporarily
      setStations((prev) => [
        {
          id: `probe-${Date.now()}`,
          name: data.name,
          country: data.country,
          coords,
          aqi: data.current.us_aqi,
          dominantPollutant: data.current.dominant_pollutant,
        },
        ...prev,
      ]);
    } catch {
      setIsProbing(false);
    }
  };

  // Smooth navigation scroll
  const handleNavigate = (section: string) => {
    setActiveSection(section as any);
    if (section === 'map') mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'local') localSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'history') historySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'leaderboard') leaderboardSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-800">
      
      {/* Top Header complying with Top Bar Contract */}
      <Header
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenGuide={() => setGuideModalOpen(true)}
        userCityName={userLocationData?.name}
      />

      {/* Banner notification if present */}
      {bannerNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1 w-full">
        
        {/* Search & Overview Hero Strip */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900">
              Global Air Quality & Atmospheric Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Live continuous AQI satellite & ground station monitoring, particulate analysis, and long-term trend forecasting.
            </p>
          </div>

          <CitySearch onSelectCity={handleSelectCity} />
        </section>

        {/* Section 1: World Map View */}
        <section ref={mapSectionRef} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider">
                Interactive World Air Quality Map
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {stations.length} Global Stations Active
            </span>
          </div>

          <WorldMap
            stations={stations}
            selectedLocation={selectedLocation}
            onSelectStation={(name, country, coords) => handleSelectCity(name, country, coords)}
            onProbeMapPoint={handleProbeMapPoint}
            userCoords={userCoords}
            isProbing={isProbing}
          />
        </section>

        {/* Section 2: Current Location AQI Card */}
        <section ref={localSectionRef} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider">
                Current Location AQI & Health Advisory
              </h2>
            </div>
            <button
              onClick={handleLocateMe}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
            >
              Re-scan GPS Location
            </button>
          </div>

          <CurrentLocationCard
            locationData={userLocationData}
            isLoading={isLocating}
            onRefresh={handleLocateMe}
            onRequestLocation={handleLocateMe}
            geoError={geoError}
            onSelectForDeepDive={() => {
              if (userLocationData) {
                setSelectedLocation(userLocationData);
                historySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </section>

        {/* Section 3: Historical Data & Long-Term Trends for Selected Location */}
        <section ref={historySectionRef} className="space-y-3">
          <HistoricalTrends
            location={selectedLocation}
            extendedHistory={extendedHistory}
            isLoadingHistory={isLoadingHistory}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />
        </section>

        {/* Section 4: Pollutant Spectrum Breakdown */}
        {selectedLocation && (
          <section className="space-y-3">
            <PollutantBreakdown
              pollutants={selectedLocation.current.pollutants}
              locationName={selectedLocation.name}
              onOpenGuide={() => setGuideModalOpen(true)}
            />
          </section>
        )}

        {/* Section 5: Global Leaderboard (Cleanest vs Polluted Metropolises) */}
        <section ref={leaderboardSectionRef} className="space-y-3">
          <GlobalLeaderboard
            stations={stations}
            onSelectCity={handleSelectCity}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 font-display">AetherAir Monitor</span>
            <span>·</span>
            <span>Open-access atmospheric modeling powered by Open-Meteo & Copernicus Atmosphere Service</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setGuideModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              EPA & WHO Standards
            </button>
            <button
              onClick={() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Back to Map
            </button>
          </div>
        </div>
      </footer>

      {/* Educational Guide Modal */}
      <PollutantGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

    </div>
  );
}
