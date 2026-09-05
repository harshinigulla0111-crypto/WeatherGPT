import React, { useState } from 'react';
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import type { WeatherCondition } from '../../types/weather';

export const HourlyForecast: React.FC = () => {
  const { hourlyForecast, formatTemp, t } = useWeather();
  const [activeMetric, setActiveMetric] = useState<'temp' | 'rain' | 'wind'>('temp');

  const getConditionIcon = (condition: WeatherCondition) => {
    switch (condition) {
      case 'Sunny':
      case 'Clear':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Rain':
      case 'Heavy Rain':
      case 'Light Rain':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'Cloudy':
        return <Cloud className="w-5 h-5 text-slate-400" />;
      default:
        return <CloudSun className="w-5 h-5 text-cyan-300" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            {t('todayTimeline')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('hourlyForecast')}
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeMetric === 'temp'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('temperature')}
          </button>
          <button
            onClick={() => setActiveMetric('rain')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeMetric === 'rain'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('rain')}
          </button>
          <button
            onClick={() => setActiveMetric('wind')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeMetric === 'wind'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('wind')}
          </button>
        </div>
      </div>

      {/* Horizontal Timeline Scroll View */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
        {hourlyForecast.map((item, idx) => (
          <div
            key={idx}
            className={`min-w-[100px] flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center justify-between gap-2.5 text-center proximity-card ${
              idx === 0
                ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500/50 text-white font-bold shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-200'
            }`}
          >
            <span className="text-xs font-semibold text-slate-400">
              {idx === 0 ? 'Now' : item.time}
            </span>

            <div className="my-1">{getConditionIcon(item.condition)}</div>

            {/* Display metric based on active tab */}
            {activeMetric === 'temp' && (
              <span className="text-lg font-bold text-slate-100 font-mono">
                {formatTemp(item.temperature)}
              </span>
            )}

            {activeMetric === 'rain' && (
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 font-mono">
                <Droplets className="w-3.5 h-3.5" />
                <span>{item.precipitationProb}%</span>
              </div>
            )}

            {activeMetric === 'wind' && (
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 font-mono">
                <Wind className="w-3.5 h-3.5" />
                <span>{item.windSpeed} km/h</span>
              </div>
            )}

            <span className="text-[10px] text-slate-400 font-medium truncate max-w-full">
              {item.condition}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
