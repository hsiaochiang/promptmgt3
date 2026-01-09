import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { registerInboxRoutes } from '../../apps/server/src/routes/inbox';
import { invalidateCache } from '../../apps/server/src/indexing';
import matter from 'gray-matter';

const TEST_ROOT = path.join(process.cwd(), 'temp-test-inbox-usability');
const INBOX_DIR = path.join(TEST_ROOT, 'inbox');

describe('Integration: Inbox Usability', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    await fs.mkdir(INBOX_DIR, { recursive: true });
    server = Fastify();
    await registerInboxRoutes(server as any, TEST_ROOT);
    invalidateCache();
  });

  afterEach(async () => {
    await server.close();
    await fs.rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('should list multiple items sorted by date', async () => {
    // Create 3 items with different dates
    const items = [
      { id: '123e4567-e89b-12d3-a456-426614174001', importedAt: '2024-01-01T10:00:00Z', title: 'Old' },
      { id: '123e4567-e89b-12d3-a456-426614174002', importedAt: '2024-01-03T10:00:00Z', title: 'New' },
      { id: '123e4567-e89b-12d3-a456-426614174003', importedAt: '2024-01-02T10:00:00Z', title: 'Mid' },
    ];

    for (const item of items) {
      await fs.writeFile(
        path.join(INBOX_DIR, `${item.id}.md`),
        matter.stringify('content', item)
      );
    }

    // Invalidate cache explicitly to ensure scan picks up new files
    invalidateCache();

    const res = await server.inject({
      method: 'GET',
      url: '/api/inbox'
    });

    const list = res.json<any[]>();
    expect(list).toHaveLength(3);

    // Should be New -> Mid -> Old (Desc)
    expect(list[0].title).toBe('New');
    expect(list[1].title).toBe('Mid');
    expect(list[2].title).toBe('Old');
  });

  it('should handle permanent delete of non-existent item gracefully', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: '/api/inbox/123e4567-e89b-12d3-a456-999999999999'
    });
    expect(res.statusCode).toBe(404);
  });
});
