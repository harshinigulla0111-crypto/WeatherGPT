import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, ChevronRight, Compass, PhoneCall, Radio, ShieldAlert, X } from 'lucide-react';
import type { DangerTriageResponse } from '../../types/disaster';

interface DangerTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DangerTriageModal: React.FC<DangerTriageModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<DangerTriageResponse>({
    environment: 'INDOORS',
    situation: 'IMMEDIATE DANGER',
    isAlone: 'YES'
  });
  const [isSOSBroadcasting, setIsSOSBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (key: keyof DangerTriageResponse, val: any) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
    setStep((s) => s + 1);
  };

  const handleBroadcastSOS = () => {
    setIsSOSBroadcasting(true);
    setTimeout(() => {
      setIsSOSBroadcasting(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-red-950/90 border-2 border-red-600 rounded-3xl p-6 shadow-2xl shadow-red-600/50 space-y-6 text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white animate-ping">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white font-mono">
                EMERGENCY TRIAGE ASSISTANT
              </h2>
              <p className="text-xs text-red-200 font-medium">
                Step {Math.min(step, 3)} of 3 • Instant Safety Protocol
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-900 text-red-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question 1: Environment */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              1. Are you indoors or outdoors?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelect('environment', 'INDOORS')}
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-red-800 text-left font-bold text-sm transition-all"
              >
                🏠 INDOORS
                <span className="block text-xs font-normal text-slate-400 mt-1">Inside house or building</span>
              </button>
              <button
                onClick={() => handleSelect('environment', 'OUTDOORS')}
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-red-800 text-left font-bold text-sm transition-all"
              >
                🌳 OUTDOORS
                <span className="block text-xs font-normal text-slate-400 mt-1">On road, car, or open field</span>
              </button>
            </div>
          </div>
        )}

        {/* Question 2: Situation */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              2. What is your current situation?
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => handleSelect('situation', 'SAFE')}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left font-bold text-sm flex items-center justify-between"
              >
                <span>🟢 SAFE FOR NOW</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
              <button
                onClick={() => handleSelect('situation', 'AT RISK')}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-600 text-left font-bold text-sm flex items-center justify-between text-amber-300"
              >
                <span>🟡 AT RISK (Water level rising)</span>
                <ChevronRight className="w-5 h-5 text-amber-500" />
              </button>
              <button
                onClick={() => handleSelect('situation', 'IMMEDIATE DANGER')}
                className="w-full p-4 rounded-2xl bg-red-900/80 hover:bg-red-800 border-2 border-red-500 text-left font-bold text-sm flex items-center justify-between text-white animate-pulse"
              >
                <span>🔴 IMMEDIATE DANGER (Trapped / Submerged)</span>
                <ChevronRight className="w-5 h-5 text-red-300" />
              </button>
            </div>
          </div>
        )}

        {/* Question 3: Alone status */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              3. Are you alone?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelect('isAlone', 'YES')}
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-red-800 text-left font-bold text-sm"
              >
                🙋 YES
                <span className="block text-xs font-normal text-slate-400 mt-1">Single individual</span>
              </button>
              <button
                onClick={() => handleSelect('isAlone', 'NO')}
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-red-800 text-left font-bold text-sm"
              >
                👨‍👩‍👧 NO
                <span className="block text-xs font-normal text-slate-400 mt-1">With family or others</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4+: Emergency Guidance & SOS Dispatch */}
        {step >= 4 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-red-900/60 border border-red-600 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-300 block font-mono">
                IMMEDIATE EMERGENCY GUIDANCE:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Move Upward:</strong> Climb to highest floor or roof immediately if indoors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Power Isolation:</strong> Turn off main electrical breaker switch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Avoid Flood Water:</strong> Do not walk or drive through moving water currents.</span>
                </li>
              </ul>
            </div>

            {/* Emergency Action Triggers */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBroadcastSOS}
                className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/50"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{isSOSBroadcasting ? 'BROADCASTING SOS...' : 'BROADCAST SOS'}</span>
              </button>

              <a
                href="tel:112"
                className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-600/50"
              >
                <PhoneCall className="w-4 h-4" />
                <span>CALL 112 (NATIONAL)</span>
              </a>
            </div>

            {isSOSBroadcasting && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>GPS Coordinates (16.5062° N, 80.6480° E) sent to National Disaster Control Room.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
