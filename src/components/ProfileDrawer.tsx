import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Trash2, Sparkles, User, Image as ImageIcon, ShieldCheck, LogOut } from 'lucide-react';
import {
  AvatarConfig,
  AvatarRenderer,
  BACKGROUND_COLORS,
  SKIN_TONES,
  NAME_COLORS,
  DEFAULT_AVATAR_CONFIG,
  getRandomAvatarConfig,
} from './AvatarRenderer';
import { UserProfile } from '../utils/gameStore';
import { sounds } from '../utils/audio';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  displayName?: string;
  avatarConfig?: AvatarConfig;
  initialName?: string;
  initialConfig?: AvatarConfig;
  userProfile?: UserProfile;
  onSave?: (name: string, config: AvatarConfig, useGooglePhoto?: boolean) => void;
  onSaveProfile?: (name: string, config: AvatarConfig, useGooglePhoto?: boolean) => void;
  onOpenGoogleSignIn?: () => void;
  onSignOutGoogle?: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  displayName,
  avatarConfig,
  initialName,
  initialConfig,
  userProfile,
  onSave,
  onSaveProfile,
  onOpenGoogleSignIn,
  onSignOutGoogle,
}) => {
  const currentName = displayName || initialName || userProfile?.name || 'mishraji';
  const effectiveConfig = avatarConfig || initialConfig || DEFAULT_AVATAR_CONFIG;

  const [name, setName] = useState(currentName);
  const [config, setConfig] = useState<AvatarConfig>(effectiveConfig);
  const [useDefaultColor, setUseDefaultColor] = useState(
    (effectiveConfig.nameColor || '#ffffff') === '#ffffff'
  );
  const [useGooglePhoto, setUseGooglePhoto] = useState<boolean>(
    Boolean(userProfile?.avatarUrl && userProfile?.useGooglePhoto !== false)
  );

  useEffect(() => {
    if (isOpen) {
      setName(displayName || initialName || userProfile?.name || 'mishraji');
      const latestConfig = avatarConfig || initialConfig || DEFAULT_AVATAR_CONFIG;
      setConfig(latestConfig);
      setUseDefaultColor((latestConfig.nameColor || '#ffffff') === '#ffffff');
      setUseGooglePhoto(Boolean(userProfile?.avatarUrl && userProfile?.useGooglePhoto !== false));
    }
  }, [isOpen, displayName, initialName, avatarConfig, initialConfig, userProfile]);

  if (!isOpen) return null;

  const handlePrev = (prop: keyof AvatarConfig, max: number) => {
    sounds.playClick();
    setConfig((prev) => ({
      ...prev,
      [prop]: ((prev[prop] as number) - 1 + max) % max,
    }));
  };

  const handleNext = (prop: keyof AvatarConfig, max: number) => {
    sounds.playClick();
    setConfig((prev) => ({
      ...prev,
      [prop]: ((prev[prop] as number) + 1) % max,
    }));
  };

  const handleShuffle = () => {
    sounds.playClick();
    const shuffled = getRandomAvatarConfig();
    setConfig(shuffled);
  };

  const handleRemoveGooglePhoto = () => {
    sounds.playClick();
    setUseGooglePhoto(false);
  };

  const handleRestoreGooglePhoto = () => {
    sounds.playClick();
    setUseGooglePhoto(true);
  };

  const handleSave = () => {
    sounds.playCorrect();
    const saveFn = onSaveProfile || onSave;
    if (saveFn) {
      saveFn(name.trim() || 'Player', config, useGooglePhoto);
    }
    onClose();
  };

  const handleSaveNameOnly = () => {
    sounds.playCorrect();
    const saveFn = onSaveProfile || onSave;
    if (saveFn) {
      saveFn(name.trim() || 'Player', config, useGooglePhoto);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md h-full bg-[#121524] border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 sticky top-0 bg-[#121524]/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-white tracking-wide">Your profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Google Account Status Banner */}
          {userProfile?.isGoogleUser ? (
            <div className="bg-[#181c2f] p-4 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">Google Account</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Verified
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate block">
                    {userProfile.email || 'Signed in'}
                  </span>
                </div>
              </div>
              {onSignOutGoogle && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSignOutGoogle();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Sign out of Google"
                >
                  <LogOut className="size-3" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-pink-950/30 to-purple-950/30 p-4 rounded-2xl border border-pink-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">Guest Player</div>
                  <div className="text-[11px] text-zinc-300">
                    Sign in to use your Google photo & host rooms
                  </div>
                </div>
              </div>
              {onOpenGoogleSignIn && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGoogleSignIn();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-extrabold shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {/* Display Name Section */}
          <div className="bg-[#181c2f] p-4 rounded-2xl border border-zinc-800/80 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Enter name"
                className="flex-1 bg-[#0e101c] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <button
                onClick={handleSaveNameOnly}
                className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-sm"
              >
                Save Name
              </button>
            </div>
          </div>

          {/* Profile Picture Mode (Google Photo vs Custom Avatar) */}
          {userProfile?.avatarUrl && (
            <div className="bg-[#181c2f] p-4 rounded-2xl border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Profile Picture Source
                </span>
                <span className="text-[11px] font-bold text-pink-400">
                  {useGooglePhoto ? 'Google Profile Image' : 'Custom Avatar'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRestoreGooglePhoto}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    useGooglePhoto
                      ? 'border-pink-500 bg-pink-500/15 ring-1 ring-pink-500/50 text-white'
                      : 'border-zinc-700/80 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <img
                    src={userProfile.avatarUrl}
                    alt="Google photo"
                    className="size-7 rounded-full object-cover border border-white/20 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left min-w-0">
                    <span className="text-xs font-bold block truncate">Google Photo</span>
                    <span className="text-[10px] text-zinc-400 block">From Account</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveGooglePhoto}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    !useGooglePhoto
                      ? 'border-pink-500 bg-pink-500/15 ring-1 ring-pink-500/50 text-white'
                      : 'border-zinc-700/80 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="size-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs shrink-0 border border-white/10">
                    🎨
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-bold block truncate">Custom Avatar</span>
                    <span className="text-[10px] text-zinc-400 block">Profile Editor</span>
                  </div>
                </button>
              </div>

              {/* Remove/Switch Action button */}
              {useGooglePhoto ? (
                <button
                  type="button"
                  onClick={handleRemoveGooglePhoto}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/60 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove Google Photo & Use Custom Avatar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestoreGooglePhoto}
                  className="w-full py-2 px-3 rounded-xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/60 text-blue-300 hover:text-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Sparkles className="size-3.5 text-blue-400" />
                  <span>Use Google Profile Image</span>
                </button>
              )}
            </div>
          )}

          {/* Avatar Preview Card */}
          <div className="bg-[#181c2f] p-6 rounded-2xl border border-zinc-800/80 flex flex-col items-center text-center">
            <AvatarRenderer
              config={config}
              imageUrl={useGooglePhoto ? userProfile?.avatarUrl : undefined}
              size={110}
              className="shadow-lg mb-3"
            />
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                PREVIEW
              </span>
              {useGooglePhoto && userProfile?.avatarUrl ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  Google Photo Active
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                  Custom Cartoon Avatar
                </span>
              )}
            </div>
            <span
              className="text-2xl font-bold mb-4"
              style={{ color: config.nameColor }}
            >
              {name || 'Player'}
            </span>

            <div className="w-full flex flex-col gap-2.5">
              {!useGooglePhoto && (
                <button
                  onClick={handleShuffle}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors border border-zinc-700 cursor-pointer"
                >
                  Shuffle All Avatar Parts
                </button>
              )}
              <button
                onClick={handleSave}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md shadow-pink-600/20 cursor-pointer"
              >
                Save Appearance
              </button>
            </div>
          </div>

          {/* Avatar Part Controls */}
          <div className="bg-[#181c2f] p-5 rounded-2xl border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cartoon Avatar Editor
              </h3>
              {useGooglePhoto && (
                <span className="text-[10px] text-zinc-400">
                  Configuring fallback avatar
                </span>
              )}
            </div>

            {/* Background */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Background</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrev('backgroundIndex', BACKGROUND_COLORS.length)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 min-w-[50px] text-center">
                  <strong className="text-white">{config.backgroundIndex + 1}</strong> / {BACKGROUND_COLORS.length}
                </span>
                <button
                  onClick={() => handleNext('backgroundIndex', BACKGROUND_COLORS.length)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Face */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Face</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrev('faceIndex', SKIN_TONES.length)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 min-w-[50px] text-center">
                  <strong className="text-white">{config.faceIndex + 1}</strong> / {SKIN_TONES.length}
                </span>
                <button
                  onClick={() => handleNext('faceIndex', SKIN_TONES.length)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hair */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Hair</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrev('hairIndex', 8)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 min-w-[50px] text-center">
                  <strong className="text-white">{config.hairIndex + 1}</strong> / 8
                </span>
                <button
                  onClick={() => handleNext('hairIndex', 8)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Outfit */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Outfit</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrev('outfitIndex', 6)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 min-w-[50px] text-center">
                  <strong className="text-white">{config.outfitIndex + 1}</strong> / 6
                </span>
                <button
                  onClick={() => handleNext('outfitIndex', 6)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Eyes */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Eyes</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrev('eyesIndex', 6)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 min-w-[50px] text-center">
                  <strong className="text-white">{config.eyesIndex + 1}</strong> / 6
                </span>
                <button
                  onClick={() => handleNext('eyesIndex', 6)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mouth */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Mouth</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrev('mouthIndex', 6)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 min-w-[50px] text-center">
                  <strong className="text-white">{config.mouthIndex + 1}</strong> / 6
                </span>
                <button
                  onClick={() => handleNext('mouthIndex', 6)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Name Color Swatches Section */}
          <div className="bg-[#181c2f] p-5 rounded-2xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Name color</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Default</span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    const next = !useDefaultColor;
                    setUseDefaultColor(next);
                    if (next) {
                      setConfig((prev) => ({ ...prev, nameColor: '#ffffff' }));
                    }
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    useDefaultColor ? 'bg-pink-600' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      useDefaultColor ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 24 Palette Swatches */}
            <div className="grid grid-cols-8 gap-2 pt-2">
              {NAME_COLORS.map((hex) => {
                const isSelected = !useDefaultColor && config.nameColor.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    onClick={() => {
                      sounds.playClick();
                      setUseDefaultColor(false);
                      setConfig((prev) => ({ ...prev, nameColor: hex }));
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm relative"
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
