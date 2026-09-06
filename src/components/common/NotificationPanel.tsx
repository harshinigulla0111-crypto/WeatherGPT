import React, { useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  CloudRain,
  ExternalLink,
  Flame,
  Info,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wind,
  X
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProcessedAlertItem {
  id: string;
  severity: 'DISASTER' | 'RISK' | 'NORMAL';
  title: string;
  message: string;
  source: string;
  timeText: string;
  icon: React.ReactNode;
}

function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return 'Just now';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    currentWeather,
    hourlyForecast,
    metrics,
    selectedLocation,
    weatherAlerts,
    lastFetchedAt,
    isLoading,
    refetchWeather
  } = useWeather();

  const timeSinceUpdate = useMemo(() => formatRelativeTime(lastFetchedAt), [lastFetchedAt]);

  // Derive dynamic, honest alerts strictly from real fetched weather API data
  const displayedAlerts = useMemo<ProcessedAlertItem[]>(() => {
    const items: ProcessedAlertItem[] = [];
    const city = selectedLocation.city || 'your area';

    // 1. Official Government / Agency Alerts returned by OpenWeather OneCall API
    if (weatherAlerts && weatherAlerts.length > 0) {
      weatherAlerts.forEach((alert, idx) => {
        const isSevere =
          alert.severity === 'warning' ||
          alert.event.toLowerCase().includes('warning') ||
          alert.event.toLowerCase().includes('danger');

        items.push({
          id: alert.id || `api_alert_${idx}`,
          severity: isSevere ? 'DISASTER' : 'RISK',
          title: alert.event || 'Severe Weather Alert',
          message: alert.description || 'Severe weather expected in your area.',
          source: alert.sender || 'OpenWeatherMap Weather Alert',
          timeText: alert.start && alert.end ? `${alert.start} – ${alert.end}` : timeSinceUpdate,
          icon: isSevere ? (
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )
        });
      });
      return items;
    }

    // 2. If no official alerts exist in API response, derive strictly from real current & forecast data fields

    // (A) Active severe weather / thunderstorm in current observations
    const condLower = (currentWeather?.condition || '').toLowerCase();
    if (condLower.includes('thunder') || condLower.includes('storm')) {
      items.push({
        id: 'derived_thunderstorm',
        severity: 'DISASTER',
        title: `Active Storm: ${currentWeather.condition}`,
        message: `Live observation reports ${condLower} over ${city} with winds at ${Math.round(
          metrics.windSpeed
        )} km/h. Avoid open terrain and seek secure indoor shelter.`,
        source: 'Live OpenWeather Observation',
        timeText: timeSinceUpdate,
        icon: <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
      });
    }

    // (B) High rain probability window derived directly from actual hourly forecast data
    if (hourlyForecast && hourlyForecast.length > 0) {
      // Find upcoming hours with significant rain probability (>= 45%)
      const rainHours = hourlyForecast.filter((h) => (h.precipitationProb ?? 0) >= 45);

      if (rainHours.length > 0) {
        // Find peak rain probability hour
        const peakHour = rainHours.reduce((max, h) =>
          (h.precipitationProb ?? 0) > (max.precipitationProb ?? 0) ? h : max
        );
        const peakProb = Math.round(peakHour.precipitationProb);
        const firstHour = rainHours[0].time;
        const lastHour = rainHours[rainHours.length - 1].time;
        const windowText =
          rainHours.length === 1 ? `around ${firstHour}` : `between ${firstHour} and ${lastHour}`;

        const isHighRisk = peakProb >= 70;
        items.push({
          id: 'derived_rain_window',
          severity: isHighRisk ? 'RISK' : 'NORMAL',
          title: `High Rain Probability (${peakProb}%)`,
          message: `Real forecast models project an elevated rain probability of ${peakProb}% ${windowText} in ${city}. Current live precipitation chance is ${metrics.rainProbability}%.`,
          source: 'Live OpenWeather & Forecast Model',
          timeText: timeSinceUpdate,
          icon: <CloudRain className={`w-5 h-5 ${isHighRisk ? 'text-amber-400' : 'text-cyan-400'} shrink-0`} />
        });
      }
    } else if (metrics.rainProbability >= 60) {
      // Fallback if hourly not loaded but daily rain is elevated
      items.push({
        id: 'derived_daily_rain',
        severity: 'RISK',
        title: `Precipitation Advisory (${metrics.rainProbability}%)`,
        message: `Current atmospheric moisture indicates a ${metrics.rainProbability}% chance of rain today in ${city}. Carry rain protection if heading out.`,
        source: 'Live OpenWeather Observation',
        timeText: timeSinceUpdate,
        icon: <CloudRain className="w-5 h-5 text-amber-400 shrink-0" />
      });
    }

    // (C) Extreme Heat / Solar UV Advisory
    const temp = Math.round(currentWeather?.temperature ?? 0);
    const uv = Math.round(metrics?.uvIndex ?? 0);
    if (temp >= 35 || uv >= 8) {
      items.push({
        id: 'derived_heat_uv',
        severity: 'RISK',
        title: temp >= 35 ? `High Heat Advisory (${temp}°C)` : `High UV Radiation (Index ${uv})`,
        message: `Live temperature is ${temp}°C (feels like ${Math.round(
          currentWeather.feelsLike
        )}°C) with a UV index of ${uv} (${metrics.uvDescription || 'High'}). Stay hydrated and minimize direct midday sun exposure.`,
        source: 'Live OpenWeather Observation',
        timeText: timeSinceUpdate,
        icon: <Flame className="w-5 h-5 text-orange-400 shrink-0" />
      });
    }

    // (D) High Wind Advisory
    const wind = Math.round(metrics?.windSpeed ?? 0);
    if (wind >= 35) {
      items.push({
        id: 'derived_high_wind',
        severity: 'RISK',
        title: `High Wind Advisory (${wind} km/h)`,
        message: `Live wind velocity is measured at ${wind} km/h (${metrics.windDirection || 'Variable'}) across ${city}. Secure loose outdoor items.`,
        source: 'Live OpenWeather Observation',
        timeText: timeSinceUpdate,
        icon: <Wind className="w-5 h-5 text-slate-300 shrink-0" />
      });
    }

    // (E) No severe conditions — provide clear, reassuring status
    if (items.length === 0) {
      items.push({
        id: 'status_calm_normal',
        severity: 'NORMAL',
        title: 'No Active Severe Weather Alerts',
        message: `Conditions in ${city} are currently normal. Live temperature is ${temp}°C with ${currentWeather.condition.toLowerCase()} skies, ${metrics.rainProbability}% rain chance, and calm winds (${wind} km/h).`,
        source: 'Live OpenWeather Observation',
        timeText: timeSinceUpdate,
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
      });
    }

    return items;
  }, [
    weatherAlerts,
    currentWeather,
    hourlyForecast,
    metrics,
    selectedLocation.city,
    timeSinceUpdate
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Weather Alerts Center</h2>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{selectedLocation.city || 'Live Location'}</span>
                  <span>•</span>
                  <span>Updated {timeSinceUpdate}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => refetchWeather()}
                disabled={isLoading}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                title="Refresh Live Weather Data"
                aria-label="Refresh weather data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Close Alerts Panel"
                aria-label="Close alerts panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Location & Status Banner */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Location</span>
            <span className="font-semibold text-slate-200">
              {selectedLocation.city}, {selectedLocation.state}
            </span>
          </div>

          {/* Dynamic Alert Cards */}
          <div className="space-y-3.5">
            {displayedAlerts.map((n) => {
              const isDisaster = n.severity === 'DISASTER';
              const isRisk = n.severity === 'RISK';

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
                    isDisaster
                      ? 'bg-red-950/40 border-red-800/80 text-red-200 shadow-lg shadow-red-950/30'
                      : isRisk
                      ? 'bg-amber-950/30 border-amber-800/60 text-amber-200 shadow-md shadow-amber-950/20'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{n.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 font-bold mb-1">
                        <span className="truncate">{n.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 border ${
                            isDisaster
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : isRisk
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {n.severity}
                        </span>
                      </div>

                      <p className="opacity-90 leading-relaxed text-[12px]">{n.message}</p>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] opacity-75">
                        <span className="font-medium text-slate-400 truncate">Source: {n.source}</span>
                        <span className="shrink-0">{n.timeText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accurate Attribution Footer */}
        <div className="pt-5 border-t border-slate-800 text-center space-y-1.5 mt-6">
          <p className="text-[11px] text-slate-400 font-medium">
            Powered by OpenWeatherMap & Live Forecast Models
          </p>
          <p className="text-[10px] text-slate-500 leading-tight">
            Advisories derived dynamically from real-time atmospheric sensor data for your location. Official civil emergency bulletins (e.g. IMD / NDMA / CWC flood gauges) require direct specialized governmental API authorization.
          </p>
        </div>
      </div>
    </div>
  );
};
