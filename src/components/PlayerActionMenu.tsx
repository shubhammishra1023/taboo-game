import React, { useEffect, useRef } from 'react';
import { Crown, Eye, LogOut } from 'lucide-react';
import { Player } from '../types';
import { sounds } from '../utils/audio';

interface PlayerActionMenuProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onTransferHost: (playerId: string) => void;
  onMoveToSpectate: (playerId: string) => void;
  onKick: (playerId: string) => void;
}

export const PlayerActionMenu: React.FC<PlayerActionMenuProps> = ({
  player,
  isOpen,
  onClose,
  onTransferHost,
  onMoveToSpectate,
  onKick,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1.5 w-44 bg-[#181c2e] border border-zinc-700/80 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
    >
      {!player.isHost && (
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onTransferHost(player.id);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer text-left"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span>Transfer host</span>
        </button>
      )}

      {player.team !== 'spectator' && (
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onMoveToSpectate(player.id);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer text-left"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Move to spectate</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          onKick(player.id);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer text-left"
      >
        <LogOut className="w-3.5 h-3.5 shrink-0" />
        <span>Kick</span>
      </button>
    </div>
  );
};
