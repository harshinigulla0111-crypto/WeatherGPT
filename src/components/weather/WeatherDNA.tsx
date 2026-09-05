import React from 'react';
import { Dna, ShieldAlert, Sparkles } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

export const WeatherDNA: React.FC = () => {
  const { weatherDNA } = useWeather();

  const dnaItems = [
    { label: 'Flood Exposure', value: weatherDNA.floodExposure, color: 'text-amber-400 bg-amber-950/40 border-amber-800/60' },
    { label: 'Heat Exposure', value: weatherDNA.heatExposure, color: 'text-red-400 bg-red-950/40 border-red-800/60' },
    { label: 'Rain Sensitivity', value: weatherDNA.rainSensitivity, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60' },
    { label: 'Wind Exposure', value: weatherDNA.windExposure, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60' },
    { label: 'Landslide Exposure', value: weatherDNA.landslideExposure, color: 'text-slate-400 bg-slate-800/40 border-slate-700/60' }
  ];

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-900 border border-purple-500/20 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Dna className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Your Weather DNA
            </h2>
            <p className="text-xs text-purple-300/80 font-medium">
              Personalized geographical hazard risk fingerprint
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/60 border border-purple-800/80 px-2.5 py-1 rounded-full">
          Risk Profile ID: WDNA-AP806
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {dnaItems.map((item, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-between text-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">{item.label}</span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${item.color}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-purple-300">WeatherGPT Risk Insight:</strong> {weatherDNA.insightSummary}
        </p>
      </div>
    </div>
  );
};
