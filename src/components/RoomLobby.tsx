import React, { useState } from 'react';
import {
  Home,
  LogOut,
  HelpCircle,
  Copy,
  Check,
  Shuffle,
  Play,
  Bot,
  Crown,
  ChevronDown,
  Info,
  MoreVertical,
} from 'lucide-react';
import { GameState, TeamId, GameSettings } from '../types';
import { sounds } from '../utils/audio';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';
import { WORD_PACKS } from '../data/words';
import { PlayerActionMenu } from './PlayerActionMenu';

interface RoomLobbyProps {
  gameState: GameState;
  currentPlayerId: string;
  avatarConfig: AvatarConfig;
  onJoinTeam: (team: TeamId) => void;
  onMovePlayer?: (playerId: string, team: TeamId) => void;
  onTransferHost?: (playerId: string) => void;
  onKickPlayer?: (playerId: string) => void;
  onRandomizeTeams: () => void;
  onAddBot: () => void;
  onStartGame: () => void;
  onLeaveGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
  onOpenWordPacksModal: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  gameState,
  currentPlayerId,
  avatarConfig,
  onJoinTeam,
  onMovePlayer,
  onTransferHost,
  onKickPlayer,
  onRandomizeTeams,
  onAddBot,
  onStartGame,
  onLeaveGame,
  onOpenHowToPlay,
  onOpenProfile,
  onOpenWordPacksModal,
  onUpdateSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeMenuPlayerId, setActiveMenuPlayerId] = useState<string | null>(null);

  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;

  const redPlayers = gameState.players.filter((p) => p.team === 'red');
  const bluePlayers = gameState.players.filter((p) => p.team === 'blue');
  const unassignedPlayers = gameState.players.filter((p) => p.team === 'spectator');

  const canStart = redPlayers.length >= 1 && bluePlayers.length >= 1;

  const roomUrl = `${window.location.origin}/?room=${gameState.roomCode}`;

  const handleCopyLink = () => {
    sounds.playClick();
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPacks = WORD_PACKS.filter((p) =>
    gameState.settings.selectedPackIds.includes(p.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c16] text-zinc-100 relative select-none">
      {/* Starry ambient glow */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar matching Screenshot 1 & 2 */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onLeaveGame}
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={onLeaveGame}
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Leave Lobby"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenHowToPlay();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
            <span>HOW TO PLAY</span>
          </button>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-indigo-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Join Discord"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold text-pink-400">
            <span>W PLUS</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
            <span>🇬🇧</span>
            <span>EN</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenProfile();
            }}
            className="hover:scale-105 transition-transform cursor-pointer"
            title="Edit Profile"
          >
            <AvatarRenderer
              config={avatarConfig}
              imageUrl={currentPlayer?.avatarUrl}
              size={36}
            />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 z-10 flex flex-col items-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 text-center">
          Room <span className="text-pink-500 font-black">{gameState.roomCode}</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base font-normal mb-6 text-center">
          Invite your friends, pick teams, and start playing. 🎉
        </p>

        {/* Share Link Input Box matching Screenshot 1 & 2 */}
        <div className="w-full max-w-xl mb-8 flex items-center bg-[#121524] border border-zinc-800 rounded-2xl p-1.5 shadow-lg">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-zinc-300 font-medium focus:outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-pink-600/20 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* 2-Column Split matching Screenshots 1 & 2 */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
          {/* LEFT COLUMN: Teams & Rosters */}
          <div className="space-y-6">
            {/* Red Team Card */}
            <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-base font-bold text-[#ff4b72] mb-4">
                  Red Team ({redPlayers.length} {redPlayers.length === 1 ? 'player' : 'players'})
                </h3>

                <div className="space-y-2 mb-4">
                  {redPlayers.length === 0 ? (
                    <div className="text-xs text-zinc-500 py-6 text-center italic">
                      No players yet
                    </div>
                  ) : (
                    redPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0e101c] border border-zinc-800/80 relative"
                      >
                        <div className="flex items-center gap-3">
                          {p.avatarUrl || p.avatarConfig ? (
                            <AvatarRenderer
                              config={p.avatarConfig}
                              imageUrl={p.avatarUrl}
                              size={32}
                            />
                          ) : (
                            <span className="text-xl">{p.avatar}</span>
                          )}
                          <span
                            className="font-bold text-sm"
                            style={{ color: p.avatarConfig?.nameColor || '#ffffff' }}
                          >
                            {p.name}
                            {p.id === currentPlayerId && ' (You)'}
                          </span>
                          {p.isHost && (
                            <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" title="Host" />
                          )}
                        </div>

                        {/* Host action menu toggle */}
                        {isHost && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuPlayerId(
                                  activeMenuPlayerId === p.id ? null : p.id
                                )
                              }
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Player options"
                            >
                              <MoreVertical className="w-4 h-4" />
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
                    ))
                  )}
                </div>
              </div>

              {/* Red Team Button matching Screenshot 1 & 2 */}
              {currentPlayer?.team === 'red' ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onJoinTeam('spectator');
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all bg-[#1a1e36] border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 cursor-pointer shadow-md"
                >
                  GO BACK TO SPECTATE
                </button>
              ) : (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onJoinTeam('red');
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md bg-[#e93d67] hover:bg-[#ff4b72] text-white shadow-rose-600/20 cursor-pointer"
                >
                  JOIN RED TEAM
                </button>
              )}
            </div>

            {/* Blue Team Card */}
            <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-base font-bold text-[#3b82f6] mb-4">
                  Blue Team ({bluePlayers.length} {bluePlayers.length === 1 ? 'player' : 'players'})
                </h3>

                <div className="space-y-2 mb-4">
                  {bluePlayers.length === 0 ? (
                    <div className="text-xs text-zinc-500 py-6 text-center italic">
                      No players yet
                    </div>
                  ) : (
                    bluePlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0e101c] border border-zinc-800/80 relative"
                      >
                        <div className="flex items-center gap-3">
                          {p.avatarUrl || p.avatarConfig ? (
                            <AvatarRenderer
                              config={p.avatarConfig}
                              imageUrl={p.avatarUrl}
                              size={32}
                            />
                          ) : (
                            <span className="text-xl">{p.avatar}</span>
                          )}
                          <span
                            className="font-bold text-sm"
                            style={{ color: p.avatarConfig?.nameColor || '#ffffff' }}
                          >
                            {p.name}
                            {p.id === currentPlayerId && ' (You)'}
                          </span>
                          {p.isHost && (
                            <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" title="Host" />
                          )}
                        </div>

                        {/* Host action menu toggle */}
                        {isHost && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuPlayerId(
                                  activeMenuPlayerId === p.id ? null : p.id
                                )
                              }
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Player options"
                            >
                              <MoreVertical className="w-4 h-4" />
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
                    ))
                  )}
                </div>
              </div>

              {/* Blue Team Button matching Screenshot 1 & 2 */}
              {currentPlayer?.team === 'blue' ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onJoinTeam('spectator');
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all bg-[#1a1e36] border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 cursor-pointer shadow-md"
                >
                  GO BACK TO SPECTATE
                </button>
              ) : (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onJoinTeam('blue');
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md bg-[#3b82f6] hover:bg-[#60a5fa] text-white shadow-blue-600/20 cursor-pointer"
                >
                  JOIN BLUE TEAM
                </button>
              )}
            </div>

            {/* Waiting to pick a team Section matching Screenshot 1 & 2 */}
            <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Waiting to pick a team:
              </h4>

              {unassignedPlayers.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">
                  All players have joined a team!
                </p>
              ) : (
                <div className="space-y-2">
                  {unassignedPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0e101c] border border-zinc-800/80 relative"
                    >
                      <div className="flex items-center gap-2.5">
                        {p.avatarUrl || p.avatarConfig ? (
                          <AvatarRenderer
                            config={p.avatarConfig}
                            imageUrl={p.avatarUrl}
                            size={28}
                          />
                        ) : (
                          <span className="text-lg">{p.avatar}</span>
                        )}
                        <span
                          className="text-xs sm:text-sm font-bold"
                          style={{ color: p.avatarConfig?.nameColor || '#e4e4e7' }}
                        >
                          {p.name}
                          {p.id === currentPlayerId && ' (You)'}
                        </span>
                        {p.isHost && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" title="Host" />
                        )}
                      </div>

                      {/* Host action menu toggle */}
                      {isHost && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuPlayerId(
                                activeMenuPlayerId === p.id ? null : p.id
                              )
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Player options"
                          >
                            <MoreVertical className="w-4 h-4" />
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
                  ))}
                </div>
              )}

              {/* Bot helper for solo practice */}
              {isHost && (
                <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Testing alone?</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onAddBot();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Add Practice Bot</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Settings & Word Packs (matching Screenshot 1 & 2) */}
          <div className="space-y-6">
            {/* Game Settings Box */}
            <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white tracking-wide">Game Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Game Mode */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-zinc-300 mb-1.5">
                    <span>Game Mode</span>
                    <Info className="w-3 h-3 text-zinc-500" />
                  </label>
                  <div className="relative">
                    <select
                      value={gameState.settings.mode}
                      disabled={!isHost}
                      onChange={(e) =>
                        onUpdateSettings({ mode: e.target.value as 'classic' | 'quick-six' })
                      }
                      className={`w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-pink-500 font-medium ${
                        isHost ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <option value="classic">Classic</option>
                      <option value="quick-six">Quick Six</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Play Format */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Play Format
                  </label>
                  <div className="relative">
                    <select
                      value="2 Teams"
                      disabled
                      className="w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white appearance-none focus:outline-none font-medium opacity-60 cursor-not-allowed"
                    >
                      <option>2 Teams</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Number of Rounds */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Number of Rounds
                  </label>
                  <div className="relative">
                    <select
                      value={gameState.settings.rounds}
                      disabled={!isHost}
                      onChange={(e) => onUpdateSettings({ rounds: Number(e.target.value) })}
                      className={`w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-pink-500 font-medium ${
                        isHost ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <option value={1}>1 round</option>
                      <option value={2}>2 rounds</option>
                      <option value={3}>3 rounds</option>
                      <option value={4}>4 rounds</option>
                      <option value={5}>5 rounds</option>
                      <option value={6}>6 rounds</option>
                      <option value={8}>8 rounds</option>
                      <option value={10}>10 rounds</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Turn Time */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Turn Time (seconds)
                  </label>
                  <div className="relative">
                    <select
                      value={gameState.settings.turnTime}
                      disabled={!isHost}
                      onChange={(e) => onUpdateSettings({ turnTime: Number(e.target.value) })}
                      className={`w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-pink-500 font-medium ${
                        isHost ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <option value={30}>30s</option>
                      <option value={45}>45s</option>
                      <option value={60}>60s</option>
                      <option value={90}>90s</option>
                      <option value={120}>120s</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Taboo Words per Card */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Taboo Words per Card
                  </label>
                  <div className="relative">
                    <select
                      value={gameState.settings.tabooWordsCount || 3}
                      disabled={!isHost}
                      onChange={(e) =>
                        onUpdateSettings({ tabooWordsCount: Number(e.target.value) })
                      }
                      className={`w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-pink-500 font-medium ${
                        isHost ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <option value={3}>3 words</option>
                      <option value={4}>4 words</option>
                      <option value={5}>5 words</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Skips per Turn */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Skips per Turn
                  </label>
                  <div className="relative">
                    <select
                      value={gameState.settings.skipsPerTurn === 999 ? 'unlimited' : gameState.settings.skipsPerTurn}
                      disabled={!isHost}
                      onChange={(e) => {
                        const val = e.target.value === 'unlimited' ? 999 : Number(e.target.value);
                        onUpdateSettings({ skipsPerTurn: val });
                      }}
                      className={`w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-pink-500 font-medium ${
                        isHost ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <option value="unlimited">Unlimited</option>
                      <option value={0}>0 skips</option>
                      <option value={1}>1 skip</option>
                      <option value={2}>2 skips</option>
                      <option value={3}>3 skips</option>
                      <option value={5}>5 skips</option>
                      <option value={10}>10 skips</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Word Packs Card matching Screenshot 1 & 2 */}
            <div className="bg-[#121524] border border-zinc-800/90 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-wide">Word Packs</h3>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenWordPacksModal();
                  }}
                  className="text-xs font-bold text-pink-500 hover:text-pink-400 uppercase tracking-wider cursor-pointer"
                >
                  {isHost ? 'Change Packs' : 'VIEW PACKS'}
                </button>
              </div>

              {/* Selected packs list */}
              <div className="space-y-2">
                {selectedPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0e101c] border border-zinc-800/90"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{pack.name}</div>
                      <div className="text-xs text-zinc-400 font-medium">
                        {pack.cardCount || pack.cards.length} cards
                      </div>
                    </div>

                    {pack.bannerBg === 'flag-uk' ? (
                      <div className="w-16 h-8 rounded-md overflow-hidden relative border border-zinc-700/60 flex items-center justify-center bg-[#012169]">
                        <span className="text-xs">🇬🇧</span>
                      </div>
                    ) : (
                      <div className="w-16 h-8 rounded-md overflow-hidden relative border border-zinc-700/60 flex items-center justify-center bg-zinc-800 text-xs">
                        🎮
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add more packs button */}
              {isHost ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenWordPacksModal();
                  }}
                  className="w-full py-3 rounded-2xl border border-dashed border-zinc-700 hover:border-pink-500/80 bg-zinc-900/30 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  + Add more packs
                </button>
              ) : (
                <div className="w-full py-2.5 text-center text-xs text-zinc-500 italic">
                  Only host can add or change packs
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar matching Screenshot 1 & 2 */}
        {isHost ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <button
              onClick={() => {
                sounds.playClick();
                onRandomizeTeams();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Randomize Teams</span>
            </button>

            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
              <button
                onClick={() => {
                  sounds.playClick();
                  onStartGame();
                }}
                disabled={!canStart}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                  canStart
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-600/30 active:scale-95 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Game</span>
              </button>
              {!canStart && (
                <span className="text-[11px] text-zinc-500 mt-2 font-medium">
                  Each team needs at least 1 player to start
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-6 text-sm text-zinc-400 font-medium tracking-wide animate-pulse">
            Waiting for the host to start the game...
          </div>
        )}
      </main>

      {/* Footer links */}
      <footer className="w-full py-8 text-center text-xs text-zinc-500 z-10 flex flex-wrap items-center justify-center gap-4 border-t border-zinc-800/40 mt-10">
        <span className="hover:text-zinc-400 cursor-pointer">Send feedback</span>
        <span>·</span>
        <span onClick={onOpenHowToPlay} className="hover:text-zinc-400 cursor-pointer">
          How to Play
        </span>
        <span>·</span>
        <a
          href="https://buymeacoffee.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-400 flex items-center gap-1"
        >
          Buy me a coffee ☕
        </a>
        <span>·</span>
        <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
        <span>·</span>
        <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
      </footer>
    </div>
  );
};
