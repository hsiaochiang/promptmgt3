import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import {
  type InboxItemEntity,
  InboxItemFrontmatterSchema,
} from '@pah/contracts';
import {
  getInboxItemFilePath,
  getInboxDir,
} from '../fs-layout/index.js';
import {
  parseInboxItemFile,
  writeInboxItemFile,
  scanWorkspace,
} from '../indexing/index.js';

/**
 * Register inbox routes
 * Note: Archival is handled by external tools, not provided by this API
 */
export async function registerInboxRoutes(server: FastifyInstance, rootPath: string) {
  // GET /api/inbox - List all inbox items
  server.get('/api/inbox', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const scanResult = await scanWorkspace(rootPath);
      return scanResult.inbox;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list inbox items',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/inbox/:id - Get a specific inbox item
  server.get<{
    Params: { id: string };
  }>('/api/inbox/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const scanResult = await scanWorkspace(rootPath);
      const item = scanResult.inbox.find((i) => i.id === id);

      if (!item) {
        return reply.code(404).send({ error: 'Inbox item not found' });
      }

      return item;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to get inbox item',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /api/inbox - Create a new inbox item (import)
  server.post<{
    Body: Partial<InboxItemEntity>;
  }>('/api/inbox', async (request, reply) => {
    try {
      const { title, sourcePlatform, sourceLink, rawContent, suggestedTags } = request.body;

      if (!title) {
        return reply.code(400).send({ error: 'Title is required' });
      }

      // Generate ID
      const id = uuidv4();
      const now = new Date().toISOString();

      // Create inbox item entity
      const inboxItem: InboxItemEntity = {
        id,
        title,
        sourcePlatform,
        sourceLink,
        importedAt: now,
        rawContent: rawContent || '',
        cleanedState: 'unprocessed',
        suggestedTags: suggestedTags || [],
        notes: '',
      };

      // Validate against schema
      InboxItemFrontmatterSchema.parse(inboxItem);

      // Write to file
      const filePath = getInboxItemFilePath(rootPath, id);

      // Check if item already exists
      try {
        await fs.access(filePath);
        return reply.code(409).send({ error: 'Inbox item with this ID already exists' });
      } catch {
        // File doesn't exist, we can create it
      }

      await writeInboxItemFile(filePath, inboxItem);

      return reply.code(201).send(inboxItem);
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to create inbox item',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // PUT /api/inbox/:id - Update an inbox item (minimal editing only)
  // Note: Does NOT provide archival functionality - that's handled by external tools
  server.put<{
    Params: { id: string };
    Body: Partial<InboxItemEntity>;
  }>('/api/inbox/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // Find existing item
      const scanResult = await scanWorkspace(rootPath);
      const existing = scanResult.inbox.find((i) => i.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Inbox item not found' });
      }

      // Update fields (only allow minimal editing)
      const updated: InboxItemEntity = {
        ...existing,
        ...request.body,
        id, // ID cannot be changed
        importedAt: existing.importedAt, // Import time cannot be changed
      };

      // Validate against schema
      InboxItemFrontmatterSchema.parse(updated);

      const filePath = getInboxItemFilePath(rootPath, id);
      await writeInboxItemFile(filePath, updated);

      return updated;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to update inbox item',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // DELETE /api/inbox/:id - Delete an inbox item
  server.delete<{
    Params: { id: string };
  }>('/api/inbox/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // Find existing item
      const scanResult = await scanWorkspace(rootPath);
      const existing = scanResult.inbox.find((i) => i.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Inbox item not found' });
      }

      const filePath = getInboxItemFilePath(rootPath, id);
      await fs.unlink(filePath);

      return { message: 'Inbox item deleted successfully' };
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to delete inbox item',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
