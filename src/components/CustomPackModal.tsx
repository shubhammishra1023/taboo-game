import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { TabooCard, WordPack } from '../types';
import { sounds } from '../utils/audio';

interface CustomPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePack: (pack: WordPack) => void;
}

export const CustomPackModal: React.FC<CustomPackModalProps> = ({
  isOpen,
  onClose,
  onSavePack,
}) => {
  const [packName, setPackName] = useState('');
  const [packDesc, setPackDesc] = useState('');
  const [packIcon, setPackIcon] = useState('🎯');

  const [cards, setCards] = useState<TabooCard[]>([
    {
      id: 'c-demo-1',
      word: 'PIZZA PARTY',
      tabooWords: ['CHEESE', 'SLICE', 'FRIENDS', 'DELIVERY', 'BOX'],
      category: 'Custom',
    },
  ]);

  // Current Card input state
  const [newWord, setNewWord] = useState('');
  const [newTaboos, setNewTaboos] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddCard = () => {
    if (!newWord.trim()) {
      setError('Please provide a secret word');
      return;
    }
    const cleanTaboos = newTaboos.map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (cleanTaboos.length < 3) {
      setError('Please provide at least 3 taboo words');
      return;
    }

    sounds.playClick();
    const card: TabooCard = {
      id: `custom-${Date.now()}-${Math.random()}`,
      word: newWord.trim().toUpperCase(),
      tabooWords: cleanTaboos,
      category: packName.trim() || 'Custom',
    };

    setCards([...cards, card]);
    setNewWord('');
    setNewTaboos(['', '', '', '', '']);
    setError('');
  };

  const handleRemoveCard = (id: string) => {
    sounds.playClick();
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleSavePack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packName.trim()) {
      setError('Please provide a pack name');
      return;
    }
    if (cards.length === 0) {
      setError('Please add at least 1 card to your pack');
      return;
    }

    sounds.playClick();
    const pack: WordPack = {
      id: `pack-${Date.now()}`,
      name: packName.trim(),
      description: packDesc.trim() || 'Custom created word pack',
      icon: packIcon || '🎯',
      cardCount: cards.length,
      cards,
      isCustom: true,
    };

    onSavePack(pack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#141724] p-5 sm:p-7 shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{packIcon}</span>
            <h2 className="text-xl font-bold text-white">Create Custom Word Pack</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSavePack} className="space-y-4">
          {/* Pack Details */}
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="text-[11px] uppercase font-bold text-zinc-400 block mb-1">Icon</label>
              <input
                type="text"
                maxLength={2}
                value={packIcon}
                onChange={(e) => setPackIcon(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-2 py-2 text-center text-xl text-white"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[11px] uppercase font-bold text-zinc-400 block mb-1">Pack Title</label>
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="e.g. Office Inside Jokes"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* New Card Editor Box */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block">
              Add a Taboo Card
            </span>

            <div>
              <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Secret Word</label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="e.g. MICROWAVE"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm uppercase font-bold text-white placeholder:normal-case placeholder:font-normal"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Forbidden Taboo Words (Up to 5)</label>
              <div className="grid grid-cols-2 gap-2">
                {newTaboos.map((taboo, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={taboo}
                    onChange={(e) => {
                      const updated = [...newTaboos];
                      updated[idx] = e.target.value;
                      setNewTaboos(updated);
                    }}
                    placeholder={`Taboo ${idx + 1}`}
                    className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs uppercase font-semibold text-rose-300 placeholder:normal-case placeholder:text-zinc-500"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCard}
              className="w-full py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Card to Pack</span>
            </button>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          {/* Cards In Pack List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Cards in Pack ({cards.length})
              </span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar text-xs">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div>
                    <span className="font-bold text-white mr-2">{c.word}</span>
                    <span className="text-[11px] text-zinc-400">{c.tabooWords.join(', ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(c.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-zinc-300 hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="size-4" />
              <span>Save & Use Pack</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
