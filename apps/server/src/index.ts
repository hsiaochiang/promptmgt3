import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import path from 'path';
import { registerWorkspaceRoutes } from './routes/workspace.js';
import { registerProjectRoutes, registerPromptRoutes } from './routes/entities.js';
import { registerInboxRoutes } from './routes/inbox.js';
import { registerSearchRoutes } from './routes/search.js';
import { startFileWatcher } from './watch/fileWatcher.js';
import type { FileChangedPayload, StatusEvent } from '@pah/contracts';

// Get root path from environment or use default
const ROOT_PATH = process.env.PAH_ROOT_PATH || path.join(process.cwd(), 'data');

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
await server.register(cors, {
  origin: true,
});

await server.register(websocket);

// Simple in-memory WebSocket client registry
const wsClients = new Set<any>();

server.get('/ws', { websocket: true }, (connection/*, req*/) => {
  const socket = connection.socket as any;
  wsClients.add(socket);

  socket.on('close', () => {
    wsClients.delete(socket);
  });
});

function broadcast(event: FileChangedPayload | StatusEvent): void {
  const message = JSON.stringify(event);
  for (const client of wsClients) {
    try {
      client.send(message);
    } catch {
      wsClients.delete(client);
    }
  }
}

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await registerWorkspaceRoutes(server, ROOT_PATH);
await registerProjectRoutes(server, ROOT_PATH);
await registerPromptRoutes(server, ROOT_PATH);
await registerInboxRoutes(server, ROOT_PATH);
await registerSearchRoutes(server, ROOT_PATH);

// Start file watcher for WebSocket sync
startFileWatcher(ROOT_PATH, (payload: FileChangedPayload) => {
  broadcast(payload);
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`✓ Server running on http://localhost:${port}`);
    console.log(`✓ Root path: ${ROOT_PATH}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
