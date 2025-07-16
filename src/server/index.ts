import express from 'express';
import multer from 'multer';
import path from 'path';
import { generateDocumentation } from './documentationGenerator';
import dotenv from 'dotenv';
import cors from 'cors';
import { parseSceneToExplanation } from './sceneParser';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 3124;

// Middleware
app.use(cors());
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

app.listen(port, () => {
  console.log(`BEAVER backend server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 