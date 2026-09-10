import { AvatarConfig } from './components/AvatarRenderer';

export type TeamId = 'red' | 'blue' | 'spectator';

export type GameMode = 'classic' | 'quickSix';

export interface TabooCard {
  id: string;
  word: string;
  tabooWords: string[];
  category: string;
  points?: number; // for quickSix
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  avatarConfig?: AvatarConfig;
  nameColor?: string;
  team: TeamId;
  isHost: boolean;
  isBot?: boolean;
  points: number;
  turnsPlayed: number;
}

export interface WordPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  cardCount: number;
  cards: TabooCard[];
  isCustom?: boolean;
  categoryType?: 'official' | 'community' | 'custom';
  bannerBg?: string;
  popularityRank?: number;
}

export interface GameSettings {
  mode: GameMode;
  rounds: number; // 1 to 10
  turnTime: number; // in seconds, e.g. 60
  tabooCount: number; // 3 to 5
  skipsPerTurn: number; // -1 for unlimited, 0, 1, 2, 3
  selectedPackIds: string[];
}

export type TurnStatus = 'waiting' | 'active' | 'turnEnded';

export interface TurnState {
  currentTeam: 'red' | 'blue';
  explainerId: string;
  status: TurnStatus;
  timeRemaining: number;
  currentCardIndex: number;
  cardsInTurn: TabooCard[];
  correctWords: string[];
  skippedWords: string[];
  buzzedWords: { word: string; tabooTriggered: string }[];
  pointsThisTurn: number;
  skipsUsed: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  avatarUrl?: string;
  team: TeamId;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isCorrectGuess?: boolean;
  isBuzzed?: boolean;
}

export interface GameState {
  roomCode: string;
  hostId?: string;
  status: 'lobby' | 'playing' | 'gameOver';
  currentRound: number;
  totalRounds: number;
  scores: {
    red: number;
    blue: number;
  };
  players: Player[];
  settings: GameSettings;
  turn: TurnState;
  messages: ChatMessage[];
  roundHistory: {
    round: number;
    redScore: number;
    blueScore: number;
  }[];
}
