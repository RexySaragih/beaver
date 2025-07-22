import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

export interface RoomData {
  elements: any[];
  appState: any;
  collaborators: string[];
  lastUpdated: number;
}

export class RedisService {
  private static instance: RedisService;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Get room data from Redis
   */
  async getRoomData(roomId: string): Promise<RoomData | null> {
    try {
      const key = `beaver:room:${roomId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[RedisService] Error getting room data:', error);
      return null;
    }
  }

  /**
   * Save room data to Redis
   */
  async saveRoomData(roomId: string, data: Partial<RoomData>): Promise<void> {
    try {
      const key = `beaver:room:${roomId}`;
      const existingData = await this.getRoomData(roomId);
      const updatedData: RoomData = {
        elements: data.elements || existingData?.elements || [],
        appState: data.appState || existingData?.appState || {},
        collaborators: data.collaborators || existingData?.collaborators || [],
        lastUpdated: Date.now(),
      };
      
      await this.redis.set(key, JSON.stringify(updatedData), 'EX', 86400); // 24 hours TTL
      console.log(`[RedisService] Saved room data for room: ${roomId}`);
    } catch (error) {
      console.error('[RedisService] Error saving room data:', error);
      throw error;
    }
  }

  /**
   * Add collaborator to room
   */
  async addCollaborator(roomId: string, userId: string): Promise<void> {
    try {
      const key = `beaver:room:${roomId}`;
      const existingData = await this.getRoomData(roomId);
      const collaborators = existingData?.collaborators || [];
      
      if (!collaborators.includes(userId)) {
        collaborators.push(userId);
        await this.saveRoomData(roomId, { collaborators });
      }
    } catch (error) {
      console.error('[RedisService] Error adding collaborator:', error);
      throw error;
    }
  }

  /**
   * Remove collaborator from room
   */
  async removeCollaborator(roomId: string, userId: string): Promise<void> {
    try {
      const key = `beaver:room:${roomId}`;
      const existingData = await this.getRoomData(roomId);
      const collaborators = existingData?.collaborators || [];
      
      const updatedCollaborators = collaborators.filter(id => id !== userId);
      await this.saveRoomData(roomId, { collaborators: updatedCollaborators });
    } catch (error) {
      console.error('[RedisService] Error removing collaborator:', error);
      throw error;
    }
  }

  /**
   * Get all rooms (for cleanup purposes)
   */
  async getAllRooms(): Promise<string[]> {
    try {
      const keys = await this.redis.keys('beaver:room:*');
      return keys.map(key => key.replace('beaver:room:', ''));
    } catch (error) {
      console.error('[RedisService] Error getting all rooms:', error);
      return [];
    }
  }

  /**
   * Delete room data
   */
  async deleteRoom(roomId: string): Promise<void> {
    try {
      const key = `beaver:room:${roomId}`;
      await this.redis.del(key);
      console.log(`[RedisService] Deleted room: ${roomId}`);
    } catch (error) {
      console.error('[RedisService] Error deleting room:', error);
      throw error;
    }
  }

  /**
   * Clean up expired rooms (older than 24 hours)
   */
  async cleanupExpiredRooms(): Promise<void> {
    try {
      const rooms = await this.getAllRooms();
      const now = Date.now();
      const expiredRooms: string[] = [];

      for (const roomId of rooms) {
        const roomData = await this.getRoomData(roomId);
        if (roomData && (now - roomData.lastUpdated) > 86400000) { // 24 hours
          expiredRooms.push(roomId);
        }
      }

      for (const roomId of expiredRooms) {
        await this.deleteRoom(roomId);
      }

      if (expiredRooms.length > 0) {
        console.log(`[RedisService] Cleaned up ${expiredRooms.length} expired rooms`);
      }
    } catch (error) {
      console.error('[RedisService] Error cleaning up expired rooms:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export default RedisService.getInstance(); 