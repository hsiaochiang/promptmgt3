import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';

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

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`✓ Server running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
