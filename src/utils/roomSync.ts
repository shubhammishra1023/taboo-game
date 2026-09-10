import { GameState, Player, TeamId } from '../types';

export class RoomSyncManager {
  private roomCode: string = '';
  private isHost: boolean = false;
  private eventSource: EventSource | null = null;
  private channel: BroadcastChannel | null = null;
  private pollInterval: any = null;
  private onStateUpdateCallback: ((state: GameState) => void) | null = null;

  public init(
    roomCode: string,
    isHost: boolean,
    onStateUpdate: (state: GameState) => void,
    _onGuestAction?: (action: string, payload: any, senderId: string) => void
  ) {
    this.destroy();
    this.roomCode = roomCode.toUpperCase();
    this.isHost = isHost;
    this.onStateUpdateCallback = onStateUpdate;

    // 1. Same-origin BroadcastChannel for zero-latency local tab sync
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(`taboo_channel_${this.roomCode}`);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATE' && event.data?.state) {
            this.saveStateLocally(this.roomCode, event.data.state);
            this.onStateUpdateCallback?.(event.data.state);
          }
        };
      }
    } catch {}

    // 2. Real-Time Server-Sent Events (SSE) from our Express server
    this.connectSSE();

    // 3. Periodic fallback poll to guarantee 100% sync even if SSE is interrupted
    this.pollInterval = setInterval(() => {
      this.pollCurrentState();
    }, 2500);
  }

  private connectSSE() {
    if (typeof window === 'undefined' || !this.roomCode) return;

    try {
      const sseUrl = `/api/rooms/${this.roomCode}/events`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.state) {
            this.saveStateLocally(this.roomCode, data.state);
            this.onStateUpdateCallback?.(data.state);
          }
        } catch {}
      };

      this.eventSource.onerror = () => {
        // SSE connection dropped; will reconnect automatically.
        // Fallback polling keeps state fresh in the meantime.
      };
    } catch (e) {
      console.warn('SSE connection failed, falling back to polling:', e);
    }
  }

  private async pollCurrentState() {
    if (!this.roomCode || !this.onStateUpdateCallback) return;

    try {
      const res = await fetch(`/api/rooms/${this.roomCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          this.saveStateLocally(this.roomCode, data.room);
          this.onStateUpdateCallback(data.room);
        }
      }
    } catch {}
  }

  // Fetch room state from server
  public async fetchRoom(code: string): Promise<{ success: boolean; room?: GameState; message?: string }> {
    try {
      const res = await fetch(`/api/rooms/${code.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, room: data.room };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Room not found' };
    } catch {
      return { success: false, message: 'Network connection failed' };
    }
  }

  // Register or create room on server
  public async registerRoomOnServer(state: GameState): Promise<boolean> {
    try {
      this.saveStateLocally(state.roomCode, state);
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: state }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Join room on server
  public async joinRoomOnServer(
    code: string,
    playerProfile: {
      id: string;
      name: string;
      avatar: string;
      avatarUrl?: string;
      avatarConfig?: any;
    },
    asSpectator: boolean = false
  ): Promise<{ success: boolean; room?: GameState; message?: string }> {
    try {
      const res = await fetch(`/api/rooms/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: playerProfile, asSpectator }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          this.saveStateLocally(code, data.room);
          return { success: true, room: data.room };
        }
      }

      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Unable to join room' };
    } catch {
      return { success: false, message: 'Connection error while joining room' };
    }
  }

  // Broadcast state from host to all players
  public broadcastState(state: GameState) {
    this.saveStateLocally(state.roomCode, state);

    // 1. Broadcast locally across browser tabs
    try {
      if (this.channel) {
        this.channel.postMessage({ type: 'STATE_UPDATE', state });
      }
    } catch {}

    // 2. Post to server to push to all external connected players via SSE
    fetch(`/api/rooms/${state.roomCode.toUpperCase()}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_STATE',
        payload: { state },
        senderId: state.hostId || 'host',
      }),
    }).catch(() => {});
  }

  // Send action (guest or host) to server
  public sendAction(action: string, payload: any, senderId: string) {
    if (!this.roomCode) return;

    fetch(`/api/rooms/${this.roomCode}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        payload,
        senderId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.room) {
          this.saveStateLocally(this.roomCode, data.room);
          this.onStateUpdateCallback?.(data.room);
        }
      })
      .catch(() => {});
  }

  // Backwards compatible method for guest messages
  public sendToHost(message: any) {
    if (!this.roomCode) return;
    if (message.type === 'PLAYER_ACTION') {
      this.sendAction(message.action, message.payload, message.senderId);
    } else if (message.type === 'JOIN_REQUEST') {
      this.joinRoomOnServer(this.roomCode, message.player, message.asSpectator);
    }
  }

  public saveStateLocally(roomCode: string, state: GameState) {
    try {
      localStorage.setItem(`taboo_room_${roomCode.toUpperCase()}`, JSON.stringify(state));
    } catch {}
  }

  public getSavedState(roomCode: string): GameState | null {
    try {
      const data = localStorage.getItem(`taboo_room_${roomCode.toUpperCase()}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  public removeSavedState(roomCode: string) {
    try {
      localStorage.removeItem(`taboo_room_${roomCode.toUpperCase()}`);
    } catch {}
  }

  public destroy() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }
    if (this.channel) {
      try {
        this.channel.close();
      } catch {}
      this.channel = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.onStateUpdateCallback = null;
  }
}

export const roomSync = new RoomSyncManager();
