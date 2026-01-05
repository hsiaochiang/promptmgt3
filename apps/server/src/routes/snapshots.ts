import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createSnapshot, listSnapshots } from '../backup/snapshot.js';
import { createVersionNode, listVersionNodes, listAllVersionNodes } from '../backup/version-node/index.js';
import { getProjectFilePath, getPromptFilePath, getProjectDir } from '../fs-layout/index.js';
import type { VersionEvent } from '@pah/contracts';

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
}
