import React, { useEffect, useState } from 'react';
import { Calendar, Cloud, CloudRain, CloudSun, Droplets, Sun } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import type { DailyForecastItem, WeatherCondition } from '../../types/weather';

export const DailyForecast: React.FC = () => {
  const { dailyForecast, formatTemp, isLoading, t } = useWeather();
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem>(dailyForecast[0]);

  useEffect(() => {
    if (dailyForecast && dailyForecast.length > 0) {
      setSelectedDay(dailyForecast[0]);
    }
  }, [dailyForecast]);

  const getConditionIcon = (condition: WeatherCondition) => {
    switch (condition) {
      case 'Sunny':
      case 'Clear':
        return <Sun className="w-6 h-6 text-amber-400" />;
      case 'Rain':
      case 'Heavy Rain':
      case 'Thunderstorm':
        return <CloudRain className="w-6 h-6 text-cyan-400" />;
      case 'Cloudy':
        return <Cloud className="w-6 h-6 text-slate-400" />;
      case 'Light Rain':
        return <CloudRain className="w-6 h-6 text-cyan-300" />;
      default:
        return <CloudSun className="w-6 h-6 text-cyan-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-36 bg-slate-950/70 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {t('sevenDayForecast')}
            </h2>
            <p className="text-xs text-slate-400">
              Upcoming 7-day weather outlook
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Select day for details
        </span>
      </div>

      {/* Horizontal Scroll / Grid Container */}
      <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
        {dailyForecast.map((item, idx) => {
          const isSelected = selectedDay?.day === item.day;
          return (
            <div
              key={idx}
              onClick={() => setSelectedDay(item)}
              className={`flex-shrink-0 w-32 md:w-auto p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-between gap-2.5 border text-center proximity-card ${
                isSelected
                  ? 'bg-blue-500/15 text-slate-100 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
              }`}
            >
              {/* Day & Date */}
              <div>
                <span className={`block text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                  {item.day === 'TODAY' ? 'TODAY' : item.day}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                  {item.date}
                </span>
              </div>

              {/* Weather Icon */}
              <div className="p-2.5 rounded-full bg-slate-900/60 my-0.5 border border-slate-800/50">
                {getConditionIcon(item.condition)}
              </div>

              {/* Short Condition */}
              <span className="text-[11px] font-medium text-slate-300 line-clamp-1 h-4">
                {item.condition}
              </span>

              {/* Precipitation */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 font-mono bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>{item.precipitationProb}%</span>
              </div>

              {/* High / Low Temp */}
              <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold pt-2 border-t border-slate-800/60 w-full">
                <span className="text-slate-100">{formatTemp(item.highTemp)}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 font-normal">{formatTemp(item.lowTemp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
