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
});
