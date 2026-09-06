import React from 'react';
import { Activity, AlertTriangle, CloudRain, Compass, Droplets, ShieldAlert, Sun, Sunrise, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { DynamicWeatherBackground } from './DynamicWeatherBackground';

export const WeatherHero: React.FC = () => {
  const { currentWeather, selectedLocation, metrics, formatTemp, appMode, themeMode, t } = useWeather();
  const isDisaster = appMode === 'DISASTER';
  const isRisk = appMode === 'RISK';

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
        temperature={currentWeather.temperature}
        appMode={appMode}
        themeMode={themeMode}
        sunrise={metrics.sunrise}
        sunset={metrics.sunset}
      />

      {/* Main Card Content Layer */}
      <div className="relative z-10 space-y-6">
        {/* Risk Mode Alert Banner with red High Risk badge */}
        {isRisk && (
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/85 border border-amber-500/50 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 text-amber-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm animate-pulse tracking-wider font-mono">
                    HIGH RISK
                  </span>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    WEATHER RISK ALERT
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium mt-0.5">
                  Precipitation surplus & wind gusts expected in your sector. Precautionary readiness active.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rescue Mode Alert Banner with Extreme Danger badge */}
        {isDisaster && (
          <div className="p-3 sm:p-4 rounded-2xl bg-red-950/90 border-2 border-red-500 shadow-2xl shadow-red-950/80 backdrop-blur-xl flex items-center justify-between gap-3 text-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white font-black shadow-md shadow-red-600/40 animate-bounce shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm animate-pulse tracking-wider font-mono border border-red-400">
                    EXTREME DANGER
                  </span>
                  <span className="text-xs font-bold text-red-200 uppercase tracking-wider font-mono">
                    CRITICAL WEATHER ALERT
                  </span>
                </div>
                <p className="text-xs text-white font-medium mt-0.5">
                  Flash flood threat & active storm surge in your sector. Emergency response teams mobilized.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider-label mb-0.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedLocation.city}, {selectedLocation.state || selectedLocation.country}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md font-display">
              {t('yourWeatherToday')}
            </h1>
          </div>

          <span className="text-xs text-slate-200 font-semibold bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 self-start sm:self-auto shadow-sm tracking-wider-label">
            {t('updated')} {currentWeather.updatedAt}
          </span>
        </div>

        {/* Main Temperature & Illustration Hero Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-7xl sm:text-9xl font-black display-number text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
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

          {/* Atmospheric Status & Range Glass Badge (Leaves animated scene dominant) */}
          <div className="self-start md:self-center">
            <div className="px-5 py-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-3.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    Live Animated Scene
                  </span>
                </div>
                <div className="text-base font-bold text-white tracking-tight">
                  {currentWeather.condition}
                </div>
                <div className="text-xs font-semibold text-cyan-200/90 font-mono">
                  H: {formatTemp(currentWeather.highTemp)} <span className="opacity-50">|</span> L: {formatTemp(currentWeather.lowTemp)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Weather Metrics Grid with Translucent Glassmorphism */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Humidity */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card hover:bg-black/35 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('humidity')}</span>
            </div>
            <span className="text-lg font-bold text-white display-number mt-1 drop-shadow-sm">
              {metrics.humidity}%
            </span>
          </div>

          {/* Wind */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card hover:bg-black/35 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('wind')}</span>
            </div>
            <span className="text-lg font-bold text-white display-number mt-1 drop-shadow-sm">
              {metrics.windSpeed} km/h {metrics.windDirection}
            </span>
          </div>

          {/* Rain Probability */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card hover:bg-black/35 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t('rainProbability')}</span>
            </div>
            <span className="text-lg font-bold text-cyan-300 display-number mt-1 drop-shadow-sm">
              {metrics.rainProbability}%
            </span>
          </div>

          {/* UV Index */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card hover:bg-black/35 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('uvIndex')}</span>
            </div>
            <span className="text-lg font-bold text-amber-300 display-number mt-1 drop-shadow-sm">
              {metrics.uvIndex} ({metrics.uvDescription})
            </span>
          </div>

          {/* AQI */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card hover:bg-black/35 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('airQuality')}</span>
            </div>
            <span className="text-lg font-bold text-emerald-300 display-number mt-1 drop-shadow-sm">
              {metrics.aqi} ({metrics.aqiDescription})
            </span>
          </div>

          {/* Sunrise / Sunset */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col justify-between shadow-lg proximity-card hover:bg-black/35 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Sunrise className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('sunCycle')}</span>
            </div>
            <div className="text-xs font-bold text-white display-number mt-1 drop-shadow-sm">
              {metrics.sunrise} / {metrics.sunset}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
