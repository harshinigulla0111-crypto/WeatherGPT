import React from 'react';
import { Car, Clock, Compass, Shirt, Sparkles, Umbrella } from 'lucide-react';
import { IntelligenceService } from '../../services/intelligenceService';
import type { WeatherIntelligenceDecision } from '../../types/weather';

export const WeatherIntelligenceCard: React.FC = () => {
  const decisions = IntelligenceService.getPersonalizedDecisions();

  const getDecisionIcon = (category: string) => {
    switch (category) {
      case 'umbrella':
        return <Umbrella className="w-5 h-5 text-cyan-400" />;
      case 'travel':
        return <Car className="w-5 h-5 text-amber-400" />;
      case 'clothing':
        return <Shirt className="w-5 h-5 text-purple-400" />;
      case 'activity':
        return <Clock className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-300" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/40 border border-cyan-500/20 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Your Weather Today
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Personalized guidance for your day
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decisions.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/90 transition-all flex items-start gap-3.5 group proximity-card"
          >
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform shrink-0">
              {getDecisionIcon(item.category)}
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
