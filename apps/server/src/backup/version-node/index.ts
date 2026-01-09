import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getVersionsDir, getVersionNodePath, isSystemPath, getProjectFilePath, getPromptFilePath } from '../../fs-layout/index.js';
import { findEntityPathById } from '../../indexing/index.js';
import type { VersionNode } from '@pah/contracts';

async function copyDir(src: string, dest: string, filter?: (fullPath: string) => boolean): Promise<{ files: number; size: number; }> {
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
/**
 * Create a version node for a specific entity (project or prompt)
 */
export async function createVersionNode(
  rootPath: string,
  entityType: 'project' | 'prompt',
  entityId: string,
  entityPath: string,
  name?: string,
  description?: string
): Promise<VersionNode> {
  const now = new Date();
  const timestamp = now.toISOString();
  const safeTimestamp = timestamp.replace(/[:.]/g, '').slice(0, 15); // YYYYMMDD-HHmmss
  const shortId = Math.random().toString(36).substring(2, 8);
  const versionType = 'manual';

  const versionDir = getVersionNodePath(rootPath, entityType, entityId, safeTimestamp, versionType, shortId);
  await fs.mkdir(versionDir, { recursive: true });

  // 1. Copy entity content & Extract Title
  const contentTarget = path.join(versionDir, 'content');
  let contentStats = { files: 0, size: 0 };
  let titleSnapshot = entityId; // Fallback

  try {
    const stat = await fs.stat(entityPath);
    if (stat.isFile()) {
      // Single file (prompt)
      await fs.mkdir(contentTarget, { recursive: true });
      const destFile = path.join(contentTarget, path.basename(entityPath));
      await fs.copyFile(entityPath, destFile);
      contentStats = { files: 1, size: stat.size };

      // Parse title
      const raw = await fs.readFile(entityPath, 'utf-8');
      const { data } = matter(raw);
      if (data.title) titleSnapshot = data.title;

    } else if (stat.isDirectory()) {
      // Directory (project)
      const filter = (fullPath: string) => {
        if (isSystemPath(rootPath, fullPath)) return false;
        return true;
      };
      contentStats = await copyDir(entityPath, contentTarget, filter);

      // Parse title from project.md
      try {
        const projectMdPath = path.join(entityPath, 'project.md');
        const raw = await fs.readFile(projectMdPath, 'utf-8');
        const { data } = matter(raw);
        if (data.title) titleSnapshot = data.title;
      } catch {
        // ignore if project.md missing
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy entity content: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 2. Copy attachments if they exist
  const attachmentsSrc = path.join(rootPath, 'attachments', entityType, entityId);
  const attachmentsTarget = path.join(versionDir, 'attachments');
  let attachmentsStats = { files: 0, size: 0 };

  try {
    const stat = await fs.stat(attachmentsSrc);
    if (stat.isDirectory()) {
      attachmentsStats = await copyDir(attachmentsSrc, attachmentsTarget);
    }
  } catch {
    // No attachments directory
  }

  const versionId = `version-${entityType}-${entityId}-${safeTimestamp}-${shortId}`;
  const totalSize = contentStats.size + attachmentsStats.size;

  const manifest: VersionNode = {
    id: versionId,
    entityId,
    entityType,
    versionType: 'manual',
    name: name || undefined,
    description: description || undefined,
    timestamp,
    snapshotPath: versionDir,
    titleSnapshot,
    fileSize: totalSize,
  };

  await fs.writeFile(path.join(versionDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return manifest;
}

/**
 * List all version nodes for a specific entity
 */
/**
 * List all version nodes for a specific entity
 */
export async function listVersionNodes(
  rootPath: string,
  entityType: 'project' | 'prompt',
  entityId: string
): Promise<VersionNode[]> {
  const events: VersionNode[] = [];
  const entityVersionsDir = path.join(getVersionsDir(rootPath), entityType, entityId);

  try {
    const versionDirs = await fs.readdir(entityVersionsDir, { withFileTypes: true });
    for (const versionDir of versionDirs) {
      if (!versionDir.isDirectory()) continue;

      const versionPath = path.join(entityVersionsDir, versionDir.name);
      const manifestPath = path.join(versionPath, 'manifest.json');

      try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(content) as VersionNode;
        events.push(manifest);
      } catch {
        // Ignore broken manifests
      }
    }
  } catch {
    // No versions yet for this entity
  }

  // Newest first
  events.sort((a, b) => (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  return events;
}

/**
 * Get a specific version node by reading its manifest
 */
export async function getVersionNode(versionPath: string): Promise<VersionNode | null> {
  try {
    const manifestPath = path.join(versionPath, 'manifest.json');
    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(content) as VersionNode;
    return manifest;
  } catch {
    return null;
  }
}
