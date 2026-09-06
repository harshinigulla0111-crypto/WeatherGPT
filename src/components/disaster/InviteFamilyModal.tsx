import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, MessageSquare, Phone, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileService } from '../../services/profileService';
import type { FamilyConnectionData } from '../../services/profileService';

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: (newConnection: FamilyConnectionData) => void;
  existingConnections: FamilyConnectionData[];
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
  onInviteSent,
  existingConnections
}) => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Mom');
  const [customRelationship, setCustomRelationship] = useState('');
  const [inviteMethod, setInviteMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [contactValue, setContactValue] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const relationshipOptions = ['Mom', 'Dad', 'Spouse', 'Brother', 'Sister', 'Child', 'Friend', 'Custom'];

  const validate = (): boolean => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || !name.trim()) {
      setErrorMsg('Please enter the person\'s name.');
      return false;
    }

    const relLabel = relationship === 'Custom' ? customRelationship.trim() : relationship;
    if (!relLabel) {
      setErrorMsg('Please specify the relationship.');
      return false;
    }

    if (!contactValue || !contactValue.trim()) {
      setErrorMsg(`Please enter a valid ${inviteMethod === 'whatsapp' ? 'phone number with country code' : 'email address'}.`);
      return false;
    }

    const val = contactValue.trim();

    if (inviteMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }

      // Edge case: Self invite check
      if (user?.email && val.toLowerCase() === user.email.toLowerCase()) {
        setErrorMsg('You cannot invite yourself to your Family Safety Circle.');
        return false;
      }
    } else {
      // Phone check
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      const cleanPhone = val.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        setErrorMsg('Please enter a valid phone number with country code (e.g. +91 9876543210).');
        return false;
      }
    }

    // Duplicate check
    const isDuplicate = existingConnections.some(
      (c) => c.contact_value.toLowerCase() === val.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg('This contact has already been invited or connected to your Family Circle.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const relLabel = relationship === 'Custom' ? customRelationship.trim() : relationship;
    const cleanVal = contactValue.trim();
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inviteUrl = `${window.location.origin}?invite=${token}`;

    const newInvitePayload: Omit<FamilyConnectionData, 'id' | 'created_at'> = {
      user_id: user?.id || 'demo_user',
      name: name.trim(),
      relationship_label: relLabel,
      invite_method: inviteMethod,
      contact_value: cleanVal,
      invite_token: token,
      status: 'pending',
      safety_status: 'SAFE',
      last_checkin: new Date().toISOString()
    };

    try {
      const savedConnection = await ProfileService.createFamilyInvite(newInvitePayload);

      if (inviteMethod === 'whatsapp') {
        const cleanPhone = cleanVal.replace(/[\s\-\(\)]/g, '').replace('+', '');
        const messageText = `Hi ${name.trim()}! Join my Family Safety Circle on WeatherGPT to share live emergency weather alerts and safety status updates. Accept my invite here: ${inviteUrl}`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, '_blank');
        setSuccessMsg(`WhatsApp invitation pre-filled! Click send in WhatsApp tab.`);
      } else {
        setSuccessMsg(`Email invite generated! Share link: ${inviteUrl}`);
      }

      if (savedConnection) {
        onInviteSent(savedConnection);
        setName('');
        setCustomRelationship('');
        setContactValue('');
        setRelationship('Mom');
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to send invite.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative proximity-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Invite Family Member</h2>
              <p className="text-xs text-slate-400">Connect family for live disaster safety updates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Person's Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Person's Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mom, Ravi, Priya Sharma"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-cyan-500/60"
            >
              {relationshipOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>

            {relationship === 'Custom' && (
              <input
                type="text"
                value={customRelationship}
                onChange={(e) => setCustomRelationship(e.target.value)}
                placeholder="Enter custom relationship (e.g. Uncle, Cousin)"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 mt-2"
              />
            )}
          </div>

          {/* Choice of Invite Method */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Invite Method</label>
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setInviteMethod('whatsapp');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  inviteMethod === 'whatsapp'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInviteMethod('email');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  inviteMethod === 'email'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Contact Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {inviteMethod === 'whatsapp' ? 'WhatsApp Phone Number' : 'Email Address'}
            </label>
            <div className="relative">
              {inviteMethod === 'whatsapp' ? (
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              ) : (
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              )}
              <input
                type={inviteMethod === 'email' ? 'email' : 'tel'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={inviteMethod === 'whatsapp' ? '+91 98765 43210' : 'person@example.com'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-70 mt-2"
          >
            {isSubmitting
              ? 'Sending Invitation...'
              : inviteMethod === 'whatsapp'
              ? 'Send Invite via WhatsApp'
              : 'Send Invite via Email'}
          </button>
        </form>
      </div>
    </div>
  );
};
