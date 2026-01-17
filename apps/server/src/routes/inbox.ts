import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { scanWorkspace } from '../indexing/index.js';
import { invalidateCache } from '../indexing/index.js';
import { getInboxDir, getInboxItemFilePath } from '../fs-layout/index.js';
import { InboxItemEntity, InboxItemFrontmatter } from '@pah/contracts';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { getPromptFilePath } from '../fs-layout/index.js';
import { PromptEntity } from '@pah/contracts';

interface CreateInboxItemBody {
  title: string;
  rawContent?: string;
  sourceLink?: string;
  suggestedTags?: string[];
  sourcePlatform?: string;
}

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

  // POST /api/inbox
  server.post<{ Body: CreateInboxItemBody }>('/api/inbox', async (request, reply) => {
    try {
      const { title, rawContent = '', sourceLink, suggestedTags = [], sourcePlatform } = request.body || {};

      if (!title || !title.trim()) {
        reply.code(400).send({ error: 'Title is required' });
        return;
      }

      const id = uuidv4();
      const importedAt = new Date().toISOString();
      const inboxDir = getInboxDir(rootPath);

      // Ensure inbox dir exists
      await fs.mkdir(inboxDir, { recursive: true });

      const frontmatter: InboxItemFrontmatter = {
        id,
        title,
        importedAt,
        cleanedState: 'unprocessed',
        suggestedTags,
        sourceLink: sourceLink || undefined,
        sourcePlatform: sourcePlatform || undefined,
        notes: ''
      };

      // Remove undefined keys so gray-matter doesn't choke
      const cleanFrontmatter = JSON.parse(JSON.stringify(frontmatter));

      const fileContent = matter.stringify(rawContent, cleanFrontmatter);
      const filePath = path.join(inboxDir, `${id}.md`);

      await fs.writeFile(filePath, fileContent, 'utf-8');

      const entity: InboxItemEntity = {
        rawContent
      };

      invalidateCache(); // Invalidate cache after creating inbox item

      reply.code(201).send(entity);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create inbox item', message: String(error) });
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

      invalidateCache(); // Invalidate cache after deleting inbox item

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
      if (updates.project !== undefined) frontmatter.project = updates.project;
      if (updates.status !== undefined) frontmatter.status = updates.status;
      if (updates.category !== undefined) frontmatter.category = updates.category;
      if (updates.tags !== undefined) frontmatter.tags = updates.tags;

      const newBody = updates.rawContent !== undefined ? updates.rawContent : body;
      const newFileContent = matter.stringify(newBody, frontmatter);

      await fs.writeFile(targetPath, newFileContent, 'utf-8');

      // --- Promotion Logic ---
      if (frontmatter.project) {
        try {
          const promoted = await promoteToPrompt(
            { ...frontmatter, rawContent: newBody, id: id } as InboxItemEntity,
            frontmatter.project,
            rootPath
          );

          console.log(`[Inbox] Promotion successful. PromptID: ${promoted.id}, Path should be in project folder`);

          // ATOMIC: Only delete from inbox AFTER verification succeeded
          await fs.rm(targetPath, { force: true });

          invalidateCache(); // Invalidate cache after promotion

          reply.code(200).send({
            id,
            ...frontmatter,
            rawContent: newBody,
            promotedTo: promoted.id
          });
          return;
        } catch (err) {
          // DO NOT SWALLOW ERRORS - Log and return error to client
          const errorMsg = `[Inbox] Promotion FAILED for ${id}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          reply.code(500).send({
            error: 'Promotion failed',
            message: errorMsg,
            details: err instanceof Error ? err.stack : String(err)
          });
          return;
        }
      }

      reply.code(200).send({ id, ...frontmatter, rawContent: newBody });

      invalidateCache(); // Invalidate cache after updating inbox item

    } catch (error) {
      reply.code(500).send({ error: 'Failed to update inbox item', message: String(error) });
    }
  });

  // Helper to promote inbox item to prompt
  async function promoteToPrompt(
    item: InboxItemEntity,
    projectId: string,
    rootPath: string
  ): Promise<PromptEntity> {
    // CRITICAL: Invalidate cache to ensure fresh project data
    invalidateCache();

    const scan = await scanWorkspace(rootPath);
    const project = scan.projects.find(p => p.id === projectId);

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const promptId = uuidv4();

    // Fix: Use proper regex (single backslash, not double-escaped)
    const slug = item.title.trim().toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') || item.id;

    // Fix: Map inbox status to valid prompt status values
    // Schema allows: 'draft', 'needs_review', 'ready', 'deprecated'
    const statusMap: Record<string, string> = {
      'ACTIVE': 'draft',
      'PENDING': 'needs_review',
      'COMPLETED': 'ready',
      'ARCHIVED': 'deprecated',
    };
    const promptStatus = statusMap[item.status as string] || 'draft';

    const newPrompt: PromptEntity = {
      id: promptId,
      slug,
      projectId: project.id,
      title: item.title,
      status: promptStatus as any,
      priority: 'medium',
      tags: item.tags || [],
      notes: item.notes || '',
      archived: false,
      createdAt: item.importedAt,
      updatedAt: new Date().toISOString(),
      body: item.rawContent || '',
    };

    // Write prompt file
    const promptPath = getPromptFilePath(rootPath, project.slug, slug);

    console.log(`[Promotion] Creating prompt at: ${promptPath}`);

    // Ensure prompts dir exists
    await fs.mkdir(path.dirname(promptPath), { recursive: true });

    const { body, ...promptFrontmatter } = newPrompt;
    const content = matter.stringify(body, promptFrontmatter);

    await fs.writeFile(promptPath, content, 'utf-8');

    // VERIFICATION: Confirm file was actually written
    try {
      await fs.access(promptPath);
      const stat = await fs.stat(promptPath);
      console.log(`[Promotion] Verified file created: ${promptPath} (${stat.size} bytes)`);
    } catch (error) {
      throw new Error(`Promotion failed: File not created at ${promptPath}. Error: ${String(error)}`);
    }

    return newPrompt;
  }
}
