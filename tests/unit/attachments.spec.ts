import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { saveAttachment } from '../../apps/server/src/attachments/index.js';

describe('Attachment storage helpers', () => {
  let rootPath: string;
  let attachmentBasePath: string;

  beforeEach(async () => {
    rootPath = await fs.mkdtemp(path.join(os.tmpdir(), 'pah-attachments-'));
    attachmentBasePath = path.join(rootPath, 'attachments');
  });

  afterEach(async () => {
    await fs.rm(rootPath, { recursive: true, force: true });
  });

  it('saves attachment under entity directory without overwriting', async () => {
    const entityType = 'prompt' as const;
    const entityId = '123e4567-e89b-12d3-a456-426614174000';
    const originalFilename = 'image.png';
    const buffer = Buffer.from('dummy-image-bytes');

    const first = await saveAttachment({
      rootPath,
      attachmentBasePath,
      entityType,
      entityId,
      originalFilename,
      buffer,
      mimeType: 'image/png',
    });

    const second = await saveAttachment({
      rootPath,
      attachmentBasePath,
      entityType,
      entityId,
      originalFilename,
      buffer,
      mimeType: 'image/png',
    });

    expect(first.filename).not.toBe(second.filename);

    const entityDir = path.join(attachmentBasePath, entityType, entityId);
    const files = await fs.readdir(entityDir);
    expect(files).toContain(first.filename);
    expect(files).toContain(second.filename);
  });

  it('returns storagePath relative to workspace root', async () => {
    const entityType = 'project' as const;
    const entityId = '11111111-1111-1111-1111-111111111111';
    const originalFilename = 'doc.txt';
    const buffer = Buffer.from('hello');

    const result = await saveAttachment({
      rootPath,
      attachmentBasePath,
      entityType,
      entityId,
      originalFilename,
      buffer,
      mimeType: 'text/plain',
    });

    expect(result.storagePath.startsWith('attachments/')).toBe(true);
    expect(result.storagePath).toContain(`/` + entityType + `/` + entityId + `/`);

    const fullPath = path.join(rootPath, ...result.storagePath.split('/'));
    const content = await fs.readFile(fullPath, 'utf-8');
    expect(content).toBe('hello');
  });
});
