import React, { useState, useEffect } from 'react';
import { GameSettings, GameState, TeamId, WordPack } from './types';
import { WORD_PACKS } from './data/words';
import { sounds } from './utils/audio';
import {
  generateRoomCode,
  UserProfile,
  createNewGame,
  movePlayerTeam,
  skipExplainerTurn,
  transferHostRole,
  kickPlayerFromGame,
  checkGuessMatch,
  DEFAULT_SETTINGS,
} from './utils/gameStore';

// Components
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InteractiveCardPreview } from './components/InteractiveCardPreview';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowToPlaySection } from './components/HowToPlaySection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

// Full Screen Views matching Screenshots
import { CreateGameScreen } from './components/CreateGameScreen';
import { CustomPacksScreen } from './components/CustomPacksScreen';
import { CreateCustomPackScreen } from './components/CreateCustomPackScreen';
import { RoomLobby } from './components/RoomLobby';
import { ActiveGameView } from './components/ActiveGameView';

// Drawers & Modals
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from './components/AvatarRenderer';
import { ProfileDrawer } from './components/ProfileDrawer';
import { SelectWordPacksModal } from './components/SelectWordPacksModal';
import { GameOverModal } from './components/GameOverModal';
import { InfoModals } from './components/InfoModals';
import { GoogleSignInModal } from './components/GoogleSignInModal';

const USER_STORAGE_KEY = 'stormio_user_profile';
const AVATAR_CONFIG_KEY = 'stormio_avatar_config';
const CUSTOM_PACKS_KEY = 'stormio_custom_packs';

type ViewMode = 'home' | 'create' | 'custom-packs' | 'create-custom-pack';

