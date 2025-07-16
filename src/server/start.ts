import { spawn } from 'child_process';
import path from 'path';

// Start the MCP server
const mcpServer = spawn('ts-node', [path.join(__dirname, 'mcpServer.ts')], {
  stdio: 'inherit'
});

// Start the main server
const mainServer = spawn('ts-node', [path.join(__dirname, 'index.ts')], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  mcpServer.kill();
  mainServer.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  mcpServer.kill();
  mainServer.kill();
  process.exit();
});

// Handle server process errors
mcpServer.on('error', (error) => {
  console.error('MCP Server error:', error);
});

mainServer.on('error', (error) => {
  console.error('Main Server error:', error);
});

// Handle server process exit
mcpServer.on('exit', (code) => {
  if (code !== 0) {
    console.error(`MCP Server exited with code ${code}`);
  }
});

mainServer.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Main Server exited with code ${code}`);
  }
}); 