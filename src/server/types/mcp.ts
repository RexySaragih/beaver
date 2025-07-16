export interface MCPRequest<T = any> {
  data: T;
  metadata?: Record<string, any>;
}

export interface MCPResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

export interface Section {
  title: string;
  content: string;
  components?: {
    name: string;
    description: string;
    role: string;
  }[];
}

export interface DocumentationResponse {
  title: string;
  description: string;
  sections: Section[];
  generatedAt: string;
} 