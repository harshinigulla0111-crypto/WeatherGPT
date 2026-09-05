import React from 'react';
import { Activity, Car, Compass, Footprints, Shield, Shirt, Sun, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

export const LifestyleIndexCard: React.FC = () => {
  const { metrics } = useWeather();

  const lifestyleItems = [
    {
      id: 'activity',
      title: 'Outdoor Activity',
      status: 'Good',
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      recommendation: 'Go for it! Conditions comfortable until afternoon.',
      icon: <Footprints className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'travel',
      title: 'Travel',
      status: 'Moderate',
      statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      recommendation: 'Plan ahead. Rain probability rises after 3 PM.',
      icon: <Car className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'aqi',
      title: 'Air Quality',
      status: `${metrics.aqiDescription}`,
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      recommendation: `AQI ${metrics.aqi} - Clean air suitable for all activity.`,
      icon: <Activity className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'uv',
      title: 'UV Exposure',
      status: `${metrics.uvDescription}`,
      statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      recommendation: `UV Index ${metrics.uvIndex} - Wear sunscreen & hat.`,
      icon: <Sun className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'pollen',
      title: 'Pollen Level',
      status: 'Moderate',
      statusColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      recommendation: 'Low grass & tree pollen risk today.',
      icon: <Wind className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'clothing',
      title: 'Clothing',
      status: 'Light',
      statusColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      recommendation: 'Light breathable cotton recommended.',
      icon: <Shirt className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100">
          Lifestyle Index
        </h2>
        <p className="text-xs text-slate-400">
          Daily lifestyle advisories derived from atmospheric metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {lifestyleItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.statusColor}`}>
                {item.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              "{item.recommendation}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
