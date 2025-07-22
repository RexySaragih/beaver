import io from 'socket.io-client';
import type { Socket } from 'socket.io-client/build/esm/socket';

export interface CanvasUpdate {
  elements: any[];
  appState?: any;
  userId: string;
  timestamp: number;
}

export interface UserInfo {
  userId: string;
  username: string;
  isTyping?: boolean;
  position?: { x: number; y: number };
}

export interface RoomData {
  roomId: string;
  elements: any[];
  appState: any;
  collaborators: string[];
}

export class SocketClient {
  private socket: any = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private username: string | null = null;
  private isConnected = false;

  // Event callbacks
  private onCanvasUpdate: ((data: CanvasUpdate) => void) | null = null;
  private onUserJoined: ((user: UserInfo) => void) | null = null;
  private onUserLeft: ((user: UserInfo) => void) | null = null;
  private onUserTyping: ((user: UserInfo) => void) | null = null;
  private onCursorMove: ((user: UserInfo) => void) | null = null;
  private onRoomJoined: ((data: RoomData) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onConnect: (() => void) | null = null;
  private onDisconnect: (() => void) | null = null;

  constructor() {
    // Do not call setupEventHandlers here, only after socket is created
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.userId = this.socket?.id || null;
      console.log('[SocketClient] Connected to server');
      this.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[SocketClient] Disconnected from server');
      this.onDisconnect?.();
    });

    this.socket.on('room-joined', (data: RoomData) => {
      console.log('[SocketClient] Joined room:', data.roomId);
      this.roomId = data.roomId;
      this.onRoomJoined?.(data);
    });

    this.socket.on('canvas-updated', (data: CanvasUpdate) => {
      console.log('[SocketClient] Canvas updated by:', data.userId);
      this.onCanvasUpdate?.(data);
    });

    this.socket.on('user-joined', (user: UserInfo) => {
      console.log('[SocketClient] User joined:', user.username);
      this.onUserJoined?.(user);
    });

    this.socket.on('user-left', (user: UserInfo) => {
      console.log('[SocketClient] User left:', user.username);
      this.onUserLeft?.(user);
    });

    this.socket.on('user-typing', (user: UserInfo) => {
      this.onUserTyping?.(user);
    });

    this.socket.on('cursor-moved', (user: UserInfo) => {
      this.onCursorMove?.(user);
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('[SocketClient] Error:', data.message);
      this.onError?.(data.message);
    });
  }

  /**
   * Connect to Socket.IO server
   */
  connect(serverUrl: string = 'http://localhost:3124'): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(serverUrl);
    this.setupEventHandlers();
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string, username?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('[SocketClient] Not connected to server');
      return;
    }

    this.roomId = roomId;
    this.username = typeof username === 'string' ? username : null;
    this.socket.emit('join-room', { roomId, username });
  }

  /**
   * Send canvas update to other users
   */
  sendCanvasUpdate(elements: any[], appState?: any): void {
    if (!this.socket || !this.isConnected || !this.roomId) {
      console.error('[SocketClient] Not connected or not in room');
      return;
    }

    const update: CanvasUpdate = {
      elements,
      appState,
      userId: this.userId || '',
      timestamp: Date.now()
    };

    this.socket.emit('canvas-update', update);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(isTyping: boolean): void {
    if (!this.socket || !this.isConnected || !this.roomId) {
      return;
    }

    this.socket.emit('user-typing', {
      roomId: this.roomId,
      userId: this.userId,
      isTyping
    });
  }

  /**
   * Send cursor position
   */
  sendCursorPosition(position: { x: number; y: number }): void {
    if (!this.socket || !this.isConnected || !this.roomId) {
      return;
    }

    this.socket.emit('cursor-move', {
      roomId: this.roomId,
      userId: this.userId,
      position
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.roomId = null;
    this.userId = null;
    this.username = null;
  }

  /**
   * Get current connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get current room ID
   */
  getCurrentRoomId(): string | null {
    return this.roomId;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * Get current username
   */
  getCurrentUsername(): string | null {
    return this.username;
  }

  // Event setters
  setOnCanvasUpdate(callback: (data: CanvasUpdate) => void): void {
    this.onCanvasUpdate = callback;
  }

  setOnUserJoined(callback: (user: UserInfo) => void): void {
    this.onUserJoined = callback;
  }

  setOnUserLeft(callback: (user: UserInfo) => void): void {
    this.onUserLeft = callback;
  }

  setOnUserTyping(callback: (user: UserInfo) => void): void {
    this.onUserTyping = callback;
  }

  setOnCursorMove(callback: (user: UserInfo) => void): void {
    this.onCursorMove = callback;
  }

  setOnRoomJoined(callback: (data: RoomData) => void): void {
    this.onRoomJoined = callback;
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  setOnConnect(callback: () => void): void {
    this.onConnect = callback;
  }

  setOnDisconnect(callback: () => void): void {
    this.onDisconnect = callback;
  }
}

// Create singleton instance
const socketClient = new SocketClient();
export default socketClient; 