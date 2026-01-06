import type { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import path from 'path';

/**
 * File read/write routes for autosave support
 * Provides direct file access for entities that need granular control over file content
 */
export async function registerFileRoutes(server: FastifyInstance, rootPath: string) {
  /**
   * GET /api/files - Read a file by relative path
   * Query: path (relative to rootPath)
   */
  server.get<{
    Querystring: {
      path: string;
    };
  }>('/api/files', async (request, reply) => {
    const { path: relativePath } = request.query;

    if (!relativePath) {
      return reply.code(400).send({ error: 'Missing path parameter' });
    }

    // Security: prevent path traversal
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
      return reply.code(400).send({ error: 'Invalid path' });
    }

    const fullPath = path.join(rootPath, relativePath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return { path: relativePath, content };
    } catch (err: any) {
      if (err && err.code === 'ENOENT') {
        return reply.code(404).send({ error: 'File not found' });
      }
      return reply.code(500).send({
        error: 'Failed to read file',
        message: err?.message ?? String(err),
      });
    }
  });

  /**
   * PUT /api/files - Write a file by relative path (autosave support)
   * Body: { path: string, content: string }
   */
  server.put<{
    Body: {
      path: string;
      content: string;
    };
  }>('/api/files', async (request, reply) => {
    const { path: relativePath, content } = request.body;

    if (!relativePath || content === undefined) {
      return reply.code(400).send({ error: 'Missing path or content' });
    }

    // Security: prevent path traversal
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
      return reply.code(400).send({ error: 'Invalid path' });
    }

    const fullPath = path.join(rootPath, relativePath);

    try {
      // Ensure parent directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      await fs.writeFile(fullPath, content, 'utf-8');
      
      return { 
        success: true, 
        path: relativePath,
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      return reply.code(500).send({
        error: 'Failed to write file',
        message: err?.message ?? String(err),
      });
    }
  });
}
