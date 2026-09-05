import React from 'react';
import { Activity, Compass, Droplets, Eye, Gauge, CloudRain, Sunrise, Sunset, SunMedium, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

export const WeatherMetrics: React.FC = () => {
  const { metrics, t } = useWeather();

  const metricCards = [
    {
      id: 'humidity',
      label: t('humidity'),
      value: `${metrics.humidity}%`,
      subtitle: 'High moisture level',
      icon: <Droplets className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'wind',
      label: t('wind'),
      value: `${metrics.windSpeed} km/h`,
      subtitle: `Direction ${metrics.windDirection}`,
      icon: <Wind className="w-5 h-5 text-blue-400" />
    },
    {
      id: 'uv',
      label: t('uvIndex'),
      value: `${metrics.uvIndex}`,
      subtitle: metrics.uvDescription,
      icon: <SunMedium className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'visibility',
      label: t('visibility'),
      value: `${metrics.visibility} km`,
      subtitle: 'Clear distance',
      icon: <Eye className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'pressure',
      label: t('pressure'),
      value: `${metrics.pressure} hPa`,
      subtitle: 'Stable atmospheric',
      icon: <Gauge className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'aqi',
      label: t('airQuality'),
      value: `${metrics.aqi}`,
      subtitle: metrics.aqiDescription,
      icon: <Activity className="w-5 h-5 text-green-400" />
    },
    {
      id: 'rain-prob',
      label: t('rainProbability'),
      value: `${metrics.rainProbability}%`,
      subtitle: 'Peak after 3 PM',
      icon: <CloudRain className="w-5 h-5 text-cyan-300" />
    },
    {
      id: 'sun-times',
      label: t('sunCycle'),
      value: `${metrics.sunrise}`,
      subtitle: `${t('sunset')}: ${metrics.sunset}`,
      icon: <Sunrise className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-400 font-medium">
        {t('weatherMetrics')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {metricCards.map((card) => (
          <div
            key={card.id}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/80 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.label}</span>
              <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
