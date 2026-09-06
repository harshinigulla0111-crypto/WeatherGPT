import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import {
  areToastsEnabled,
  generateWeatherNotifications,
  hasWeatherMeaningfullyChanged,
  WITTY_TOASTS_CHANGED_EVENT,
  type NotificationCategory,
  type WeatherNotification,
  type WeatherSnapshot
} from '../../services/weatherNotificationService';

interface ToastItem {
  notification: WeatherNotification;
  isExiting: boolean;
}

export const WeatherPushToast: React.FC = () => {
  const { currentWeather, metrics, selectedLocation, weatherAlerts } = useWeather();

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(areToastsEnabled());

  const prevSnapshotRef = useRef<WeatherSnapshot | null>(null);
  const hasTriggeredInitialRef = useRef(false);
  const lastTriggeredTimeRef = useRef<number>(0);
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Listen for settings toggle changes
  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      const enabled = customEvent.detail?.enabled ?? areToastsEnabled();
      setIsEnabled(enabled);
      if (!enabled) {
        // Clear active notifications if toggled off
        dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
        dismissTimersRef.current.clear();
        setToasts([]);
      }
    };

    window.addEventListener(WITTY_TOASTS_CHANGED_EVENT, handleSettingsChange);
    return () => {
      window.removeEventListener(WITTY_TOASTS_CHANGED_EVENT, handleSettingsChange);
    };
  }, []);

  const scheduleAutoDismiss = (id: string, durationMs: number = 7500) => {
    if (dismissTimersRef.current.has(id)) {
      clearTimeout(dismissTimersRef.current.get(id)!);
    }

    const timer = setTimeout(() => {
      dismissToast(id);
    }, durationMs);

    dismissTimersRef.current.set(id, timer);
  };

  const dismissToast = (id: string) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((item) => (item.notification.id === id ? { ...item, isExiting: true } : item))
    );

    // Remove from state after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.notification.id !== id));
      if (dismissTimersRef.current.has(id)) {
        clearTimeout(dismissTimersRef.current.get(id)!);
        dismissTimersRef.current.delete(id);
      }
    }, 350);
  };

  const handleMouseEnter = (id: string) => {
    if (dismissTimersRef.current.has(id)) {
      clearTimeout(dismissTimersRef.current.get(id)!);
      dismissTimersRef.current.delete(id);
    }
  };

  const handleMouseLeave = (id: string) => {
    scheduleAutoDismiss(id, 4000); // Give user a generous window after unhovering
  };

  const triggerNotifications = (newNotifs: WeatherNotification[]) => {
    if (!isEnabled || newNotifs.length === 0) return;

    setToasts((prev) => {
      // Avoid duplicate titles/messages already displayed
      const existingTitles = new Set(prev.map((t) => t.notification.title));
      const filtered = newNotifs.filter((n) => !existingTitles.has(n.title));
      if (filtered.length === 0) return prev;

      const newItems: ToastItem[] = filtered.map((notification) => ({
        notification,
        isExiting: false
      }));

      // Stack with previous (max 2 visible at once to prevent clutter)
      const combined = [...prev, ...newItems].slice(-2);
      return combined;
    });

    newNotifs.forEach((n) => scheduleAutoDismiss(n.id, 7500));
    lastTriggeredTimeRef.current = Date.now();
  };

  // 1. Initial greeting trigger shortly after weather data loads on login / location change
  useEffect(() => {
    if (!currentWeather || !selectedLocation.city || !isEnabled) return;

    if (!hasTriggeredInitialRef.current) {
      hasTriggeredInitialRef.current = true;
      const initialTimer = setTimeout(() => {
        const notifs = generateWeatherNotifications(currentWeather, metrics, selectedLocation, weatherAlerts);
        triggerNotifications(notifs);

        prevSnapshotRef.current = {
          temperature: currentWeather.temperature,
          rainProbability: metrics.rainProbability,
          condition: currentWeather.condition,
          uvIndex: metrics.uvIndex,
          windSpeed: metrics.windSpeed,
          humidity: metrics.humidity,
          alertCount: weatherAlerts?.length || 0
        };
      }, 2000);

      return () => clearTimeout(initialTimer);
    }
  }, [currentWeather?.temperature, selectedLocation?.city, isEnabled]);

  // 2. Periodic meaningful weather change trigger
  useEffect(() => {
    if (!currentWeather || !hasTriggeredInitialRef.current || !isEnabled) return;

    const currentSnapshot: WeatherSnapshot = {
      temperature: currentWeather.temperature,
      rainProbability: metrics.rainProbability,
      condition: currentWeather.condition,
      uvIndex: metrics.uvIndex,
      windSpeed: metrics.windSpeed,
      humidity: metrics.humidity,
      alertCount: weatherAlerts?.length || 0
    };

    const timeSinceLast = Date.now() - lastTriggeredTimeRef.current;
    const cooldownPeriod = 2.5 * 60 * 1000; // 2.5 minutes cooldown to avoid rapid fire

    if (
      timeSinceLast >= cooldownPeriod &&
      hasWeatherMeaningfullyChanged(prevSnapshotRef.current, currentSnapshot)
    ) {
      const notifs = generateWeatherNotifications(currentWeather, metrics, selectedLocation, weatherAlerts);
      triggerNotifications(notifs);
      prevSnapshotRef.current = currentSnapshot;
    }
  }, [
    currentWeather?.temperature,
    currentWeather?.condition,
    metrics?.rainProbability,
    metrics?.uvIndex,
    metrics?.windSpeed,
    metrics?.humidity,
    weatherAlerts?.length,
    isEnabled
  ]);

  if (!isEnabled || toasts.length === 0) return null;

  const getCategoryStyles = (category: NotificationCategory) => {
    switch (category) {
      case 'storm':
        return {
          border: 'border-red-500/50 shadow-red-950/40',
          glow: 'bg-red-500/10',
          badge: 'bg-red-500/25 text-red-300 border-red-500/40',
          iconBox: 'bg-red-950/50 border-red-500/30 text-red-200'
        };
      case 'rain':
        return {
          border: 'border-sky-500/50 shadow-sky-950/40',
          glow: 'bg-sky-500/10',
          badge: 'bg-sky-500/25 text-sky-300 border-sky-500/40',
          iconBox: 'bg-sky-950/50 border-sky-500/30 text-sky-200'
        };
      case 'uv':
        return {
          border: 'border-amber-500/50 shadow-amber-950/40',
          glow: 'bg-amber-500/10',
          badge: 'bg-amber-500/25 text-amber-300 border-amber-500/40',
          iconBox: 'bg-amber-950/50 border-amber-500/30 text-amber-200'
        };
      case 'windy':
        return {
          border: 'border-slate-500/50 shadow-slate-900/40',
          glow: 'bg-slate-400/10',
          badge: 'bg-slate-600/30 text-slate-200 border-slate-500/40',
          iconBox: 'bg-slate-800/80 border-slate-600/40 text-slate-200'
        };
      case 'humid':
        return {
          border: 'border-teal-500/50 shadow-teal-950/40',
          glow: 'bg-teal-500/10',
          badge: 'bg-teal-500/25 text-teal-300 border-teal-500/40',
          iconBox: 'bg-teal-950/50 border-teal-500/30 text-teal-200'
        };
      case 'cold':
        return {
          border: 'border-indigo-500/50 shadow-indigo-950/40',
          glow: 'bg-indigo-500/10',
          badge: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/40',
          iconBox: 'bg-indigo-950/50 border-indigo-500/30 text-indigo-200'
        };
      case 'hot':
        return {
          border: 'border-orange-500/50 shadow-orange-950/40',
          glow: 'bg-orange-500/10',
          badge: 'bg-orange-500/25 text-orange-300 border-orange-500/40',
          iconBox: 'bg-orange-950/50 border-orange-500/30 text-orange-200'
        };
      case 'night':
        return {
          border: 'border-purple-500/50 shadow-purple-950/40',
          glow: 'bg-purple-500/10',
          badge: 'bg-purple-500/25 text-purple-300 border-purple-500/40',
          iconBox: 'bg-purple-950/50 border-purple-500/30 text-purple-200'
        };
      case 'pleasant':
      default:
        return {
          border: 'border-emerald-500/50 shadow-emerald-950/40',
          glow: 'bg-emerald-500/10',
          badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
          iconBox: 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
        };
    }
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
      aria-live="polite"
    >
      {toasts.map(({ notification, isExiting }) => {
        const styles = getCategoryStyles(notification.category);

        return (
          <div
            key={notification.id}
            onMouseEnter={() => handleMouseEnter(notification.id)}
            onMouseLeave={() => handleMouseLeave(notification.id)}
            className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/95 backdrop-blur-2xl border ${styles.border} shadow-2xl text-slate-100 flex items-start gap-3 relative overflow-hidden group transition-all duration-300 ease-out ${
              isExiting
                ? 'opacity-0 translate-y-3 scale-95 duration-300'
                : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-bottom-5 fade-in duration-300'
            }`}
          >
            {/* Ambient Radial Accent Glow */}
            <div
              className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${styles.glow}`}
            />

            {/* Expressive Emoji Avatar Box */}
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-md ${styles.iconBox}`}
            >
              <span>{notification.emoji}</span>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pr-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles.badge}`}
                >
                  {notification.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Just now</span>
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-200 font-medium leading-relaxed drop-shadow-sm">
                {notification.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => dismissToast(notification.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
              aria-label="Dismiss notification"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
