import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { AttachmentRef } from '@pah/contracts';

export type AttachmentEntityType = 'project' | 'prompt' | 'inbox';

export interface SaveAttachmentOptions {
  /** Workspace root path (for computing relative storagePath) */
  rootPath: string;
  /** Base attachment directory, e.g. from workspace settings */
  attachmentBasePath: string;
  entityType: AttachmentEntityType;
  entityId: string;
  originalFilename: string;
  buffer: Buffer | Uint8Array;
  mimeType?: string;
}

/**
 * Generate a filesystem-safe filename and avoid overwriting by appending a suffix when needed.
 */
async function generateUniqueFilename(dir: string, originalFilename: string): Promise<string> {
  const ext = path.extname(originalFilename) || '';
  const baseRaw = path.basename(originalFilename, ext);
  const safeBase = baseRaw.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'attachment';

  // Use timestamp to reduce collision probability, still check on disk to be safe.
  const timestamp = Date.now();
  let counter = 0;

  while (true) {
    const suffix = counter === 0 ? '' : `-${counter}`;
    const filename = `${safeBase}-${timestamp}${suffix}${ext}`;
    const fullPath = path.join(dir, filename);

    try {
      await fs.access(fullPath);
      // File exists, try next suffix
      counter += 1;
    } catch (error: any) {
      if (error && error.code === 'ENOENT') {
        return filename;
      }
      // For unexpected errors, rethrow
      throw error;
    }
  }
}

/**
 * Save an attachment to disk using the workspace attachment layout.
 * Returns an AttachmentRef that can be stored in frontmatter or returned via API.
 */
export async function saveAttachment(options: SaveAttachmentOptions): Promise<AttachmentRef> {
  const {
    rootPath,
    attachmentBasePath,
    entityType,
    entityId,
    originalFilename,
    buffer,
    mimeType,
  } = options;

  const entityDir = path.join(attachmentBasePath, entityType, entityId);
  await fs.mkdir(entityDir, { recursive: true });

  const filename = await generateUniqueFilename(entityDir, originalFilename);
  const fullPath = path.join(entityDir, filename);

  // Normalize to Buffer
  const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  await fs.writeFile(fullPath, data);

  const id = uuidv4();
  const storagePath = path
    .relative(rootPath, fullPath)
    .split(path.sep)
    .join('/');

  const attachment: AttachmentRef = {
    id,
    filename,
    storagePath,
    mimeType,
  };

  return attachment;
}
