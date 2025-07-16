import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState } from '@excalidraw/excalidraw/types/types';
import Layout from './components/Layout';
import DocumentationViewer from './components/DocumentationViewer';
import { generateCanvasDocumentation } from './utils/documentationHelper';
import { analyzeSceneDiagram } from './utils/sceneDiagramAnalyzer';
import { generateDocxDocumentation } from './utils/documentGenerator';
import softwareArchitectureLibrary from '../assets/libraries/software-architecture.excalidrawlib';
import './styles/documentation.css';

interface Documentation {
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

// Allow documentation state to be either the wrapped or unwrapped format
interface DocumentationResponseWrapper {
  documentation: Documentation;
}

type DocumentationState = Documentation | DocumentationResponseWrapper | null;

const DEFAULT_APP_STATE: Partial<AppState> = {
  currentItemStrokeColor: '#1e1e1e',
  currentItemStrokeWidth: 2,
  viewBackgroundColor: '#ffffff',
  currentItemFontSize: 16, // Set to small (Excalidraw default small size)
};

function transformLibrary(lib: any) {
  if (lib.library && lib.library[0] && lib.library[0].elements) return lib.library;
  return (lib.library || []).map((group: any) => ({
    status: 'published',
    elements: Array.isArray(group) ? group : [group]
  }));
}

const App: React.FC = () => {
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [documentation, setDocumentation] = useState<DocumentationState>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const excalidrawAPIRef = useRef<any>(null);
  const documentationContainerRef = useRef<HTMLDivElement>(null);

  // Load the custom library into Excalidraw's built-in library
  useEffect(() => {
    if (
      excalidrawAPIRef.current &&
      softwareArchitectureLibrary &&
      softwareArchitectureLibrary.library
    ) {
      const libraryItems = transformLibrary(softwareArchitectureLibrary);
      excalidrawAPIRef.current.updateLibrary({ libraryItems });
    }
  }, [excalidrawAPIRef.current]);

  // Auto-clear errors after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = useCallback((
    elements: readonly ExcalidrawElement[],
    state: AppState,
  ) => {
    setElements(elements);
  }, []);

  const generateDocumentation = async () => {
    if (!excalidrawAPIRef.current) return;
    
    // Clear any previous errors
    setError(null);
    
    try {
      const elements = excalidrawAPIRef.current.getSceneElements();
      const result = await generateCanvasDocumentation({ elements }, {
        onLoadingStateChange: setIsLoading
      });
      setDocumentation('documentation' in (result as any) ? (result as any).documentation : result as any);
      setIsDrawerOpen(true);
      console.log('Generated documentation:', result);
    } catch (error: any) {
      console.error('Error generating documentation:', error);
      setError(error.message || 'An unexpected error occurred while generating documentation.');
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setError(null);
  };

  const handleDownloadDocx = async () => {
    if (!documentation || !excalidrawAPIRef.current) return;
    
    setIsDownloading(true);
    try {
      const docObj = isWrapped(documentation) ? documentation.documentation : documentation;
      
      // Capture canvas image
      let canvasImage: Buffer | undefined;
      try {
        // Get the canvas element from the Excalidraw component
        const canvasElement = document.querySelector('.excalidraw__canvas') as HTMLCanvasElement;
        if (canvasElement) {
          // Create a temporary canvas with higher resolution
          const tempCanvas = document.createElement('canvas');
          const ctx = tempCanvas.getContext('2d');
          
          // Set higher resolution
          const scale = 0.75;
          tempCanvas.width = canvasElement.width * scale;
          tempCanvas.height = canvasElement.height * scale;
          
          if (ctx) {
            // Scale the context to match the new size
            ctx.scale(scale, scale);
            // Draw the original canvas onto the temp canvas
            ctx.drawImage(canvasElement, 0, 0);
            
            const dataURL = tempCanvas.toDataURL('image/png', 1.0);
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            canvasImage = Buffer.from(base64Data, 'base64');
            console.log('Canvas image captured successfully with high resolution');
          } else {
            // Fallback to original method
            const dataURL = canvasElement.toDataURL('image/png');
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            canvasImage = Buffer.from(base64Data, 'base64');
            console.log('Canvas image captured successfully (fallback)');
          }
        } else {
          console.warn('Canvas element not found');
        }
      } catch (imageError) {
        console.warn('Could not capture canvas image:', imageError);
      }
      
      // Add canvas image to documentation object
      const docWithImage = {
        ...docObj,
        canvasImage
      };
      
      console.log('Documentation with image:', {
        hasCanvasImage: !!canvasImage,
        canvasImageSize: canvasImage?.length,
        docTitle: docObj.title
      });
      
      const blob = await generateDocxDocumentation(docWithImage);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docObj.title.replace(/[^a-zA-Z0-9]/g, '_')}_documentation.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error generating DOCX:', error);
      alert('Failed to generate DOCX. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Type guard for wrapped format
  function isWrapped(doc: DocumentationState): doc is DocumentationResponseWrapper {
    return doc !== null && typeof doc === 'object' && 'documentation' in doc && typeof (doc as any).documentation === 'object';
  }

  const renderDocumentation = () => {
    if (!documentation) return null;

    const docObj = isWrapped(documentation) ? documentation.documentation : documentation;

    console.log('Rendering documentation:', JSON.stringify(docObj, null, 2));
    
    return (
      <div className={`documentation-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="documentation-drawer-header">
          <h2>{docObj.title}</h2>
          <button className="close-button" onClick={closeDrawer}>×</button>
        </div>
        <div className="documentation-panel" ref={documentationContainerRef}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '6px 0 6px 0' }}>
            <button 
              className="pdf-download-outlined" 
              onClick={handleDownloadDocx} 
              disabled={isDownloading}
              style={{ width: '100%' }}
            >
              <span style={{ color: '#000', fontWeight: 500 }}>Download DOCX</span>
            </button>
          </div>
          <DocumentationViewer documentation={docObj} />
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <div className="app-container">
              <button 
                className="floating-doc-button" 
                onClick={generateDocumentation}
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{isLoading ? 'Generating...' : 'Generate Documentation'}</span>
              </button>
              <div className={`canvas-container ${isDrawerOpen ? 'drawer-open' : ''}`}>
                <Excalidraw
                  onChange={handleChange}
                  initialData={{
                    elements: [],
                    appState: DEFAULT_APP_STATE,
                    scrollToContent: true,
                  }}
                  excalidrawAPI={(api) => {
                    excalidrawAPIRef.current = api;
                  }}
                />
              </div>
              {renderDocumentation()}
              {isDrawerOpen && <div className="drawer-overlay" onClick={closeDrawer} />}
              {isLoading && (
                <div className="loading-overlay">
                  <img src="assets/ico/loading.gif" alt="Loading..." style={{ width: 120, height: 120 }} />
                </div>
              )}
              {error && (
                <div className="error-toast">
                  <div className="error-content">
                    <div className="error-icon">⚠️</div>
                    <div className="error-message">{error}</div>
                    <button className="error-close" onClick={() => setError(null)}>×</button>
                  </div>
                </div>
              )}
            </div>
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;