import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, User, Package, MessageSquare, LogOut } from 'lucide-react';
import { sounds } from '../utils/audio';
import { UserProfile } from '../utils/gameStore';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';

interface HeaderProps {
  userProfile: UserProfile;
  avatarConfig: AvatarConfig;
  onOpenProfile: () => void;
  onOpenHowToPlay: () => void;
  onOpenCustomPacks: () => void;
  onOpenGoogleSignIn?: () => void;
  onSignOutGoogle?: () => void;
  onGoHome?: () => void;
  inGame?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  avatarConfig,
  onOpenProfile,
  onOpenHowToPlay,
  onOpenCustomPacks,
  onOpenGoogleSignIn,
  onSignOutGoogle,
  onGoHome,
}) => {
  const [muted, setMuted] = useState(!sounds.isSoundEnabled());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleSound = () => {
    const isNowEnabled = sounds.toggleSound();
    setMuted(!isNowEnabled);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAvatarUrl = userProfile.useGooglePhoto !== false ? userProfile.avatarUrl : undefined;

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 border-b border-zinc-800/80 bg-[#0b0c16]/90 backdrop-blur-md select-none">
      {/* Brand / Logo */}
      <button
        type="button"
        onClick={onGoHome}
        className="group flex items-center gap-2.5 text-left focus:outline-none rounded-xl transition-transform active:scale-95 cursor-pointer"
      >
        <div className="relative flex items-center justify-center size-9 rounded-xl bg-gradient-to-tr from-pink-600 via-pink-500 to-rose-500 shadow-[0_0_15px_rgba(236,72,153,0.35)] text-white">
          <span className="text-xl font-black">T</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-pink-300 transition-colors">
            Stormio
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/40 text-pink-300">
            Taboo
          </span>
        </div>
      </button>

      {/* Right Controls matching Screenshot 1 */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sign in with Google Button (for Guests) */}
        {!userProfile.isGoogleUser && onOpenGoogleSignIn && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenGoogleSignIn();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            title="Sign in with Google to host rooms"
          >
            <svg className="size-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span className="hidden sm:inline">Sign in with Google</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="flex items-center justify-center size-9 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
          title={muted ? 'Unmute Sounds' : 'Mute Sounds'}
          aria-label={muted ? 'Unmute Sounds' : 'Mute Sounds'}
        >
          {muted ? <VolumeX className="size-4 text-zinc-400" /> : <Volume2 className="size-4 text-pink-400" />}
        </button>

        {/* How to Play */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenHowToPlay();
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
        >
          <HelpCircle className="size-4 text-pink-400" />
          <span>How to Play</span>
        </button>

        {/* Discord Icon Button */}
        <a
          href="https://discord.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center size-9 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-all"
          title="Join Discord Community"
        >
          <svg className="size-4 fill-current text-indigo-400" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </a>

        {/* Language selector pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
          <span>🇬🇧</span>
          <span>EN</span>
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setDropdownOpen((prev) => !prev);
            }}
            className="flex items-center focus:outline-none hover:scale-105 transition-transform cursor-pointer relative"
            title="Account Menu"
          >
            <AvatarRenderer
              config={avatarConfig}
              imageUrl={activeAvatarUrl}
              size={36}
            />
            {userProfile.isGoogleUser && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-blue-500 rounded-full border border-[#0b0c16] flex items-center justify-center text-[7px] text-white font-bold">
                G
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#121524] border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in text-sm">
              {/* User overview header */}
              <div className="px-3 py-2.5 mb-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white text-xs truncate">
                    {userProfile.name}
                  </span>
                  {userProfile.isGoogleUser ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                      Google
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-700/50 text-zinc-400 font-medium">
                      Guest
                    </span>
                  )}
                </div>
                {userProfile.email && (
                  <span className="text-[10px] text-zinc-400 truncate block">
                    {userProfile.email}
                  </span>
                )}
              </div>

              {!userProfile.isGoogleUser && onOpenGoogleSignIn && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenGoogleSignIn();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-pink-600/10 hover:bg-pink-600/20 text-pink-300 font-bold transition-colors text-left mb-1"
                >
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-xs">Sign in with Google</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors text-left"
              >
                <User className="w-4 h-4 text-pink-400" />
                <span className="font-semibold text-xs tracking-wide">
                  {userProfile.avatarUrl ? 'Profile & Avatar Settings' : 'Profile editor'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenCustomPacks();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors text-left"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs tracking-wide">My word packs</span>
              </button>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors text-left"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs tracking-wide">Link Discord account</span>
              </a>

              <div className="h-px bg-zinc-800 my-1" />

              {userProfile.isGoogleUser && onSignOutGoogle ? (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onSignOutGoogle();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-xs tracking-wide">Sign out of Google</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    sounds.playBuzz();
                    localStorage.removeItem('stormio_username');
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-zinc-400" />
                  <span className="font-semibold text-xs tracking-wide">Reset guest session</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
