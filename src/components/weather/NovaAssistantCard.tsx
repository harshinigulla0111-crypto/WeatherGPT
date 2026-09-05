import React, { useState } from 'react';
import { Bot, Mic, Send, Sparkles } from 'lucide-react';
import { useNova } from '../../contexts/NovaContext';
import { useWeather } from '../../contexts/WeatherContext';

export const NovaAssistantCard: React.FC = () => {
  const { sendMessage, startVoiceListening, setIsOpen } = useNova();
  const { appMode } = useWeather();
  const [queryText, setQueryText] = useState('');
  const isDisaster = appMode === 'DISASTER';

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setIsOpen(true);
    sendMessage(queryText, isDisaster);
    setQueryText('');
  };

  return (
    <div className="nova-assistant-card p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-indigo-500/40 shadow-2xl space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full nova-orb-normal flex items-center justify-center border border-white/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">N.O.V.A. AI Assistant</h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Natural Observation & Virtual Assistant
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Assistant</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Ask N.O.V.A. any question about your daily schedule, rain windows, clothing, or emergency risks.
      </p>

      {/* Quick query bar */}
      <form onSubmit={handleQuerySubmit} className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={startVoiceListening}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-all shrink-0"
          title="Voice assistant"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder="Ask N.O.V.A: Should I travel at 4 PM?"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
        />

        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
