import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { WordPack } from '../types';
import { WORD_PACKS } from '../data/words';
import { sounds } from '../utils/audio';

interface SelectWordPacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackIds: string[];
  onSave: (packIds: string[]) => void;
  customPacks: WordPack[];
  onOpenCustomPacksPage?: () => void;
}

export const SelectWordPacksModal: React.FC<SelectWordPacksModalProps> = ({
  isOpen,
  onClose,
  selectedPackIds,
  onSave,
  customPacks,
  onOpenCustomPacksPage,
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'community' | 'custom'>('official');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedPackIds);

  if (!isOpen) return null;

  const togglePack = (id: string) => {
    sounds.playClick();
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = () => {
    sounds.playCorrect();
    onSave(selectedIds);
    onClose();
  };

  const officialPacks = WORD_PACKS.filter((p) => p.categoryType === 'official');
  const communityPacks = WORD_PACKS.filter((p) => p.categoryType === 'community');

  const currentPacks =
    activeTab === 'official'
      ? officialPacks
      : activeTab === 'community'
      ? communityPacks
      : customPacks;

  const renderBannerGraphic = (pack: WordPack) => {
    if (pack.bannerBg === 'flag-uk') {
      return (
        <div className="w-24 h-12 rounded-lg overflow-hidden relative shadow border border-zinc-700/50 flex items-center justify-center bg-[#012169]">
          {/* Stylized UK Flag */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* White diagonal */}
            <div className="absolute w-full h-3 bg-white rotate-[24deg]" />
            <div className="absolute w-full h-3 bg-white -rotate-[24deg]" />
            {/* Red diagonal */}
            <div className="absolute w-full h-1.5 bg-[#C8102E] rotate-[24deg]" />
            <div className="absolute w-full h-1.5 bg-[#C8102E] -rotate-[24deg]" />
            {/* White cross */}
            <div className="absolute w-4 h-full bg-white" />
            <div className="absolute w-full h-4 bg-white" />
            {/* Red cross */}
            <div className="absolute w-2 h-full bg-[#C8102E]" />
            <div className="absolute w-full h-2 bg-[#C8102E]" />
          </div>
        </div>
      );
    }
    if (pack.id === 'famous-brands') {
      return (
        <div className="w-24 h-12 rounded-lg overflow-hidden relative shadow border border-zinc-700/50 flex items-center justify-around px-2 bg-gradient-to-r from-zinc-900 to-indigo-950">
          <span className="text-sm">🍎</span>
          <span className="text-sm font-bold text-blue-400">G</span>
          <span className="text-sm font-bold text-orange-400">MS</span>
        </div>
      );
    }
    if (pack.id === 'jobs-careers') {
      return (
        <div className="w-24 h-12 rounded-lg overflow-hidden relative shadow border border-zinc-700/50 flex items-center justify-around px-2 bg-gradient-to-r from-amber-950/60 to-zinc-900">
          <span className="text-sm">👷</span>
          <span className="text-sm">💼</span>
          <span className="text-sm">🩺</span>
        </div>
      );
    }
    if (pack.id === 'geography') {
      return (
        <div className="w-24 h-12 rounded-lg overflow-hidden relative shadow border border-zinc-700/50 flex items-center justify-center bg-gradient-to-r from-blue-950 via-slate-900 to-black">
          <span className="text-2xl drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">🌍</span>
        </div>
      );
    }
    if (pack.id === 'movies-series') {
      return (
        <div className="w-24 h-12 rounded-lg overflow-hidden relative shadow border border-zinc-700/50 flex items-center justify-center bg-gradient-to-r from-purple-950 to-zinc-900">
          <span className="text-2xl">🎬</span>
        </div>
      );
    }
    return (
      <div className="w-24 h-12 rounded-lg overflow-hidden relative shadow border border-zinc-700/50 flex items-center justify-center bg-zinc-800/80 text-xl">
        {pack.icon || '📦'}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#121524] border border-zinc-800 rounded-3xl text-zinc-100 flex flex-col shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80">
          <h2 className="text-xl font-bold text-white tracking-wide">Select Word Packs</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-800/60">
          <div className="flex bg-[#0b0d18] p-1 rounded-2xl border border-zinc-800">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('official');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'official'
                  ? 'bg-[#1e2338] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Official packs
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('community');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'community'
                  ? 'bg-[#1e2338] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Community <span className="bg-pink-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">New</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('custom');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'custom'
                  ? 'bg-[#1e2338] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Your packs
            </button>
          </div>

          <span className="text-xs text-zinc-400 font-medium hidden sm:inline-block">
            Sorted by popularity
          </span>
        </div>

        {/* Pack List Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {activeTab === 'custom' && customPacks.length === 0 ? (
            <div className="text-center py-10 bg-[#0e101c] rounded-2xl border border-zinc-800/80 p-6">
              <p className="text-zinc-400 text-sm mb-4">
                You haven't created any custom packs yet.
              </p>
              {onOpenCustomPacksPage && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCustomPacksPage();
                  }}
                  className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-sm"
                >
                  Create Custom Pack
                </button>
              )}
            </div>
          ) : (
            currentPacks.map((pack) => {
              const isChecked = selectedIds.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  onClick={() => togglePack(pack.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-[#1a1e34] border-pink-500/80 shadow-md shadow-pink-900/10'
                      : 'bg-[#151829] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#181c30]'
                  }`}
                >
                  {/* Left: Checkbox & Name/Count */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                        isChecked
                          ? 'bg-pink-600 border-pink-500 text-white'
                          : 'bg-zinc-900 border-zinc-700 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base tracking-wide">
                          {pack.name}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-medium">
                        {pack.cardCount || pack.cards.length} cards
                      </span>
                    </div>
                  </div>

                  {/* Right: Flag/Banner visual graphic */}
                  {renderBannerGraphic(pack)}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-[#0e101c]/60">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-8 py-3 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-pink-600/20"
          >
            Save Packs
          </button>
        </div>
      </div>
    </div>
  );
};
