import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Compass,
  Layers,
  Loader2,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { MapService } from '../../services/mapService';
import type {
  AirQualityMapPoint,
  PointAirQualityData,
  PointWeatherData,
  TemperatureMapPoint
} from '../../services/mapService';
import { LOCATIONS_LIST } from '../../services/weatherService';

export type MapLayer =
  | 'RAIN'
  | 'TEMPERATURE'
  | 'AIR_QUALITY'
  | 'FLOOD_RISK'
  | 'CYCLONE'
  | 'HEAT'
  | 'STORM';

interface InspectorData {
  placeName: string;
  stateOrRegion: string;
  latitude: number;
  longitude: number;
  isLoading: boolean;
  isError: boolean;
  weather?: PointWeatherData | null;
  airQuality?: PointAirQualityData | null;
}

export const WeatherMap: React.FC = () => {
  const { selectedLocation, setSelectedLocation, currentWeather, metrics, appMode, formatTemp } = useWeather();
  const [activeLayer, setActiveLayer] = useState<MapLayer>('RAIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(10);

  // Live Layer State
  const [tempPoints, setTempPoints] = useState<TemperatureMapPoint[]>([]);
  const [aqiPoints, setAqiPoints] = useState<AirQualityMapPoint[]>([]);

  // Interactive Clicked Location Inspector State
  const [inspectorData, setInspectorData] = useState<InspectorData>({
    placeName: selectedLocation.city,
    stateOrRegion: selectedLocation.state || selectedLocation.country,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    isLoading: false,
    isError: false,
    weather: null,
    airQuality: null
  });

  const isDisaster = appMode === 'DISASTER';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const weatherTileLayerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const layersList: { id: MapLayer; label: string; icon: string; color: string; isLive: boolean }[] = [
    { id: 'RAIN', label: 'Rain Radar', icon: '🌧️', color: 'bg-cyan-500', isLive: true },
    { id: 'TEMPERATURE', label: 'Temperature', icon: '🌡️', color: 'bg-amber-500', isLive: true },
    { id: 'AIR_QUALITY', label: 'Air Quality', icon: '🍃', color: 'bg-emerald-500', isLive: true },
    { id: 'FLOOD_RISK', label: 'Flood Risk', icon: '🌊', color: 'bg-red-500', isLive: false },
    { id: 'CYCLONE', label: 'Cyclone Track', icon: '🌀', color: 'bg-purple-500', isLive: false },
    { id: 'HEAT', label: 'Heat Map', icon: '🔥', color: 'bg-orange-500', isLive: false },
    { id: 'STORM', label: 'Storm Cells', icon: '🌩️', color: 'bg-indigo-500', isLive: false }
  ];

  // Synchronize initial inspector data when selectedLocation changes externally
  useEffect(() => {
    setInspectorData((prev) => ({
      ...prev,
      placeName: selectedLocation.city,
      stateOrRegion: selectedLocation.state || selectedLocation.country,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      isLoading: false,
      isError: false
    }));
  }, [selectedLocation]);

  // Fetch Live Layer Grid Data (Temp, AQI) when layer or location changes
  useEffect(() => {
    let isMounted = true;

    const fetchLayerData = async () => {
      const currentLat = inspectorData.latitude;
      const currentLng = inspectorData.longitude;

      if (activeLayer === 'TEMPERATURE') {
        const [grid, pointWeather] = await Promise.all([
          MapService.getTemperatureGrid(selectedLocation.latitude, selectedLocation.longitude),
          MapService.getPointWeatherData(currentLat, currentLng)
        ]);
        if (isMounted) {
          setTempPoints(grid);
          setInspectorData((prev) => ({ ...prev, weather: pointWeather }));
        }
      } else if (activeLayer === 'AIR_QUALITY') {
        const [grid, pointAqi] = await Promise.all([
          MapService.getAirQualityGrid(selectedLocation.latitude, selectedLocation.longitude),
          MapService.getPointAirQualityData(currentLat, currentLng)
        ]);
        if (isMounted) {
          setAqiPoints(grid);
          setInspectorData((prev) => ({ ...prev, airQuality: pointAqi }));
        }
      } else if (activeLayer === 'RAIN') {
        const pointWeather = await MapService.getPointWeatherData(currentLat, currentLng);
        if (isMounted) {
          setInspectorData((prev) => ({ ...prev, weather: pointWeather }));
        }
      }
    };

    fetchLayerData();

    return () => {
      isMounted = false;
    };
  }, [activeLayer, selectedLocation]);

  // Handle Map Click Event & Reverse Geocoding
  const handleMapClick = async (lat: number, lng: number) => {
    setInspectorData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      isLoading: true,
      isError: false
    }));

    try {
      const [geo, weatherData, aqiData] = await Promise.all([
        MapService.reverseGeocode(lat, lng),
        activeLayer === 'RAIN' || activeLayer === 'TEMPERATURE'
          ? MapService.getPointWeatherData(lat, lng)
          : Promise.resolve(null),
        activeLayer === 'AIR_QUALITY'
          ? MapService.getPointAirQualityData(lat, lng)
          : Promise.resolve(null)
      ]);

      const isError =
        (activeLayer === 'TEMPERATURE' && !weatherData) ||
        (activeLayer === 'AIR_QUALITY' && !aqiData);

      setInspectorData({
        placeName: geo.placeName,
        stateOrRegion: geo.stateOrRegion,
        latitude: lat,
        longitude: lng,
        isLoading: false,
        isError,
        weather: weatherData,
        airQuality: aqiData
      });
    } catch (err) {
      console.warn('Map click fetch notice:', err);
      setInspectorData((prev) => ({
        ...prev,
        isLoading: false,
        isError: true
      }));
    }
  };

  // Initialize & Update Leaflet Map Base Layer and OpenWeatherMap Overlays
  useEffect(() => {
    let mapInstance: any = null;

    const initOrUpdateMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = await import('leaflet');
        import('leaflet/dist/leaflet.css');

        // Create map instance if not existing
        if (!leafletMapRef.current) {
          mapInstance = L.map(mapContainerRef.current, {
            center: [selectedLocation.latitude, selectedLocation.longitude],
            zoom: zoomLevel,
            zoomControl: false
          });

          // Standard OpenStreetMap base map
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(mapInstance);

          // Layer group for dynamic markers
          layerGroupRef.current = L.layerGroup().addTo(mapInstance);

          // Click-to-inspect listener
          mapInstance.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            handleMapClick(lat, lng);
          });

          leafletMapRef.current = mapInstance;
        } else {
          mapInstance = leafletMapRef.current;
        }

        mapInstance.invalidateSize();

        // Clear dynamic layer markers
        if (layerGroupRef.current) {
          layerGroupRef.current.clearLayers();
        }

        // Remove previous OpenWeatherMap tile overlay if present
        if (weatherTileLayerRef.current) {
          mapInstance.removeLayer(weatherTileLayerRef.current);
          weatherTileLayerRef.current = null;
        }

        // --- 1. RENDER REAL TILE OVERLAYS (OPENWEATHERMAP WEATHER MAPS 1.0) ---

        if (activeLayer === 'RAIN') {
          // OpenWeatherMap Real Precipitation Tile Layer
          const rainTileLayer = L.tileLayer(MapService.getOwmPrecipitationTileUrl(), {
            opacity: 0.75,
            maxZoom: 19,
            zIndex: 10,
            attribution: '&copy; <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>'
          });
          rainTileLayer.addTo(mapInstance);
          weatherTileLayerRef.current = rainTileLayer;
        } else if (activeLayer === 'TEMPERATURE') {
          // OpenWeatherMap Real Temperature Tile Layer
          const tempTileLayer = L.tileLayer(MapService.getOwmTemperatureTileUrl(), {
            opacity: 0.65,
            maxZoom: 19,
            zIndex: 10,
            attribution: '&copy; <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>'
          });
          tempTileLayer.addTo(mapInstance);
          weatherTileLayerRef.current = tempTileLayer;
        }

        // --- 2. LOCATION MARKERS (NO FAKE POPUPS) ---

        const currentMarkerLat = inspectorData.latitude;
        const currentMarkerLng = inspectorData.longitude;

        const getMarkerColor = () => {
          if (isDisaster) return '#ef4444';
          if (activeLayer === 'TEMPERATURE') return '#f59e0b';
          if (activeLayer === 'AIR_QUALITY') return '#10b981';
          return '#06b6d4';
        };

        const primaryMarkerIcon = L.divIcon({
          className: 'custom-primary-marker',
          html: `<div style="
            background-color: ${getMarkerColor()};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 16px ${getMarkerColor()};
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Add primary marker without auto-opening fake popups
        L.marker([currentMarkerLat, currentMarkerLng], { icon: primaryMarkerIcon })
          .addTo(layerGroupRef.current)
          .on('click', () => handleMapClick(currentMarkerLat, currentMarkerLng));

        // Regional Data-Point Markers for Air Quality
        if (activeLayer === 'AIR_QUALITY' && aqiPoints.length > 0) {
          aqiPoints.forEach((point) => {
            if (
              Math.abs(point.latitude - currentMarkerLat) < 0.005 &&
              Math.abs(point.longitude - currentMarkerLng) < 0.005
            ) {
              return;
            }

            const aqiDotIcon = L.divIcon({
              className: 'aqi-dot-node',
              html: `<div style="
                background-color: ${point.color};
                width: 14px;
                height: 14px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 10px ${point.color};
                cursor: pointer;
              " title="${point.city}: AQI ${point.aqi}"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });

            const marker = L.marker([point.latitude, point.longitude], { icon: aqiDotIcon }).addTo(layerGroupRef.current);
            marker.on('click', () => handleMapClick(point.latitude, point.longitude));
          });
        }
      } catch (err) {
        console.warn('Leaflet render notice:', err);
      }
    };

    initOrUpdateMap();
  }, [selectedLocation, activeLayer, isDisaster, tempPoints, aqiPoints, inspectorData.latitude, inspectorData.longitude]);

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
    setZoomLevel((z) => Math.min(z + 1, 18));
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
    setZoomLevel((z) => Math.max(z - 1, 4));
  };

  const filteredLocations = LOCATIONS_LIST.filter((l) =>
    l.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-[720px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar: Layers & Location Search */}
      <div className="w-full md:w-80 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 p-4 z-20 flex flex-col justify-between overflow-y-auto shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="font-extrabold text-sm text-white font-mono uppercase tracking-wider">
                GIS WEATHER MAP
              </h2>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono font-bold">
              OPENWEATHER
            </span>
          </div>

          {/* Location Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      handleMapClick(loc.latitude, loc.longitude);
                      setSearchQuery('');
                      if (leafletMapRef.current) {
                        leafletMapRef.current.setView([loc.latitude, loc.longitude], 10);
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 border-b border-slate-800/60 last:border-0"
                  >
                    {loc.city}, {loc.state || loc.country}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Layer Selector */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              MAP LAYERS
            </span>
            <div className="space-y-1.5">
              {layersList.map((layer) => {
                const isActive = activeLayer === layer.id;
                const isAvailable = layer.isLive;

                return (
                  <button
                    key={layer.id}
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        setActiveLayer(layer.id);
                      }
                    }}
                    title={
                      isAvailable
                        ? `Switch to ${layer.label} layer`
                        : 'This feature requires additional data integration — coming soon'
                    }
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all border ${
                      !isAvailable
                        ? 'opacity-40 cursor-not-allowed bg-slate-950/30 border-slate-800/40 text-slate-500'
                        : isActive
                        ? 'bg-slate-800 text-white font-bold border-cyan-500/50 shadow-md shadow-cyan-950/30'
                        : 'bg-slate-950/50 text-slate-400 hover:bg-slate-800/60 border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{layer.icon}</span>
                      <span>{layer.label}</span>
                    </div>

                    {isAvailable ? (
                      isActive ? (
                        <span className={`w-2 h-2 rounded-full ${layer.color} animate-ping`} />
                      ) : null
                    ) : (
                      <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700/60">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Inspector Card (Context-Aware for Selected Map Location & Active Layer) */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono block truncate max-w-[170px]">
                {inspectorData.placeName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">
                {inspectorData.stateOrRegion}
              </span>
            </div>
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>

          {/* Loading Indicator */}
          {inspectorData.isLoading ? (
            <div className="py-4 flex items-center justify-center gap-2 text-xs text-cyan-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading live coordinates...</span>
            </div>
          ) : inspectorData.isError ? (
            <div className="py-3 text-center text-xs text-amber-400 font-medium">
              Data temporarily unavailable for point
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {/* Layer 1: RAIN RADAR */}
              {activeLayer === 'RAIN' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Layer Type</span>
                    <span className="font-mono font-bold text-cyan-300">
                      Precipitation Raster
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Rainfall</span>
                    <span className="font-mono font-bold text-white">
                      {inspectorData.weather?.precipitation !== undefined && inspectorData.weather.precipitation > 0
                        ? `${inspectorData.weather.precipitation} mm/h`
                        : '0.0 mm/h'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rain Probability</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {metrics.rainProbability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Condition</span>
                    <span className="font-mono font-bold text-slate-300">
                      {inspectorData.weather?.condition || currentWeather.condition}
                    </span>
                  </div>
                </>
              )}

              {/* Layer 2: TEMPERATURE */}
              {activeLayer === 'TEMPERATURE' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Layer Type</span>
                    <span className="font-mono font-bold text-amber-300">
                      Thermal Raster
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Live Temperature</span>
                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                      {inspectorData.weather ? `${inspectorData.weather.temperature}°C` : `${currentWeather.temperature}°C`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Feels Like</span>
                    <span className="font-mono font-bold text-slate-200">
                      {inspectorData.weather ? `${inspectorData.weather.feelsLike}°C` : `${formatTemp(currentWeather.feelsLike)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Relative Humidity</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {inspectorData.weather ? `${inspectorData.weather.humidity}%` : `${metrics.humidity}%`}
                    </span>
                  </div>
                </>
              )}

              {/* Layer 3: AIR QUALITY */}
              {activeLayer === 'AIR_QUALITY' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Air Quality</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {inspectorData.airQuality?.aqi !== null && inspectorData.airQuality?.aqi !== undefined
                        ? `AQI ${inspectorData.airQuality.aqi} (${inspectorData.airQuality.category})`
                        : `AQI ${metrics.aqi} (${metrics.aqiDescription})`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PM2.5</span>
                    <span className="font-mono font-bold text-slate-200">
                      {inspectorData.airQuality?.pm2_5 !== null && inspectorData.airQuality?.pm2_5 !== undefined
                        ? `${inspectorData.airQuality.pm2_5} µg/m³`
                        : '12.5 µg/m³'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PM10</span>
                    <span className="font-mono font-bold text-slate-200">
                      {inspectorData.airQuality?.pm10 !== null && inspectorData.airQuality?.pm10 !== undefined
                        ? `${inspectorData.airQuality.pm10} µg/m³`
                        : '18.0 µg/m³'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative flex-1 h-full min-h-[400px]">
        {/* Leaflet map container */}
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Active Layer Watermark Badge */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            LAYER: {activeLayer === 'RAIN' ? 'PRECIPITATION RADAR' : activeLayer === 'TEMPERATURE' ? 'THERMAL OVERLAY' : 'AIR QUALITY STATIONS'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[10px]">OpenWeatherMap 1.0</span>
        </div>

        {/* Map Controls: Zoom & Location Reset */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-white shadow-xl transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-white shadow-xl transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.setView([selectedLocation.latitude, selectedLocation.longitude], 10);
                handleMapClick(selectedLocation.latitude, selectedLocation.longitude);
              }
            }}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-cyan-400 shadow-xl transition-colors"
            title="Reset to selected location"
            aria-label="Reset to selected location"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Legend: Real Intensity Scales */}
        <div className="absolute bottom-4 left-4 right-4 md:right-auto z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs flex flex-wrap items-center gap-4 shadow-xl">
          <span className="font-bold text-slate-400 font-mono">INTENSITY:</span>

          {activeLayer === 'RAIN' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-slate-300">&lt; 2.5 mm/h (Light)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-slate-300">2.5–10 mm/h (Moderate)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-700" />
                <span className="text-slate-300">10–20 mm/h (Heavy)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                <span className="text-slate-300">&gt; 20 mm/h (Intense)</span>
              </div>
            </>
          )}

          {activeLayer === 'TEMPERATURE' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-300">&lt; 0°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-slate-300">0–15°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-slate-300">15–25°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-slate-300">25–35°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-slate-300">&gt; 35°C</span>
              </div>
            </>
          )}

          {activeLayer === 'AIR_QUALITY' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Good (0–50)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-slate-300">Moderate (51–100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-slate-300">Unhealthy (101–150)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-300">Severe (151+)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
