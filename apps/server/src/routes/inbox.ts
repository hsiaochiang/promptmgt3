import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { scanWorkspace } from '../indexing/index.js';
import { getInboxDir, getInboxItemFilePath } from '../fs-layout/index.js';
import { InboxItemEntity } from '@pah/contracts';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export async function registerInboxRoutes(server: FastifyInstance, rootPath: string) {

  // GET /api/inbox
  server.get('/api/inbox', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const scan = await scanWorkspace(rootPath);
      const inboxItems: InboxItemEntity[] = scan.inbox;

      inboxItems.sort((a, b) => {
        return new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime();
      });

      return inboxItems;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to list inbox items', message: String(error) });
    }
  });

  // GET /api/inbox/:id
  server.get<{ Params: { id: string } }>('/api/inbox/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const scan = await scanWorkspace(rootPath);
      const item = scan.inbox.find(i => i.id === id);

      if (!item) {
        reply.code(404).send({ error: 'Inbox item not found' });
        return;
      }
      return item;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to get inbox item', message: String(error) });
    }
  });

  // DELETE /api/inbox/:id
  server.delete<{ Params: { id: string } }>('/api/inbox/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // We need to find the specific file to delete.
      // Since filenames in inbox are usually just ID.md or whatever the user dropped,
      // we can't assume ID.md.
      // scanWorkspace already found the item, but ScanResult doesn't expose path directly in DTO?
      // Actually indexing/index.ts ScanResult items are constructed from storage.
      // Let's iterate directory to find the file with matching ID in frontmatter.

      const inboxDir = getInboxDir(rootPath);
      // Ensure inbox dir exists
      try {
        await fs.access(inboxDir);
      } catch {
        // Inbox empty or missing
        reply.code(404).send({ error: 'Inbox item not found' });
        return;
      }

      const files = await fs.readdir(inboxDir);
      let targetPath = '';

      // Optimization: Check if ID.md exists first (common case)
      const likelyPath = getInboxItemFilePath(rootPath, id);
      try {
        const content = await fs.readFile(likelyPath, 'utf-8');
        const { data } = matter(content);
        if (data.id === id) {
          targetPath = likelyPath;
        }
      } catch {
        // Not ID.md, fall back to scan
      }

      if (!targetPath) {
        // Linear scan
        for (const file of files) {
          if (!file.endsWith('.md')) continue;
          const filePath = path.join(inboxDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data } = matter(content);
          if (data.id === id) {
            targetPath = filePath;
            break;
          }
        }
      }

      if (!targetPath) {
        reply.code(404).send({ error: 'Inbox item not found' });
        return;
      }

      await fs.rm(targetPath, { force: true });
      reply.code(200).send({ message: 'Deleted' });

    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete inbox item', message: String(error) });
    }
  });

  // PATCH /api/inbox/:id
  server.patch<{ Params: { id: string }, Body: Partial<InboxItemEntity> }>('/api/inbox/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;

      // Find file logic (same as delete)
      const inboxDir = getInboxDir(rootPath);
      const files = await fs.readdir(inboxDir);
      let targetPath = '';
      let fileContent = '';

      // Check ID.md
      const likelyPath = getInboxItemFilePath(rootPath, id);
      try {
        const content = await fs.readFile(likelyPath, 'utf-8');
        const { data } = matter(content);
        if (data.id === id) {
          targetPath = likelyPath;
          fileContent = content;
        }
      } catch {
        // Fallback
      }

      if (!targetPath) {
        for (const file of files) {
          if (!file.endsWith('.md')) continue;
          const filePath = path.join(inboxDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data } = matter(content);
          if (data.id === id) {
            targetPath = filePath;
            fileContent = content;
            break;
          }
        }
      }

      if (!targetPath) {
        reply.code(404).send({ error: 'Inbox item not found' });
        return;
      }

      const { data: frontmatter, content: body } = matter(fileContent);

      if (updates.title !== undefined) frontmatter.title = updates.title;
      if (updates.notes !== undefined) frontmatter.notes = updates.notes;
      if (updates.suggestedTags !== undefined) frontmatter.suggestedTags = updates.suggestedTags;

      const newBody = updates.rawContent !== undefined ? updates.rawContent : body;
      const newFileContent = matter.stringify(newBody, frontmatter);

      await fs.writeFile(targetPath, newFileContent, 'utf-8');

      reply.code(200).send({ id, ...frontmatter, rawContent: newBody });

    } catch (error) {
      reply.code(500).send({ error: 'Failed to update inbox item', message: String(error) });
    }
  });
}
