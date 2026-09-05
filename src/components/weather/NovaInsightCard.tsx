import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useNova } from '../../contexts/NovaContext';

export const NovaInsightCard: React.FC = () => {
  const { setIsOpen: setIsNovaOpen } = useNova();

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/30 via-slate-900/80 to-slate-900 border border-indigo-500/30 space-y-3 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>N.O.V.A. Insight</span>
        </div>
        <button
          onClick={() => setIsNovaOpen(true)}
          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <span>Ask N.O.V.A.</span>
          <Sparkles className="w-3 h-3" />
        </button>
      </div>

      <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
        “Rain chances increase significantly after 4 PM. The best time for outdoor activities is before afternoon.”
      </p>
    </div>
  );
};