export default function App() {
  // 1. User Profile & Avatar Customizer State
  const [displayName, setDisplayName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return 'mishraji';
  });

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem(AVATAR_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_AVATAR_CONFIG, ...parsed };
        }
      }
    } catch {}
    return DEFAULT_AVATAR_CONFIG;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            id: parsed.id || `user-${Date.now()}`,
            name: parsed.name || 'mishraji',
            avatar: parsed.avatar || '👱',
            avatarUrl: parsed.avatarUrl,
            email: parsed.email,
            isGoogleUser: parsed.isGoogleUser || false,
            useGooglePhoto: parsed.useGooglePhoto ?? true,
          };
        }
      }
    } catch {}
    return {
      id: `user-${Date.now()}`,
      name: 'mishraji',
      avatar: '👱',
      isGoogleUser: false,
      useGooglePhoto: true,
    };
  });

  // Sync userProfile name when displayName changes
  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      name: displayName,
    }));
  }, [displayName]);

  // 2. Custom Packs State
  const [customPacks, setCustomPacks] = useState<WordPack[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PACKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 3. Navigation / Route State
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  // 4. Game State
  const [gameState, setGameState] = useState<GameState | null>(null);

  // 5. Drawers & Modals
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isWordPacksModalOpen, setIsWordPacksModalOpen] = useState(false);
  const [isGoogleSignInOpen, setIsGoogleSignInOpen] = useState(false);
  const [googleSignInIntent, setGoogleSignInIntent] = useState<'createRoom' | 'general'>('general');
  const [activeInfoModal, setActiveInfoModal] = useState<
    'howToPlay' | 'feedback' | 'terms' | 'privacy' | null
  >(null);

  // Google Sign-In handlers
  const handleGoogleSignInSuccess = (userData: {
    name: string;
    email: string;
    avatarUrl: string;
  }) => {
    setDisplayName(userData.name);
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: userData.name,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
      isGoogleUser: true,
      useGooglePhoto: true,
    };
    setUserProfile(updatedProfile);
    setIsGoogleSignInOpen(false);

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch {}

    // Update active player in game if inside room
    if (gameState) {
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === userProfile.id
              ? {
                  ...p,
                  name: userData.name,
                  avatarUrl: userData.avatarUrl,
                }
              : p
          ),
        };
      });
    }

    // If the sign-in intent was to create a room, navigate to create view
    if (googleSignInIntent === 'createRoom') {
      setCurrentView('create');
    }
  };

  const handleSignOutGoogle = () => {
    sounds.playBuzz();
    const guestProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: 'Guest Player',
      avatar: '👱',
      isGoogleUser: false,
      avatarUrl: undefined,
      email: undefined,
      useGooglePhoto: false,
    };
    setDisplayName('Guest Player');
    setUserProfile(guestProfile);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(guestProfile));
    } catch {}
  };

  // Save profile and avatar configuration
  const handleSaveProfile = (
    name: string,
    config: AvatarConfig,
    extra?: Partial<UserProfile>
  ) => {
    setDisplayName(name);
    setAvatarConfig(config);

    const updatedProfile: UserProfile = {
      ...userProfile,
      name,
      ...extra,
    };
    setUserProfile(updatedProfile);

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
      localStorage.setItem(AVATAR_CONFIG_KEY, JSON.stringify(config));
    } catch {}

    // Update active player in game if inside room
    if (gameState) {
      const activeAvatarUrl =
        updatedProfile.useGooglePhoto !== false ? updatedProfile.avatarUrl : undefined;

      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === userProfile.id
              ? {
                  ...p,
                  name,
                  avatarConfig: config,
                  color: config.nameColor,
                  avatarUrl: activeAvatarUrl,
                }
              : p
          ),
        };
      });
    }
  };

  // Custom pack operations
  const handleSaveCustomPack = (pack: WordPack) => {
    const updated = [...customPacks, pack];
    setCustomPacks(updated);
    try {
      localStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteCustomPack = (packId: string) => {
    const updated = customPacks.filter((p) => p.id !== packId);
    setCustomPacks(updated);
    try {
      localStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Initiate Create Room flow (enforces Google sign-in)
  const handleInitiateCreateRoom = () => {
    if (!userProfile.isGoogleUser) {
      setGoogleSignInIntent('createRoom');
      setIsGoogleSignInOpen(true);
      return;
    }
    setCurrentView('create');
  };

  // Room Creation Handler (host only)
  const handleCreateRoom = (customSettings?: Partial<GameSettings>) => {
    if (!userProfile.isGoogleUser) {
      setGoogleSignInIntent('createRoom');
      setIsGoogleSignInOpen(true);
      return;
    }

    const code = generateRoomCode();
    const allPacks = [...WORD_PACKS, ...customPacks];
    const initialSettings: GameSettings = {
      ...DEFAULT_SETTINGS,
      ...customSettings,
      selectedPackIds: ['general'],
    };

    const hostProfileToUse: UserProfile = {
      ...userProfile,
      name: displayName,
      avatarUrl: userProfile.useGooglePhoto !== false ? userProfile.avatarUrl : undefined,
    };

    const newGame = createNewGame(
      code,
      hostProfileToUse,
      initialSettings,
      allPacks,
      avatarConfig
    );
    setGameState(newGame);
    setCurrentView('home'); // inside game, gameState takes precedence

    try {
      window.history.pushState({}, '', `?room=${code}`);
    } catch {}
  };

  // Room Join Handler
  const handleJoinRoom = (code: string, asSpectator: boolean = false) => {
    const cleanCode = code.trim().toUpperCase();
    const allPacks = [...WORD_PACKS, ...customPacks];
    const newGame = createNewGame(
      cleanCode,
      { ...userProfile, name: displayName },
      DEFAULT_SETTINGS,
      allPacks,
      avatarConfig
    );
    if (asSpectator) {
      newGame.players = newGame.players.map((p) =>
        p.id === userProfile.id ? { ...p, team: 'spectator' } : p
      );
    }
    setGameState(newGame);
    setCurrentView('home');

    try {
      const spectateQuery = asSpectator ? '&spectate=true' : '';
      window.history.pushState({}, '', `?room=${cleanCode}${spectateQuery}`);
    } catch {}
  };

  // URL parsing on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    const spectateFromUrl = params.get('spectate') === 'true';
    if (roomFromUrl && !gameState) {
      handleJoinRoom(roomFromUrl.toUpperCase(), spectateFromUrl);
    }
  }, []);

  // In-Game Handlers
  const handleJoinTeam = (team: TeamId) => {
    if (!gameState) return;
    sounds.playClick();
    setGameState((prev) => {
      if (!prev) return null;
      return movePlayerTeam(prev, userProfile.id, team);
    });
  };

  // Host or player moving another player
  const handleMovePlayer = (playerId: string, targetTeam: TeamId) => {
    if (!gameState) return;
    const actorPlayer = gameState.players.find((p) => p.id === userProfile.id);
    const actorName = actorPlayer?.isHost ? `${actorPlayer.name} (Host)` : actorPlayer?.name;
    sounds.playClick();
    setGameState((prev) => {
      if (!prev) return null;
      return movePlayerTeam(prev, playerId, targetTeam, actorName);
    });
  };

  const handleRandomizeTeams = () => {
    if (!gameState) return;
    sounds.playClick();
    setGameState((prev) => {
      if (!prev) return null;
      const nonSpectators = prev.players.filter((p) => p.team !== 'spectator');
      const shuffled = [...nonSpectators].sort(() => Math.random() - 0.5);
      const half = Math.ceil(shuffled.length / 2);
      const redIds = new Set(shuffled.slice(0, half).map((p) => p.id));

      return {
        ...prev,
        players: prev.players.map((p) => {
          if (p.team === 'spectator') return p;
          return {
            ...p,
            team: redIds.has(p.id) ? 'red' : 'blue',
          };
        }),
      };
    });
  };

  const handleAddBot = () => {
    if (!gameState) return;
    sounds.playClick();

    const redCount = gameState.players.filter((p) => p.team === 'red').length;
    const blueCount = gameState.players.filter((p) => p.team === 'blue').length;
    const team: TeamId = redCount <= blueCount ? 'red' : 'blue';

    const botNames = ['PixelFox', 'EchoBot', 'NovaStar', 'Sparky', 'GamerAI', 'Zippy'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];

    const botPlayer = {
      id: `bot-${Date.now()}`,
      name: botName,
      avatar: '🤖',
      team,
      isHost: false,
      isBot: true,
      points: 0,
      avatarConfig: {
        ...DEFAULT_AVATAR_CONFIG,
        bgIndex: Math.floor(Math.random() * 8),
        faceIndex: Math.floor(Math.random() * 6),
        nameColor: team === 'red' ? '#ff4b72' : '#3b82f6',
      },
    };

    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: [...prev.players, botPlayer],
      };
    });
  };

  const handleStartGame = () => {
    if (!gameState) return;
    sounds.playGameStart();

    const redPlayers = gameState.players.filter((p) => p.team === 'red');
    const bluePlayers = gameState.players.filter((p) => p.team === 'blue');

    if (redPlayers.length === 0 || bluePlayers.length === 0) return;

    const startingTeam: TeamId = 'red';
    const startingExplainer = redPlayers[0];

    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'playing',
        turn: {
          ...prev.turn,
          status: 'active',
          currentTeam: startingTeam,
          explainerId: startingExplainer.id,
          timeRemaining: prev.settings.turnTime,
          currentCardIndex: 0,
          pointsThisTurn: 0,
          skipsUsed: 0,
          correctWords: [],
          skippedWords: [],
          buzzedWords: [],
        },
      };
    });
  };

  const handleLeaveGame = () => {
    sounds.playClick();
    setGameState(null);
    setCurrentView('home');
    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch {}
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    if (!gameState) return;
    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings,
        },
      };
    });
  };

  const handleSaveSelectedPacks = (packIds: string[]) => {
    if (gameState) {
      handleUpdateSettings({ selectedPackIds: packIds });
    }
  };

  // Turn timer countdown effect during active game
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || gameState.turn.status !== 'active') {
      return;
    }

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.status !== 'playing' || prev.turn.status !== 'active') return prev;

        if (prev.turn.timeRemaining <= 1) {
          sounds.playTurnEnd();
          const teamLabel = prev.turn.currentTeam === 'red' ? 'Red Team' : 'Blue Team';
          const roundEndMsg = {
            id: `sys-${Date.now()}-round-end`,
            playerId: 'system',
            playerName: 'System',
            avatar: '🏁',
            team: 'spectator' as TeamId,
            text: `${teamLabel} earned ${prev.turn.pointsThisTurn} points in Round ${prev.currentRound}!`,
            timestamp: Date.now(),
            isSystem: true,
          };

          return {
            ...prev,
            turn: {
              ...prev.turn,
              timeRemaining: 0,
              status: 'turnEnded',
            },
            messages: [...prev.messages, roundEndMsg],
          };
        }

        if (prev.turn.timeRemaining <= 6) {
          sounds.playTick();
        }

        return {
          ...prev,
          turn: {
            ...prev.turn,
            timeRemaining: prev.turn.timeRemaining - 1,
          },
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.status, gameState?.turn?.status]);

  const handleCorrect = () => {
    if (!gameState || gameState.turn.status !== 'active') return;
    sounds.playCorrect();

    setGameState((prev) => {
      if (!prev) return null;
      const card = prev.turn.cardsInTurn[prev.turn.currentCardIndex];
      const team = prev.turn.currentTeam;
      const earned = card?.points || 4;

      const updatedPlayers = prev.players.map((p) =>
        p.id === userProfile.id ? { ...p, points: (p.points || 0) + earned } : p
      );

      return {
        ...prev,
        players: updatedPlayers,
        scores: {
          ...prev.scores,
          [team]: prev.scores[team] + earned,
        },
        turn: {
          ...prev.turn,
          currentCardIndex: (prev.turn.currentCardIndex + 1) % prev.turn.cardsInTurn.length,
          pointsThisTurn: prev.turn.pointsThisTurn + earned,
          correctWords: card ? [...prev.turn.correctWords, card.word] : prev.turn.correctWords,
        },
        messages: card
          ? [
              ...prev.messages,
              {
                id: `msg-${Date.now()}`,
                playerId: userProfile.id,
                playerName: displayName,
                avatar: '🎉',
                team,
                text: `${displayName}: got it! (correct word: "${card.word}") (+${earned}) ✓`,
                timestamp: Date.now(),
                isCorrectGuess: true,
              },
            ]
          : prev.messages,
      };
    });
  };

  const handleSkip = () => {
    if (!gameState || gameState.turn.status !== 'active') return;
    sounds.playSkip();

    setGameState((prev) => {
      if (!prev) return null;
      const card = prev.turn.cardsInTurn[prev.turn.currentCardIndex];

      return {
        ...prev,
        turn: {
          ...prev.turn,
          currentCardIndex: (prev.turn.currentCardIndex + 1) % prev.turn.cardsInTurn.length,
          skipsUsed: prev.turn.skipsUsed + 1,
          skippedWords: card ? [...prev.turn.skippedWords, card.word] : prev.turn.skippedWords,
        },
      };
    });
  };

  const handleBuzz = (tabooWord?: string) => {
    if (!gameState || gameState.turn.status !== 'active') return;
    sounds.playBuzz();

    setGameState((prev) => {
      if (!prev) return null;
      const card = prev.turn.cardsInTurn[prev.turn.currentCardIndex];
      const team = prev.turn.currentTeam;
      const currentExplainer = prev.players.find((p) => p.id === prev.turn.explainerId);
      const explainerName = currentExplainer?.name || 'explainer';

      const buzzNotification = tabooWord
        ? `${displayName} buzzed "${explainerName}" - taboo: "${tabooWord}" (-1 pt)`
        : `${displayName} buzzed "${explainerName}" (-1 pt)`;

      return {
        ...prev,
        scores: {
          ...prev.scores,
          [team]: Math.max(0, prev.scores[team] - 1),
        },
        turn: {
          ...prev.turn,
          currentCardIndex: (prev.turn.currentCardIndex + 1) % prev.turn.cardsInTurn.length,
          pointsThisTurn: prev.turn.pointsThisTurn - 1,
          buzzedWords: card ? [...prev.turn.buzzedWords, card.word] : prev.turn.buzzedWords,
        },
        messages: [
          ...prev.messages,
          {
            id: `msg-${Date.now()}`,
            playerId: userProfile.id,
            playerName: displayName,
            avatar: '🚨',
            team: 'spectator',
            text: buzzNotification,
            timestamp: Date.now(),
            isBuzzed: true,
          },
        ],
      };
    });
  };

  const handleNextTurn = () => {
    if (!gameState) return;
    sounds.playClick();

    const nextTeam: TeamId = gameState.turn.currentTeam === 'red' ? 'blue' : 'red';
    const teamPlayers = gameState.players.filter((p) => p.team === nextTeam);
    const nextExplainer = teamPlayers.length > 0 ? teamPlayers[0] : gameState.players[0];

    const isLastTurnOfRound = nextTeam === 'red';
    const nextRound = isLastTurnOfRound ? gameState.currentRound + 1 : gameState.currentRound;

    if (nextRound > gameState.totalRounds) {
      setGameState((prev) => (prev ? { ...prev, status: 'gameOver' } : null));
      return;
    }

    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentRound: nextRound,
        turn: {
          ...prev.turn,
          status: 'active',
          currentTeam: nextTeam,
          explainerId: nextExplainer.id,
          timeRemaining: prev.settings.turnTime,
          currentCardIndex: 0,
          pointsThisTurn: 0,
          skipsUsed: 0,
          correctWords: [],
          skippedWords: [],
          buzzedWords: [],
        },
      };
    });
  };

  const handleSkipExplainerTurn = () => {
    if (!gameState) return;
    sounds.playClick();
    setGameState((prev) => (prev ? skipExplainerTurn(prev, true, displayName) : null));
  };

  const handleTransferHost = (targetPlayerId: string) => {
    if (!gameState) return;
    sounds.playClick();
    setGameState((prev) => (prev ? transferHostRole(prev, targetPlayerId) : null));
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    if (!gameState) return;
    sounds.playClick();
    setGameState((prev) => (prev ? kickPlayerFromGame(prev, targetPlayerId, displayName) : null));
  };

  const handleEndGameEarly = () => {
    if (!gameState) return;
    sounds.playVictory();
    setGameState((prev) => (prev ? { ...prev, status: 'gameOver' } : null));
  };

  const handlePlayAgain = () => {
    if (!gameState) return;
    sounds.playClick();
    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'lobby',
        currentRound: 1,
        scores: { red: 0, blue: 0 },
        messages: [],
      };
    });
  };

  const handleSendMessage = (text: string) => {
    if (!gameState) return;
    const player = gameState.players.find((p) => p.id === userProfile.id);
    const card = gameState.turn.cardsInTurn[gameState.turn.currentCardIndex];
    const isGuesser =
      gameState.turn.status === 'active' &&
      player?.team === gameState.turn.currentTeam &&
      gameState.turn.explainerId !== userProfile.id;

    // Check fuzzy match for active guessers (accepts 1-2 letter typos)
    if (isGuesser && card) {
      const matchResult = checkGuessMatch(text, card.word, card.points || 4);
      if (matchResult.isMatch) {
        sounds.playCorrect();
        const earned = matchResult.points;
        const currentTeam = gameState.turn.currentTeam;

        setGameState((prev) => {
          if (!prev) return null;
          const updatedPlayers = prev.players.map((p) =>
            p.id === userProfile.id ? { ...p, points: (p.points || 0) + earned } : p
          );
          const nextCardIdx = (prev.turn.currentCardIndex + 1) % prev.turn.cardsInTurn.length;

          return {
            ...prev,
            players: updatedPlayers,
            scores: {
              ...prev.scores,
              [currentTeam]: prev.scores[currentTeam] + earned,
            },
            turn: {
              ...prev.turn,
              currentCardIndex: nextCardIdx,
              pointsThisTurn: prev.turn.pointsThisTurn + earned,
              correctWords: [...prev.turn.correctWords, card.word],
            },
            messages: [
              ...prev.messages,
              {
                id: `msg-${Date.now()}`,
                playerId: userProfile.id,
                playerName: displayName,
                avatar: player?.avatar || '🎉',
                team: currentTeam,
                text: `${displayName}: ${text} (correct word: "${card.word}") (+${earned}) ✓`,
                timestamp: Date.now(),
                isCorrectGuess: true,
              },
            ],
          };
        });
        return;
      }
    }

    // Standard chat message
    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: `msg-${Date.now()}`,
            playerId: userProfile.id,
            playerName: displayName,
            avatar: player?.avatar || '👱',
            team: player?.team || 'spectator',
            text,
            timestamp: Date.now(),
          },
        ],
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white relative">
      {/* 1. If currently inside a Room (Lobby or Active Game) */}
      {gameState ? (
        gameState.status === 'lobby' ? (
          <RoomLobby
            gameState={gameState}
            currentPlayerId={userProfile.id}
            avatarConfig={avatarConfig}
            onJoinTeam={handleJoinTeam}
            onMovePlayer={handleMovePlayer}
            onRandomizeTeams={handleRandomizeTeams}
            onAddBot={handleAddBot}
            onStartGame={handleStartGame}
            onLeaveGame={handleLeaveGame}
            onOpenHowToPlay={() => setActiveInfoModal('howToPlay')}
            onOpenProfile={() => setIsProfileDrawerOpen(true)}
            onOpenWordPacksModal={() => setIsWordPacksModalOpen(true)}
            onUpdateSettings={handleUpdateSettings}
          />
        ) : (
          <ActiveGameView
            gameState={gameState}
            currentPlayerId={userProfile.id}
            avatarConfig={avatarConfig}
            onCorrect={handleCorrect}
            onSkip={handleSkip}
            onBuzz={handleBuzz}
            onSendMessage={handleSendMessage}
            onNextTurn={handleNextTurn}
            onEndGameEarly={handleEndGameEarly}
            onSkipExplainerTurn={handleSkipExplainerTurn}
            onTransferHost={handleTransferHost}
            onKickPlayer={handleKickPlayer}
            onMovePlayer={handleMovePlayer}
            onGoHome={handleLeaveGame}
            onOpenProfile={() => setIsProfileDrawerOpen(true)}
          />
        )
      ) : currentView === 'create' ? (
        /* 2. Create Game View matching Screenshot 8 */
        <CreateGameScreen
          onBackToHome={() => setCurrentView('home')}
          displayName={displayName}
          avatarConfig={avatarConfig}
          avatarUrl={userProfile.avatarUrl}
          isGoogleUser={userProfile.isGoogleUser}
          useGooglePhoto={userProfile.useGooglePhoto}
          onEditProfile={() => setIsProfileDrawerOpen(true)}
          onCreateRoom={() => handleCreateRoom()}
        />
      ) : currentView === 'custom-packs' ? (
        /* 3. My Word Packs View matching Screenshot 4 */
        <CustomPacksScreen
          onBackToHome={() => setCurrentView('home')}
          onOpenNewPack={() => setCurrentView('create-custom-pack')}
          customPacks={customPacks}
          onDeletePack={handleDeleteCustomPack}
          displayName={displayName}
          avatarConfig={avatarConfig}
          onEditProfile={() => setIsProfileDrawerOpen(true)}
        />
      ) : currentView === 'create-custom-pack' ? (
        /* 4. Create Custom Pack Screen matching Screenshots 5, 6, 7 */
        <CreateCustomPackScreen
          onBackToPacks={() => setCurrentView('custom-packs')}
          onSavePack={handleSaveCustomPack}
          avatarConfig={avatarConfig}
          onEditProfile={() => setIsProfileDrawerOpen(true)}
        />
      ) : (
        /* 5. Main Landing Page matching Screenshot 1 */
        <>
          <Header
            userProfile={userProfile}
            avatarConfig={avatarConfig}
            onOpenProfile={() => setIsProfileDrawerOpen(true)}
            onOpenHowToPlay={() => setActiveInfoModal('howToPlay')}
            onOpenCustomPacks={() => setCurrentView('custom-packs')}
            onOpenGoogleSignIn={() => {
              setGoogleSignInIntent('general');
              setIsGoogleSignInOpen(true);
            }}
            onSignOutGoogle={handleSignOutGoogle}
            onGoHome={() => setCurrentView('home')}
            inGame={false}
          />
          <main className="flex-1 flex flex-col">
            <HeroSection
              onCreateRoomClick={handleInitiateCreateRoom}
              onJoinRoomClick={handleJoinRoom}
              isGoogleUser={userProfile.isGoogleUser}
              onGoogleSignInRequired={handleInitiateCreateRoom}
            />
            <InteractiveCardPreview />
            <HowItWorksSection />
            <FeaturesSection />
            <HowToPlaySection />
            <FaqSection />
          </main>
          <Footer
            onOpenHowToPlay={() => setActiveInfoModal('howToPlay')}
            onOpenFeedback={() => setActiveInfoModal('feedback')}
            onOpenTerms={() => setActiveInfoModal('terms')}
            onOpenPrivacy={() => setActiveInfoModal('privacy')}
          />
        </>
      )}

      {/* Profile & Avatar Customizer Drawer matching Screenshots 2 & 3 */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        displayName={displayName}
        avatarConfig={avatarConfig}
        initialName={displayName}
        initialConfig={avatarConfig}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onSave={handleSaveProfile}
        onOpenGoogleSignIn={() => {
          setGoogleSignInIntent('general');
          setIsGoogleSignInOpen(true);
        }}
      />

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={isGoogleSignInOpen}
        onClose={() => setIsGoogleSignInOpen(false)}
        onSuccess={handleGoogleSignInSuccess}
        title={
          googleSignInIntent === 'createRoom'
            ? 'Sign in to Create a Room'
            : 'Sign in with Google'
        }
        subtitle={
          googleSignInIntent === 'createRoom'
            ? 'Room creation is available for Google accounts. Guests can join and play any match without signing in.'
            : 'Sign in with Google to create rooms, use your Google profile photo, and host matches.'
        }
      />

      {/* Select Word Packs Modal matching Screenshot 11 */}
      <SelectWordPacksModal
        isOpen={isWordPacksModalOpen}
        onClose={() => setIsWordPacksModalOpen(false)}
        selectedPackIds={gameState?.settings.selectedPackIds || ['general']}
        onSave={handleSaveSelectedPacks}
        customPacks={customPacks}
        onOpenCustomPacksPage={() => {
          if (gameState) handleLeaveGame();
          setCurrentView('custom-packs');
        }}
      />

      {/* Game Over Victory Modal */}
      {gameState && gameState.status === 'gameOver' && (
        <GameOverModal
          gameState={gameState}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleLeaveGame}
        />
      )}

      {/* Information & Feedback Modals (Free & No Paywalls) */}
      <InfoModals
        type={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
      />
    </div>
  );
}
