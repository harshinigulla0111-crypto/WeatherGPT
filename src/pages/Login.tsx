import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const Login: React.FC = () => {
  const { signInWithGoogle, signUpWithEmail, signInWithPassword, resendConfirmationEmail } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);

  const validateInputs = (): boolean => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResendButton(false);

    if (!email || !email.trim()) {
      setErrorMessage('Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResendButton(false);

    const { error } = await signInWithGoogle();
    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResendButton(false);

    if (mode === 'signup') {
      const { data, error } = await signUpWithEmail(email.trim(), password);
      setIsSubmitting(false);
      if (error) {
        setErrorMessage(error.message || 'Sign up failed. Please try again.');
      } else {
        if (data?.session) {
          setSuccessMessage('Account created successfully! Redirecting...');
        } else {
          setSuccessMessage(
            'Account created! Please check your email inbox (and spam folder) to confirm your account before signing in.'
          );
        }
      }
    } else {
      const { error } = await signInWithPassword(email.trim(), password);
      setIsSubmitting(false);
      if (error) {
        const msg = error.message || '';
        if (msg.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Email not confirmed yet. Please check your inbox for the verification link.');
          setShowResendButton(true);
        } else {
          setErrorMessage(msg || 'Invalid email or password.');
        }
      }
    }
  };

  const handleResendConfirmation = async () => {
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your email address to resend confirmation.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);

    const { error } = await resendConfirmationEmail(email.trim());
    setIsResending(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to resend confirmation email.');
    } else {
      setSuccessMessage(`Confirmation email resent to ${email.trim()}! Please check your inbox.`);
      setShowResendButton(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Environmental Background Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10 relative proximity-card">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-2xl tracking-tight text-white">
              WEATHER<span className="text-cyan-400">GPT</span>
            </span>
          </div>
          <p className="text-xs text-cyan-300/80 font-semibold tracking-wide">
            Intelligence that protects.
          </p>
        </div>

        {/* Welcome Section */}
        <div className="text-center space-y-1 pt-1 border-t border-slate-800/80">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Welcome to WeatherGPT
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Sign in to access personalized weather intelligence.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex flex-col space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
            {showResendButton && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isResending}
                className="mt-1 self-start px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800/80 border border-red-500/40 text-[11px] font-bold text-red-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Mail className="w-3 h-3 text-red-300" />
                )}
                <span>{isResending ? 'Resending email...' : 'Resend Confirmation Email'}</span>
              </button>
            )}
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed magnetic-btn"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
            )}
            <span>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider absolute">
            or continue with email
          </span>
        </div>

        {/* Email/Password Auth Section */}
        <div className="space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
                setShowResendButton(false);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
                setShowResendButton(false);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'signup'
                ? 'Create WeatherGPT Account'
                : 'Sign In'}
            </button>
          </form>

          {/* Security Assurance Footer */}
          <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 pt-1 text-center">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Your weather preferences, saved locations and personalized insights are securely stored.</span>
          </div>
        </div>
      </div>

      {/* Footer Branding & Dev Notice */}
      <div className="mt-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Protected by Supabase Auth & Row Level Security</span>
        </div>
        {import.meta.env.DEV && !isSupabaseConfigured && (
          <span className="text-[10px] text-amber-400/80 mt-1 font-mono">
            [Dev mode: Supabase environment variables missing in .env]
          </span>
        )}
      </div>
    </div>
  );
};
