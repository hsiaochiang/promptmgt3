import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createSnapshot, listSnapshots } from '../backup/snapshot.js';
import type { VersionEvent } from '@pah/contracts';

interface CreateSnapshotBody {
  message?: string;
  scope?: 'workspace' | 'project' | 'prompt';
}

export async function registerSnapshotRoutes(server: FastifyInstance, rootPath: string) {
  // POST /api/snapshots - create snapshot/version event
  server.post<{
    Body: CreateSnapshotBody;
  }>('/api/snapshots', async (request, reply) => {
    try {
      const { message, scope = 'workspace' } = request.body || {};
      const event = await createSnapshot(rootPath, scope, message);
      reply.code(201);
      return event satisfies VersionEvent;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to create snapshot',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/snapshots - list snapshot/version events
  server.get('/api/snapshots', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const events = await listSnapshots(rootPath);
      return events;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list snapshots',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
