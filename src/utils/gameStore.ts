import { ChatMessage, GameMode, GameSettings, GameState, Player, TabooCard, TeamId, WordPack } from '../types';
import { getCardsForGame, WORD_PACKS } from '../data/words';
export { getCardsForGame };
import { sounds } from './audio';
import { AvatarConfig } from '../components/AvatarRenderer';

// Helper to generate 4-letter room codes like Stormio (e.g. CUBZ, ROSE, WAVE)
export function generateRoomCode(): string {
  const letters = 'BCDFGHJKLMNPQRSTVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  avatarUrl?: string;
  isGoogleUser?: boolean;
  useGooglePhoto?: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  rounds: 3,
  turnTime: 60,
  tabooCount: 5,
  skipsPerTurn: -1, // Unlimited
  selectedPackIds: ['general', 'countries', 'movies', 'food'],
};

export const BOT_NAMES = ['Cosmo 🤖', 'Luna 🦊', 'Sparky ⚡', 'Pixel 🎮', 'Pip 🐱', 'Ziggy 🌟'];

// Helper to create initial game state
export function createNewGame(
  roomCode: string,
  host: UserProfile,
  settings: GameSettings = DEFAULT_SETTINGS,
  allPacks: WordPack[] = WORD_PACKS,
  avatarConfig?: AvatarConfig
): GameState {
  const hostPlayer: Player = {
    id: host.id,
    name: host.name,
    avatar: host.avatar,
    avatarUrl: host.useGooglePhoto !== false ? host.avatarUrl : undefined,
    team: 'red',
    isHost: true,
    points: 0,
    turnsPlayed: 0,
    avatarConfig,
  };

  const initialCards = getCardsForGame(settings.selectedPackIds, 50, allPacks);

  return {
    roomCode,
    hostId: host.id,
    status: 'lobby',
    currentRound: 1,
    totalRounds: settings.rounds,
    scores: {
      red: 0,
      blue: 0,
    },
    players: [hostPlayer],
    settings,
    turn: {
      currentTeam: 'red',
      explainerId: host.id,
      status: 'waiting',
      timeRemaining: settings.turnTime,
      currentCardIndex: 0,
      cardsInTurn: initialCards,
      correctWords: [],
      skippedWords: [],
      buzzedWords: [],
      pointsThisTurn: 0,
      skipsUsed: 0,
    },
    messages: [
      {
        id: `sys-${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        avatar: '⚡',
        team: 'spectator',
        text: `Room ${roomCode} created! Share the code with friends to join.`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ],
    roundHistory: [],
  };
}

// Helper to create a guest game state for a player joining via link while syncing
export function createGuestGame(
  roomCode: string,
  guest: UserProfile,
  asSpectator: boolean = false,
  avatarConfig?: AvatarConfig
): GameState {
  const hostPlaceholder: Player = {
    id: `host-placeholder-${roomCode}`,
    name: 'Room Host',
    avatar: '👑',
    team: 'red',
    isHost: true,
    points: 0,
    turnsPlayed: 0,
  };

  const guestPlayer: Player = {
    id: guest.id,
    name: guest.name,
    avatar: guest.avatar,
    avatarUrl: guest.useGooglePhoto !== false ? guest.avatarUrl : undefined,
    team: asSpectator ? 'spectator' : 'blue',
    isHost: false, // Never host!
    points: 0,
    turnsPlayed: 0,
    avatarConfig,
  };

  const initialCards = getCardsForGame(DEFAULT_SETTINGS.selectedPackIds, 50, WORD_PACKS);

  return {
    roomCode,
    status: 'lobby',
    currentRound: 1,
    totalRounds: DEFAULT_SETTINGS.rounds,
    scores: { red: 0, blue: 0 },
    players: [hostPlaceholder, guestPlayer],
    settings: DEFAULT_SETTINGS,
    turn: {
      currentTeam: 'red',
      explainerId: hostPlaceholder.id,
      status: 'waiting',
      timeRemaining: DEFAULT_SETTINGS.turnTime,
      currentCardIndex: 0,
      cardsInTurn: initialCards,
      correctWords: [],
      skippedWords: [],
      buzzedWords: [],
      pointsThisTurn: 0,
      skipsUsed: 0,
    },
    messages: [
      {
        id: `sys-${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        avatar: '⚡',
        team: 'spectator',
        text: `Connecting to room ${roomCode}...`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ],
    roundHistory: [],
  };
}

// Add a player to an existing game state with team balancing and isHost=false
export function addPlayerToGame(
  gameState: GameState,
  playerProfile: {
    id: string;
    name: string;
    avatar: string;
    avatarUrl?: string;
    avatarConfig?: AvatarConfig;
  },
  asSpectator: boolean = false
): GameState {
  // If player already exists, update their profile details
  const existingIndex = gameState.players.findIndex((p) => p.id === playerProfile.id);
  if (existingIndex >= 0) {
    const updatedPlayers = gameState.players.map((p) =>
      p.id === playerProfile.id
        ? {
            ...p,
            name: playerProfile.name,
            avatar: playerProfile.avatar,
            avatarUrl: playerProfile.avatarUrl,
            avatarConfig: playerProfile.avatarConfig || p.avatarConfig,
          }
        : p
    );
    return { ...gameState, players: updatedPlayers };
  }

  // Remove any temporary placeholder host if a real host exists
  let currentPlayers = gameState.players;
  if (currentPlayers.some((p) => p.isHost && p.id.startsWith('host-placeholder-')) && currentPlayers.length > 1) {
    currentPlayers = currentPlayers.filter((p) => !p.id.startsWith('host-placeholder-'));
  }

  // Balance teams
  const redCount = currentPlayers.filter((p) => p.team === 'red').length;
  const blueCount = currentPlayers.filter((p) => p.team === 'blue').length;
  const targetTeam: TeamId = asSpectator
    ? 'spectator'
    : redCount > blueCount
    ? 'blue'
    : 'red';

  const newPlayer: Player = {
    id: playerProfile.id,
    name: playerProfile.name,
    avatar: playerProfile.avatar,
    avatarUrl: playerProfile.avatarUrl,
    avatarConfig: playerProfile.avatarConfig,
    team: targetTeam,
    isHost: false, // Guest is never host!
    points: 0,
    turnsPlayed: 0,
  };

  const joinMessage: ChatMessage = {
    id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    playerId: 'system',
    playerName: 'System',
    avatar: '👋',
    team: targetTeam,
    text: `${playerProfile.name} joined the room!`,
    timestamp: Date.now(),
    isSystem: true,
  };

  return {
    ...gameState,
    players: [...currentPlayers, newPlayer],
    messages: [...gameState.messages, joinMessage],
  };
}

// Levenshtein distance for fuzzy matching 1-2 letter typos
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

// Normalize text for guessing comparison
export function cleanGuess(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^a-z0-9]/g, '');
}

