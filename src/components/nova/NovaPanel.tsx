import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Mic,
  MicOff,
  Send,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useNova } from '../../contexts/NovaContext';
import { useWeather } from '../../contexts/WeatherContext';
import { VoiceWaveform } from './VoiceWaveform';

interface NovaPanelProps {
  onTriggerDangerWizard?: () => void;
}

export const NovaPanel: React.FC<NovaPanelProps> = ({ onTriggerDangerWizard }) => {
  const {
    isOpen,
    setIsOpen,
    orbState,
    messages,
    sendMessage,
    startVoiceListening,
    stopVoiceListening,
    isListening,
    voiceStatusText,
    permissionError,
    setPermissionError,
    isAutoSpeak,
    toggleAutoSpeak,
    isSpeaking,
    stopSpeaking,
    speakText,
    suggestedPrompts,
    clearHistory
  } = useNova();

  const { appMode, t } = useWeather();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isDisaster = appMode === 'DISASTER';

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText, isDisaster);
    setInputText('');
  };

  const handlePromptClick = (label: string) => {
    if (label === "I'M IN DANGER" && onTriggerDangerWizard) {
      onTriggerDangerWizard();
      return;
    }
    sendMessage(label, isDisaster);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden ${
        isDisaster
          ? 'bg-slate-950 border-red-800/80 shadow-red-950/80'
          : 'bg-slate-900/90 border-slate-700/80 shadow-cyan-950/50'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDisaster ? 'bg-red-950/80 border-red-800/80' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDisaster ? 'nova-orb-alert' : 'nova-orb-normal'
            }`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base font-mono">N.O.V.A.</h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  v3.6 AI ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {isDisaster ? "Emergency Voice & Intelligence Active" : "Natural Observation & Virtual Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-speak / Playback toggle control */}
            <button
              type="button"
              onClick={isSpeaking ? stopSpeaking : toggleAutoSpeak}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : isAutoSpeak
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
              title={isSpeaking ? 'Stop audio playback' : isAutoSpeak ? 'Auto-speak enabled (Click to mute)' : 'Auto-speak muted (Click to enable)'}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </>
              ) : isAutoSpeak ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline text-[11px]">{t('autoSpeak')}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Muted</span>
                </>
              )}
            </button>

            {/* Clear persistent chat history */}
            <button
              type="button"
              onClick={clearHistory}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-all"
              title={t('clearChat')}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Microphone Permission Denial Notification */}
        {permissionError && (
          <div className="p-3 bg-red-950/90 border-b border-red-800/80 text-red-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{permissionError}</span>
            </div>
            <button
              onClick={() => setPermissionError(null)}
              className="text-xs text-red-300 hover:underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Voice waveform / Status bar when Web Speech STT is active */}
        {orbState === 'LISTENING' && (
          <div className="bg-cyan-950/50 border-b border-cyan-800/50 p-2.5 text-center flex flex-col items-center gap-1 animate-in fade-in">
            <span className="text-xs text-cyan-300 font-bold tracking-wide">{voiceStatusText || t('listening')}</span>
            <VoiceWaveform isActive={true} />
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Bot className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {isDisaster ? t('safetyIsPriority') : t('tagline')}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t('tapToTalk')}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg relative group ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                    : msg.isEmergency
                    ? 'bg-red-950/90 border border-red-800 text-red-100 rounded-bl-none'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 mb-1 font-mono gap-4">
                  <span>{msg.sender === 'user' ? 'YOU' : 'N.O.V.A AI'}</span>
                  <div className="flex items-center gap-2">
                    {msg.sender === 'nova' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text)}
                        className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors"
                        title="Read response aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <p>{msg.text}</p>

                {/* Step-by-step action items for disaster responses */}
                {msg.actionItems && msg.actionItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-800/60 space-y-1.5 text-xs">
                    <span className="font-bold text-red-300 uppercase tracking-wider block text-[10px]">
                      RECOMMENDED ACTION STEPS:
                    </span>
                    {msg.actionItems.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-200">
                        <span className="font-bold text-red-400">•</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              SUGGESTED:
            </span>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptClick(prompt.label)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  isDisaster || prompt.category === 'disaster'
                    ? 'bg-red-950/60 hover:bg-red-900/80 border-red-800 text-red-200 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border-slate-700'
                }`}
              >
                {t(prompt.label) || prompt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar & Voice Trigger */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={isListening ? stopVoiceListening : startVoiceListening}
            className={`p-3 rounded-2xl transition-all relative ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input (Speak now)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            placeholder={t('askNovaPlaceholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className={`p-3 rounded-2xl text-white font-bold transition-all ${
              isDisaster
                ? 'bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/30'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
