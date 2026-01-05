import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerWorkspaceRoutes } from './routes/workspace.js';
import { registerProjectRoutes, registerPromptRoutes } from './routes/entities.js';
import { registerInboxRoutes } from './routes/inbox.js';
import { registerSearchRoutes } from './routes/search.js';

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
