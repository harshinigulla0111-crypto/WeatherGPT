import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Share2,
  Shield,
  Trash2,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { ProfileService } from '../../services/profileService';
import type { FamilyConnectionData } from '../../services/profileService';
import { InviteFamilyModal } from './InviteFamilyModal';

export const FamilySafetyCircle: React.FC = () => {
  const { user, setIsAuthModalOpen } = useAuth();
  const { appMode, selectedLocation } = useWeather();

  const [connections, setConnections] = useState<FamilyConnectionData[]>([]);
  const [myStatus, setMyStatus] = useState<'SAFE' | 'AT RISK'>('SAFE');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteNotification, setInviteNotification] = useState<string | null>(null);

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
            // Clean up URL parameter
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

  // Toggle logged-in user's safety status
  const toggleMyStatus = async () => {
    const newStatus = myStatus === 'SAFE' ? 'AT RISK' : 'SAFE';
    setMyStatus(newStatus);

    if (user?.id) {
      await ProfileService.updateUserSafetyStatus(user.id, newStatus);
    }
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

  const getStatusBadge = (status: 'pending' | 'accepted', safetyStatus: string) => {
    if (status === 'pending') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          PENDING
        </span>
      );
    }

    if (safetyStatus === 'SAFE') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          SAFE
        </span>
      );
    }

    if (safetyStatus === 'AT RISK') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3 text-red-400" />
          AT RISK
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
    <div className={`p-6 rounded-3xl space-y-5 shadow-xl transition-all duration-300 ${
      isDisaster
        ? 'bg-gradient-to-br from-red-950/90 via-slate-950/90 to-red-950/70 border-2 border-red-600/80 shadow-red-600/30'
        : 'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/40 border border-slate-800 shadow-cyan-950/20'
    }`}>
      {/* Invite Acceptance Toast Notification */}
      {inviteNotification && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center justify-between animate-in fade-in ${
          isDisaster
            ? 'bg-red-950/90 border border-red-500/50 text-red-200'
            : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200'
        }`}>
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
        isDisaster ? 'border-red-900/60' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${
            isDisaster
              ? 'bg-red-600/20 text-red-400 border border-red-500/40'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold tracking-wide font-mono ${
              isDisaster ? 'text-red-300' : 'text-white'
            }`}>
              {isDisaster ? '🚨 FAMILY SAFETY CIRCLE (RESCUE MONITORING)' : 'FAMILY SAFETY CIRCLE'}
            </h2>
            <p className={`text-xs font-medium ${isDisaster ? 'text-red-200/80' : 'text-slate-400'}`}>
              {isDisaster
                ? 'Emergency contact safety monitoring & live check-ins active'
                : 'Connect family & emergency contacts for live status updates & check-ins'
              }
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
              isDisaster
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-red-600/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Invite Family</span>
          </button>

          <button
            onClick={toggleMyStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              myStatus === 'SAFE'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>I'M {myStatus}</span>
          </button>

          <button
            onClick={() => alert(`GPS Location broadcasted: ${selectedLocation.city}, ${selectedLocation.state || selectedLocation.country}`)}
            className={`p-2 rounded-xl text-xs font-medium ${
              isDisaster
                ? 'bg-red-950/80 hover:bg-red-900/80 border border-red-700/80 text-red-300'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300'
            }`}
            title="Broadcast Location"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-950/70 border border-slate-800 rounded-2xl" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {connections.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3 relative proximity-card group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{member.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {member.relationship_label}
                  </span>
                </div>
                {getStatusBadge(member.status, member.safety_status)}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{selectedLocation.city}, {selectedLocation.state || selectedLocation.country}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Contact: {member.contact_value}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
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

                <button
                  onClick={() => handleRemoveConnection(member.id)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/80 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove Connection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
