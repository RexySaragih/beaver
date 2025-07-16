# Beaver - Business Engineering And Visual Enterprise Representation

A local business flow diagram tool with AI-powered documentation generation and Model Context Protocol (MCP) integration.

## Features

- **Interactive Diagram Canvas**: Create and edit business flow diagrams using Excalidraw
- **AI-Powered Documentation**: Generate comprehensive documentation using Gemini AI
- **MCP Server Integration**: Model Context Protocol server for seamless AI tool integration
- **Real-time Analysis**: Analyze canvas diagrams and generate documentation instantly
- **Modern React Frontend**: Clean, responsive UI with TypeScript

## Project Structure

```
beaver/
├── src/
│   ├── client/           # React frontend application
│   │   ├── components/   # React components
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # CSS stylesheets
│   └── server/           # Node.js backend
│       ├── services/     # AI and external services
│       ├── types/        # TypeScript type definitions
│       └── utils/        # Server utilities
└── public/               # Static assets
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd beaver

# Install dependencies
npm install
```

### Running the Project

After cloning and installing dependencies, follow these steps to run the project:

1. **Set up environment variables** (optional):
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env file and add your Gemini API key (optional)
   # GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers in development mode.

3. **Access the application**:
   - Frontend: Open your browser and go to `http://localhost:3123`
   - Backend API: Available at `http://localhost:3124`

4. **For MCP server** (optional):
   ```bash
   # In a separate terminal
   npm run mcp
   ```

**Note**: The application works without the Gemini API key, but you'll get enhanced documentation generation with it.

### Environment Variables
Create a `.env` file in the root directory:
```bash
# Optional: Gemini AI API key for enhanced documentation
GEMINI_API_KEY=your_gemini_api_key_here
```

Note: The system works without the API key using fallback documentation generation.

## Usage

### Development Mode
Start both frontend and backend in development mode:
```bash
npm run dev
```

### MCP Server
Start the Model Context Protocol server:
```bash
npm run mcp
```

### Build for Production
```bash
npm run build
```

## API Workflow

1. **Canvas Export**: Export diagram as scene JSON from Excalidraw
2. **Scene Analysis**: Parse and analyze the diagram structure
3. **Documentation Generation**: AI creates comprehensive documentation
4. **Structured Response**: Returns analysis and documentation in JSON format

### Example Response Structure
```json
{
  "localAnalysis": {
    "components": [...],
    "relationships": [...],
    "flow": "...",
    "purpose": "...",
    "diagramType": "..."
  },
  "documentation": {
    "title": "...",
    "overview": "...",
    "sections": [...],
    "technicalSpecs": {...},
    "businessSpecs": {...}
  },
  "summary": {
    "diagramType": "...",
    "componentsCount": 5,
    "relationshipsCount": 4,
    "documentationTitle": "...",
    "sectionsCount": 3
  }
}
```

## Architecture

### Frontend (`src/client/`)
- **React + TypeScript**: Modern frontend with type safety
- **Excalidraw Integration**: Interactive diagram canvas
- **Documentation Viewer**: Display generated documentation
- **Responsive Layout**: Clean, modern UI components

### Backend (`src/server/`)
- **Express Server**: RESTful API endpoints
- **Gemini Service**: AI-powered documentation generation
- **MCP Server**: Model Context Protocol implementation
- **Scene Parser**: Diagram analysis and processing

### Key Components
- **`DocumentationViewer.tsx`**: Display AI-generated documentation
- **`Layout.tsx`**: Main application layout
- **`Sidebar.tsx`**: Navigation and controls
- **`geminiService.ts`**: Gemini AI integration
- **`mcpServer.ts`**: MCP server implementation

## Technologies Used

- **Frontend**: React, TypeScript, CSS3
- **Backend**: Node.js, Express, TypeScript
- **AI Integration**: Gemini Flash 2.0 API
- **Protocol**: Model Context Protocol (MCP)
- **Diagram Tool**: Excalidraw integration
- **Build Tool**: Webpack

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run mcp          # Start MCP server
npm run start        # Start production server
```

### Code Structure
- TypeScript for type safety
- Modular component architecture
- Separation of concerns between client and server
- Comprehensive error handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test with `npm run dev`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository. 