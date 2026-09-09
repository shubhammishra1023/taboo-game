import React, { useState } from 'react';
import { X, Sparkles, Sliders, Check, Layers, Plus, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import { GameMode, GameSettings, WordPack } from '../types';
import { WORD_PACKS } from '../data/words';
import { UserProfile } from '../utils/gameStore';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';
import { sounds } from '../utils/audio';

interface CreateRoomModalProps {
  userProfile: UserProfile;
  avatarConfig?: AvatarConfig;
  customPacks: WordPack[];
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (settings: GameSettings) => void;
  onOpenCustomPackCreator: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  userProfile,
  avatarConfig,
  customPacks,
  isOpen,
  onClose,
  onCreateRoom,
  onOpenCustomPackCreator,
}) => {
  const [mode, setMode] = useState<GameMode>('classic');
  const [rounds, setRounds] = useState(3);
  const [turnTime, setTurnTime] = useState(60);
  const [tabooCount, setTabooCount] = useState(5);
  const [skips, setSkips] = useState(-1); // -1 = Unlimited
  const [selectedPacks, setSelectedPacks] = useState<string[]>(['general', 'countries', 'movies', 'food']);

  if (!isOpen) return null;

  const allPacks = [...WORD_PACKS, ...customPacks];

  const togglePack = (packId: string) => {
    sounds.playClick();
    if (selectedPacks.includes(packId)) {
      if (selectedPacks.length > 1) {
        setSelectedPacks(selectedPacks.filter((id) => id !== packId));
      }
    } else {
      setSelectedPacks([...selectedPacks, packId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onCreateRoom({
      mode,
      rounds,
      turnTime,
      tabooCount,
      skipsPerTurn: skips,
      selectedPackIds: selectedPacks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#141724] p-5 sm:p-7 shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Create a <span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">New Game</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Host Preview */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <AvatarRenderer
                config={avatarConfig}
                imageUrl={userProfile.useGooglePhoto !== false ? userProfile.avatarUrl : undefined}
                size={36}
              />
              <div>
                <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Hosting as
                </span>
                <span className="text-sm font-bold text-white">{userProfile.name}</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase">
              Host
            </span>
          </div>

          {/* Game Mode Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMode('classic');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'classic'
                    ? 'border-pink-500 bg-pink-500/15 ring-1 ring-pink-500/50'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Classic Taboo</span>
                  {mode === 'classic' && <Check className="size-4 text-pink-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Standard rules with 5 taboo forbidden words per card.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMode('quickSix');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'quickSix'
                    ? 'border-pink-500 bg-pink-500/15 ring-1 ring-pink-500/50'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Quick Six</span>
                  {mode === 'quickSix' && <Check className="size-4 text-pink-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  6 rapid-fire cards, no taboo lists, 1–6 points race!
                </p>
              </button>
            </div>
          </div>

          {/* Game Rules Configuration */}
          <div className="grid grid-cols-2 gap-4">
            {/* Rounds */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Rounds
                </label>
                <span className="text-xs font-bold text-pink-400">{rounds} Rounds</span>
              </div>
              <div className="flex gap-1.5">
                {[2, 3, 5, 8].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRounds(r);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      rounds === r
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.09] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Turn Timer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Turn Time
                </label>
                <span className="text-xs font-bold text-pink-400">{turnTime}s</span>
              </div>
              <div className="flex gap-1.5">
                {[30, 45, 60, 90].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTurnTime(t);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      turnTime === t
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.09] hover:text-white'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {mode === 'classic' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Taboo Words count */}
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                  Taboo Words / Card
                </label>
                <div className="flex gap-1.5">
                  {[3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setTabooCount(cnt);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        tabooCount === cnt
                          ? 'bg-pink-600 text-white'
                          : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.09]'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skips */}
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                  Skips Allowed
                </label>
                <div className="flex gap-1.5">
                  {[
                    { label: '∞', val: -1 },
                    { label: '1', val: 1 },
                    { label: '2', val: 2 },
                    { label: '0', val: 0 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSkips(s.val);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        skips === s.val
                          ? 'bg-pink-600 text-white'
                          : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.09]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Word Packs Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Word Packs ({selectedPacks.length} selected)
              </label>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenCustomPackCreator();
                }}
                className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="size-3.5" />
                <span>Custom Pack</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {allPacks.map((pack) => {
                const isSelected = selectedPacks.includes(pack.id);
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => togglePack(pack.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-pink-500/50 bg-pink-500/10 text-white'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl leading-none">{pack.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {pack.name}
                          </span>
                          {pack.isCustom && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {pack.cards.length} cards · {pack.description}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`size-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                        isSelected
                          ? 'bg-pink-600 border-pink-500 text-white'
                          : 'border-white/[0.2] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-12 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 shadow-[0_4px_16px_rgba(236,72,153,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>Create Room & Enter Lobby</span>
          </button>
        </form>
      </div>
    </div>
  );
};
