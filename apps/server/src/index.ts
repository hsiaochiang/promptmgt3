import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import path from 'path';
import { registerWorkspaceRoutes } from './routes/workspace.js';
import { registerProjectRoutes, registerPromptRoutes } from './routes/entities.js';
import { registerInboxRoutes } from './routes/inbox.js';
import { registerSnippetRoutes } from './routes/snippets.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerSnapshotRoutes, setBroadcastFunction } from './routes/snapshots.js';
import { registerTrashRoutes } from './routes/trash.js';
import { registerFileRoutes } from './routes/files.js';
import { registerAttachmentRoutes } from './routes/attachments.js';
import { startFileWatcher } from './watch/fileWatcher.js';
import { cleanupExpiredTrash, scheduleDailyCleanup } from './trash/retention.js';
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
// 原本只有 { origin: true }，請換成這個完整的：
await server.register(cors, {
  origin: true, // 允許 Extension 存取
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
});

await server.register(websocket);

// Simple in-memory WebSocket client registry
const wsClients = new Set<any>();

server.get('/ws', ({ websocket: true } as any), (connection/*, req*/) => {
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

// Set broadcast function for snapshot routes
setBroadcastFunction(broadcast);

// Register routes
await registerWorkspaceRoutes(server, ROOT_PATH);
await registerProjectRoutes(server, ROOT_PATH);
await registerPromptRoutes(server, ROOT_PATH);
await registerInboxRoutes(server, ROOT_PATH);
await registerSnippetRoutes(server, ROOT_PATH);
await registerSearchRoutes(server, ROOT_PATH);
await registerSnapshotRoutes(server, ROOT_PATH);
await registerTrashRoutes(server, ROOT_PATH);
await registerFileRoutes(server, ROOT_PATH);
await registerAttachmentRoutes(server, ROOT_PATH);

// Start file watcher for WebSocket sync
startFileWatcher(ROOT_PATH, (payload: FileChangedPayload) => {
  broadcast(payload);
});

// Run initial trash cleanup on startup
cleanupExpiredTrash(ROOT_PATH)
  .then((result) => {
    server.log.info(
      `Initial trash cleanup: checked ${result.checked}, purged ${result.purged}, errors: ${result.errors.length}`
    );
  })
  .catch((err) => {
    server.log.error('Initial trash cleanup failed:', err);
  });

// Schedule daily trash cleanup at 03:00
const stopDailyCleanup = scheduleDailyCleanup(ROOT_PATH, '03:00', (result) => {
  server.log.info(
    `Daily trash cleanup: checked ${result.checked}, purged ${result.purged}, errors: ${result.errors.length}`
  );
});

// Cleanup on shutdown
process.on('SIGINT', () => {
  stopDailyCleanup();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  stopDailyCleanup();
  server.close(() => {
    process.exit(0);
  });
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
