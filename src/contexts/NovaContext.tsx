import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useWeather } from './WeatherContext';
import { NovaService } from '../services/novaService';
import type { NovaChatMessage, SuggestedPrompt } from '../services/novaService';
import { NovaChatService } from '../services/novaChatService';
import { I18nService } from '../services/i18nService';

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
  isListening: boolean;
  voiceStatusText: string;
  permissionError: string | null;
  setPermissionError: (err: string | null) => void;
  isAutoSpeak: boolean;
  toggleAutoSpeak: () => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  speakText: (text: string) => void;
  suggestedPrompts: SuggestedPrompt[];
  clearHistory: () => void;
}

const NovaContext = createContext<NovaContextType | undefined>(undefined);

export const NovaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { selectedLocation, currentWeather, metrics, currentLanguage } = useWeather();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [orbState, setOrbState] = useState<NovaOrbState>('IDLE');
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const [isAutoSpeak, setIsAutoSpeak] = useState<boolean>(() => {
    return localStorage.getItem('weathergpt_nova_autospeak') === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [messages, setMessages] = useState<NovaChatMessage[]>([]);
  const recognitionRef = useRef<any>(null);

  // Load persistent chat history from Supabase / localStorage on user auth
  useEffect(() => {
    const userId = user?.id || 'demo_user';
    NovaChatService.getChatHistory(userId).then((history) => {
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'welcome-1',
            sender: 'nova',
            text: "Hello! I'm N.O.V.A., your personal weather intelligence assistant. Ask me about rain, travel timing, or safety tips.",
            timestamp: 'Just now'
          }
        ]);
      }
    });
  }, [user?.id]);

  // Helper to select best available female voice on user's system/browser
  const getFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleVoiceNames = [
      'google us english',
      'google uk english female',
      'samantha',
      'zira',
      'victoria',
      'karen',
      'moira',
      'fiona',
      'jenny',
      'aria',
      'eva',
      'serena',
      'female'
    ];

    // Search for explicit female match in english
    const match = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const isEnglish = v.lang.toLowerCase().startsWith('en');
      return isEnglish && femaleVoiceNames.some((femaleName) => nameLower.includes(femaleName));
    });

    if (match) return match;

    // Fallback to any English voice containing 'female'
    const fallbackFemale = voices.find((v) => v.lang.toLowerCase().startsWith('en') && v.name.toLowerCase().includes('female'));
    if (fallbackFemale) return fallbackFemale;

    // Fallback to first English voice
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Web Speech API Text-to-Speech (TTS)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      // Sanitize "N.O.V.A." to "Nova" so TTS pronounces it as the name Nova, not N-O-V-A
      const cleanText = text
        .replace(/N\.O\.V\.A\./gi, 'Nova')
        .replace(/N\.O\.V\.A/gi, 'Nova')
        .replace(/[*_#`~]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.15; // Pleasant natural female voice pitch
      utterance.lang = I18nService.getBCP47LangCode(currentLanguage);

      const femaleVoice = getFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setOrbState('SPEAKING');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setOrbState('IDLE');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setOrbState('IDLE');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS] Error:', err);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setOrbState('IDLE');
  };

  const toggleAutoSpeak = () => {
    setIsAutoSpeak((prev) => {
      const next = !prev;
      localStorage.setItem('weathergpt_nova_autospeak', String(next));
      if (!next) stopSpeaking();
      return next;
    });
  };

  // Web Speech API Speech-to-Text (STT)
  const startVoiceListening = () => {
    setPermissionError(null);
    stopSpeaking();

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setPermissionError("Voice recognition is not supported in this browser. Please type instead.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = I18nService.getBCP47LangCode(currentLanguage);

      recognition.onstart = () => {
        setOrbState('LISTENING');
        setIsListening(true);
        setVoiceStatusText("Listening for your voice...");
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceStatusText(transcript || "Listening...");
        if (event.results[0]?.isFinal && transcript.trim()) {
          setIsListening(false);
          setOrbState('THINKING');
          sendMessage(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[WebSpeech STT] Error:', event.error);
        setIsListening(false);
        setOrbState('IDLE');

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError("Microphone access denied — please type instead.");
          setVoiceStatusText("Microphone access denied — please type instead.");
        } else if (event.error !== 'no-speech') {
          setVoiceStatusText("Voice input ended.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setOrbState((curr) => (curr === 'LISTENING' ? 'IDLE' : curr));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[STT] Exception:', err);
      setPermissionError("Microphone error — please type instead.");
      setIsListening(false);
      setOrbState('IDLE');
    }
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setOrbState('IDLE');
    setVoiceStatusText('');
  };

  // Send message flow (User input & assistant response saved to DB)
  const sendMessage = async (text: string, isDisaster: boolean = false) => {
    if (!text.trim()) return;

    const userId = user?.id || 'demo_user';

    // 1. Save user message locally and to Supabase
    const userMsg = await NovaChatService.saveChatMessage(userId, 'user', text.trim());
    setMessages((prev) => [...prev, userMsg]);
    setOrbState('THINKING');

    const weatherContextDetails = {
      location: `${selectedLocation.city}, ${selectedLocation.state || selectedLocation.country}`,
      temp: currentWeather.temperature,
      condition: currentWeather.condition,
      humidity: metrics.humidity,
      windSpeed: metrics.windSpeed,
      highTemp: currentWeather.highTemp,
      lowTemp: currentWeather.lowTemp,
      rainProbability: metrics.rainProbability
    };

    // 2. Generate response via OpenAI or dynamic intelligence engine
    try {
      const responseMsg = await NovaService.processQuery(text, messages, isDisaster, weatherContextDetails, currentLanguage);

      // Save assistant response to Supabase & local state
      const savedAssistantMsg = await NovaChatService.saveChatMessage(userId, 'assistant', responseMsg.text);

      const fullResponse: NovaChatMessage = {
        ...savedAssistantMsg,
        isEmergency: responseMsg.isEmergency,
        actionItems: responseMsg.actionItems
      };

      setMessages((prev) => [...prev, fullResponse]);
      setOrbState(isDisaster ? 'ALERT' : 'IDLE');

      // 3. Audio voice output if auto-speak is enabled
      if (isAutoSpeak) {
        speakText(responseMsg.text);
      }
    } catch (err) {
      console.error('[sendMessage Error]', err);
      setOrbState('IDLE');
    }
  };

  const clearHistory = async () => {
    stopSpeaking();
    stopVoiceListening();
    const userId = user?.id || 'demo_user';
    await NovaChatService.clearChatHistory(userId);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'nova',
        text: "Conversation cleared. How can I help you today?",
        timestamp: 'Just now'
      }
    ]);
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
        isListening,
        voiceStatusText,
        permissionError,
        setPermissionError,
        isAutoSpeak,
        toggleAutoSpeak,
        isSpeaking,
        stopSpeaking,
        speakText,
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