export interface GuessMatchResult {
  isMatch: boolean;
  isTypo: boolean;
  targetWord: string;
  points: number;
}

export function getCardPoints(card: TabooCard): number {
  if (card.points && card.points > 0) return card.points;
  // Deterministic realistic points (2, 3, or 4 pts) matching screenshots
  const hash = card.word.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 3) + 2; // 2, 3, or 4 pts
}

export function isGuessMatch(guess: string, targetWord: string): boolean {
  const res = checkGuessMatch(guess, targetWord);
  return res.isMatch;
}

export function checkGuessMatch(rawGuess: string, targetWord: string, cardPoints: number = 4): GuessMatchResult {
  const g = cleanGuess(rawGuess);
  const t = cleanGuess(targetWord);
  if (!g || !t) return { isMatch: false, isTypo: false, targetWord, points: cardPoints };

  // 1. Exact match
  if (g === t) {
    return { isMatch: true, isTypo: false, targetWord, points: cardPoints };
  }

  // 2. Plural / Singular match
  if (g + 's' === t || t + 's' === g || g + 'es' === t || t + 'es' === g) {
    return { isMatch: true, isTypo: false, targetWord, points: cardPoints };
  }

  // 3. Typo matching (1 to 2 letter mistake as required in PDF Page 4 & 5)
  const dist = levenshteinDistance(g, t);
  if (t.length >= 4 && t.length <= 5 && dist <= 1) {
    return { isMatch: true, isTypo: true, targetWord, points: cardPoints };
  }
  if (t.length >= 6 && dist <= 2) {
    return { isMatch: true, isTypo: true, targetWord, points: cardPoints };
  }

  // 4. In case the user typed a sentence containing the word, e.g. "it is a lasaer"
  const words = rawGuess.toLowerCase().split(/\s+/).map(cleanGuess).filter(Boolean);
  for (const w of words) {
    if (w === t || w + 's' === t || t + 's' === w) {
      return { isMatch: true, isTypo: false, targetWord, points: cardPoints };
    }
    const wDist = levenshteinDistance(w, t);
    if (t.length >= 4 && t.length <= 5 && wDist <= 1) {
      return { isMatch: true, isTypo: true, targetWord, points: cardPoints };
    }
    if (t.length >= 6 && wDist <= 2) {
      return { isMatch: true, isTypo: true, targetWord, points: cardPoints };
    }
  }

  return { isMatch: false, isTypo: false, targetWord, points: cardPoints };
}

