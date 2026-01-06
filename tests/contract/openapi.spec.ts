import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Contract Tests - OpenAPI spec', () => {
  const openapiPath = path.resolve(
    __dirname,
    '..',
    '..',
    'specs',
    '001-prompt-asset-hub',
    'contracts',
    'openapi.yaml',
  );

  const specText = fs.readFileSync(openapiPath, 'utf-8');

  it('should define workspace settings and permissions endpoints', () => {
    expect(specText).toContain('/api/workspace/settings');
    expect(specText).toContain('/api/workspace/permissions');
    // Legacy /api/settings path should not remain
    expect(specText).not.toContain('/api/settings:');
  });

  it('should define POST /api/search using SearchRequest and SearchResponse', () => {
    const searchIndex = specText.indexOf('/api/search:');
    expect(searchIndex).toBeGreaterThan(-1);

    const slice = specText.slice(searchIndex, searchIndex + 400);
    expect(slice).toContain('post:');
    expect(slice).toContain('SearchRequest');
    expect(slice).toContain('SearchResponse');
  });

  it('should include core API routes in the OpenAPI spec', () => {
    const expectedPaths = [
      '/api/projects:',
      '/api/projects/{id}:',
      '/api/prompts:',
      '/api/prompts/{id}:',
      '/api/trash:',
      '/api/trash/{trashId}:',
      '/api/trash/{trashId}/restore:',
      '/api/inbox:',
      '/api/inbox/{id}:',
      '/api/files/read:',
      '/api/files/write:',
      '/api/search:',
      '/api/snapshots:',
      '/api/versions:',
      '/api/versions/{entityType}/{entityId}:',
    ];

    for (const p of expectedPaths) {
      expect(specText).toContain(p);
    }
  });
});
