import React, { createContext, useContext, useState } from 'react';
import { NovaService } from '../services/novaService';
import type { NovaChatMessage, SuggestedPrompt } from '../services/novaService';

export type NovaOrbState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ALERT';

interface NovaContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orbState: NovaOrbState;
  setOrbState: (state: NovaOrbState) => void;
  messages: NovaChatMessage[];
  sendMessage: (text: string, isDisaster?: boolean) => void;
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  voiceStatusText: string;
  suggestedPrompts: SuggestedPrompt[];
  clearHistory: () => void;
}

const NovaContext = createContext<NovaContextType | undefined>(undefined);

export const NovaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [orbState, setOrbState] = useState<NovaOrbState>('IDLE');
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [messages, setMessages] = useState<NovaChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'nova',
      text: "Hello! I'm N.O.V.A., your personal weather intelligence assistant. Ask me about rain, travel timing, or safety tips.",
      timestamp: 'Just now'
    }
  ]);

  const sendMessage = (text: string, isDisaster: boolean = false) => {
    if (!text.trim()) return;

    const userMsg: NovaChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setOrbState('THINKING');

    setTimeout(() => {
      const response = NovaService.processQuery(text, messages, isDisaster);
      setMessages((prev) => [...prev, response]);
      setOrbState(isDisaster ? 'ALERT' : 'SPEAKING');

      setTimeout(() => {
        setOrbState(isDisaster ? 'ALERT' : 'IDLE');
      }, 3000);
    }, 900);
  };

  const startVoiceListening = () => {
    setOrbState('LISTENING');
    setVoiceStatusText("I'm listening...");

    setTimeout(() => {
      setVoiceStatusText("Understanding your question...");
      setTimeout(() => {
        setOrbState('THINKING');
        setVoiceStatusText("Here's what I found...");
        sendMessage("Will it rain today at 4 PM?");
        setVoiceStatusText("");
      }, 1200);
    }, 1800);
  };

  const stopVoiceListening = () => {
    setOrbState('IDLE');
    setVoiceStatusText('');
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <NovaContext.Provider
      value={{
        isOpen,
        setIsOpen,
        orbState,
        setOrbState,
        messages,
        sendMessage,
        startVoiceListening,
        stopVoiceListening,
        voiceStatusText,
        suggestedPrompts: NovaService.getSuggestedPrompts(),
        clearHistory
      }}
    >
      {children}
    </NovaContext.Provider>
  );
};

export const useNova = () => {
  const context = useContext(NovaContext);
  if (!context) {
    throw new Error('useNova must be used within a NovaProvider');
  }
  return context;
};