// Move player to a different team or spectator mode safely
export function movePlayerTeam(
  gameState: GameState,
  playerId: string,
  targetTeam: TeamId,
  actorName?: string
): GameState {
  const targetPlayer = gameState.players.find((p) => p.id === playerId);
  if (!targetPlayer || targetPlayer.team === targetTeam) return gameState;

  const previousTeam = targetPlayer.team;
  const updatedPlayers = gameState.players.map((p) =>
    p.id === playerId ? { ...p, team: targetTeam } : p
  );

  let updatedTurn = { ...gameState.turn };
  const extraMessages: ChatMessage[] = [];

  // If in an active match and the moved player is the current explainer
  if (gameState.status === 'playing') {
    if (gameState.turn.explainerId === playerId && targetTeam === 'spectator') {
      // Find another active player on current team
      const remainingTeamPlayers = updatedPlayers.filter(
        (p) => p.team === gameState.turn.currentTeam && p.id !== playerId
      );

      if (remainingTeamPlayers.length > 0) {
        const nextExplainer = remainingTeamPlayers[0];
        updatedTurn.explainerId = nextExplainer.id;
        extraMessages.push({
          id: `sys-${Date.now()}-explainer`,
          playerId: 'system',
          playerName: 'System',
          avatar: '🔄',
          team: 'spectator',
          text: `${targetPlayer.name} moved to Spectator. ${nextExplainer.name} is now giving clues!`,
          timestamp: Date.now(),
          isSystem: true,
        });
      } else {
        // Switch turn to other team if no players left on this team
        const nextTeam: 'red' | 'blue' = gameState.turn.currentTeam === 'red' ? 'blue' : 'red';
        const otherTeamPlayers = updatedPlayers.filter((p) => p.team === nextTeam);
        if (otherTeamPlayers.length > 0) {
          updatedTurn = {
            ...updatedTurn,
            currentTeam: nextTeam,
            explainerId: otherTeamPlayers[0].id,
            timeRemaining: gameState.settings.turnTime,
            status: 'active',
            pointsThisTurn: 0,
            skipsUsed: 0,
          };
          extraMessages.push({
            id: `sys-${Date.now()}-switch`,
            playerId: 'system',
            playerName: 'System',
            avatar: '⚠️',
            team: 'spectator',
            text: `No active players left on ${previousTeam.toUpperCase()} team. Turn passed to ${nextTeam.toUpperCase()}!`,
            timestamp: Date.now(),
            isSystem: true,
          });
        }
      }
    }
  }

  const roleLabel =
    targetTeam === 'spectator'
      ? 'Spectators 👁️'
      : targetTeam === 'red'
      ? 'Red Team 🔴'
      : 'Blue Team 🔵';

  const actionText = actorName
    ? `${actorName} moved ${targetPlayer.name} to ${roleLabel}.`
    : `${targetPlayer.name} switched to ${roleLabel}.`;

  const statusMsg: ChatMessage = {
    id: `sys-${Date.now()}`,
    playerId: 'system',
    playerName: 'System',
    avatar: targetTeam === 'spectator' ? '👁️' : '👥',
    team: 'spectator',
    text: actionText,
    timestamp: Date.now(),
    isSystem: true,
  };

  return {
    ...gameState,
    players: updatedPlayers,
    turn: updatedTurn,
    messages: [...gameState.messages, statusMsg, ...extraMessages],
  };
}

