import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Check, Upload, UserCheck, ArrowRight, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { signInWithGoogle } from '../lib/firebase';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: {
    name: string;
    email: string;
    avatarUrl: string;
  }) => void;
  onContinueAsGuest?: () => void;
  title?: string;
  subtitle?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onContinueAsGuest,
  title = 'Sign in with Google',
  subtitle = 'Connect your Google account to host rooms, use your profile photo, and get verified host status.',
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual fallback / custom account states
  const defaultEmail = 'shubhamsatyam581@gmail.com';
  const defaultName = 'Shubham Satyam';

  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Real Google Sign In using Firebase Auth
  const handleFirebaseGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        sounds.playCorrect();
        onSuccess({
          name: res.user.displayName || res.user.email?.split('@')[0] || defaultName,
          email: res.user.email || defaultEmail,
          avatarUrl: res.user.photoURL || '',
        });
        return;
      }
      if (res.error) {
        // If popup was closed by user or cancelled, show friendly message without breaking
        if (res.error.includes('popup-closed-by-user')) {
          setErrorMessage('Sign-in window closed. You can try again or use the one-click profile below.');
        } else {
          setErrorMessage(res.error);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle local photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedPhoto(dataUrl);
      sounds.playClick();
    };
    reader.readAsDataURL(file);
  };

  const executeSignIn = (targetName: string, targetEmail: string, customAvatar?: string | null) => {
    const cleanEmail = (targetEmail || defaultEmail).trim();
    const cleanName = (targetName || defaultName).trim() || cleanEmail.split('@')[0];
    const avatar =
      customAvatar ||
      uploadedPhoto ||
      photoUrl.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff&size=150&bold=true`;

    sounds.playCorrect();
    onSuccess({
      name: cleanName,
      email: cleanEmail,
      avatarUrl: avatar,
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSignIn(name, email);
  };

  const effectiveAvatar =
    uploadedPhoto ||
    photoUrl.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Shubham Satyam')}&background=4285F4&color=fff&size=150&bold=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-[#121524] border border-zinc-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
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
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                Google Authentication
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-zinc-300 mb-4 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
          {subtitle}
        </p>

        {/* Benefits badge */}
        <div className="space-y-1.5 mb-5 text-xs text-zinc-300">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>Verified Host with room creation and management rights</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="size-4 text-amber-400 shrink-0" />
            <span>Displays your Google profile picture across matches and lobbies</span>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Firebase Live Google Sign-In Popup Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleFirebaseGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-white hover:bg-zinc-100 text-zinc-900 shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin text-blue-600" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="size-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Sign in with Google Popup</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-3">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Or quick sign-in
          </span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        {/* Primary 1-Click Google Account Sign-In Card */}
        {!isSwitchingAccount ? (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181c30] to-[#121422] border border-blue-500/40 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="relative shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=4285F4&color=fff&size=120&bold=true`}
                    alt={defaultName}
                    className="size-12 rounded-full object-cover border-2 border-blue-500 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-[#121524] flex items-center justify-center">
                    <Check className="size-2.5 text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white truncate">{defaultName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                      Google
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 block truncate">{defaultEmail}</span>
                </div>
              </div>

              {/* 1-Click Sign-In Button */}
              <button
                type="button"
                onClick={() => executeSignIn(defaultName, defaultEmail)}
                className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] cursor-pointer"
              >
                <span>Continue as {defaultName}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>

            {/* Switch / Custom account button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSwitchingAccount(true)}
                className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1"
              >
                <UserPlus className="size-3.5" />
                <span>Sign in with a different Google account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for custom / another Google account */
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Enter Google Account</span>
              <button
                type="button"
                onClick={() => setIsSwitchingAccount(false)}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                Back to {defaultEmail}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Google Email <span className="text-pink-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full bg-[#0b0d18] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shubham Satyam"
                className="w-full bg-[#0b0d18] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Profile Picture Option */}
            <div className="p-3 rounded-2xl bg-[#0e101c] border border-zinc-800/80">
              <label className="text-[11px] font-bold text-zinc-300 block mb-2">
                Google Profile Picture
              </label>

              <div className="flex items-center gap-3 mb-2">
                <img
                  src={effectiveAvatar}
                  alt="Preview"
                  className="size-11 rounded-full object-cover border-2 border-blue-500 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 space-y-1.5 min-w-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                  >
                    <Upload className="size-3.5" />
                    <span>Upload Custom Photo</span>
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setUploadedPhoto(null);
                  }}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full bg-[#0b0d18] border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <Check className="size-4" />
              <span>Confirm & Sign In with Google</span>
            </button>
          </form>
        )}

        {/* Footer: Option to proceed as guest host */}
        <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-zinc-500" />
            <span>Prefer not to sign in?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onContinueAsGuest) {
                onContinueAsGuest();
              } else {
                onClose();
              }
            }}
            className="text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer"
          >
            Continue as Guest Host
          </button>
        </div>
      </div>
    </div>
  );
};
