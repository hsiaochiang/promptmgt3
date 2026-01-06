import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import {
  type SnippetEntity,
  type SnippetInput,
  SnippetSchema,
  SnippetInputSchema,
} from '@pah/contracts';
import {
  getSnippetsDir,
  getSnippetFilePath,
} from '../fs-layout/index.js';

/**
 * Register snippet routes
 * Snippets are stored in .pah/snippets/ directory
 */
export async function registerSnippetRoutes(server: FastifyInstance, rootPath: string) {
  const snippetsDir = getSnippetsDir(rootPath);

  // Ensure snippets directory exists
  await fs.mkdir(snippetsDir, { recursive: true });

  // Helper: Scan and load all snippets
  async function loadSnippets(): Promise<SnippetEntity[]> {
    try {
      const files = await fs.readdir(snippetsDir);
      const snippets: SnippetEntity[] = [];

      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(snippetsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(content);

        const snippet: SnippetEntity = {
          id: parsed.data.id || file.replace('.md', ''),
          title: parsed.data.title || 'Untitled',
          content: parsed.content,
          tags: parsed.data.tags || [],
          createdAt: parsed.data.createdAt || new Date().toISOString(),
          updatedAt: parsed.data.updatedAt || new Date().toISOString(),
        };

        snippets.push(snippet);
      }

      return snippets;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Helper: Write snippet to file
  async function writeSnippet(snippet: SnippetEntity): Promise<void> {
    const filePath = getSnippetFilePath(rootPath, snippet.id);
    const fileContent = matter.stringify(snippet.content, {
      id: snippet.id,
      title: snippet.title,
      tags: snippet.tags,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    });

    await fs.mkdir(snippetsDir, { recursive: true });
    await fs.writeFile(filePath, fileContent, 'utf-8');
  }

  // GET /api/snippets - List all snippets
  server.get('/api/snippets', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const items = await loadSnippets();
      return {
        items,
        total: items.length,
      };
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list snippets',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/snippets/:id - Get a specific snippet
  server.get<{
    Params: { id: string };
  }>('/api/snippets/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const snippets = await loadSnippets();
      const snippet = snippets.find((s) => s.id === id);

      if (!snippet) {
        return reply.code(404).send({ error: 'Snippet not found' });
      }

      return snippet;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to get snippet',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /api/snippets - Create a new snippet
  server.post<{
    Body: SnippetInput;
  }>('/api/snippets', async (request, reply) => {
    try {
      const input = SnippetInputSchema.parse(request.body);

      const now = new Date().toISOString();
      const snippet: SnippetEntity = {
        id: uuidv4(),
        title: input.title,
        content: input.content,
        tags: input.tags || [],
        createdAt: now,
        updatedAt: now,
      };

      // Validate against schema
      SnippetSchema.parse(snippet);

      await writeSnippet(snippet);

      return reply.code(201).send(snippet);
    } catch (error) {
      reply.code(400).send({
        error: 'Failed to create snippet',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // PUT /api/snippets/:id - Update a snippet
  server.put<{
    Params: { id: string };
    Body: SnippetInput;
  }>('/api/snippets/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const snippets = await loadSnippets();
      const existing = snippets.find((s) => s.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Snippet not found' });
      }

      const input = SnippetInputSchema.parse(request.body);

      const updated: SnippetEntity = {
        ...existing,
        title: input.title,
        content: input.content,
        tags: input.tags || existing.tags,
        updatedAt: new Date().toISOString(),
      };

      SnippetSchema.parse(updated);

      await writeSnippet(updated);

      return updated;
    } catch (error) {
      reply.code(400).send({
        error: 'Failed to update snippet',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // DELETE /api/snippets/:id - Delete a snippet
  server.delete<{
    Params: { id: string };
  }>('/api/snippets/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const snippets = await loadSnippets();
      const existing = snippets.find((s) => s.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Snippet not found' });
      }

      const filePath = getSnippetFilePath(rootPath, id);
      await fs.unlink(filePath);

      return reply.code(204).send();
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to delete snippet',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
