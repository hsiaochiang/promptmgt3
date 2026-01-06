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
      '/api/snippets:',
      '/api/snippets/{id}:',
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

  it('should define all core entity CRUD operations', () => {
    // Projects CRUD
    expect(specText).toContain('/api/projects:');
    expect(specText).toMatch(/\/api\/projects:[\s\S]*get:/);
    expect(specText).toMatch(/\/api\/projects:[\s\S]*post:/);
    
    // Prompts CRUD
    expect(specText).toContain('/api/prompts:');
    expect(specText).toMatch(/\/api\/prompts:[\s\S]*get:/);
    expect(specText).toMatch(/\/api\/prompts:[\s\S]*post:/);
    expect(specText).toMatch(/\/api\/prompts\/\{id\}:[\s\S]*put:/);
    expect(specText).toMatch(/\/api\/prompts\/\{id\}:[\s\S]*delete:/);

    // Inbox CRUD
    expect(specText).toContain('/api/inbox:');
    expect(specText).toMatch(/\/api\/inbox:[\s\S]*get:/);
    expect(specText).toMatch(/\/api\/inbox:[\s\S]*post:/);
    expect(specText).toMatch(/\/api\/inbox\/\{id\}:[\s\S]*get:/);
    expect(specText).toMatch(/\/api\/inbox\/\{id\}:[\s\S]*put:/);
    expect(specText).toMatch(/\/api\/inbox\/\{id\}:[\s\S]*delete:/);
  });

  it('should define trash operations with proper error responses', () => {
    const trashSection = specText.indexOf('/api/trash:');
    expect(trashSection).toBeGreaterThan(-1);

    // Check trash list endpoint
    expect(specText).toContain('列出回收站項目');
    expect(specText).toContain('TrashListResponse');

    // Check trash restore endpoint with conflict handling
    const restoreIndex = specText.indexOf('/api/trash/{trashId}/restore:');
    expect(restoreIndex).toBeGreaterThan(-1);
    
    const restoreSlice = specText.slice(restoreIndex, restoreIndex + 800);
    expect(restoreSlice).toContain('TrashRestoreRequest');
    expect(restoreSlice).toContain('TrashRestoreResult');
    expect(restoreSlice).toContain('409'); // Conflict response
    expect(restoreSlice).toContain('RestoreConflict');

    // Check trash purge endpoint
    expect(specText).toContain('永久刪除回收站項目');
    expect(specText).toMatch(/\/api\/trash\/\{trashId\}:[\s\S]*delete:/);
  });

  it('should define backup/snapshot/version endpoints', () => {
    // Snapshots
    expect(specText).toContain('/api/snapshots:');
    expect(specText).toMatch(/\/api\/snapshots:[\s\S]*post:/);
    expect(specText).toMatch(/\/api\/snapshots:[\s\S]*get:/);
    expect(specText).toContain('建立快照');
    expect(specText).toContain('列出快照事件');

    // Versions
    expect(specText).toContain('/api/versions:');
    expect(specText).toMatch(/\/api\/versions:[\s\S]*post:/);
    expect(specText).toMatch(/\/api\/versions:[\s\S]*get:/);
    expect(specText).toContain('/api/versions/{entityType}/{entityId}:');
    expect(specText).toContain('VersionEvent');
  });

  it('should define file operations and attachments', () => {
    // File read/write for autosave
    expect(specText).toContain('/api/files/read:');
    expect(specText).toContain('/api/files/write:');
    expect(specText).toMatch(/\/api\/files\/read:[\s\S]*get:/);
    expect(specText).toMatch(/\/api\/files\/write:[\s\S]*post:/);

    // Attachments upload
    expect(specText).toContain('/api/files/attach:');
    expect(specText).toMatch(/\/api\/files\/attach:[\s\S]*post:/);
    expect(specText).toContain('multipart/form-data');
    expect(specText).toContain('Attachment');
  });

  it('should define workspace settings endpoints with proper error codes', () => {
    const settingsIndex = specText.indexOf('/api/workspace/settings:');
    expect(settingsIndex).toBeGreaterThan(-1);

    const settingsSlice = specText.slice(settingsIndex, settingsIndex + 1200);
    
    // GET endpoint
    expect(settingsSlice).toMatch(/get:[\s\S]*取得工作空間設定/);
    
    // POST endpoint with proper error responses
    expect(settingsSlice).toMatch(/post:[\s\S]*更新工作空間設定/);
    expect(settingsSlice).toContain('SettingsUpdate');
    expect(settingsSlice).toContain("'400'"); // Bad request
    expect(settingsSlice).toContain("'403'"); // Forbidden
    expect(settingsSlice).toContain("'500'"); // Server error
    expect(settingsSlice).toContain('ErrorResponse');
  });

  it('should define workspace permissions endpoint', () => {
    const permIndex = specText.indexOf('/api/workspace/permissions:');
    expect(permIndex).toBeGreaterThan(-1);

    const permSlice = specText.slice(permIndex, permIndex + 400);
    expect(permSlice).toContain('檢查路徑讀寫權限');
    expect(permSlice).toContain('PathPermissions');
    expect(permSlice).toMatch(/parameters:[\s\S]*- in: query[\s\S]*name: path/);
    expect(permSlice).toContain("'400'"); // Missing path parameter
  });

  it('should define all required schemas in components section', () => {
    const requiredSchemas = [
      'ErrorResponse',
      'Settings',
      'SettingsUpdate',
      'PathPermissions',
      'Project',
      'ProjectInput',
      'Prompt',
      'PromptInput',
      'InboxItem',
      'InboxImport',
      'TrashItem',
      'TrashListResponse',
      'TrashRestoreRequest',
      'TrashRestoreResult',
      'RestoreConflict',
      'SearchRequest',
      'SearchResponse',
      'VersionEvent',
      'Attachment',
      'Snippet',
      'SnippetInput',
      'SnippetList',
    ];

    const componentsIndex = specText.indexOf('components:');
    expect(componentsIndex).toBeGreaterThan(-1);

    for (const schema of requiredSchemas) {
      expect(specText).toContain(schema);
    }
  });

  it('should document error responses consistently across endpoints', () => {
    // All POST /api/workspace/settings error codes should reference ErrorResponse
    expect(specText).toMatch(/\/api\/workspace\/settings:[\s\S]*'400':[\s\S]*ErrorResponse/);
    expect(specText).toMatch(/\/api\/workspace\/settings:[\s\S]*'403':[\s\S]*ErrorResponse/);
    expect(specText).toMatch(/\/api\/workspace\/settings:[\s\S]*'500':[\s\S]*ErrorResponse/);

    // 404 Not Found should be present for entity endpoints
    expect(specText).toMatch(/\/api\/prompts\/\{id\}:[\s\S]*'404'/);
    expect(specText).toMatch(/\/api\/inbox\/\{id\}:[\s\S]*'404'/);
    expect(specText).toMatch(/\/api\/trash\/\{trashId\}:[\s\S]*'404'/);
  });

  it('should prevent route drift by listing all documented paths', () => {
    // Extract all path definitions from OpenAPI spec
    const pathRegex = /^  \/api\/[^:]+:/gm;
    const specPaths = [...specText.matchAll(pathRegex)].map((m) => 
      m[0].trim().replace(':', '')
    );

    // Core paths that MUST be implemented according to plan.md and tasks.md
    const implementedPaths = [
      '/api/workspace/settings',
      '/api/workspace/permissions',
      '/api/projects',
      '/api/projects/{id}',
      '/api/prompts',
      '/api/prompts/{id}',
      '/api/trash',
      '/api/trash/{trashId}',
      '/api/trash/{trashId}/restore',
      '/api/inbox',
      '/api/inbox/{id}',
      '/api/snippets',
      '/api/snippets/{id}',
      '/api/files/read',
      '/api/files/write',
      '/api/files/attach',
      '/api/search',
      '/api/snapshots',
      '/api/versions',
      '/api/versions/{entityType}/{entityId}',
    ];

    // All implemented paths should be in the spec
    for (const implPath of implementedPaths) {
      expect(specPaths).toContain(implPath);
    }

    console.log(`✓ OpenAPI spec documents ${specPaths.length} paths`);
    console.log(`✓ All ${implementedPaths.length} implemented paths are present in spec`);
  });
});
