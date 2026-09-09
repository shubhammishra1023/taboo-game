import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';
import { sounds } from '../utils/audio';

interface CreateGameScreenProps {
  onBackToHome: () => void;
  displayName: string;
  avatarConfig: AvatarConfig;
  avatarUrl?: string;
  isGoogleUser?: boolean;
  useGooglePhoto?: boolean;
  onEditProfile: () => void;
  onCreateRoom: () => void;
}

export const CreateGameScreen: React.FC<CreateGameScreenProps> = ({
  onBackToHome,
  displayName,
  avatarConfig,
  avatarUrl,
  isGoogleUser = false,
  useGooglePhoto = true,
  onEditProfile,
  onCreateRoom,
}) => {
  const activeAvatarUrl = useGooglePhoto ? avatarUrl : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c16] text-zinc-100 relative overflow-hidden select-none">
      {/* Background Starry Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-zinc-800 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
            <span>🇬🇧</span>
            <span>EN</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onEditProfile();
            }}
            className="hover:scale-105 transition-transform cursor-pointer"
          >
            <AvatarRenderer
              config={avatarConfig}
              imageUrl={activeAvatarUrl}
              size={36}
            />
          </button>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 max-w-lg mx-auto w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Create a <span className="text-pink-500">new game</span>
        </h1>
        <p className="text-zinc-400 text-base font-normal mb-8">
          Configure room settings and jump into the host lobby.
        </p>

        {/* Profile Card */}
        <div className="w-full bg-[#121524] border border-zinc-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center">
          <div className="relative mb-4 group cursor-pointer" onClick={onEditProfile}>
            <AvatarRenderer
              config={avatarConfig}
              imageUrl={activeAvatarUrl}
              size={110}
              className="shadow-xl"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white uppercase tracking-wider">
              Change
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h2
              className="text-2xl font-bold"
              style={{ color: avatarConfig?.nameColor || '#ffffff' }}
            >
              {displayName || 'Player'}
            </h2>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onEditProfile();
            }}
            className="text-pink-500 hover:text-pink-400 text-xs font-bold tracking-wide mb-8 hover:underline cursor-pointer"
          >
            {activeAvatarUrl ? 'Edit Avatar or Switch Photo' : 'Edit profile & avatar'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onCreateRoom();
            }}
            className="w-full bg-pink-600 hover:bg-pink-500 active:scale-[0.99] text-white font-bold text-sm tracking-wider uppercase py-4 rounded-2xl transition-all shadow-lg shadow-pink-600/25 flex items-center justify-center cursor-pointer"
          >
            Create Room
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="py-6 text-center text-xs text-zinc-500 z-10 flex items-center justify-center gap-4">
        <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
        <span>·</span>
        <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
      </div>
    </div>
  );
};
