# 🦫 Beaver - Business Engineering And Visual Enterprise Representation

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A powerful local business flow diagram tool with AI-powered documentation generation and Model Context Protocol (MCP) integration.

## ✨ Features

- 🎨 **Interactive Diagram Canvas** - Create and edit business flow diagrams using Excalidraw
- 🤖 **AI-Powered Documentation** - Generate comprehensive documentation using Gemini AI
- 🔗 **MCP Server Integration** - Model Context Protocol server for seamless AI tool integration
- ⚡ **Real-time Analysis** - Analyze canvas diagrams and generate documentation instantly
- 📱 **Modern React Frontend** - Clean, responsive UI with TypeScript
- 📄 **Export Capabilities** - Export documentation in multiple formats
- 🏗️ **Software Architecture Library** - Pre-built components for system design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/beaver.git
cd beaver

# Install dependencies
npm install
```

### Running the Project

1. **Set up environment variables** (optional):
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your Gemini API key for enhanced documentation
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3123
   - Backend API: http://localhost:3124

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run dev:debug` | Start with debug mode and MCP server |
| `npm run build` | Build for production |
| `npm run mcp` | Start Model Context Protocol server |
| `npm run server` | Start backend server only |
| `npm run start` | Start frontend development server |

## 🏗️ Project Structure

```
beaver/
├── src/
│   ├── client/                 # React frontend application
│   │   ├── components/         # React components
│   │   │   ├── DocumentationViewer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── utils/             # Utility functions
│   │   ├── styles/            # CSS stylesheets
│   │   └── types/             # TypeScript definitions
│   ├── server/                # Node.js backend
│   │   ├── services/          # AI and external services
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Server utilities
│   │   ├── documentationGenerator.ts
│   │   ├── mcpServer.ts
│   │   └── sceneParser.ts
│   └── assets/                # Static assets
│       └── libraries/         # Excalidraw libraries
└── public/                    # Build output
```

## 🎯 Use Cases

### Business Process Modeling
- Create flowcharts for business processes
- Document system architectures
- Design user journey maps
- Model organizational structures

### Technical Documentation
- Generate API documentation
- Create system architecture diagrams
- Document database schemas
- Design software components

### AI-Enhanced Analysis
- Automatic diagram analysis
- Intelligent documentation generation
- Context-aware suggestions
- Real-time collaboration

## 🔧 Architecture

### Frontend (`src/client/`)
- **React 18** with TypeScript for type safety
- **Excalidraw Integration** for interactive diagramming
- **Documentation Viewer** for displaying AI-generated content
- **Responsive Layout** with modern UI components

### Backend (`src/server/`)
- **Express Server** with RESTful API endpoints
- **Gemini Service** for AI-powered documentation
- **MCP Server** for Model Context Protocol implementation
- **Scene Parser** for diagram analysis and processing

### Key Technologies
- **Frontend**: React, TypeScript, CSS3, Webpack
- **Backend**: Node.js, Express, TypeScript
- **AI Integration**: Gemini Flash 2.0 API
- **Protocol**: Model Context Protocol (MCP)
- **Diagram Tool**: Excalidraw integration

## 📊 API Workflow

1. **Canvas Export** - Export diagram as scene JSON from Excalidraw
2. **Scene Analysis** - Parse and analyze the diagram structure
3. **Documentation Generation** - AI creates comprehensive documentation
4. **Structured Response** - Returns analysis and documentation in JSON format

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

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test with `npm run dev`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the inline code comments

## 🙏 Acknowledgments

- [Excalidraw](https://excalidraw.com/) for the diagramming capabilities
- [Google Gemini](https://ai.google.dev/) for AI-powered documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) for AI tool integration

---

**Made with ❤️ for the business engineering community** 