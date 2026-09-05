import React from 'react';
import { Activity, Car, CloudRain, Flame, Info } from 'lucide-react';
import { IntelligenceService } from '../../services/intelligenceService';

export const WeatherInsightsCard: React.FC = () => {
  const insights = IntelligenceService.getWeatherInsights();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Rain Pattern':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'Heat':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Air Quality':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Travel':
        return <Car className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-400 font-medium">
        Weather Insights
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {item.category}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-800/90 group-hover:scale-110 transition-transform">
                {getCategoryIcon(item.category)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              <p className="text-[11px] font-medium text-cyan-400 mt-0.5">{item.subtitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
