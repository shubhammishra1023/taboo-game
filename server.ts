import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Real-Time Room Store
interface ServerRoom {
  code: string;
  gameState: any;
  updatedAt: number;
}

const rooms = new Map<string, ServerRoom>();
const sseClients = new Map<string, Set<Response>>();

function broadcastRoomUpdate(code: string, updatedState: any) {
  const upperCode = code.toUpperCase();
  rooms.set(upperCode, {
    code: upperCode,
    gameState: updatedState,
    updatedAt: Date.now(),
  });

  const clients = sseClients.get(upperCode);
  if (clients && clients.size > 0) {
    const payload = `data: ${JSON.stringify({ type: 'STATE_UPDATE', state: updatedState })}\n\n`;
    for (const res of clients) {
      try {
        res.write(payload);
      } catch {
        clients.delete(res);
      }
    }
  }
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// 2. Fetch room by code
app.get('/api/rooms/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    res.status(404).json({ success: false, message: `Room ${code} not found` });
    return;
  }

  res.json({ success: true, room: room.gameState });
});

// 3. Create or register room (Host)
app.post('/api/rooms/create', (req: Request, res: Response) => {
  const { room } = req.body;
  if (!room || !room.roomCode) {
    res.status(400).json({ success: false, message: 'Invalid room state' });
    return;
  }

  const code = room.roomCode.toUpperCase();
  rooms.set(code, {
    code,
    gameState: room,
    updatedAt: Date.now(),
  });

  broadcastRoomUpdate(code, room);
  res.json({ success: true, room });
});

// 4. Join room (Guest)
app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const { player, asSpectator } = req.body;

  if (!player || !player.id) {
    res.status(400).json({ success: false, message: 'Invalid player profile' });
    return;
  }

  const room = rooms.get(code);
  if (!room) {
    res.status(404).json({ success: false, message: `Room ${code} does not exist` });
    return;
  }

  const state = room.gameState;
  const existingPlayerIndex = state.players.findIndex((p: any) => p.id === player.id);

  let updatedPlayers = [...state.players];

  if (existingPlayerIndex >= 0) {
    // Player re-joining: update details while preserving team and host status
    const current = updatedPlayers[existingPlayerIndex];
    updatedPlayers[existingPlayerIndex] = {
      ...current,
      name: player.name || current.name,
      avatar: player.avatar || current.avatar,
      avatarUrl: player.avatarUrl !== undefined ? player.avatarUrl : current.avatarUrl,
      avatarConfig: player.avatarConfig || current.avatarConfig,
    };
  } else {
    // Calculate balanced team
    const redCount = state.players.filter((p: any) => p.team === 'red').length;
    const blueCount = state.players.filter((p: any) => p.team === 'blue').length;
    const assignedTeam = asSpectator ? 'spectator' : redCount <= blueCount ? 'red' : 'blue';

    const newPlayer = {
      id: player.id,
      name: player.name || 'Guest Player',
      avatar: player.avatar || '👱',
      avatarUrl: player.avatarUrl,
      team: assignedTeam,
      isHost: false, // Joining players are NEVER the host
      points: 0,
      turnsPlayed: 0,
      avatarConfig: player.avatarConfig,
    };

    updatedPlayers.push(newPlayer);
  }

  const joinMsg = {
    id: `msg-join-${Date.now()}-${player.id}`,
    playerId: 'system',
    playerName: 'System',
    avatar: '👋',
    team: 'spectator',
    text: `${player.name || 'A player'} joined the room!`,
    timestamp: Date.now(),
    isSystem: true,
  };

  const nextState = {
    ...state,
    players: updatedPlayers,
    messages: [...(state.messages || []), joinMsg],
  };

  broadcastRoomUpdate(code, nextState);
  res.json({ success: true, room: nextState });
});

