import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createSnapshot, listSnapshots } from '../backup/snapshot.js';
import { createVersionNode, listVersionNodes, listAllVersionNodes } from '../backup/version-node/index.js';
import { getBackupStatistics } from '../backup/statistics.js';
import { getPromptFilePath, getProjectDir } from '../fs-layout/index.js';
import type { VersionEvent, SnapshotCreatedPayload, SnapshotFailedPayload } from '@pah/contracts';

interface CreateSnapshotBody {
  message?: string;
  scope?: 'workspace' | 'project' | 'prompt';
}

interface CreateVersionNodeBody {
  entityType: 'project' | 'prompt';
  entityId: string;
  projectSlug?: string;
  promptSlug?: string;
  message?: string;
}

// Global broadcast function reference (will be set by server)
let broadcastFn: ((event: any) => void) | undefined;

export function setBroadcastFunction(fn: (event: any) => void) {
  broadcastFn = fn;
}

export async function registerSnapshotRoutes(server: FastifyInstance, rootPath: string) {
  // POST /api/snapshots - create snapshot/version event
  server.post<{
    Body: CreateSnapshotBody;
  }>('/api/snapshots', async (request, reply) => {
    try {
      const { message, scope = 'workspace' } = request.body || {};
      const event = await createSnapshot(rootPath, scope, message);
      
      // Broadcast snapshot.created event
      if (broadcastFn) {
        const snapshotEvent: SnapshotCreatedPayload = {
          event: 'snapshot.created',
          data: {
            snapshotId: event.id,
            scope,
            path: event.snapshotPath || '',
            stats: {
              filesCount: 0,
              attachmentsCount: 0,
              sizeBytes: 0,
            },
          },
        };
        broadcastFn(snapshotEvent);
      }
      
      reply.code(201);
      return event satisfies VersionEvent;
    } catch (error) {
      // Broadcast snapshot.failed event
      if (broadcastFn) {
        const failedEvent: SnapshotFailedPayload = {
          event: 'snapshot.failed',
          data: {
            snapshotId: `snapshot-failed-${Date.now()}`,
            scope: 'workspace',
            error: error instanceof Error ? error.message : String(error),
          },
        };
        broadcastFn(failedEvent);
      }
      
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

  // POST /api/versions - create version node for entity
  server.post<{
    Body: CreateVersionNodeBody;
  }>('/api/versions', async (request, reply) => {
    try {
      const { entityType, entityId, projectSlug, promptSlug, message } = request.body || {};
      
      if (!entityType || !entityId) {
        reply.code(400).send({ error: 'Missing entityType or entityId' });
        return;
      }

      let entityPath: string;
      if (entityType === 'project') {
        if (!projectSlug) {
          reply.code(400).send({ error: 'Missing projectSlug for project version' });
          return;
        }
        entityPath = getProjectDir(rootPath, projectSlug);
      } else if (entityType === 'prompt') {
        if (!projectSlug || !promptSlug) {
          reply.code(400).send({ error: 'Missing projectSlug or promptSlug for prompt version' });
          return;
        }
        entityPath = getPromptFilePath(rootPath, projectSlug, promptSlug);
      } else {
        reply.code(400).send({ error: 'Invalid entityType' });
        return;
      }

      const event = await createVersionNode(rootPath, entityType, entityId, entityPath, message);
      reply.code(201);
      return event satisfies VersionEvent;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to create version node',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/versions - list all version nodes
  server.get('/api/versions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const events = await listAllVersionNodes(rootPath);
      return events;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list version nodes',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/versions/:entityType/:entityId - list version nodes for specific entity
  server.get<{
    Params: { entityType: string; entityId: string };
  }>('/api/versions/:entityType/:entityId', async (request, reply) => {
    try {
      const { entityType, entityId } = request.params;
      
      if (entityType !== 'project' && entityType !== 'prompt') {
        reply.code(400).send({ error: 'Invalid entityType' });
        return;
      }

      const events = await listVersionNodes(rootPath, entityType, entityId);
      return events;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list version nodes for entity',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/backups/statistics - get backup statistics for 7 or 30 days
  server.get<{
    Querystring: { period?: '7d' | '30d' };
  }>('/api/backups/statistics', async (request, reply) => {
    try {
      const period = request.query.period === '30d' ? 30 : 7;
      const stats = await getBackupStatistics(rootPath, period);
      return stats;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to get backup statistics',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
