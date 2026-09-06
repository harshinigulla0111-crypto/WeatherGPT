import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  Radio,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { ProfileService } from '../../services/profileService';
import type { FamilyConnectionData } from '../../services/profileService';
import { InviteFamilyModal } from './InviteFamilyModal';
import { FamilyAlertService } from '../../services/familyAlertService';

interface SafetyStatusToast {
  id: string;
  type: 'SAFE' | 'DANGER';
  memberName: string;
  relationship: string;
  contactValue?: string;
  inviteMethod?: 'whatsapp' | 'email';
  title: string;
  message: string;
}

function formatCheckinTime(isoString?: string): string {
  if (!isoString) return 'Recently';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

interface FamilySafetyCircleProps {
  highlightedMemberId?: string | null;
}

export const FamilySafetyCircle: React.FC<FamilySafetyCircleProps> = ({ highlightedMemberId }) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const { appMode, selectedLocation, t } = useWeather();

  const [connections, setConnections] = useState<FamilyConnectionData[]>([]);
  const [myStatus, setMyStatus] = useState<'SAFE' | 'AT RISK'>('SAFE');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteNotification, setInviteNotification] = useState<string | null>(null);

  // Active floating safety status pop-up toast
  const [statusToast, setStatusToast] = useState<SafetyStatusToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSafetyToast = (toast: SafetyStatusToast) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setStatusToast(toast);
    toastTimerRef.current = setTimeout(() => {
      setStatusToast(null);
    }, toast.type === 'DANGER' ? 10000 : 6500);
  };

  // Sync user's personal safety status from their account
  useEffect(() => {
    const userId = user?.id || 'demo_user';
    setMyStatus(ProfileService.getUserSafetyStatus(userId));
  }, [user]);

  // Listen for real-time safety status updates from connected family members
  useEffect(() => {
    const currentUserId = user?.id || 'demo_user';
    const currentUserName = user?.name || user?.email?.split('@')[0] || '';

    const unsubscribe = FamilyAlertService.subscribe((alert) => {
      // Ignore alerts sent by the logged-in user themselves — their status is tracked in myStatus
      if (
        alert.senderId === currentUserId ||
        (currentUserName && alert.senderName && alert.senderName.trim().toLowerCase() === currentUserName.trim().toLowerCase())
      ) {
        return;
      }

      setConnections((prev) =>
        prev.map((c) => {
          const isIdMatch =
            Boolean(alert.senderId && c.connected_user_id && c.connected_user_id === alert.senderId) ||
            Boolean(alert.senderId && c.user_id && c.user_id === alert.senderId) ||
            Boolean(alert.familyConnectionId && c.id && c.id === alert.familyConnectionId) ||
            Boolean(alert.senderId && c.id && c.id === alert.senderId);

          const isContactMatch = Boolean(
            alert.senderId &&
            c.contact_value &&
            c.contact_value.replace(/[\s\-\(\)\+]/g, '').includes(alert.senderId.replace(/[\s\-\(\)\+]/g, ''))
          );

          const isNameMatch = Boolean(
            alert.senderName &&
            c.name &&
            (
              c.name.trim().toLowerCase() === alert.senderName.trim().toLowerCase() ||
              c.name.toLowerCase().includes(alert.senderName.toLowerCase()) ||
              alert.senderName.toLowerCase().includes(c.name.toLowerCase()) ||
              c.name.toLowerCase().split(/\s+/).some((token) => token.length > 2 && alert.senderName.toLowerCase().includes(token))
            )
          );

          const isMatch = isIdMatch || isContactMatch || isNameMatch;

          if (isMatch) {
            return {
              ...c,
              safety_status: alert.newStatus,
              last_checkin: alert.timestamp || new Date().toISOString()
            };
          }
          return c;
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Auto-scroll and highlight target member card if navigated from alert banner
  useEffect(() => {
    if (highlightedMemberId) {
      const el =
        document.getElementById(`family-member-${highlightedMemberId}`) ||
        document.getElementById('family-member-self');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedMemberId, connections]);

  // Fetch real connected family members from Supabase / Storage
  const loadConnections = async () => {
    setIsLoading(true);
    const userId = user?.id || 'demo_user';
    const data = await ProfileService.getFamilyConnections(userId);
    setConnections(data);
    setIsLoading(false);
  };

  // Handle URL invite detection (`?invite=token`)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');

    if (inviteToken) {
      if (!user) {
        setInviteNotification('You received a Family Circle invite! Please sign in or create an account to connect.');
        sessionStorage.setItem('pending_invite_token', inviteToken);
        setIsAuthModalOpen(true);
      } else {
        ProfileService.acceptFamilyInvite(inviteToken, user.id).then((success) => {
          if (success) {
            setInviteNotification('Family Circle invitation accepted successfully!');
            window.history.replaceState({}, document.title, window.location.pathname);
            loadConnections();
          }
        });
      }
    } else {
      const pendingToken = sessionStorage.getItem('pending_invite_token');
      if (pendingToken && user) {
        sessionStorage.removeItem('pending_invite_token');
        ProfileService.acceptFamilyInvite(pendingToken, user.id).then(() => {
          setInviteNotification('Family Circle invitation accepted!');
          loadConnections();
        });
      } else {
        loadConnections();
      }
    }
  }, [user]);

  // Toggle logged-in user's own safety status
  const toggleMyStatus = async () => {
    const newStatus = myStatus === 'SAFE' ? 'AT RISK' : 'SAFE';
    setMyStatus(newStatus);

    const userId = user?.id || 'demo_user';
    await ProfileService.updateUserSafetyStatus(userId, newStatus);

    const myName = user?.name || user?.email?.split('@')[0] || 'You';
    const locName = selectedLocation?.city
      ? `${selectedLocation.city}, ${selectedLocation.state || selectedLocation.country}`
      : 'Current Location';

    // Broadcast in real-time to all connected family members
    FamilyAlertService.broadcastSafetyAlert({
      senderId: userId,
      senderName: myName,
      relationship: 'Your Account',
      newStatus,
      locationName: locName,
      timestamp: new Date().toISOString()
    });

    triggerSafetyToast({
      id: `toast_self_${Date.now()}`,
      type: newStatus === 'SAFE' ? 'SAFE' : 'DANGER',
      memberName: myName,
      relationship: 'Your Account',
      title: newStatus === 'SAFE' ? 'Safety Broadcast: You are SAFE' : 'Emergency Alert: You are IN DANGER',
      message:
        newStatus === 'SAFE'
          ? 'You have updated your account status to SAFE. Your Family Circle can see your safe check-in.'
          : '⚠️ You broadcasted your status as AT RISK / IN DANGER! All connected family members are alerted.'
    });

    window.dispatchEvent(
      new CustomEvent('family-safety-status-updated', {
        detail: { memberId: userId, memberName: myName, newStatus }
      })
    );
  };



  const handleAcceptConnection = async (member: FamilyConnectionData) => {
    const userId = user?.id || 'demo_user';
    await ProfileService.acceptFamilyInvite(member.invite_token, userId);
    setInviteNotification(`Connected with ${member.name}! Connection accepted.`);
    await loadConnections();
  };

  const handleRemoveConnection = async (id?: string) => {
    if (!id) return;
    const userId = user?.id || 'demo_user';
    const success = await ProfileService.removeFamilyConnection(id, userId);
    if (success) {
      setConnections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleInviteSent = (newInvite: FamilyConnectionData) => {
    setConnections((prev) => [newInvite, ...prev]);
  };

  const getStatusBadge = (member: FamilyConnectionData) => {
    if (member.status === 'pending') {
      return (
        <button
          onClick={() => handleAcceptConnection(member)}
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
          title="Click to accept & confirm family connection"
        >
          <Clock className="w-3 h-3 text-amber-400" />
          {t('pending')} (Accept)
        </button>
      );
    }

    if (member.safety_status === 'SAFE') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          {t('safe')}
        </span>
      );
    }

    if (member.safety_status === 'AT RISK') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/30 text-red-200 border border-red-500/60 flex items-center gap-1 animate-pulse shadow-md shadow-red-950/40">
          <AlertCircle className="w-3 h-3 text-red-400" />
          IN DANGER
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
        UNKNOWN
      </span>
    );
  };

  const isDisaster = appMode === 'DISASTER';

  return (
    <div
      className={`p-6 rounded-3xl space-y-5 shadow-xl transition-all duration-300 relative ${
        isDisaster
          ? 'bg-gradient-to-br from-red-950/90 via-slate-950/90 to-red-950/70 border-2 border-red-600/80 shadow-red-600/30'
          : 'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/40 border border-slate-800 shadow-cyan-950/20'
      }`}
    >
      {/* =========================================================================
          FLOATING HIGH-PRIORITY SAFETY STATUS POP-UP TOAST
          Shows real-time status popups when members mark themselves Safe or in Danger
         ========================================================================= */}
      {statusToast && (
        <div
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
          role="alert"
          aria-live="assertive"
        >
          <div
            className={`p-4 rounded-3xl backdrop-blur-2xl shadow-2xl flex items-start gap-3.5 relative overflow-hidden group ${
              statusToast.type === 'DANGER'
                ? 'bg-red-950/95 border-2 border-red-500 shadow-red-950/70 text-red-100'
                : 'bg-slate-900/95 border-2 border-emerald-500/70 shadow-emerald-950/50 text-emerald-100'
            }`}
          >
            {/* Ambient Radial Accent Glow */}
            <div
              className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
                statusToast.type === 'DANGER' ? 'bg-red-500/30' : 'bg-emerald-500/20'
              }`}
            />

            {/* Status Avatar / Icon */}
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl shrink-0 shadow-md ${
                statusToast.type === 'DANGER'
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {statusToast.type === 'DANGER' ? (
                <AlertOctagon className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pr-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                    statusToast.type === 'DANGER'
                      ? 'bg-red-500 text-white border-red-400 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {statusToast.type === 'DANGER' ? 'CRITICAL ALERT' : 'SAFETY CHECK-IN'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Just now</span>
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight">
                {statusToast.title}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {statusToast.message}
              </p>

              {/* Emergency Action Buttons if in Danger */}
              {statusToast.type === 'DANGER' && statusToast.contactValue && (
                <div className="flex items-center gap-2 pt-1.5">
                  <a
                    href={`tel:${statusToast.contactValue.replace(/[\s\-\(\)]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  {statusToast.inviteMethod === 'whatsapp' && (
                    <a
                      href={`https://wa.me/${statusToast.contactValue.replace(/[\s\-\(\)]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setStatusToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
              aria-label="Dismiss status notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Invite Acceptance Toast Notification */}
      {inviteNotification && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between animate-in fade-in ${
            isDisaster
              ? 'bg-red-950/90 border border-red-500/50 text-red-200'
              : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDisaster ? 'text-red-400' : 'text-cyan-400'}`} />
            <span>{inviteNotification}</span>
          </div>
          <button
            onClick={() => setInviteNotification(null)}
            className={`text-xs hover:underline font-bold ${isDisaster ? 'text-red-300' : 'text-cyan-400'}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Row */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          isDisaster ? 'border-red-900/60' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl ${
              isDisaster
                ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-base font-extrabold tracking-wide font-mono ${
                  isDisaster ? 'text-red-300' : 'text-white'
                }`}
              >
                {isDisaster ? '🚨 FAMILY SAFETY CIRCLE (RESCUE MONITORING)' : 'FAMILY SAFETY CIRCLE'}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  myStatus === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-600 text-white font-black animate-pulse'
                }`}
              >
                Your Status: {myStatus === 'SAFE' ? 'SAFE' : 'IN DANGER'}
              </span>
            </div>
            <p className={`text-xs font-medium mt-0.5 ${isDisaster ? 'text-red-200/80' : 'text-slate-400'}`}>
              {isDisaster
                ? 'Emergency contact safety monitoring & live check-in coordination active'
                : 'Coordinate live safe/danger updates with family members & emergency contacts'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
              isDisaster
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-red-600/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{t('inviteFamily')}</span>
          </button>

          {/* User's Own Account Safety Status Toggle */}
          <button
            onClick={toggleMyStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
              myStatus === 'SAFE'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-pulse'
            }`}
            title="Toggle your own safety status to broadcast to family"
          >
            <Shield className="w-4 h-4" />
            <span>{myStatus === 'SAFE' ? "I'm Safe" : "I'm in Danger"}</span>
          </button>

          <button
            onClick={() => {
              triggerSafetyToast({
                id: `loc_${Date.now()}`,
                type: 'SAFE',
                memberName: user?.name || 'You',
                relationship: 'Self',
                title: 'GPS Location Broadcasted',
                message: `Your live coordinates (${selectedLocation.city}, ${
                  selectedLocation.state || selectedLocation.country
                }) have been broadcasted to your Family Circle.`
              });
            }}
            className={`p-2 rounded-xl text-xs font-medium ${
              isDisaster
                ? 'bg-red-950/80 hover:bg-red-900/80 border border-red-700/80 text-red-300'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300'
            }`}
            title="Broadcast GPS Coordinates"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-950/70 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
          <HeartHandshake className="w-10 h-10 text-cyan-400/60 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Family Members Connected Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Invite your family members or emergency contacts to share live disaster safety alerts and check-in updates.
            </p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Family Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {connections.map((member) => {
            const isMemberDanger = member.safety_status === 'AT RISK';
            const isHighlighted = Boolean(
              highlightedMemberId &&
                (member.id === highlightedMemberId ||
                  member.connected_user_id === highlightedMemberId)
            );

            return (
              <div
                key={member.id}
                id={`family-member-${member.id}`}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 relative transition-all duration-500 ${
                  isHighlighted
                    ? 'ring-4 ring-red-500 shadow-2xl shadow-red-600/60 scale-[1.03] z-10 animate-pulse'
                    : ''
                } ${
                  isMemberDanger
                    ? 'bg-gradient-to-br from-red-950/80 via-slate-950/90 to-red-950/50 border-red-500/70 shadow-lg shadow-red-950/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header with Name, Relationship & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-100 truncate">{member.name}</h3>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {member.relationship_label}
                    </span>
                  </div>
                  {getStatusBadge(member)}
                </div>

                {/* Location & Last Check-in Details */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {selectedLocation.city}, {selectedLocation.state || selectedLocation.country}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Contact: {member.contact_value}</span>
                    <span className="font-mono text-slate-400">
                      {formatCheckinTime(member.last_checkin)}
                    </span>
                  </div>
                </div>

                {/* Quick Safe/Danger Mode Toggle & Communication Controls */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  {/* Read-Only Status Indicator */}
                  <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium pl-1">Safety Status</span>
                    {isMemberDanger ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-600/30 text-red-200 border border-red-500/60 flex items-center gap-1.5 animate-pulse shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>IN DANGER</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SAFE</span>
                      </span>
                    )}
                  </div>

                  {/* Communication Action Row */}
                  <div className="flex items-center gap-1.5">
                    {member.invite_method === 'whatsapp' ? (
                      <a
                        href={`https://wa.me/${member.contact_value.replace(/[\s\-\(\)]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-center text-xs font-semibold text-emerald-300 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <a
                        href={`mailto:${member.contact_value}`}
                        className="flex-1 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-center text-xs font-semibold text-cyan-300 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Email</span>
                      </a>
                    )}

                    <a
                      href={`tel:${member.contact_value.replace(/[\s\-\(\)]/g, '')}`}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                      title="Direct Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleRemoveConnection(member.id)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/80 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove Connection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal Component */}
      <InviteFamilyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSent={handleInviteSent}
        existingConnections={connections}
      />
    </div>
  );
};
