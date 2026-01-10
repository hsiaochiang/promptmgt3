import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { registerInboxRoutes } from '../../apps/server/src/routes/inbox';
import { invalidateCache } from '../../apps/server/src/indexing/index';
import { InboxItemEntity } from '@pah/contracts';
import matter from 'gray-matter';

const TEST_ROOT = path.join(process.cwd(), 'temp-test-inbox-contract');
const INBOX_DIR = path.join(TEST_ROOT, 'inbox');

describe('Contract: Inbox API', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    await fs.mkdir(INBOX_DIR, { recursive: true });
    server = Fastify();
    // Mock scanWorkspace or use real one? 
    // Real one depends on fs.
    // We need to import registerInboxRoutes.
    await registerInboxRoutes(server as any, TEST_ROOT);
  });

  afterEach(async () => {
    await server.close();
    await fs.rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('GET /api/inbox should return list', async () => {
    // Setup: Create an inbox item
    const item = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Test Item',
      importedAt: new Date().toISOString(),
    };
    const content = matter.stringify('Body content', item);
    await fs.writeFile(path.join(INBOX_DIR, 'test.md'), content);
    invalidateCache();

    const res = await server.inject({
      method: 'GET',
      url: '/api/inbox'
    });

    expect(res.statusCode).toBe(200);
    const list = res.json<InboxItemEntity[]>();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(list[0].title).toBe('Test Item');
  });

  it('DELETE /api/inbox/:id should permanent delete', async () => {
    // Setup
    const item = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      title: 'To Delete',
      importedAt: new Date().toISOString(),
    };
    await fs.writeFile(path.join(INBOX_DIR, 'del.md'), matter.stringify('Delete me', item));
    invalidateCache();

    const res = await server.inject({
      method: 'DELETE',
      url: '/api/inbox/123e4567-e89b-12d3-a456-426614174002'
    });

    expect(res.statusCode).toBe(200);

    // Verify file gone
    await expect(fs.access(path.join(INBOX_DIR, 'del.md'))).rejects.toThrow();
  });

  it('POST /api/inbox should create item', async () => {
    const payload = {
      title: 'Captured from Chrome',
      rawContent: 'This is the selection text.\n\nFrom a webpage.',
      sourceLink: 'https://example.com',
      suggestedTags: ['extension', 'capture']
    };

    const res = await server.inject({
      method: 'POST',
      url: '/api/inbox',
      payload
    });

    expect(res.statusCode).toBe(201);
    const created = res.json<InboxItemEntity>();

    expect(created.id).toBeDefined();
    expect(created.title).toBe(payload.title);
    expect(created.sourceLink).toBe(payload.sourceLink);
    expect(created.suggestedTags).toEqual(payload.suggestedTags);
    expect(created.rawContent).toBe(payload.rawContent);

    // Verify file created
    // We don't know the exact filename as it uses UUID, but we can scan dir
    const files = await fs.readdir(INBOX_DIR);
    expect(files.length).toBeGreaterThan(0);

    // Read one file and check
    const content = await fs.readFile(path.join(INBOX_DIR, files[0]), 'utf-8');
    const { data, content: body } = matter(content);
    expect(data.title).toBe(payload.title);
    expect(body.trim()).toBe(payload.rawContent.trim());
  });

  it('POST /api/inbox should fail without title', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/inbox',
      payload: {
        rawContent: 'No title here'
      }
    });
    expect(res.statusCode).toBe(400);
  });
});
