import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { DocumentationResponse, MCPRequest, MCPResponse } from './types/mcp';
import { GeminiService } from './services/geminiService';

interface ComponentDescription {
  name: string;
  description: string;
  role: string;
}

interface DocumentationSection {
  title: string;
  content: string;
  components?: ComponentDescription[];
}

interface Documentation {
  title: string;
  description: string;
  sections: DocumentationSection[];
  generatedAt: string;
}

interface CanvasData {
  sceneAnalysis?: any;
  explanation?: string;
}

export async function generateDocumentation(canvasData: CanvasData): Promise<any> {
  try {
    console.log('=== Documentation Generator Called ===');
    if (!canvasData) throw new Error('Canvas data is required');

    // Only support sceneAnalysis and explanation (scene-based) logic
    if (canvasData.sceneAnalysis && canvasData.explanation) {
      // Create MCP client
      const client = new Client({
        name: 'Documentation Client',
        version: '1.0.0'
      });
      console.log('Created MCP client');
      // Create transport that connects to our MCP server
      const transport = new StdioClientTransport({
        command: 'npm',
        args: ['run', 'mcp'],
        cwd: process.cwd()
      });
      try {
        await client.connect(transport);
        console.log('Successfully connected to MCP server');
      } catch (connectError) {
        console.error('Failed to connect to MCP server:', connectError);
        throw new Error(`MCP connection failed: ${connectError}`);
      }
      console.log('Calling analyze-diagram tool (scene-based)...');
      let result;
      try {
        result = await client.callTool({
          name: 'analyze-diagram',
          arguments: {
            sceneAnalysis: canvasData.sceneAnalysis,
            explanation: canvasData.explanation,
            documentationType: 'complete'
          }
        });
        console.log('Tool result received:', result.toString().substring(0, 120) + '...');

      } catch (toolError) {
        console.error('Failed to call analyze-diagram tool:', toolError);
        throw new Error(`Tool call failed: ${toolError}`);
      }
      // Parse the AI analysis result
      let analysisData;
      let resultText = Array.isArray(result.content) && result.content[0]?.type === 'text' 
        ? result.content[0].text 
        : 'Failed to analyze diagram';
      try {
        console.log('Parsing result text:', resultText.substring(0, 120) + '...');
        
        // Check if the response is an error
        const parsedResult = JSON.parse(resultText);
        if (parsedResult.error && parsedResult.type === 'gemini_api_error') {
          throw new Error(parsedResult.message);
        }
        
        analysisData = parsedResult;
      } catch (parseError) {
        console.error('Failed to parse AI analysis:', parseError);
        
        // If it's a JSON parse error, check if it's an error message
        if (resultText && resultText.includes('Gemini API Error')) {
          throw new Error(resultText);
        }
        
        analysisData = {
          components: [],
          relationships: [],
          flow: 'Analysis failed',
          purpose: 'Unable to determine purpose'
        };
      }
      if (typeof transport.close === 'function') {
        await transport.close();
      }
      return analysisData;
    }

    throw new Error('sceneAnalysis and explanation are required');
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
} 