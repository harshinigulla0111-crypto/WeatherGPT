import React, { createContext, useContext, useEffect, useState } from 'react';
import { LOCATIONS_LIST, WeatherService } from '../services/weatherService';
import type { AppStateMode } from '../types/disaster';
import type { CropType, SpecializedMode } from '../types/specialized';
import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  LocationData,
  WeatherAlert,
  WeatherDNAData,
  WeatherMetricsData
} from '../types/weather';

export type ThemeMode = 'dark' | 'light';

interface WeatherContextType {
  appMode: AppStateMode;
  setAppMode: (mode: AppStateMode) => void;
  toggleDemoFloodMode: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  selectedLocation: LocationData;
  setSelectedLocation: (loc: LocationData) => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  speedUnit: 'kmh' | 'mph';
  setSpeedUnit: (unit: 'kmh' | 'mph') => void;
  specializedMode: SpecializedMode;
  setSpecializedMode: (mode: SpecializedMode) => void;
  selectedCrop: CropType;
  setSelectedCrop: (crop: CropType) => void;

  // Live Weather State
  currentWeather: CurrentWeather;
  hourlyForecast: HourlyForecastItem[];
  dailyForecast: DailyForecastItem[];
  metrics: WeatherMetricsData;
  weatherDNA: WeatherDNAData;
  weatherAlerts: WeatherAlert[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetchWeather: () => Promise<void>;

  // Temperature Formatting Helpers
  convertTemp: (celsius: number) => number;
  formatTemp: (celsius: number) => string;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppStateMode>('NORMAL');
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('weathergpt_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const DEFAULT_FALLBACK_LOCATION: LocationData = {
    id: 'vijayawada',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    country: 'India',
    latitude: 16.5062,
    longitude: 80.6480
  };

  const [selectedLocation, setSelectedLocationState] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem('weathergpt_selected_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.latitude && parsed.longitude) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_FALLBACK_LOCATION;
  });

  const setSelectedLocation = (loc: LocationData) => {
    setSelectedLocationState(loc);
    try {
      localStorage.setItem('weathergpt_selected_location', JSON.stringify(loc));
    } catch (e) {
      // ignore
    }
  };
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>('kmh');
  const [specializedMode, setSpecializedMode] = useState<SpecializedMode>('STANDARD');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('Rice');

  // Live Weather Data States
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(() =>
    WeatherService.getCurrentWeather('vijayawada')
  );
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>(() =>
    WeatherService.getHourlyForecast('vijayawada')
  );
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>(() =>
    WeatherService.getDailyForecast('vijayawada')
  );
  const [metrics, setMetrics] = useState<WeatherMetricsData>(() =>
    WeatherService.getMetrics('vijayawada')
  );
  const [weatherDNA, setWeatherDNA] = useState<WeatherDNAData>(() =>
    WeatherService.getWeatherDNA('vijayawada')
  );
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('weathergpt_theme', mode);
    if (mode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeMode]);

  const toggleDemoFloodMode = () => {
    if (appMode === 'DISASTER') {
      setAppMode('NORMAL');
    } else {
      setAppMode('DISASTER');
    }
  };

  // Asynchronously fetch real live weather data whenever selectedLocation changes
  const fetchLiveData = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const lat = selectedLocation.latitude;
      const lon = selectedLocation.longitude;
      const city = selectedLocation.city;

      const [cur, hourly, daily, met, alerts] = await Promise.all([
        WeatherService.fetchCurrentWeather(lat, lon, city),
        WeatherService.fetchHourlyForecast(lat, lon),
        WeatherService.fetchDailyForecast(lat, lon),
        WeatherService.fetchWeatherMetrics(lat, lon),
        WeatherService.fetchWeatherAlerts(lat, lon)
      ]);

      setCurrentWeather(cur);
      setHourlyForecast(hourly);
      setDailyForecast(daily);
      setMetrics(met);
      setWeatherAlerts(alerts);
      setWeatherDNA(WeatherService.getWeatherDNA(selectedLocation.id));

      // Dynamic Risk Mode Trigger based on live API metrics & alerts
      const hasSevereAlert = alerts && alerts.length > 0;
      const isHighRainRisk = met.rainProbability >= 70 || cur.condition === 'Thunderstorm' || cur.condition === 'Heavy Rain';
      const isHighWindRisk = met.windSpeed >= 40;

      if (appMode !== 'DISASTER') {
        if (hasSevereAlert || isHighRainRisk || isHighWindRisk) {
          setAppMode('RISK');
        } else {
          setAppMode('NORMAL');
        }
      }
    } catch (err: any) {
      console.error('[WeatherContext] Error fetching live weather data:', err);
      setIsError(true);
      setErrorMessage(err.message || 'Failed to fetch weather data for selected location.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, [selectedLocation]);

  const convertTemp = (celsius: number): number => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const formatTemp = (celsius: number): string => {
    return `${convertTemp(celsius)}°${tempUnit}`;
  };

  return (
    <WeatherContext.Provider
      value={{
        appMode,
        setAppMode,
        toggleDemoFloodMode,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        selectedLocation,
        setSelectedLocation,
        tempUnit,
        setTempUnit,
        speedUnit,
        setSpeedUnit,
        specializedMode,
        setSpecializedMode,
        selectedCrop,
        setSelectedCrop,

        currentWeather,
        hourlyForecast,
        dailyForecast,
        metrics,
        weatherDNA,
        weatherAlerts,
        isLoading,
        isError,
        errorMessage,
        refetchWeather: fetchLiveData,

        convertTemp,
        formatTemp
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
