import express from 'express';
import multer from 'multer';
import path from 'path';
import { generateDocumentation } from './documentationGenerator';
import dotenv from 'dotenv';
import cors from 'cors';
import { parseSceneToExplanation } from './sceneParser';
import { createServer } from 'http';
import { SocketService } from './services/socketService';
import redisService from './services/redisService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.BACKEND_PORT || 3124;

// Initialize Socket.IO and Redis services
const socketService = new SocketService(server);

// Middleware
app.use(cors({
  origin: ["http://localhost:3123", "http://localhost:8080"]
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.static(path.join(__dirname, '../../dist')));

// Scene-based diagram analysis endpoint (the only API route)
app.post('/api/diagram/analyze-scene', async (req, res) => {
  try {
    const { scene } = req.body;
    if (!scene || !Array.isArray(scene)) {
      return res.status(400).json({ error: 'Invalid scene data provided' });
    }
    // Parse scene into structured analysis and explanation
    const { analysis, explanation } = parseSceneToExplanation(scene);
    // Call documentation generator with the explanation and analysis
    const documentation = await generateDocumentation({
      sceneAnalysis: analysis,
      explanation
    });
    res.json(documentation);
  } catch (error: any) {
    console.error('Error analyzing scene:', error);
    
    // Check if it's a Gemini API error
    if (error.message && error.message.includes('Gemini API Error')) {
      // Extract status code from error message if available
      const statusMatch = error.message.match(/\((\d+)\):/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500;
      
      return res.status(statusCode).json({ 
        error: error.message,
        details: 'Gemini API error occurred while generating documentation'
      });
    }
    
    // For other errors, return 500
    res.status(500).json({ 
      error: 'Failed to analyze scene and generate documentation',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Room management endpoints
app.post('/api/room/create', (req, res) => {
  const roomId = socketService.generateRoomId();
  res.json({ roomId });
});

app.get('/api/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomData = await redisService.getRoomData(roomId);
    
    if (!roomData) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ 
      roomId,
      collaborators: roomData.collaborators.length,
      lastUpdated: roomData.lastUpdated
    });
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({ error: 'Failed to get room information' });
  }
});

server.listen(port, () => {
  console.log(`BEAVER backend server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Socket.IO server initialized`);
  
  // Clean up expired rooms every hour
  setInterval(async () => {
    await redisService.cleanupExpiredRooms();
  }, 3600000); // 1 hour
}); 