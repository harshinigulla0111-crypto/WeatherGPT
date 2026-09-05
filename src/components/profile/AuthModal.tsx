import React from 'react';
import { LogOut, Mail, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, user, logout, signInWithGoogle } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 proximity-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-mono uppercase tracking-wider">
                USER PROFILE
              </h2>
              <p className="text-xs text-slate-400">WeatherGPT Account Details</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged In User Info */}
        {user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full font-mono border border-cyan-800 mt-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>Google Authenticated</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Primary Location</span>
                <span className="font-bold text-cyan-400 font-mono">{user.primaryCity || 'Vijayawada'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Saved Locations & Preferences</span>
                <span className="font-bold text-emerald-400 font-mono">Synced</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="w-full py-3 px-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm magnetic-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          /* Fallback Sign In option */
          <div className="space-y-4 text-center py-4">
            <p className="text-xs text-slate-400">Sign in to sync your weather preferences and saved locations.</p>
            <button
              onClick={() => signInWithGoogle()}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-lg transition-all magnetic-btn"
            >
              Sign in with Google
            </button>
          </div>
        )}

        <div className="text-center pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>Supabase Auth & Row Level Security Enabled</span>
        </div>
      </div>
    </div>
  );
};
