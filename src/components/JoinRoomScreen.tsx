import React, { useState } from 'react';
import { AvatarConfig, AvatarRenderer, DEFAULT_AVATAR_CONFIG } from './AvatarRenderer';
import { sounds } from '../utils/audio';
import { Trash2 } from 'lucide-react';

interface JoinRoomScreenProps {
  roomCode: string;
  initialName?: string;
  initialAvatarConfig?: AvatarConfig;
  onJoinRoom: (name: string, config: AvatarConfig) => void;
  onCancel: () => void;
}

export const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({
  roomCode,
  initialName = 'winner!',
  initialAvatarConfig = DEFAULT_AVATAR_CONFIG,
  onJoinRoom,
  onCancel,
}) => {
  const [name, setName] = useState(initialName || 'winner!');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(initialAvatarConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Player';
    sounds.playClick();
    onJoinRoom(finalName, avatarConfig);
  };

  const randomizeAvatar = () => {
    sounds.playClick();
    setAvatarConfig((prev) => ({
      ...prev,
      bgIndex: Math.floor(Math.random() * 8),
      faceIndex: Math.floor(Math.random() * 6),
      hairIndex: Math.floor(Math.random() * 8),
      eyeIndex: Math.floor(Math.random() * 6),
      mouthIndex: Math.floor(Math.random() * 6),
      accessoryIndex: Math.floor(Math.random() * 6),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0c16] text-white px-4 relative select-none">
      {/* Starry subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Join Room Card matching Screenshot 1 */}
      <div className="w-full max-w-md bg-[#121524] border border-zinc-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight mb-1.5">
          Join Room <span className="text-pink-500">{roomCode}</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 text-center font-normal mb-8">
          Enter your name to join the game
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">
              Your Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#0e101c] border border-zinc-800 focus:border-pink-500 rounded-2xl px-4 py-3.5 pr-14 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all placeholder-zinc-600"
              />
              <button
                type="button"
                onClick={randomizeAvatar}
                className="absolute right-2 p-1 rounded-full hover:scale-105 transition-transform"
                title="Click to randomize avatar"
              >
                <AvatarRenderer config={avatarConfig} size={36} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white bg-[#e93d67] hover:bg-[#ff4b72] active:scale-[0.99] transition-all shadow-lg shadow-pink-600/25 cursor-pointer"
          >
            JOIN ROOM
          </button>
        </form>
      </div>

      {/* Red cancel / clear icon in bottom right matching Screenshot 1 */}
      <button
        onClick={onCancel}
        className="fixed bottom-6 right-6 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/50 text-rose-500 hover:text-rose-400 hover:bg-zinc-800 transition-all shadow-lg"
        title="Cancel"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};
