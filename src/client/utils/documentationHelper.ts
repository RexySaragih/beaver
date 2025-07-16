import axios from 'axios';
import { analyzeSceneDiagram } from './sceneDiagramAnalyzer';

export async function generateCanvasDocumentation({ elements }: { elements: any[] }, { onLoadingStateChange }: { onLoadingStateChange?: (loading: boolean) => void } = {}) {
  if (onLoadingStateChange) onLoadingStateChange(true);
  try {
    // Send scene JSON to backend for analysis and documentation
    const response = await axios.post('/api/diagram/analyze-scene', { scene: elements });
    if (onLoadingStateChange) onLoadingStateChange(false);
    return response.data;
  } catch (error: any) {
    if (onLoadingStateChange) onLoadingStateChange(false);
    
    // Handle axios errors with HTTP status codes
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.error || data?.details || `HTTP ${status} error`;
      
      // Create a more user-friendly error message based on status code
      let userMessage = '';
      switch (status) {
        case 429:
          userMessage = 'Rate limit exceeded. The AI service is receiving too many requests. Please wait a moment and try again.';
          break;
        case 503:
          userMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
          break;
        case 401:
          userMessage = 'Authentication failed. Please check your API configuration.';
          break;
        case 400:
          userMessage = 'Invalid request. Please check your diagram and try again.';
          break;
        case 500:
          userMessage = 'Server error occurred while generating documentation. Please try again.';
          break;
        default:
          userMessage = `Error (${status}): ${errorMessage}`;
      }
      
      throw new Error(userMessage);
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    
    // Handle other errors
    throw new Error(error.message || 'An unexpected error occurred while generating documentation.');
  }
} 