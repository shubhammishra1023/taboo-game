import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeroSectionProps {
  onCreateRoomClick: () => void;
  onJoinRoomClick: (code: string, asSpectator?: boolean) => void;
  isGoogleUser?: boolean;
  onGoogleSignInRequired?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCreateRoomClick,
  onJoinRoomClick,
  isGoogleUser = false,
  onGoogleSignInRequired,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreateRoom = () => {
    sounds.playClick();
    if (!isGoogleUser && onGoogleSignInRequired) {
      onGoogleSignInRequired();
    } else {
      onCreateRoomClick();
    }
  };

  const handleJoin = (asSpectator: boolean = false) => {
    const clean = joinCode.trim().toUpperCase();
    if (!clean) {
      setJoinError('Please enter a 4-letter code');
      return;
    }
    sounds.playClick();
    onJoinRoomClick(clean, asSpectator);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin(false);
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 pt-10 pb-6 text-center px-4 select-none">
      {/* Main Headline */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#ff4b72] drop-shadow-[0_4px_30px_rgba(255,75,114,0.3)] font-['Fredoka',sans-serif]">
        Play Taboo Online
      </h1>

      {/* Tagline / Subtitle */}
      <p className="max-w-xl text-base sm:text-lg text-zinc-300 font-normal leading-relaxed -mt-2">
        The ultimate word-guessing party game
      </p>

      {/* Main Action Box matching Screenshot 1 */}
      <div className="w-full max-w-2xl mt-4 rounded-3xl border border-zinc-800/80 bg-[#121524]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Start a new game */}
          <div className="text-left flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">
                Start a new game
              </span>
            </div>
            <button
              type="button"
              onClick={handleCreateRoom}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider text-white bg-[#e93d67] hover:bg-[#ff4b72] active:scale-[0.99] shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="size-4 stroke-[3]" />
              <span>+ NEW GAME</span>
            </button>
          </div>

          {/* Right: Join a room */}
          <div className="text-left flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="join-room-input"
                className="text-xs font-semibold text-zinc-400 block"
              >
                Join a room
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                Guests welcome
              </span>
            </div>
            <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                id="join-room-input"
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                placeholder="Enter 4-letter code"
                className="flex-1 bg-[#0b0d18] border border-zinc-700/70 focus:border-pink-500 rounded-2xl px-4 py-3 text-sm font-bold tracking-wider text-white uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-white bg-[#1a1e34] hover:bg-[#222845] border border-zinc-700/80 active:scale-95 transition-all cursor-pointer shadow-sm"
                  title="Join room as player"
                >
                  JOIN
                </button>
                <button
                  type="button"
                  onClick={() => handleJoin(true)}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/60 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  title="Watch game in spectator mode"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>WATCH</span>
                </button>
              </div>
            </form>
            {joinError && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">{joinError}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
