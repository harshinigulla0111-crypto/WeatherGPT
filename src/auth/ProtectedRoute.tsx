import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authStatus } = useAuth();

  // 1. Loading State Screen (Avoids flickering)
  if (authStatus === 'LOADING') {
    return (
      <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex flex-col items-center justify-center p-6 relative font-sans">
        <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/40 animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="font-mono font-black text-2xl tracking-tight text-white block">
              WEATHER<span className="text-cyan-400">GPT</span>
            </span>
            <p className="text-xs text-slate-400 font-medium">
              Preparing your weather intelligence...
            </p>
          </div>

          <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden mt-4">
            <div className="w-full h-full bg-cyan-400 origin-left animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Show Login Page
  if (authStatus === 'UNAUTHENTICATED') {
    return <Login />;
  }

  // 3. Authenticated -> Render Application
  return <>{children}</>;
};