// Host skipping a player's turn from explaining:
// "if he skips then turn passes to next person in his team…. If host skip turn player of another team then it passes to next person in another team"
export function skipExplainerTurn(
  gameState: GameState,
  isHostAction: boolean = true,
  actorName: string = 'Host'
): GameState {
  const currentTeam = gameState.turn.currentTeam;
  const teamPlayers = gameState.players.filter((p) => p.team === currentTeam);
  const currentExplainer = gameState.players.find((p) => p.id === gameState.turn.explainerId);
  const explainerName = currentExplainer?.name || 'Player';

  let nextExplainer: Player | undefined;
  let nextTeam = currentTeam;

  if (teamPlayers.length > 1) {
    const currentIndex = teamPlayers.findIndex((p) => p.id === gameState.turn.explainerId);
    const nextIndex = (currentIndex + 1) % teamPlayers.length;
    nextExplainer = teamPlayers[nextIndex];
  } else {
    // Pass to next person in other team
    nextTeam = currentTeam === 'red' ? 'blue' : 'red';
    const otherTeamPlayers = gameState.players.filter((p) => p.team === nextTeam);
    nextExplainer = otherTeamPlayers[0] || currentExplainer;
  }

  const notificationText = isHostAction
    ? `Host skipped ${explainerName}'s turn`
    : `${explainerName} skipped their turn`;

  const skipMessage: ChatMessage = {
    id: `sys-${Date.now()}-skip`,
    playerId: 'system',
    playerName: 'System',
    avatar: '⏭️',
    team: currentTeam,
    text: notificationText,
    timestamp: Date.now(),
    isSystem: true,
  };

  return {
    ...gameState,
    turn: {
      ...gameState.turn,
      currentTeam: nextTeam,
      explainerId: nextExplainer?.id || gameState.turn.explainerId,
      timeRemaining: gameState.settings.turnTime,
      currentCardIndex: (gameState.turn.currentCardIndex + 1) % gameState.turn.cardsInTurn.length,
      pointsThisTurn: 0,
      skipsUsed: 0,
      status: 'active',
    },
    messages: [...gameState.messages, skipMessage],
  };
}

// Host transfer action matching Screenshot on Page 3
export function transferHostRole(
  gameState: GameState,
  targetPlayerId: string,
  actorName?: string
): GameState {
  const target = gameState.players.find((p) => p.id === targetPlayerId);
  if (!target) return gameState;

  const updatedPlayers = gameState.players.map((p) => ({
    ...p,
    isHost: p.id === targetPlayerId,
  }));

  const msg: ChatMessage = {
    id: `sys-${Date.now()}-host`,
    playerId: 'system',
    playerName: 'System',
    avatar: '👑',
    team: 'spectator',
    text: `${target.name} is now the room host.`,
    timestamp: Date.now(),
    isSystem: true,
  };

  return {
    ...gameState,
    players: updatedPlayers,
    messages: [...gameState.messages, msg],
  };
}

// Host kick action matching Screenshot on Page 3
export function kickPlayerFromGame(
  gameState: GameState,
  targetPlayerId: string,
  actorName?: string
): GameState {
  const target = gameState.players.find((p) => p.id === targetPlayerId);
  if (!target) return gameState;

  const updatedPlayers = gameState.players.filter((p) => p.id !== targetPlayerId);
  let updatedTurn = { ...gameState.turn };

  if (gameState.status === 'playing' && gameState.turn.explainerId === targetPlayerId) {
    const remainingTeam = updatedPlayers.filter((p) => p.team === gameState.turn.currentTeam);
    if (remainingTeam.length > 0) {
      updatedTurn.explainerId = remainingTeam[0].id;
    } else {
      const otherTeam = gameState.turn.currentTeam === 'red' ? 'blue' : 'red';
      const otherTeamPlayers = updatedPlayers.filter((p) => p.team === otherTeam);
      if (otherTeamPlayers.length > 0) {
        updatedTurn.currentTeam = otherTeam;
        updatedTurn.explainerId = otherTeamPlayers[0].id;
      }
    }
  }

  const msg: ChatMessage = {
    id: `sys-${Date.now()}-kick`,
    playerId: 'system',
    playerName: 'System',
    avatar: '🚪',
    team: 'spectator',
    text: `Host kicked ${target.name} from the room.`,
    timestamp: Date.now(),
    isSystem: true,
  };

  return {
    ...gameState,
    players: updatedPlayers,
    turn: updatedTurn,
    messages: [...gameState.messages, msg],
  };
}

