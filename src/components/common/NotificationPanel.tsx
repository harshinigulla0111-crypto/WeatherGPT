import React from 'react';
import { AlertCircle, AlertTriangle, Bell, ShieldAlert, X } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { appMode } = useWeather();

  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      severity: 'DISASTER',
      title: 'FLOOD WARNING: HIGH RISK',
      message: 'Krishna River Basin rainfall surplus reached 96mm. Move to elevated safe shelters if near low-lying drains.',
      time: '10 mins ago',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />
    },
    {
      id: 'n2',
      severity: 'RISK',
      title: 'Monsoon Rain Intensity Alert',
      message: 'Heavy rainfall probability rises to 85% between 3:00 PM and 6:00 PM today in Vijayawada.',
      time: '45 mins ago',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'n3',
      severity: 'NORMAL',
      title: 'Smart Activity Advisory',
      message: 'Optimal outdoor activity window recommended between 7:00 AM – 10:00 AM while temperatures remain at 28°C.',
      time: '2 hours ago',
      icon: <AlertCircle className="w-5 h-5 text-cyan-400" />
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Weather Alerts Center</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                  n.severity === 'DISASTER'
                    ? 'bg-red-950/40 border-red-800/80 text-red-200'
                    : n.severity === 'RISK'
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{n.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{n.title}</span>
                      <span className="text-[10px] opacity-70 font-normal">{n.time}</span>
                    </div>
                    <p className="opacity-90">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Emergency alerts provided by National Disaster Response & IMD Radar Feed.
          </p>
        </div>
      </div>
    </div>
  );
};
