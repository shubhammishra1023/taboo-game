import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Sparkles } from 'lucide-react';
import { GameState } from '../types';
import { sounds } from '../utils/audio';

interface GameOverModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onPlayAgain,
  onGoHome,
}) => {
  const { scores, players } = gameState;

  const isRedWinner = scores.red > scores.blue;
  const isBlueWinner = scores.blue > scores.red;
  const isTie = scores.red === scores.blue;

  useEffect(() => {
    sounds.playVictory();

    // Trigger confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: isRedWinner
          ? ['#f43f5e', '#fb7185', '#fda4af', '#ffffff']
          : isBlueWinner
          ? ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff']
          : ['#ec4899', '#a855f7', '#fbbf24', '#ffffff'],
      });
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#141724] p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
            isRedWinner
              ? 'from-rose-500 to-pink-500'
              : isBlueWinner
              ? 'from-sky-500 to-indigo-500'
              : 'from-amber-400 to-pink-500'
          }`}
        />

        {/* Trophy Icon */}
        <div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-pink-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_25px_rgba(251,191,36,0.3)]">
          <Trophy className="size-10" />
        </div>

        {/* Winner Headline */}
        <span className="text-xs uppercase font-bold tracking-widest text-pink-400 block mb-1">
          Game Completed!
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
          {isTie ? (
            "It's a Tie!"
          ) : isRedWinner ? (
            <span className="text-rose-400">Red Team Wins!</span>
          ) : (
            <span className="text-sky-400">Blue Team Wins!</span>
          )}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6">
          {isTie
            ? 'Incredible match! Both teams scored identical points.'
            : `Outstanding performance across all ${gameState.totalRounds} rounds!`}
        </p>

        {/* Final Score Card */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block mb-1">
              Red Team
            </span>
            <span className="text-3xl font-black text-white">{scores.red}</span>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300 block mb-1">
              Blue Team
            </span>
            <span className="text-3xl font-black text-white">{scores.blue}</span>
          </div>
        </div>

        {/* Player Roster Summary */}
        <div className="mb-6 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
            Player Standings
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-xs">
            {players
              .filter((p) => p.team !== 'spectator')
              .sort((a, b) => b.points - a.points)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-500 w-4">{idx + 1}</span>
                    <span className="text-base leading-none">{p.avatar}</span>
                    <span className="font-semibold text-white">{p.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        p.team === 'red' ? 'bg-rose-500/20 text-rose-300' : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {p.team}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400">{p.points} pts</span>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex-1 py-3 rounded-xl border border-white/[0.1] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.05] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="size-4" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
