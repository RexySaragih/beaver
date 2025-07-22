import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import redisService, { RoomData } from './redisService';
import { v4 as uuidv4 } from 'uuid';

export interface SocketUser {
  id: string;
  roomId: string;
  username?: string;
}

export interface CanvasUpdate {
  elements: any[];
  appState?: any;
  userId: string;
  timestamp: number;
}

export class SocketService {
  private io: SocketIOServer;
  private users: Map<string, SocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ["http://localhost:3123", "http://localhost:8080"],
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`[SocketService] User connected: ${socket.id}`);

      // Join room
      socket.on('join-room', async (data: { roomId: string; username?: string }) => {
        await this.handleJoinRoom(socket, data);
      });

      // Canvas update
      socket.on('canvas-update', async (data: CanvasUpdate) => {
        await this.handleCanvasUpdate(socket, data);
      });

      // User typing
      socket.on('user-typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
        this.handleUserTyping(socket, data);
      });

      // User cursor movement
      socket.on('cursor-move', (data: { roomId: string; userId: string; position: { x: number; y: number } }) => {
        this.handleCursorMove(socket, data);
      });

      // Disconnect
      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });
  }

  private async handleJoinRoom(socket: any, data: { roomId: string; username?: string }): Promise<void> {
    const { roomId, username } = data;
    const userId = socket.id;

    try {
      // Join the socket room
      socket.join(roomId);

      // Store user information
      const user: SocketUser = {
        id: userId,
        roomId,
        username: username || `User-${userId.slice(-4)}`
      };
      this.users.set(userId, user);

      // Add user to room in Redis
      await redisService.addCollaborator(roomId, userId);

      // Get existing room data
      const roomData = await redisService.getRoomData(roomId);
      
      // Send room data to the joining user
      socket.emit('room-joined', {
        roomId,
        elements: roomData?.elements || [],
        appState: roomData?.appState || {},
        collaborators: roomData?.collaborators || []
      });

      // Notify other users in the room
      socket.to(roomId).emit('user-joined', {
        userId,
        username: user.username,
        totalUsers: this.getRoomUserCount(roomId)
      });

      console.log(`[SocketService] User ${userId} joined room ${roomId}`);
    } catch (error) {
      console.error('[SocketService] Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private async handleCanvasUpdate(socket: any, data: CanvasUpdate): Promise<void> {
    const { elements, appState, userId, timestamp } = data;
    const user = this.users.get(userId);
    
    if (!user) {
      console.warn(`[SocketService] User ${userId} not found for canvas update`);
      return;
    }

    try {
      // Save to Redis
      await redisService.saveRoomData(user.roomId, {
        elements,
        appState,
        collaborators: await this.getRoomCollaborators(user.roomId)
      });

      // Broadcast to other users in the room
      socket.to(user.roomId).emit('canvas-updated', {
        elements,
        appState,
        userId,
        timestamp
      });

      console.log(`[SocketService] Canvas updated in room ${user.roomId} by user ${userId}`);
    } catch (error) {
      console.error('[SocketService] Error handling canvas update:', error);
      socket.emit('error', { message: 'Failed to update canvas' });
    }
  }

  private handleUserTyping(socket: any, data: { roomId: string; userId: string; isTyping: boolean }): void {
    const { roomId, userId, isTyping } = data;
    const user = this.users.get(userId);
    
    if (!user || user.roomId !== roomId) {
      return;
    }

    socket.to(roomId).emit('user-typing', {
      userId,
      username: user.username,
      isTyping
    });
  }

  private handleCursorMove(socket: any, data: { roomId: string; userId: string; position: { x: number; y: number } }): void {
    const { roomId, userId, position } = data;
    const user = this.users.get(userId);
    
    if (!user || user.roomId !== roomId) {
      return;
    }

    socket.to(roomId).emit('cursor-moved', {
      userId,
      username: user.username,
      position
    });
  }

  private async handleDisconnect(socket: any): Promise<void> {
    const userId = socket.id;
    const user = this.users.get(userId);

    if (user) {
      try {
        // Remove user from room in Redis
        await redisService.removeCollaborator(user.roomId, userId);
        
        // Notify other users
        socket.to(user.roomId).emit('user-left', {
          userId,
          username: user.username,
          totalUsers: this.getRoomUserCount(user.roomId) - 1
        });

        // Remove user from local map
        this.users.delete(userId);

        console.log(`[SocketService] User ${userId} disconnected from room ${user.roomId}`);
      } catch (error) {
        console.error('[SocketService] Error handling disconnect:', error);
      }
    }
  }

  private getRoomUserCount(roomId: string): number {
    let count = 0;
    for (const user of this.users.values()) {
      if (user.roomId === roomId) {
        count++;
      }
    }
    return count;
  }

  private async getRoomCollaborators(roomId: string): Promise<string[]> {
    const roomData = await redisService.getRoomData(roomId);
    return roomData?.collaborators || [];
  }

  /**
   * Generate a random room ID
   */
  public generateRoomId(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8);
  }

  /**
   * Get all users in a room
   */
  public getRoomUsers(roomId: string): SocketUser[] {
    const users: SocketUser[] = [];
    for (const user of this.users.values()) {
      if (user.roomId === roomId) {
        users.push(user);
      }
    }
    return users;
  }

  /**
   * Get user by ID
   */
  public getUser(userId: string): SocketUser | undefined {
    return this.users.get(userId);
  }

  /**
   * Get Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
} 