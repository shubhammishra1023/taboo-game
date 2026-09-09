import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  LogOut,
  Volume2,
  VolumeX,
  Settings,
  Send,
  Star,
  X,
  SkipForward,
  Mic,
  Crown,
  MoreVertical,
  RotateCw,
} from 'lucide-react';
import { GameState, TabooCard, TeamId } from '../types';
import { sounds } from '../utils/audio';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';
import { PlayerActionMenu } from './PlayerActionMenu';

interface ActiveGameViewProps {
  gameState: GameState;
  currentPlayerId: string;
  avatarConfig?: AvatarConfig;
  onCorrect: () => void;
  onSkip: () => void;
  onBuzz: (tabooWord?: string) => void;
  onSendMessage: (text: string) => void;
  onNextTurn: () => void;
  onEndGameEarly: () => void;
  onSkipExplainerTurn?: () => void;
  onTransferHost?: (playerId: string) => void;
  onKickPlayer?: (playerId: string) => void;
  onMovePlayer?: (playerId: string, team: TeamId) => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
}

export const ActiveGameView: React.FC<ActiveGameViewProps> = ({
  gameState,
  currentPlayerId,
  avatarConfig,
  onCorrect,
  onSkip,
  onBuzz,
  onSendMessage,
  onNextTurn,
  onEndGameEarly,
  onSkipExplainerTurn,
  onTransferHost,
  onKickPlayer,
  onMovePlayer,
  onGoHome,
  onOpenProfile,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [activeMenuPlayerId, setActiveMenuPlayerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(!sounds.isSoundEnabled());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { turn, scores, currentRound, totalRounds, settings } = gameState;
  const explainer = gameState.players.find((p) => p.id === turn.explainerId);
  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId);
  const isHost = Boolean(currentPlayer?.isHost);

  const isExplainer = currentPlayerId === turn.explainerId;
  const isTeammate = currentPlayer?.team === turn.currentTeam && !isExplainer;
  const isOpponent =
    currentPlayer?.team !== 'spectator' && currentPlayer?.team !== turn.currentTeam;
  const isSpectator = currentPlayer?.team === 'spectator';

  const redPlayers = gameState.players.filter((p) => p.team === 'red');
  const bluePlayers = gameState.players.filter((p) => p.team === 'blue');
  const spectatorPlayers = gameState.players.filter((p) => p.team === 'spectator');

  const currentCard: TabooCard | undefined = turn.cardsInTurn[turn.currentCardIndex];
  const cardPoints = currentCard?.points || 4;

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages]);

  const handleToggleSound = () => {
    const enabled = sounds.toggleSound();
    setIsMuted(!enabled);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || isExplainer) return;

    const text = guessInput.trim();
    onSendMessage(text);
    setGuessInput('');
  };

  // Format time as m:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSkips =
    settings.skipsPerTurn === 999 || settings.skipsPerTurn === -1
      ? '∞'
      : Math.max(0, settings.skipsPerTurn - turn.skipsUsed);
  const canSkip =
    settings.skipsPerTurn === 999 ||
    settings.skipsPerTurn === -1 ||
    turn.skipsUsed < settings.skipsPerTurn;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c16] text-zinc-100 select-none">
      {/* Top Header Bar matching Pages 3, 4, 5, 6 */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between z-20 border-b border-zinc-800/80 bg-[#0e101c]/80 backdrop-blur-md">
        {/* Left: Home & Exit Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoHome}
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Leave match & return home"
          >
            <Home className="w-4 h-4" />
          </button>
          {isHost && (
            <button
              type="button"
              onClick={onEndGameEarly}
              className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="End Game Early"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center: Red Score | Timer Pill | Blue Score */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Red Team Score */}
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#ff4b72] tracking-tight">
              {scores.red}
            </span>
          </div>

          {/* Timer & Round Pill matching Screenshot on Page 3 */}
          <div className="flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl bg-[#141728] border border-zinc-700/80 shadow-inner">
            <span
              className={`text-xl sm:text-2xl font-black tracking-wider leading-none ${
                turn.timeRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(turn.timeRemaining)}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Round {currentRound} of {totalRounds}
            </span>
          </div>

          {/* Blue Team Score */}
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#3b82f6] tracking-tight">
              {scores.blue}
            </span>
          </div>
        </div>

        {/* Right Tools matching Screenshots */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold text-pink-400">
            <span>W PLUS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
            <span>🇬🇧</span>
            <span>EN</span>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="hover:scale-105 transition-transform cursor-pointer"
            title="Profile"
          >
            {avatarConfig ? (
              <AvatarRenderer config={avatarConfig} size={36} />
            ) : (
              <div className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center font-bold text-white text-sm">
                {currentPlayer?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Upper Split: Center Stage (7 cols) + Right Chat (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CENTER STAGE (Left 7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* 1. Explainer View (matching Screenshot on Page 4) */}
            {turn.status === 'active' && isExplainer && currentCard && (
              <div className="w-full bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[420px] text-center">
                {/* Top points & header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{cardPoints} pts</span>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                    Describe This Word
                  </span>
                  <div className="w-16" /> {/* spacer */}
                </div>

                {/* Secret Target Word */}
                <div className="my-2">
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-wide">
                    {currentCard.word}
                  </h2>
                </div>

                {/* Taboo Forbidden Words List */}
                <div className="my-6">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                    🚫 Don't say these words:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-md mx-auto">
                    {currentCard.tabooWords.map((taboo, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1e2238] border border-rose-500/30 text-rose-200 text-sm font-bold shadow-sm"
                      >
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        <span>{taboo}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skip Word Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSkip();
                      onSkip();
                    }}
                    disabled={!canSkip}
                    className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-[#1a1e36] hover:bg-[#222846] border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Skip Word ({remainingSkips})</span>
                    <SkipForward className="w-4 h-4 text-pink-400" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. Opponent View (matching Screenshot on Page 5) */}
            {turn.status === 'active' && isOpponent && currentCard && (
              <div className="w-full bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[420px] text-center">
                {/* Top points and word */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{cardPoints} pts</span>
                    </div>
                    <div className="w-16" />
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-wide my-2 flex items-center justify-center gap-2">
                    <span>{currentCard.word}</span>
                    <X className="w-7 h-7 text-rose-500" />
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-3">
                    🔍 Click a taboo word if{' '}
                    <strong className="text-white">{explainer?.name || 'explainer'}</strong> says it
                  </p>
                </div>

                {/* Clickable Taboo Buttons to Buzz */}
                <div className="my-6 space-y-2.5 max-w-sm mx-auto w-full">
                  {currentCard.tabooWords.map((taboo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        sounds.playBuzz();
                        onBuzz(taboo);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1e2238] hover:bg-rose-900/30 border border-rose-500/40 hover:border-rose-500 text-rose-200 hover:text-white text-sm font-bold shadow-md transition-all active:scale-98 cursor-pointer group"
                    >
                      <X className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>{taboo}</span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-zinc-500 italic">
                  Buzzing deducts 1 point from the opponent team
                </div>
              </div>
            )}

            {/* 3. Teammate of Explainer View (matching Screenshot on Page 4 bottom) */}
            {turn.status === 'active' && isTeammate && (
              <div className="w-full bg-[#121524] border border-zinc-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center min-h-[420px]">
                {/* Large Explainer Avatar */}
                <div className="relative mb-6">
                  {explainer?.avatarConfig ? (
                    <AvatarRenderer config={explainer.avatarConfig} size={88} />
                  ) : (
                    <div className="w-22 h-22 rounded-full bg-pink-600 flex items-center justify-center text-4xl shadow-xl border-4 border-pink-500/40">
                      {explainer?.avatar || '🎤'}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[#121524] border border-zinc-700 text-pink-400 shadow-md">
                    <Mic className="w-4 h-4 animate-bounce" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {explainer?.name} is explaining
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mb-8">
                  Type your guesses in the chat. 1-2 letter typos are accepted!
                </p>

                {/* Host button to skip turn if needed */}
                {isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onSkipExplainerTurn && onSkipExplainerTurn();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1a1e36] hover:bg-[#242b4d] border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    <span>SKIP {explainer?.name?.toUpperCase()}'S TURN</span>
                    <SkipForward className="w-4 h-4 text-pink-400" />
                  </button>
                )}
              </div>
            )}

            {/* 4. Spectator or Waiting View (matching Screenshot on Page 3 top) */}
            {(isSpectator || turn.status === 'turnEnded') && (
              <div className="w-full bg-[#121524] border border-zinc-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center min-h-[420px]">
                {turn.status === 'turnEnded' ? (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                      Round {currentRound} Turn Ended!
                    </h3>
                    <p className="text-sm text-zinc-400 mb-6">
                      {explainer?.name} earned{' '}
                      <span className="text-emerald-400 font-bold">
                        +{turn.pointsThisTurn} points
                      </span>{' '}
                      for{' '}
                      <span
                        className={
                          turn.currentTeam === 'red' ? 'text-[#ff4b72]' : 'text-[#3b82f6]'
                        }
                      >
                        {turn.currentTeam.toUpperCase()} Team
                      </span>
                      !
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onNextTurn();
                      }}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-pink-600/30 cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue to Next Turn</span>
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative mb-6">
                      {explainer?.avatarConfig ? (
                        <AvatarRenderer config={explainer.avatarConfig} size={88} />
                      ) : (
                        <div className="w-22 h-22 rounded-full bg-pink-600 flex items-center justify-center text-4xl shadow-xl border-4 border-pink-500/40">
                          {explainer?.avatar || '🎤'}
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[#121524] border border-zinc-700 text-pink-400 shadow-md">
                        <Mic className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      {explainer?.name}'s turn
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-md mb-8">
                      {explainer?.name} will explain a secret word in chat without using the taboo
                      words. Watch their clues and type your guess.
                    </p>

                    {isHost && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onSkipExplainerTurn && onSkipExplainerTurn();
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1a1e36] hover:bg-[#242b4d] border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        <span>SKIP {explainer?.name?.toUpperCase()}'S TURN</span>
                        <SkipForward className="w-4 h-4 text-pink-400" />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT CHAT & GUESS STREAM (Right 5 cols on lg) */}
          <div className="lg:col-span-5 bg-[#121524] border border-zinc-800/90 rounded-3xl p-5 shadow-2xl flex flex-col justify-between h-[440px]">
            {/* Chat Header matching Screenshots */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              {turn.status === 'active' && explainer ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {explainer.name} is explaining
                  </span>
                  {/* Animated sound wave bars */}
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-pink-500 animate-pulse" />
                    <span className="w-0.5 h-3 bg-pink-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-pink-500 animate-pulse delay-150" />
                    <span className="w-0.5 h-3 bg-pink-400 animate-pulse delay-100" />
                  </div>
                </div>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Team Guesses
                </span>
              )}
              <span className="text-[11px] text-zinc-400 font-medium">
                {turn.currentTeam === 'red' ? 'Red Turn' : 'Blue Turn'}
              </span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 text-xs custom-scrollbar">
              {gameState.messages.map((msg) => {
                if (msg.isCorrectGuess) {
                  // Matching Screenshot on Page 5: emerald highlight
                  return (
                    <div
                      key={msg.id}
                      className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="font-bold">{msg.text}</span>
                    </div>
                  );
                }

                if (msg.isBuzzed) {
                  // Matching buzz notification on Page 5: rose highlight
                  return (
                    <div
                      key={msg.id}
                      className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-semibold shadow-sm"
                    >
                      {msg.text}
                    </div>
                  );
                }

                if (msg.isSystem) {
                  // Round end or turn skip notification
                  return (
                    <div
                      key={msg.id}
                      className="py-1 px-2.5 rounded-lg bg-zinc-900/60 text-zinc-400 text-[11px] italic"
                    >
                      {msg.text}
                    </div>
                  );
                }

                // Standard chat / guess message
                return (
                  <div
                    key={msg.id}
                    className="p-2 rounded-xl bg-[#0e101c] border border-zinc-800/80 text-zinc-200 flex items-start gap-2"
                  >
                    <span
                      className="font-bold shrink-0"
                      style={{
                        color: msg.team === 'red' ? '#ff4b72' : msg.team === 'blue' ? '#3b82f6' : '#a1a1aa',
                      }}
                    >
                      {msg.playerName}:
                    </span>
                    <span className="break-all">{msg.text}</span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input row */}
            <form onSubmit={handleGuessSubmit} className="pt-3 border-t border-zinc-800/80 flex gap-2">
              <input
                type="text"
                value={guessInput}
                disabled={isExplainer}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder={
                  isExplainer
                    ? 'Only the guessing team can submit answers'
                    : 'Type your guess...'
                }
                className={`flex-1 bg-[#0e101c] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 ${
                  isExplainer ? 'opacity-60 cursor-not-allowed italic' : ''
                }`}
              />
              <button
                type="submit"
                disabled={isExplainer || !guessInput.trim()}
                className="bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-pink-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM SCOREBOARD SECTION matching Screenshots on Pages 3, 4, 5, 6 */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Red Team Table */}
          <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#ff4b72] mb-3">
              Red Team ({redPlayers.length} {redPlayers.length === 1 ? 'player' : 'players'})
            </h3>

            {/* Table Header */}
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-800/80 mb-2">
              <span>PLAYER</span>
              <span>SCORE</span>
            </div>

            {/* Players list */}
            <div className="space-y-1.5">
              {redPlayers.map((p) => {
                const isCurrentlyExplaining =
                  turn.status === 'active' && turn.explainerId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0e101c] border border-zinc-800/80 relative"
                  >
                    <div className="flex items-center gap-2.5">
                      {p.avatarConfig ? (
                        <AvatarRenderer config={p.avatarConfig} size={28} />
                      ) : (
                        <span className="text-base">{p.avatar}</span>
                      )}
                      <span
                        className="font-bold text-xs sm:text-sm"
                        style={{ color: p.avatarConfig?.nameColor || '#ffffff' }}
                      >
                        {p.name}
                        {p.id === currentPlayerId && ' (You)'}
                      </span>
                      {p.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Host" />
                      )}
                      {isCurrentlyExplaining && (
                        <Mic className="w-3.5 h-3.5 text-pink-400" title="Explaining" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-white">{p.points || 0}</span>

                      {/* Host player action menu toggle */}
                      {isHost && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuPlayerId(
                                activeMenuPlayerId === p.id ? null : p.id
                              )
                            }
                            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Host options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <PlayerActionMenu
                            player={p}
                            isOpen={activeMenuPlayerId === p.id}
                            onClose={() => setActiveMenuPlayerId(null)}
                            onTransferHost={(id) => onTransferHost && onTransferHost(id)}
                            onMoveToSpectate={(id) => onMovePlayer && onMovePlayer(id, 'spectator')}
                            onKick={(id) => onKickPlayer && onKickPlayer(id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blue Team Table */}
          <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#3b82f6] mb-3">
              Blue Team ({bluePlayers.length} {bluePlayers.length === 1 ? 'player' : 'players'})
            </h3>

            {/* Table Header */}
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-800/80 mb-2">
              <span>PLAYER</span>
              <span>SCORE</span>
            </div>

            {/* Players list */}
            <div className="space-y-1.5">
              {bluePlayers.map((p) => {
                const isCurrentlyExplaining =
                  turn.status === 'active' && turn.explainerId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0e101c] border border-zinc-800/80 relative"
                  >
                    <div className="flex items-center gap-2.5">
                      {p.avatarConfig ? (
                        <AvatarRenderer config={p.avatarConfig} size={28} />
                      ) : (
                        <span className="text-base">{p.avatar}</span>
                      )}
                      <span
                        className="font-bold text-xs sm:text-sm"
                        style={{ color: p.avatarConfig?.nameColor || '#ffffff' }}
                      >
                        {p.name}
                        {p.id === currentPlayerId && ' (You)'}
                      </span>
                      {p.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Host" />
                      )}
                      {isCurrentlyExplaining && (
                        <Mic className="w-3.5 h-3.5 text-pink-400" title="Explaining" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-white">{p.points || 0}</span>

                      {/* Host player action menu toggle */}
                      {isHost && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuPlayerId(
                                activeMenuPlayerId === p.id ? null : p.id
                              )
                            }
                            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Host options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <PlayerActionMenu
                            player={p}
                            isOpen={activeMenuPlayerId === p.id}
                            onClose={() => setActiveMenuPlayerId(null)}
                            onTransferHost={(id) => onTransferHost && onTransferHost(id)}
                            onMoveToSpectate={(id) => onMovePlayer && onMovePlayer(id, 'spectator')}
                            onKick={(id) => onKickPlayer && onKickPlayer(id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Spectators List if any exist */}
        {spectatorPlayers.length > 0 && (
          <div className="w-full bg-[#121524] border border-zinc-800/90 rounded-3xl p-5 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Spectators ({spectatorPlayers.length}):
            </h4>
            <div className="flex flex-wrap gap-3">
              {spectatorPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e101c] border border-zinc-800"
                >
                  {p.avatarConfig ? (
                    <AvatarRenderer config={p.avatarConfig} size={24} />
                  ) : (
                    <span>{p.avatar}</span>
                  )}
                  <span className="text-xs font-semibold text-zinc-300">
                    {p.name}
                    {p.id === currentPlayerId && ' (You)'}
                  </span>
                  {p.isHost && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
