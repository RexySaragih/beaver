declare global {
  interface Window {
    __CURSOR__: {
      agent: {
        chat: (prompt: string) => Promise<string>;
      };
    };
  }

  var __CURSOR__: {
    agent: {
      chat: (prompt: string) => Promise<string>;
    };
  };
} 