// 5. Room Real-Time SSE Stream
app.get('/api/rooms/:code/events', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(code)) {
    sseClients.set(code, new Set());
  }
  const clients = sseClients.get(code)!;
  clients.add(res);

  // Send current state immediately upon connecting
  const currentRoom = rooms.get(code);
  if (currentRoom) {
    res.write(`data: ${JSON.stringify({ type: 'STATE_UPDATE', state: currentRoom.gameState })}\n\n`);
  }

  // Periodic heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(':keep-alive\n\n');
    } catch {
      clearInterval(heartbeat);
      clients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

// 6. Generic Action or State Sync
app.post('/api/rooms/:code/action', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const { action, payload, senderId } = req.body;

  const room = rooms.get(code);
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  const state = room.gameState;
  let nextState = { ...state };

  switch (action) {
    case 'SYNC_STATE': {
      if (payload && payload.state) {
        nextState = payload.state;
      }
      break;
    }

    case 'MOVE_TEAM': {
      const { playerId, targetTeam, actorName } = payload;
      const targetPlayer = state.players.find((p: any) => p.id === playerId);
      if (targetPlayer) {
        const teamLabel =
          targetTeam === 'red' ? 'Red Team' : targetTeam === 'blue' ? 'Blue Team' : 'Spectators';
        const moveMsg = {
          id: `msg-${Date.now()}`,
          playerId: 'system',
          playerName: 'System',
          avatar: targetTeam === 'red' ? '🔴' : targetTeam === 'blue' ? '🔵' : '👀',
          team: targetTeam,
          text: actorName
            ? `${actorName} moved ${targetPlayer.name} to ${teamLabel}`
            : `${targetPlayer.name} joined ${teamLabel}`,
          timestamp: Date.now(),
          isSystem: true,
        };

        nextState.players = state.players.map((p: any) =>
          p.id === playerId ? { ...p, team: targetTeam } : p
        );
        nextState.messages = [...(state.messages || []), moveMsg];
      }
      break;
    }

    case 'UPDATE_SETTINGS': {
      nextState.settings = {
        ...state.settings,
        ...payload.settings,
      };
      break;
    }

    case 'RANDOMIZE_TEAMS': {
      const nonSpectators = state.players.filter((p: any) => p.team !== 'spectator');
      const shuffled = [...nonSpectators].sort(() => Math.random() - 0.5);
      const half = Math.ceil(shuffled.length / 2);
      const redIds = new Set(shuffled.slice(0, half).map((p: any) => p.id));

      nextState.players = state.players.map((p: any) => {
        if (p.team === 'spectator') return p;
        return {
          ...p,
          team: redIds.has(p.id) ? 'red' : 'blue',
        };
      });
      break;
    }

    case 'ADD_BOT': {
      const redCount = state.players.filter((p: any) => p.team === 'red').length;
      const blueCount = state.players.filter((p: any) => p.team === 'blue').length;
      const team = redCount <= blueCount ? 'red' : 'blue';
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
          backgroundIndex: Math.floor(Math.random() * 8),
          faceIndex: Math.floor(Math.random() * 6),
          hairIndex: Math.floor(Math.random() * 8),
          outfitIndex: Math.floor(Math.random() * 6),
          eyesIndex: Math.floor(Math.random() * 6),
          mouthIndex: Math.floor(Math.random() * 6),
          nameColor: team === 'red' ? '#ff4b72' : '#3b82f6',
        },
      };

      nextState.players = [...state.players, botPlayer];
      break;
    }

    case 'START_GAME': {
      const redPlayers = state.players.filter((p: any) => p.team === 'red');
      const bluePlayers = state.players.filter((p: any) => p.team === 'blue');

      if (redPlayers.length >= 1 && bluePlayers.length >= 1) {
        nextState.status = 'playing';
        nextState.turn = {
          ...state.turn,
          status: 'active',
          currentTeam: 'red',
          explainerId: redPlayers[0].id,
          timeRemaining: state.settings.turnTime,
          currentCardIndex: 0,
          pointsThisTurn: 0,
          skipsUsed: 0,
          correctWords: [],
          skippedWords: [],
          buzzedWords: [],
        };
      }
      break;
    }

    case 'SEND_MESSAGE': {
      const { text, sender } = payload;
      const clean = (text || '').trim();
      if (clean) {
        // If in active turn, check if word guessed
        let isCorrect = false;
        let earned = 4;
        let cardWord = '';

        if (state.status === 'playing' && state.turn.status === 'active') {
          const card = state.turn.cardsInTurn[state.turn.currentCardIndex];
          if (card) {
            cardWord = card.word;
            earned = card.points || 4;
            const normalizedText = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedTarget = cardWord.toLowerCase().replace(/[^a-z0-9]/g, '');

            if (normalizedText === normalizedTarget) {
              isCorrect = true;
            }
          }
        }

        if (isCorrect) {
          const currentTeam = state.turn.currentTeam;
          const nextCardIdx = (state.turn.currentCardIndex + 1) % state.turn.cardsInTurn.length;

          nextState.players = state.players.map((p: any) =>
            p.id === sender.id ? { ...p, points: (p.points || 0) + earned } : p
          );
          nextState.scores = {
            ...state.scores,
            [currentTeam]: (state.scores[currentTeam] || 0) + earned,
          };
          nextState.turn = {
            ...state.turn,
            currentCardIndex: nextCardIdx,
            pointsThisTurn: state.turn.pointsThisTurn + earned,
            correctWords: [...state.turn.correctWords, cardWord],
          };
          nextState.messages = [
            ...(state.messages || []),
            {
              id: `msg-${Date.now()}`,
              playerId: sender.id,
              playerName: sender.name,
              avatar: '🎉',
              team: currentTeam,
              text: `${sender.name}: ${clean} (correct word: "${cardWord}") (+${earned}) ✓`,
              timestamp: Date.now(),
              isCorrectGuess: true,
            },
          ];
        } else {
          nextState.messages = [
            ...(state.messages || []),
            {
              id: `msg-${Date.now()}`,
              playerId: sender.id,
              playerName: sender.name,
              avatar: sender.avatar || '👱',
              team: sender.team || 'spectator',
              text: clean,
              timestamp: Date.now(),
            },
          ];
        }
      }
      break;
    }

    case 'BUZZ': {
      const { tabooWord, senderName } = payload;
      const card = state.turn.cardsInTurn[state.turn.currentCardIndex];
      const team = state.turn.currentTeam;
      const currentExplainer = state.players.find((p: any) => p.id === state.turn.explainerId);
      const explainerName = currentExplainer?.name || 'explainer';

      const buzzNotification = tabooWord
        ? `${senderName} buzzed "${explainerName}" - taboo: "${tabooWord}" (-1 pt)`
        : `${senderName} buzzed "${explainerName}" (-1 pt)`;

      nextState.scores = {
        ...state.scores,
        [team]: Math.max(0, state.scores[team] - 1),
      };
      nextState.turn = {
        ...state.turn,
        currentCardIndex: (state.turn.currentCardIndex + 1) % state.turn.cardsInTurn.length,
        pointsThisTurn: state.turn.pointsThisTurn - 1,
        buzzedWords: card ? [...state.turn.buzzedWords, card.word] : state.turn.buzzedWords,
      };
      nextState.messages = [
        ...(state.messages || []),
        {
          id: `msg-${Date.now()}`,
          playerId: senderId,
          playerName: senderName,
          avatar: '🚨',
          team: 'spectator',
          text: buzzNotification,
          timestamp: Date.now(),
          isBuzzed: true,
        },
      ];
      break;
    }

    default:
      break;
  }

  broadcastRoomUpdate(code, nextState);
  res.json({ success: true, room: nextState });
});

// Vite middleware & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Taboo server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
