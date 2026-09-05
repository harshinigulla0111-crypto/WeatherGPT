import React from 'react';
import { Activity, CloudRain, CloudSun, Compass, Droplets, Sun, Sunrise, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { DynamicWeatherBackground } from './DynamicWeatherBackground';

export const WeatherHero: React.FC = () => {
  const { currentWeather, selectedLocation, metrics, formatTemp, appMode, themeMode, t } = useWeather();
  const isDisaster = appMode === 'DISASTER';
  const isRisk = appMode === 'RISK';

  const getWeatherIllustration = () => {
    switch (currentWeather.condition) {
      case 'Rain':
      case 'Heavy Rain':
      case 'Light Rain':
        return (
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-3xl animate-pulse" />
            <CloudRain className="w-28 h-28 sm:w-36 sm:h-36 text-cyan-300 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-bounce" />
          </div>
        );
      case 'Sunny':
        return (
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
            <Sun className="w-28 h-28 sm:w-36 sm:h-36 text-amber-300 drop-shadow-[0_0_35px_rgba(245,158,11,0.9)] animate-spin-slow" />
          </div>
        );
      default:
        return (
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-3xl animate-pulse" />
            <CloudSun className="w-28 h-28 sm:w-36 sm:h-36 text-cyan-200 drop-shadow-[0_0_30px_rgba(56,189,248,0.8)]" />
          </div>
        );
    }
  };

  return (
    <div
      className={`hero-weather-card relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-500 shadow-2xl ${
        isDisaster
          ? 'border-2 border-red-600/80 shadow-red-950/60'
          : isRisk
          ? 'border-2 border-amber-500/80 shadow-amber-950/50'
          : 'border border-slate-700/60 shadow-cyan-950/40'
      }`}
    >
      {/* Dynamic Live Climate Wallpaper Background Layer */}
      <DynamicWeatherBackground
        condition={currentWeather.condition}
        appMode={appMode}
        themeMode={themeMode}
        sunrise={metrics.sunrise}
        sunset={metrics.sunset}
      />

      {/* Main Card Content Layer */}
      <div className="relative z-10 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-0.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedLocation.city}, {selectedLocation.state || selectedLocation.country}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {t('yourWeatherToday')}
            </h1>
          </div>

          <span className="text-xs text-slate-200 font-semibold bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 self-start sm:self-auto shadow-sm">
            {t('updated')} {currentWeather.updatedAt}
          </span>
        </div>

        {/* Main Temperature & Illustration Hero Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-7xl sm:text-9xl font-black tracking-tighter text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                {formatTemp(currentWeather.temperature)}
              </span>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                  {t(currentWeather.condition) || currentWeather.condition}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1 drop-shadow-sm">
                  {t('feelsLike')} {formatTemp(currentWeather.feelsLike)}
                </div>
              </div>
            </div>
          </div>

          <div className="self-center md:self-auto">
            {getWeatherIllustration()}
          </div>
        </div>

        {/* Compact Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Humidity */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('humidity')}</span>
            </div>
            <span className="text-lg font-bold text-white font-mono mt-1">
              {metrics.humidity}%
            </span>
          </div>

          {/* Wind */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('wind')}</span>
            </div>
            <span className="text-lg font-bold text-white font-mono mt-1">
              {metrics.windSpeed} km/h {metrics.windDirection}
            </span>
          </div>

          {/* Rain Probability */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t('rainProbability')}</span>
            </div>
            <span className="text-lg font-bold text-cyan-300 font-mono mt-1">
              {metrics.rainProbability}%
            </span>
          </div>

          {/* UV Index */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('uvIndex')}</span>
            </div>
            <span className="text-lg font-bold text-amber-300 font-mono mt-1">
              {metrics.uvIndex} ({metrics.uvDescription})
            </span>
          </div>

          {/* AQI */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('airQuality')}</span>
            </div>
            <span className="text-lg font-bold text-emerald-300 font-mono mt-1">
              {metrics.aqi} ({metrics.aqiDescription})
            </span>
          </div>

          {/* Sunrise / Sunset */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Sunrise className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('sunCycle')}</span>
            </div>
            <div className="text-xs font-bold text-white font-mono mt-1">
              {metrics.sunrise} / {metrics.sunset}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
