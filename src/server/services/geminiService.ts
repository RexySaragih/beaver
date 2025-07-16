import axios from 'axios';

export interface DiagramAnalysis {
  components: Array<{
    name: string;
    type: string;
    description: string;
    position?: { x: number; y: number };
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type: string;
  }>;
  flow: string;
  purpose: string;
  diagramType: string;
  flowContext?: string; // Added flowContext to the interface
}

export interface DocumentationRequest {
  diagramAnalysis: DiagramAnalysis;
  projectContext?: string;
  documentationType: 'technical' | 'business' | 'user' | 'complete';
}

export interface DocumentationResponse {
  title: string;
  introduction: {
    objective: string;
    keyOutput: string;
    whyThisFeatureIsNeeded: string;
  };
  coreProcessingLogic: {
    stepByStepFlow: Array<{
      step: string;
      description: string;
      component: string;
    }>;
  };
  technicalSpecs?: {
    architecture: string;
    dataFlow: string;
    components: Array<{
      name: string;
      description: string;
      responsibilities: string[];
    }>;
  };
  businessSpecs?: {
    processFlow: string;
    stakeholders: string[];
    requirements: string[];
  };
  generatedAt: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. Gemini integration will be disabled.');
    }
  }

  async generateDocumentation(request: DocumentationRequest): Promise<DocumentationResponse> {
    if (!this.apiKey) {
      return this.generateFallbackDocumentation(request);
    }

    try {
      console.log('Generating documentation with Gemini Flash 2.0...');
      
      const prompt = this.buildPrompt(request);
      console.log('[GeminiService] Prompt sent to Gemini:\n', prompt);
      
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data as any;
      const generatedText = responseData.candidates[0].content.parts[0].text;
      console.log('[GeminiService] Gemini response (truncated):', generatedText.slice(0, 500));
      return this.parseGeminiResponse(generatedText, request);
      
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      
      // Check if it's an axios error with HTTP status code
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = this.getErrorMessage(statusCode, error.response.data);
        throw new Error(`Gemini API Error (${statusCode}): ${errorMessage}`);
      }
      
      // For network errors or other issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Unable to connect to Gemini API. Please check your internet connection.');
      }
      
      // For other errors, throw with the original message
      throw new Error(`Gemini API Error: ${error.message || 'Unknown error occurred'}`);
    }
  }

  private buildPrompt(request: DocumentationRequest): string {
    const { diagramAnalysis, projectContext, documentationType } = request;
    let flowContextSection = '';
    if (diagramAnalysis.flowContext && diagramAnalysis.flowContext.trim() !== '') {
      flowContextSection = `\nFLOW CONTEXT: ${diagramAnalysis.flowContext}\n`;
    }
    return `You are an expert technical writer and software architect. Based on the following diagram analysis, generate comprehensive ${documentationType} documentation.

${flowContextSection}DIAGRAM ANALYSIS:
- Type: ${diagramAnalysis.diagramType}
- Purpose: ${diagramAnalysis.purpose}
- Flow: ${diagramAnalysis.flow}
- Components: ${diagramAnalysis.components.map(c => `${c.name} (${c.type}): ${c.description}`).join(', ')}
- Relationships: ${diagramAnalysis.relationships.map(r => `${r.from} ${r.type} ${r.to}`).join(', ')}

PROJECT CONTEXT: ${projectContext || 'Business process automation system'}

Please generate documentation in the following JSON format with the exact structure:

{
  "title": "string",
  "introduction": {
    "objective": "string",
    "keyOutput": "string", 
    "whyThisFeatureIsNeeded": "string"
  },
  "coreProcessingLogic": {
    "stepByStepFlow": [
      {
        "step": "string",
        "description": "string",
        "component": "string"
      }
    ]
  },
  "technicalSpecs": {
    "architecture": "string",
    "dataFlow": "string",
    "components": [
      {
        "name": "string",
        "description": "string",
        "responsibilities": ["string"]
      }
    ]
  },
  "businessSpecs": {
    "processFlow": "string",
    "stakeholders": ["string"],
    "requirements": ["string"]
  }
}

Focus on creating practical, actionable documentation that developers and business stakeholders can use. The introduction should clearly explain the objective, key output, and why this feature is needed. The core processing logic should provide a detailed step-by-step flow based on the diagram components and relationships.`;
  }

  private parseGeminiResponse(responseText: string, request: DocumentationRequest): DocumentationResponse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(responseText);
      return {
        ...parsed,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return {
            ...parsed,
            generatedAt: new Date().toISOString()
          };
        } catch (jsonError) {
          console.log('Failed to parse JSON from markdown block:', jsonError);
        }
      }
      // If all parsing fails, create a structured response from the text
      return this.createStructuredResponse(responseText, request);
    }
  }

  private createStructuredResponse(text: string, request: DocumentationRequest): DocumentationResponse {
    const sections = text.split('\n\n').filter(section => section.trim().length > 0);
    
    return {
      title: `Documentation for ${request.diagramAnalysis.diagramType}`,
      introduction: {
        objective: sections[0] || 'Automate business processes based on diagram analysis',
        keyOutput: 'Streamlined business workflow with automated processing',
        whyThisFeatureIsNeeded: 'To improve efficiency and reduce manual errors in business processes'
      },
      coreProcessingLogic: {
        stepByStepFlow: request.diagramAnalysis.components.map((component, index) => ({
          step: `Step ${index + 1}`,
          description: component.description,
          component: component.name
        }))
      },
      technicalSpecs: {
        architecture: 'Component-based architecture following the diagram structure',
        dataFlow: request.diagramAnalysis.flow,
        components: request.diagramAnalysis.components.map(c => ({
          name: c.name,
          description: c.description,
          responsibilities: [`Handle ${c.type} operations`]
        }))
      },
      businessSpecs: {
        processFlow: request.diagramAnalysis.flow,
        stakeholders: ['Business Users', 'System Administrators'],
        requirements: ['Process automation', 'Data management', 'User interface']
      },
      generatedAt: new Date().toISOString()
    };
  }

  private generateFallbackDocumentation(request: DocumentationRequest): DocumentationResponse {
    const { diagramAnalysis } = request;
    
    return {
      title: `Documentation for ${diagramAnalysis.diagramType}`,
      introduction: {
        objective: `Automate and streamline ${diagramAnalysis.diagramType.toLowerCase()} processes`,
        keyOutput: 'Efficient business workflow with automated processing and data management',
        whyThisFeatureIsNeeded: 'To improve efficiency, reduce manual errors, and provide better process visibility'
      },
      coreProcessingLogic: {
        stepByStepFlow: diagramAnalysis.components.map((component, index) => ({
          step: `Step ${index + 1}`,
          description: component.description,
          component: component.name
        }))
      },
      technicalSpecs: {
        architecture: 'Component-based architecture following the diagram structure',
        dataFlow: diagramAnalysis.flow,
        components: diagramAnalysis.components.map(c => ({
          name: c.name,
          description: c.description,
          responsibilities: [`Process ${c.type} operations`, `Handle data flow`]
        }))
      },
      businessSpecs: {
        processFlow: diagramAnalysis.flow,
        stakeholders: ['End Users', 'System Administrators', 'Business Analysts'],
        requirements: ['Automated process flow', 'Data management', 'User interface', 'Reporting capabilities']
      },
      generatedAt: new Date().toISOString()
    };
  }

  private getErrorMessage(statusCode: number, responseData: any): string {
    switch (statusCode) {
      case 400:
        return 'Bad request - Invalid parameters provided to Gemini API';
      case 401:
        return 'Unauthorized - Invalid API key or authentication failed';
      case 403:
        return 'Forbidden - Access denied to Gemini API';
      case 404:
        return 'Not found - Gemini API endpoint not found';
      case 429:
        return 'Rate limit exceeded - Too many requests to Gemini API. Please try again later.';
      case 500:
        return 'Internal server error - Gemini API server error';
      case 502:
        return 'Bad gateway - Gemini API gateway error';
      case 503:
        return 'Service unavailable - Gemini API is temporarily unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout - Gemini API request timed out';
      default:
        return responseData?.error?.message || `HTTP ${statusCode} error`;
    }
  }
} 