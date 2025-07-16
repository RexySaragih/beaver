import { createServer } from 'net';
import { MCPResponse, MCPRequest, Section, DocumentationResponse } from './types/mcp';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { GeminiService } from './services/geminiService';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.MCP_PORT || 3125;
const CURSOR_CONFIG_DIR = path.join(os.homedir(), '.cursor');

// Create an MCP server
const mcp = new McpServer({
  name: 'Documentation Generator',
  version: '1.0.0'
});

// Initialize services
const geminiService = new GeminiService();

// Define the diagram analysis tool with Gemini integration only
mcp.registerTool('analyze-diagram',
  {
    title: 'Diagram Analyzer',
    description: 'Analyzes Excalidraw scene JSON and generates documentation with Gemini Flash 2.0',
    inputSchema: {
      sceneAnalysis: z.any().optional(),
      explanation: z.string().optional(),
      projectContext: z.string().optional(),
      documentationType: z.enum(['technical', 'business', 'user', 'complete']).optional()
    }
  },
  async ({ sceneAnalysis, explanation, projectContext, documentationType = 'complete' }) => {
    // Only support sceneAnalysis/explanation-based flow
    if (!sceneAnalysis || !explanation) {
      throw new Error('sceneAnalysis and explanation are required');
    }
    
    try {
      // Step 1: Generate documentation using Gemini Flash 2.0
      console.log('Step 1: Generating documentation with Gemini...');
      const documentation = await geminiService.generateDocumentation({
        diagramAnalysis: sceneAnalysis,
        projectContext,
        documentationType
      });
      console.log('Documentation generated successfully');
      
      // Step 2: Return comprehensive response
      const responseText = JSON.stringify({
        localAnalysis: sceneAnalysis,
        documentation: documentation,
        summary: {
          diagramType: sceneAnalysis.diagramType,
          componentsCount: sceneAnalysis.components.length,
          relationshipsCount: sceneAnalysis.relationships.length,
          documentationTitle: documentation.title,
          stepsCount: documentation.coreProcessingLogic?.stepByStepFlow?.length || 0
        }
      }, null, 2);
      console.log('Returning response summary:', {
        diagramType: sceneAnalysis.diagramType,
        componentsCount: sceneAnalysis.components.length,
        relationshipsCount: sceneAnalysis.relationships.length,
        documentationTitle: documentation.title,
        stepsCount: documentation.coreProcessingLogic?.stepByStepFlow?.length || 0
      });
      return {
        content: [{
          type: 'text',
          text: responseText
        }]
      };
    } catch (error: any) {
      console.error('Error in analyze-diagram tool:', error);
      
      // Check if it's a Gemini API error
      if (error.message && error.message.includes('Gemini API Error')) {
        // Return the error message as JSON so it can be properly handled
        const errorResponse = {
          error: true,
          message: error.message,
          type: 'gemini_api_error'
        };
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(errorResponse, null, 2)
          }]
        };
      }
      
      // For other errors, throw them normally
      throw error;
    }
  }
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
mcp.connect(transport).then(() => {
  console.log('=== MCP Server Started ===');
  console.log(`MCP Server running on port ${PORT}`);
  console.log('Server name: Documentation Generator');
  console.log('Server version: 1.0.0');
  console.log('Transport: StdioServerTransport');
  console.log('Ready to receive requests...');
}).catch((error: Error) => {
  console.error('=== MCP Server Error ===');
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}); 