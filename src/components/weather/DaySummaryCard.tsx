import React from 'react';
import { CloudRain, Compass, Thermometer, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

export const DaySummaryCard: React.FC = () => {
  const { currentWeather, dailyForecast, metrics, formatTemp, isLoading, t } = useWeather();

  const todaySummary = dailyForecast[0]?.summary || 
    `${currentWeather.condition} conditions today with temperature around ${formatTemp(currentWeather.temperature)}.`;

  const estimatedRainfall = metrics.rainProbability > 0 
    ? `${Math.round(metrics.rainProbability * 0.25)} mm` 
    : '0 mm';

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg animate-pulse">
        <div className="border-b border-slate-800 pb-3 space-y-2">
          <div className="h-5 bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-800/60 rounded w-3/4" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-950/70 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg transition-all duration-300">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100">
          {t('daySummary')}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed mt-1">
          {todaySummary}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between proximity-card">
          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Highest</span>
            <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">
              {formatTemp(currentWeather.highTemp)}
            </span>
          </div>
          <Thermometer className="w-5 h-5 text-amber-400/80" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between proximity-card">
          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Lowest</span>
            <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">
              {formatTemp(currentWeather.lowTemp)}
            </span>
          </div>
          <Thermometer className="w-5 h-5 text-cyan-400/80" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between proximity-card">
          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Total Rainfall</span>
            <span className="text-base font-bold text-blue-400 font-mono mt-0.5 block">
              {estimatedRainfall}
            </span>
          </div>
          <CloudRain className="w-5 h-5 text-blue-400/80" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between proximity-card">
          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Max Wind</span>
            <span className="text-base font-bold text-indigo-400 font-mono mt-0.5 block">
              {metrics.windSpeed} km/h
            </span>
          </div>
          <Wind className="w-5 h-5 text-indigo-400/80" />
        </div>
      </div>
    </div>
  );
};
