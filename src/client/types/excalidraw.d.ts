declare module '*.excalidrawlib' {
  const content: {
    type: 'excalidrawlib';
    version: number;
    library: any[];
  };
  export default content;
} 