// Unified chat and guess evaluation
export function applyChatMessage(
  gameState: GameState,
  text: string,
  sender: { id: string; name: string; avatar: string; team: TeamId }
): { updatedState: GameState; isCorrect: boolean } {
  const clean = text.trim();
  if (!clean) return { updatedState: gameState, isCorrect: false };

  // Check if guessing during active turn
  if (gameState.status === 'playing' && gameState.turn.status === 'active') {
    const card = gameState.turn.cardsInTurn[gameState.turn.currentCardIndex];
    if (card) {
      const matchResult = checkGuessMatch(clean, card.word, card.points || 4);
      if (matchResult.isMatch) {
        const earned = matchResult.points;
        const currentTeam = gameState.turn.currentTeam;
        const nextCardIdx = (gameState.turn.currentCardIndex + 1) % gameState.turn.cardsInTurn.length;

        const updatedPlayers = gameState.players.map((p) =>
          p.id === sender.id ? { ...p, points: (p.points || 0) + earned } : p
        );

        const correctMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          playerId: sender.id,
          playerName: sender.name,
          avatar: sender.avatar,
          team: currentTeam,
          text: `${sender.name}: ${clean} (correct word: "${card.word}") (+${earned}) ✓`,
          timestamp: Date.now(),
          isCorrectGuess: true,
        };

        return {
          isCorrect: true,
          updatedState: {
            ...gameState,
            players: updatedPlayers,
            scores: {
              ...gameState.scores,
              [currentTeam]: gameState.scores[currentTeam] + earned,
            },
            turn: {
              ...gameState.turn,
              currentCardIndex: nextCardIdx,
              pointsThisTurn: gameState.turn.pointsThisTurn + earned,
              correctWords: [...gameState.turn.correctWords, card.word],
            },
            messages: [...gameState.messages, correctMsg],
          },
        };
      }
    }
  }

  // Standard chat message
  const chatMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    playerId: sender.id,
    playerName: sender.name,
    avatar: sender.avatar,
    team: sender.team,
    text: clean,
    timestamp: Date.now(),
  };

  return {
    isCorrect: false,
    updatedState: {
      ...gameState,
      messages: [...gameState.messages, chatMsg],
    },
  };
}

// Unified buzz action
export function applyBuzzAction(
  gameState: GameState,
  tabooWord: string,
  buzzerName?: string
): GameState {
  if (gameState.status !== 'playing' || gameState.turn.status !== 'active') return gameState;
  const currentCard = gameState.turn.cardsInTurn[gameState.turn.currentCardIndex];
  if (!currentCard) return gameState;

  const currentTeam = gameState.turn.currentTeam;
  const nextCardIdx = (gameState.turn.currentCardIndex + 1) % gameState.turn.cardsInTurn.length;

  const buzzMessage: ChatMessage = {
    id: `msg-${Date.now()}-buzz`,
    playerId: 'system',
    playerName: 'System',
    avatar: '🚨',
    team: currentTeam,
    text: buzzerName
      ? `🚨 ${buzzerName} BUZZED! Taboo word "${tabooWord}" was triggered!`
      : `🚨 BUZZED! Taboo word "${tabooWord}" was triggered!`,
    timestamp: Date.now(),
    isBuzzed: true,
  };

  return {
    ...gameState,
    scores: {
      ...gameState.scores,
      [currentTeam]: Math.max(0, gameState.scores[currentTeam] - 1),
    },
    turn: {
      ...gameState.turn,
      currentCardIndex: nextCardIdx,
      pointsThisTurn: Math.max(0, gameState.turn.pointsThisTurn - 1),
      buzzedWords: [
        ...gameState.turn.buzzedWords,
        { word: currentCard.word, tabooTriggered: tabooWord },
      ],
    },
    messages: [...gameState.messages, buzzMessage],
  };
}



