import React, { useEffect, useRef, useState } from 'react';
import { AlertOctagon, CheckCircle2, ChevronRight, MapPin, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { areToastsEnabled } from '../../services/weatherNotificationService';
import { FamilyAlertService } from '../../services/familyAlertService';
import type { FamilySafetyAlertEvent } from '../../services/familyAlertService';

interface FamilyEmergencyBannerProps {
  onNavigateToMember: (memberId?: string) => void;
}

export const FamilyEmergencyBanner: React.FC<FamilyEmergencyBannerProps> = ({ onNavigateToMember }) => {
  const { user } = useAuth();
  const [currentAlert, setCurrentAlert] = useState<FamilySafetyAlertEvent | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentUserId = user?.id || 'demo_user';
    const unsubscribe = FamilyAlertService.subscribe((alert) => {
      // Do not display emergency popups to the user who triggered their own status change
      if (alert.senderId === currentUserId) {
        return;
      }

      // Danger alerts always show (safety-critical priority bypass).
      // Safe confirmation toasts respect the general notification toggle.
      if (alert.newStatus === 'SAFE' && !areToastsEnabled()) {
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      setIsExiting(false);
      setCurrentAlert(alert);

      // Auto-dismiss duration: 20s for Danger, 7s for Safe
      const duration = alert.newStatus === 'AT RISK' ? 20000 : 7000;
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setCurrentAlert(null);
      setIsExiting(false);
    }, 300);
  };

  const handleActionClick = () => {
    if (currentAlert) {
      onNavigateToMember(currentAlert.senderId || currentAlert.familyConnectionId);
      handleDismiss();
    }
  };

  if (!currentAlert) return null;

  const isDanger = currentAlert.newStatus === 'AT RISK';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-2xl transition-all duration-300 transform ${
        isExiting ? '-translate-y-12 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-2xl border backdrop-blur-xl transition-all ${
          isDanger
            ? 'bg-gradient-to-r from-red-950/95 via-red-900/90 to-slate-950/95 border-red-600/80 shadow-red-950/80 ring-2 ring-red-500/50 animate-pulse'
            : 'bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-950/95 border-emerald-500/60 shadow-emerald-950/60'
        }`}
      >
        {/* Urgent pulsating glow strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isDanger ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          {/* Leading Icon Beacon */}
          <div
            className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              isDanger
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isDanger ? (
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isDanger
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                }`}
              >
                {isDanger ? '🚨 CRITICAL FAMILY EMERGENCY' : '✅ FAMILY CHECK-IN'}
              </span>

              {currentAlert.relationship && (
                <span className="text-[11px] font-semibold text-slate-400">
                  • {currentAlert.relationship}
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-white mt-1 leading-snug">
              {isDanger ? (
                <span>
                  <strong className="text-red-300 font-black">{currentAlert.senderName}</strong> has marked themselves as{' '}
                  <span className="text-red-400 underline decoration-red-500 decoration-2">IN DANGER</span>!
                </span>
              ) : (
                <span>
                  <strong className="text-emerald-300 font-bold">{currentAlert.senderName}</strong> is now marked{' '}
                  <span className="text-emerald-400 font-bold">SAFE</span>.
                </span>
              )}
            </h3>

            {currentAlert.locationName && (
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{currentAlert.locationName}</span>
              </p>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 mt-3">
              <button
                type="button"
                onClick={handleActionClick}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                }`}
              >
                <span>View in Family Circle</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close / Dismiss 'X' Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
