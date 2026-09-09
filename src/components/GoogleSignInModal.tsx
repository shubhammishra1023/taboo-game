import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Check, ArrowRight, UserCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: {
    name: string;
    email: string;
    avatarUrl: string;
  }) => void;
  title?: string;
  subtitle?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign in with Google',
  subtitle = 'Room creation is available for Google accounts. Guests can join and play any match without signing in.',
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  // Primary detected user account (from context)
  const defaultAccount = {
    name: 'Shubham Satyam',
    email: 'shubhamsatyam581@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };

  const handleSelectDefault = () => {
    sounds.playCorrect();
    onSuccess(defaultAccount);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail.trim();
    if (!email) return;
    const name = customName.trim() || email.split('@')[0];
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`;
    sounds.playCorrect();
    onSuccess({
      name,
      email,
      avatarUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-[#121524] border border-zinc-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            {/* Google G Multi-Color Icon */}
            <div className="p-2.5 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
              <svg className="size-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
              <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                Required for Room Hosts
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Explanation */}
        <p className="text-xs text-zinc-300 mb-5 leading-relaxed relative z-10 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
          {subtitle}
        </p>

        {/* Feature perks pill */}
        <div className="space-y-2 mb-6 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-zinc-200 font-medium">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>Create custom rooms, pick word packs & adjust timers</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-200 font-medium">
            <Sparkles className="size-4 text-amber-400 shrink-0" />
            <span>Google profile picture becomes your avatar (editable anytime)</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-200 font-medium">
            <Check className="size-4 text-sky-400 shrink-0" />
            <span>Guests can join your room code without signing in</span>
          </div>
        </div>

        {!isCustomMode ? (
          <div className="space-y-3">
            {/* Quick 1-Click Google Account Selector */}
            <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1">
              Choose Google Account
            </div>

            <button
              type="button"
              onClick={handleSelectDefault}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1e34] hover:bg-[#222846] border border-zinc-700/80 hover:border-pink-500/60 transition-all group cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={defaultAccount.avatarUrl}
                  alt={defaultAccount.name}
                  className="size-10 rounded-full object-cover border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                      {defaultAccount.name}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 truncate block">
                    {defaultAccount.email}
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className="w-full py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign in with a different Google email
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1">
              Enter Google Account Details
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Google Email
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-[#0b0d18] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-[#0b0d18] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-600/30"
              >
                Sign in with Google
              </button>
            </div>
          </form>
        )}

        {/* Footer info for Guests */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-zinc-500" />
            <span>Just want to play?</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
