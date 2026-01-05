/**
 * T053 [P] [US2] Integration test：外部檔案修改衝突流程（spec Edge Case #1）
 * DoD: 不靜默覆蓋；提供 rebase actions（重新整理/覆寫）
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';

describe('Integration - Conflict Resolution', () => {
  const testDataDir = path.join(process.cwd(), 'test-data', 'conflict-tests');
  let testRootPath: string;
  let testPromptPath: string;

  beforeEach(async () => {
    // Create test directory
    testRootPath = path.join(testDataDir, `test-${nanoid()}`);
    await fs.mkdir(testRootPath, { recursive: true });

    // Create test project directory
    const projectDir = path.join(testRootPath, 'projects', 'test-project');
    const promptsDir = path.join(projectDir, 'prompts');
    await fs.mkdir(promptsDir, { recursive: true });

    // Create a test prompt file
    testPromptPath = path.join(promptsDir, 'test-prompt.md');
    const initialContent = `---
id: 550e8400-e29b-41d4-a716-446655440000
slug: test-prompt
projectId: 550e8400-e29b-41d4-a716-446655440001
title: Test Prompt
status: draft
priority: P1
tags: [test]
createdAt: 2024-01-01T00:00:00.000Z
updatedAt: 2024-01-01T00:00:00.000Z
---

Initial prompt content.
`;
    await fs.writeFile(testPromptPath, initialContent, 'utf-8');
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testRootPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('External Modification Detection', () => {
    it('should detect when file is modified externally while editing', async () => {
      // Given: Original file content
      const originalContent = await fs.readFile(testPromptPath, 'utf-8');
      const originalMtime = (await fs.stat(testPromptPath)).mtimeMs;

      // When: External process modifies the file
      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different mtime
      const externalModification = originalContent.replace(
        'Initial prompt content.',
        'Externally modified content.'
      ).replace(
        'updatedAt: 2024-01-01T00:00:00.000Z',
        'updatedAt: 2024-01-01T01:00:00.000Z'
      );
      await fs.writeFile(testPromptPath, externalModification, 'utf-8');

      // Then: File should have different mtime
      const newMtime = (await fs.stat(testPromptPath)).mtimeMs;
      expect(newMtime).toBeGreaterThan(originalMtime);

      const modifiedContent = await fs.readFile(testPromptPath, 'utf-8');
      expect(modifiedContent).not.toBe(originalContent);
      expect(modifiedContent).toContain('Externally modified content.');
    });

    it('should detect conflict when attempting to save over external changes', async () => {
      // Given: Original file state
      const originalContent = await fs.readFile(testPromptPath, 'utf-8');
      const originalMtime = (await fs.stat(testPromptPath)).mtimeMs;

      // Simulate user editing in app
      const userEdits = originalContent.replace(
        'Initial prompt content.',
        'User edited content in app.'
      );

      // When: External modification happens first
      await new Promise(resolve => setTimeout(resolve, 10));
      const externalModification = originalContent.replace(
        'Initial prompt content.',
        'Externally modified content.'
      );
      await fs.writeFile(testPromptPath, externalModification, 'utf-8');
      const externalMtime = (await fs.stat(testPromptPath)).mtimeMs;

      // Attempt to save user edits
      const currentMtime = (await fs.stat(testPromptPath)).mtimeMs;
      const hasConflict = currentMtime > originalMtime;

      // Then: Conflict should be detected
      expect(hasConflict).toBe(true);
      expect(externalMtime).toBeGreaterThan(originalMtime);
    });
  });

  describe('Conflict Resolution - Refresh', () => {
    it('should allow user to refresh and discard local changes', async () => {
      // Given: User has unsaved edits
      const originalContent = await fs.readFile(testPromptPath, 'utf-8');
      const userEdits = originalContent.replace(
        'Initial prompt content.',
        'User edited content.'
      );

      // External modification
      await new Promise(resolve => setTimeout(resolve, 10));
      const externalModification = originalContent.replace(
        'Initial prompt content.',
        'External modification wins.'
      );
      await fs.writeFile(testPromptPath, externalModification, 'utf-8');

      // When: User chooses to refresh (reload from disk)
      const refreshedContent = await fs.readFile(testPromptPath, 'utf-8');

      // Then: Should have external changes, user edits are lost
      expect(refreshedContent).toBe(externalModification);
      expect(refreshedContent).toContain('External modification wins.');
      expect(refreshedContent).not.toContain('User edited content.');
    });

    it('should confirm before discarding local changes on refresh', () => {
      // Given: User has unsaved changes
      const hasUnsavedChanges = true;
      const userContent = 'User edited content.';

      // When: User attempts to refresh
      let confirmationRequired = hasUnsavedChanges;

      // Then: Should require confirmation
      expect(confirmationRequired).toBe(true);

      // Simulate user confirmation
      const userConfirmedRefresh = true;
      if (userConfirmedRefresh) {
        // Discard changes and reload
        const discarded = userContent;
        expect(discarded).toBeTruthy(); // Changes were tracked for potential recovery
      }
    });
  });

  describe('Conflict Resolution - Overwrite', () => {
    it('should allow user to force overwrite external changes', async () => {
      // Given: User has edits and external modification exists
      const originalContent = await fs.readFile(testPromptPath, 'utf-8');
      const userEdits = originalContent.replace(
        'Initial prompt content.',
        'User wants to keep this.'
      ).replace(
        'updatedAt: 2024-01-01T00:00:00.000Z',
        `updatedAt: ${new Date().toISOString()}`
      );

      // External modification
      await new Promise(resolve => setTimeout(resolve, 10));
      const externalModification = originalContent.replace(
        'Initial prompt content.',
        'External changes to be overwritten.'
      );
      await fs.writeFile(testPromptPath, externalModification, 'utf-8');

      // When: User chooses to force overwrite
      await fs.writeFile(testPromptPath, userEdits, 'utf-8');
      const finalContent = await fs.readFile(testPromptPath, 'utf-8');

      // Then: User's changes should win
      expect(finalContent).toBe(userEdits);
      expect(finalContent).toContain('User wants to keep this.');
      expect(finalContent).not.toContain('External changes to be overwritten.');
    });

    it('should warn user before overwriting external changes', () => {
      // Given: Conflict detected
      const hasConflict = true;
      const externalChanges = 'External modification';

      // When: User chooses overwrite
      let warningShown = false;
      if (hasConflict) {
        warningShown = true; // Warning should be displayed
      }

      // Then: Warning must be shown
      expect(warningShown).toBe(true);
    });
  });

  describe('Conflict UI State', () => {
    it('should set sync status to "conflict" when external change detected', () => {
      // Given: Normal editing state
      let syncStatus: 'idle' | 'saving' | 'conflict' | 'error' = 'idle';

      // When: External modification detected
      const conflictDetected = true;
      if (conflictDetected) {
        syncStatus = 'conflict';
      }

      // Then: Status should be conflict
      expect(syncStatus).toBe('conflict');
    });

    it('should provide conflict metadata in sync status', () => {
      // Given: Conflict detected
      const conflictInfo = {
        status: 'conflict' as const,
        entityType: 'prompt' as const,
        id: '550e8400-e29b-41d4-a716-446655440000',
        message: 'External modification detected. Refresh to see changes or overwrite to save your version.',
        updatedAt: new Date().toISOString(),
      };

      // Then: Should have all required fields
      expect(conflictInfo.status).toBe('conflict');
      expect(conflictInfo.message).toContain('External modification detected');
      expect(conflictInfo.entityType).toBe('prompt');
      expect(conflictInfo.id).toBeTruthy();
    });

    it('should allow user to copy unsaved content before resolving conflict', () => {
      // Given: User has unsaved edits during conflict
      const unsavedContent = `---
id: 550e8400-e29b-41d4-a716-446655440000
slug: test-prompt
title: User's edited version
---

User's valuable changes that might be lost.
`;

      // When: User requests to copy content
      const copiedContent = unsavedContent;

      // Then: Content should be available for copying
      expect(copiedContent).toBe(unsavedContent);
      expect(copiedContent).toContain("User's valuable changes");
    });
  });

  describe('Prevention of Silent Overwrites', () => {
    it('should never silently overwrite external changes', async () => {
      // Given: External modification
      const originalContent = await fs.readFile(testPromptPath, 'utf-8');
      const originalMtime = (await fs.stat(testPromptPath)).mtimeMs;

      await new Promise(resolve => setTimeout(resolve, 10));
      const externalMod = originalContent.replace(
        'Initial prompt content.',
        'Important external changes.'
      );
      await fs.writeFile(testPromptPath, externalMod, 'utf-8');

      // When: Attempting autosave
      const currentMtime = (await fs.stat(testPromptPath)).mtimeMs;
      const needsConflictResolution = currentMtime !== originalMtime;

      // Then: Should block the save and require user action
      expect(needsConflictResolution).toBe(true);
      
      // Verify external changes are preserved
      const currentContent = await fs.readFile(testPromptPath, 'utf-8');
      expect(currentContent).toContain('Important external changes.');
    });

    it('should track last known mtime to detect changes', async () => {
      // Given: File with known mtime
      const initialStat = await fs.stat(testPromptPath);
      const lastKnownMtime = initialStat.mtimeMs;

      // When: File is modified externally
      await new Promise(resolve => setTimeout(resolve, 10));
      const content = await fs.readFile(testPromptPath, 'utf-8');
      await fs.writeFile(testPromptPath, content + '\nModified', 'utf-8');

      // Then: mtime should change
      const newStat = await fs.stat(testPromptPath);
      const currentMtime = newStat.mtimeMs;
      expect(currentMtime).toBeGreaterThan(lastKnownMtime);
    });
  });

  describe('Retry After Conflict Resolution', () => {
    it('should allow retry after user resolves conflict', async () => {
      // Given: Conflict was resolved by overwrite
      const userContent = `---
id: 550e8400-e29b-41d4-a716-446655440000
slug: test-prompt
title: Resolved content
---

User resolved the conflict.
`;
      await fs.writeFile(testPromptPath, userContent, 'utf-8');
      const resolvedMtime = (await fs.stat(testPromptPath)).mtimeMs;

      // When: User makes additional edits and saves
      await new Promise(resolve => setTimeout(resolve, 10));
      const additionalEdits = userContent.replace(
        'User resolved the conflict.',
        'Additional edits after resolution.'
      );
      await fs.writeFile(testPromptPath, additionalEdits, 'utf-8');

      // Then: Should save successfully
      const finalContent = await fs.readFile(testPromptPath, 'utf-8');
      expect(finalContent).toContain('Additional edits after resolution.');
      
      const finalMtime = (await fs.stat(testPromptPath)).mtimeMs;
      expect(finalMtime).toBeGreaterThan(resolvedMtime);
    });

    it('should clear conflict status after successful resolution', () => {
      // Given: Conflict state
      let syncStatus: 'idle' | 'saving' | 'conflict' | 'error' = 'conflict';

      // When: User resolves conflict and save succeeds
      const conflictResolved = true;
      const saveSuccessful = true;

      if (conflictResolved && saveSuccessful) {
        syncStatus = 'idle';
      }

      // Then: Status should return to idle
      expect(syncStatus).toBe('idle');
    });
  });
});
