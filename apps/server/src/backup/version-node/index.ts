import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getVersionsDir, getVersionNodePath, isSystemPath } from '../../fs-layout/index.js';
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
 * List ALL version nodes across the entire system
 */
export async function listAllVersionNodes(rootPath: string): Promise<VersionNode[]> {
  const allEvents: VersionNode[] = [];
  const versionsDir = getVersionsDir(rootPath);

  try {
    // Traverse entity types (project/prompt)
    const typeDirs = await fs.readdir(versionsDir, { withFileTypes: true });
    for (const typeDir of typeDirs) {
      if (!typeDir.isDirectory()) continue;
      const typePath = path.join(versionsDir, typeDir.name); // e.g. versions/project

      // Traverse entities
      const entityDirs = await fs.readdir(typePath, { withFileTypes: true });
      for (const entityDir of entityDirs) {
        if (!entityDir.isDirectory()) continue;
        const entityId = entityDir.name;

        // Use existing helper to list for this entity
        const events = await listVersionNodes(rootPath, typeDir.name as 'project' | 'prompt', entityId);
        allEvents.push(...events);
      }
    }
  } catch {
    // Ignore errors
  }

  // Sort by time desc
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return allEvents;
}

/**
 * Restore a specific version node
 */
export async function restoreVersionNode(rootPath: string, versionId: string): Promise<void> {
  // 1. Find the version directory
  // Since ID contains entity type and id, we could parse it, but listAll is safer to find path if structure varies.
  // Format: version-{type}-{id}-{timestamp}-{short}
  // Let's parse ID to find path efficiently.
  const parts = versionId.split('-');
  if (parts.length < 5) throw new Error('Invalid version ID format');

  /* const type = parts[1];
  const entId = parts[2]; */
  // UUIDs break split by dash. :D
  // Actually versionId is generated as: `version-${entityType}-${entityId}-${safeTimestamp}-${shortId}`
  // If entityId is UUID (dashes), this logic breaks.

  // Alternative: Search for manifest with this ID.
  // Since we don't have a DB, we have to scan.
  // Using listAllVersionNodes might be slow but robust.

  // Optimization: versionId is unique.
  // Let's assume we can scan.
  const all = await listAllVersionNodes(rootPath);
  const target = all.find(v => v.id === versionId);

  if (!target) {
    throw new Error('Version not found');
  }

  const versionPath = target.snapshotPath;
  const contentSource = path.join(versionPath, 'content');

  // 2. Determine restore target path
  // We need to find where this entity currently lives.
  // Use index helper.
  const entityPath = await findEntityPathById(rootPath, target.entityType as any, target.entityId);

  if (!entityPath) {
    // Entity might be deleted. Restore to some default location?
    // For now throw error.
    throw new Error('Original entity not found (might be deleted/renamed). Restore of deleted entities not fully supported yet.');
  }

  // 3. Restore Content
  // If entity is file (Prompt), copy file.
  // If entity is dir (Project), copy dir.

  try {
    const stat = await fs.stat(contentSource);
    if (stat.isDirectory()) {
      // It's a directory structure.
      // It could be a single file inside (for Prompt) or full dir (for Project).

      // Check target type
      const targetStat = await fs.stat(entityPath);

      if (targetStat.isDirectory()) {
        // Target is Project Dir. Source should have content.
        // Filter system paths during restore?
        await copyDir(contentSource, entityPath);
      } else {
        // Target is Prompt File. Source should contain the file.
        const files = await fs.readdir(contentSource);
        // Find the .md file
        const mdFile = files.find(f => f.endsWith('.md'));
        if (mdFile) {
          await fs.copyFile(path.join(contentSource, mdFile), entityPath);
        }
      }
    }
  } catch (error) {
    throw new Error(`Restore failed: ${error}`);
  }

  // 4. Restore Attributes / Attachments if needed
  // (Skipped for now, focusing on content)
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
