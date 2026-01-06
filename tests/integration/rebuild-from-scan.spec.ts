import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanWorkspace } from '../../apps/server/src/indexing/index.js';
import { 
  writeProjectFile, 
  writePromptFile, 
  writeInboxItemFile 
} from '../../apps/server/src/indexing/index.js';
import {
  getProjectFilePath,
  getPromptFilePath,
  getInboxItemFilePath,
} from '../../apps/server/src/fs-layout/index.js';
import type { ProjectEntity, PromptEntity, InboxItemEntity } from '@pah/contracts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration Test - File Scanning and Rebuild (INV-002)', () => {
  const testRootPath = path.join(__dirname, '..', '..', 'test-data', 'rebuild-test');
  
  beforeAll(async () => {
    // Clean up any existing test data
    try {
      await fs.rm(testRootPath, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    
    // Create test directory
    await fs.mkdir(testRootPath, { recursive: true });
  });
  
  afterAll(async () => {
    // Clean up test data
    try {
      await fs.rm(testRootPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });
  
  it('should rebuild UI data from file scan after restart', async () => {
    // Step 1: Create test entities
    const projectId = '11111111-1111-1111-1111-111111111111';
    const promptId = '22222222-2222-2222-2222-222222222222';
    const inboxId = '33333333-3333-3333-3333-333333333333';
    
    const project: ProjectEntity = {
      id: projectId,
      slug: 'test-project',
      title: 'Test Project',
      summary: 'A test project for rebuild verification',
      status: 'in_progress',
      type: 'test',
      tags: ['test', 'integration'],
      archived: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      body: 'This is the project description.',
    };
    
    const prompt: PromptEntity = {
      id: promptId,
      slug: 'test-prompt',
      projectId,
      title: 'Test Prompt',
      status: 'draft',
      priority: 'medium',
      tags: ['test'],
      notes: 'Test notes',
      archived: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      body: 'This is the prompt content.',
    };
    
    const inboxItem: InboxItemEntity = {
      id: inboxId,
      title: 'Test Inbox Item',
      sourcePlatform: 'manual',
      importedAt: '2024-01-01T00:00:00.000Z',
      rawContent: 'Raw inbox content',
      cleanedState: 'unprocessed',
      suggestedTags: ['inbox', 'test'],
      notes: 'Test inbox notes',
    };
    
    // Write entities to files
    await writeProjectFile(getProjectFilePath(testRootPath, 'test-project'), project);
    await writePromptFile(getPromptFilePath(testRootPath, 'test-project', 'test-prompt'), prompt);
    await writeInboxItemFile(getInboxItemFilePath(testRootPath, inboxId), inboxItem);
    
    // Step 2: Scan workspace (simulating restart/rebuild)
    const scanResult = await scanWorkspace(testRootPath);
    
    // Step 3: Verify all entities were discovered
    expect(scanResult.projects).toHaveLength(1);
    expect(scanResult.prompts).toHaveLength(1);
    expect(scanResult.inbox).toHaveLength(1);
    expect(scanResult.errors).toHaveLength(0);
    
    // Step 4: Verify project data integrity
    const scannedProject = scanResult.projects[0];
    expect(scannedProject.id).toBe(projectId);
    expect(scannedProject.slug).toBe('test-project');
    expect(scannedProject.title).toBe('Test Project');
    expect(scannedProject.summary).toBe('A test project for rebuild verification');
    expect(scannedProject.status).toBe('in_progress');
    expect(scannedProject.tags).toEqual(['test', 'integration']);
    expect(scannedProject.body).toBe('This is the project description.');
    
    // Step 5: Verify prompt data integrity
    const scannedPrompt = scanResult.prompts[0];
    expect(scannedPrompt.id).toBe(promptId);
    expect(scannedPrompt.slug).toBe('test-prompt');
    expect(scannedPrompt.projectId).toBe(projectId);
    expect(scannedPrompt.title).toBe('Test Prompt');
    expect(scannedPrompt.status).toBe('draft');
    expect(scannedPrompt.priority).toBe('medium');
    expect(scannedPrompt.body).toBe('This is the prompt content.');
    
    // Step 6: Verify inbox data integrity
    const scannedInbox = scanResult.inbox[0];
    expect(scannedInbox.id).toBe(inboxId);
    expect(scannedInbox.title).toBe('Test Inbox Item');
    expect(scannedInbox.rawContent).toBe('Raw inbox content');
    expect(scannedInbox.cleanedState).toBe('unprocessed');
  });
  
  it('should handle scan errors gracefully', async () => {
    // Create a directory with an invalid file
    const invalidProjectPath = getProjectFilePath(testRootPath, 'invalid-project');
    await fs.mkdir(path.dirname(invalidProjectPath), { recursive: true });
    await fs.writeFile(invalidProjectPath, 'invalid: yaml: content:', 'utf-8');
    
    const scanResult = await scanWorkspace(testRootPath);
    
    // Should record error but continue scanning
    expect(scanResult.errors.length).toBeGreaterThan(0);
    expect(scanResult.errors[0].path).toContain('invalid-project');
  });
});
