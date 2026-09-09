import React from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { WordPack } from '../types';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';
import { sounds } from '../utils/audio';

interface CustomPacksScreenProps {
  onBackToHome: () => void;
  onOpenNewPack: () => void;
  customPacks: WordPack[];
  onDeletePack: (packId: string) => void;
  displayName: string;
  avatarConfig: AvatarConfig;
  avatarUrl?: string;
  onEditProfile: () => void;
}

export const CustomPacksScreen: React.FC<CustomPacksScreenProps> = ({
  onBackToHome,
  onOpenNewPack,
  customPacks,
  onDeletePack,
  avatarConfig,
  avatarUrl,
  onEditProfile,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c16] text-zinc-100 relative overflow-hidden select-none">
      {/* Background Starry Glow */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-zinc-800"
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
            <AvatarRenderer config={avatarConfig} imageUrl={avatarUrl} size={36} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 z-10">
        {/* Title & New Pack Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              My Word Packs
            </h1>
            <p className="text-zinc-400 text-sm">
              Create up to 15 packs and use them in your games. Public by default.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenNewPack();
            }}
            className="self-start sm:self-auto bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-pink-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Pack
          </button>
        </div>

        {/* Counter */}
        <div className="text-xs font-semibold text-zinc-400 mb-6">
          {customPacks.length} / 15 packs
        </div>

        {/* Content Box */}
        {customPacks.length === 0 ? (
          <div className="w-full bg-[#101323] border border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-lg">
            <p className="text-zinc-400 text-sm font-medium mb-6">
              You have not created any custom packs yet.
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenNewPack();
              }}
              className="bg-zinc-800/90 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors border border-zinc-700 shadow-sm"
            >
              Create Your First Pack
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-[#121524] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700 transition-colors shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-950/40 border border-pink-900/50 flex items-center justify-center text-2xl">
                    {pack.icon || '📦'}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{pack.name}</h3>
                    <span className="text-xs text-zinc-400 font-medium">
                      {pack.cards.length} cards · {pack.description || 'Custom pack'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playBuzz();
                      onDeletePack(pack.id);
                    }}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Pack"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
