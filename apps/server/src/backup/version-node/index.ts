import fs from 'fs/promises';
import path from 'path';
import { getVersionsDir, getVersionNodePath, isSystemPath } from '../../fs-layout/index.js';
import type { VersionEvent } from '@pah/contracts';

async function copyDir(src: string, dest: string, filter?: (fullPath: string) => boolean): Promise<{ files: number; size: number; }>{
  let files = 0;
  let size = 0;

  try {
    const stat = await fs.stat(src);
    if (!stat.isDirectory()) return { files, size };
  } catch {
    return { files, size };
  }

  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (filter && !filter(srcPath)) continue;

    if (entry.isDirectory()) {
      const child = await copyDir(srcPath, destPath, filter);
      files += child.files;
      size += child.size;
    } else if (entry.isFile()) {
      const stat = await fs.stat(srcPath);
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
      files += 1;
      size += stat.size;
    }
  }

  return { files, size };
}

/**
 * Create a version node for a specific entity (project or prompt)
 */
export async function createVersionNode(
  rootPath: string,
  entityType: 'project' | 'prompt',
  entityId: string,
  entityPath: string,
  message?: string
): Promise<VersionEvent> {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '').slice(0, 15); // YYYYMMDD-HHmmss
  const shortId = Math.random().toString(36).substring(2, 8);
  const eventType = 'manual';

  const versionDir = getVersionNodePath(rootPath, entityType, entityId, timestamp, eventType, shortId);
  await fs.mkdir(versionDir, { recursive: true });

  // Copy entity content
  const contentTarget = path.join(versionDir, 'content');
  let contentStats = { files: 0, size: 0 };
  
  try {
    const stat = await fs.stat(entityPath);
    if (stat.isFile()) {
      // Single file (prompt)
      await fs.mkdir(contentTarget, { recursive: true });
      const destFile = path.join(contentTarget, path.basename(entityPath));
      await fs.copyFile(entityPath, destFile);
      contentStats = { files: 1, size: stat.size };
    } else if (stat.isDirectory()) {
      // Directory (project)
      const filter = (fullPath: string) => {
        if (isSystemPath(rootPath, fullPath)) return false;
        return true;
      };
      contentStats = await copyDir(entityPath, contentTarget, filter);
    }
  } catch (error) {
    throw new Error(`Failed to copy entity content: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Copy attachments if they exist
  const attachmentsSrc = path.join(rootPath, 'attachments', entityType, entityId);
  const attachmentsTarget = path.join(versionDir, 'attachments');
  let attachmentsStats = { files: 0, size: 0 };
  
  try {
    const stat = await fs.stat(attachmentsSrc);
    if (stat.isDirectory()) {
      attachmentsStats = await copyDir(attachmentsSrc, attachmentsTarget);
    }
  } catch {
    // No attachments directory, this is fine
  }

  const versionId = `version-${entityType}-${entityId}-${timestamp}-${shortId}`;

  const manifest = {
    versionId,
    entityType,
    entityId,
    eventType,
    createdAt: now.toISOString(),
    message,
    path: versionDir,
    stats: {
      filesCount: contentStats.files,
      attachmentsCount: attachmentsStats.files,
      sizeBytes: contentStats.size + attachmentsStats.size,
    },
    errors: [] as string[],
  };

  await fs.writeFile(path.join(versionDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  const event: VersionEvent = {
    id: versionId,
    type: 'version-node',
    scope: entityType,
    message,
    createdAt: manifest.createdAt,
    snapshotPath: versionDir,
  };

  return event;
}

/**
 * List all version nodes for a specific entity
 */
export async function listVersionNodes(
  rootPath: string,
  entityType: 'project' | 'prompt',
  entityId: string
): Promise<VersionEvent[]> {
  const events: VersionEvent[] = [];
  const entityVersionsDir = path.join(getVersionsDir(rootPath), entityType, entityId);

  try {
    const versionDirs = await fs.readdir(entityVersionsDir, { withFileTypes: true });
    for (const versionDir of versionDirs) {
      if (!versionDir.isDirectory()) continue;
      
      const versionPath = path.join(entityVersionsDir, versionDir.name);
      const manifestPath = path.join(versionPath, 'manifest.json');
      
      try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(content) as {
          versionId: string;
          entityType: string;
          createdAt: string;
          message?: string;
        };
        
        events.push({
          id: manifest.versionId,
          type: 'version-node',
          scope: entityType,
          message: manifest.message,
          createdAt: manifest.createdAt,
          snapshotPath: versionPath,
        });
      } catch {
        // Ignore broken manifests
      }
    }
  } catch {
    // No versions yet for this entity
  }

  // Newest first
  events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return events;
}

/**
 * List all version nodes across all entities
 */
export async function listAllVersionNodes(rootPath: string): Promise<VersionEvent[]> {
  const events: VersionEvent[] = [];
  const versionsRoot = getVersionsDir(rootPath);

  try {
    const entityTypes = await fs.readdir(versionsRoot, { withFileTypes: true });
    for (const entityTypeDir of entityTypes) {
      if (!entityTypeDir.isDirectory()) continue;
      
      const entityType = entityTypeDir.name as 'project' | 'prompt';
      const entityTypePath = path.join(versionsRoot, entityTypeDir.name);
      
      const entityIds = await fs.readdir(entityTypePath, { withFileTypes: true });
      for (const entityIdDir of entityIds) {
        if (!entityIdDir.isDirectory()) continue;
        
        const entityVersions = await listVersionNodes(rootPath, entityType, entityIdDir.name);
        events.push(...entityVersions);
      }
    }
  } catch {
    // No versions yet
  }

  // Newest first
  events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return events;
}

/**
 * Get a specific version node by reading its manifest
 */
export async function getVersionNode(versionPath: string): Promise<VersionEvent | null> {
  try {
    const manifestPath = path.join(versionPath, 'manifest.json');
    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(content) as {
      versionId: string;
      entityType: 'project' | 'prompt';
      createdAt: string;
      message?: string;
    };
    
    return {
      id: manifest.versionId,
      type: 'version-node',
      scope: manifest.entityType,
      message: manifest.message,
      createdAt: manifest.createdAt,
      snapshotPath: versionPath,
    };
  } catch {
    return null;
  }
}
