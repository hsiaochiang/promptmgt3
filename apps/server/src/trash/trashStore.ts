import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  TrashEntityType,
  TrashItem,
  TrashListResponse,
  TrashRestoreRequest,
  TrashRestoreResult,
  RestoreConflict,
} from '@pah/contracts';
import {
  getTrashItemsDir,
  getTrashItemDir,
  getTrashItemManifestPath,
} from '../fs-layout/index.js';
import { loadWorkspaceSettings } from '../routes/workspace.js';

type TrashManifest = TrashItem & {
  sizeBytes?: number;
  errors?: string[];
};

function toPosixRelative(p: string): string {
  return p.split(path.sep).join('/');
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function movePath(srcAbs: string, destAbs: string): Promise<void> {
  await ensureDir(path.dirname(destAbs));
  try {
    await fs.rename(srcAbs, destAbs);
  } catch (err: any) {
    // Cross-device rename fallback
    if (err && (err.code === 'EXDEV' || err.code === 'EPERM')) {
      const stat = await fs.stat(srcAbs);
      if (stat.isDirectory()) {
        await fs.cp(srcAbs, destAbs, { recursive: true });
        await fs.rm(srcAbs, { recursive: true, force: true });
      } else {
        await fs.copyFile(srcAbs, destAbs);
        await fs.rm(srcAbs, { force: true });
      }
      return;
    }
    throw err;
  }
}

export async function moveEntityToTrash(options: {
  rootPath: string;
  entityType: TrashEntityType;
  entityId: string;
  titleSnapshot: string;
  originalAbsPath: string;
  originalRelativePath: string;
  attachmentsEntityType?: 'project' | 'prompt' | 'inbox';
}): Promise<TrashItem> {
  const {
    rootPath,
    entityType,
    entityId,
    titleSnapshot,
    originalAbsPath,
    originalRelativePath,
    attachmentsEntityType,
  } = options;

  const settings = await loadWorkspaceSettings(rootPath);
  const retentionDays = settings.trashRetentionDays ?? 30;

  const trashId = uuidv4();
  const deletedAt = new Date();
  const purgeAfter = new Date(deletedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);

  const itemDir = getTrashItemDir(rootPath, trashId);
  const rootDir = path.join(itemDir, 'root');
  const attachmentsDir = path.join(itemDir, 'attachments');
  const errors: string[] = [];

  await ensureDir(getTrashItemsDir(rootPath));
  await ensureDir(rootDir);

  // Move authoritative entity content
  const normalizedRel = originalRelativePath.replace(/^\/+/, '');
  const destAbs = path.join(rootDir, ...normalizedRel.split('/'));

  try {
    await movePath(originalAbsPath, destAbs);
  } catch (e: any) {
    errors.push(`Failed to move entity content: ${e?.message ?? String(e)}`);
  }

  // Move attachments folder (best-effort)
  let attachmentsMoved = false;
  const attachmentBasePath = settings.attachmentPath;
  if (attachmentBasePath && attachmentsEntityType) {
    const srcAttachDir = path.join(attachmentBasePath, attachmentsEntityType, entityId);
    if (await pathExists(srcAttachDir)) {
      const destAttachDir = path.join(attachmentsDir, attachmentsEntityType, entityId);
      try {
        await movePath(srcAttachDir, destAttachDir);
        attachmentsMoved = true;
      } catch (e: any) {
        errors.push(`Failed to move attachments: ${e?.message ?? String(e)}`);
      }
    }
  }

  const manifest: TrashManifest = {
    trashId,
    entityType,
    entityId,
    titleSnapshot,
    deletedAt: deletedAt.toISOString(),
    purgeAfter: purgeAfter.toISOString(),
    originalRelativePath: normalizedRel,
    attachmentsMoved,
    ...(errors.length ? { errors } : {}),
  };

  await fs.writeFile(getTrashItemManifestPath(rootPath, trashId), JSON.stringify(manifest, null, 2), 'utf-8');

  return {
    trashId,
    entityType,
    entityId,
    titleSnapshot,
    deletedAt: manifest.deletedAt,
    purgeAfter: manifest.purgeAfter,
    originalRelativePath: manifest.originalRelativePath,
    attachmentsMoved: manifest.attachmentsMoved,
  };
}

export async function listTrash(options: {
  rootPath: string;
  q?: string;
  entityType?: TrashEntityType;
  page?: number;
  perPage?: number;
}): Promise<TrashListResponse> {
  const { rootPath, q, entityType } = options;
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 20;

  const itemsDir = getTrashItemsDir(rootPath);
  if (!(await pathExists(itemsDir))) {
    return { items: [], total: 0, page, perPage, hasMore: false };
  }

  const entries = await fs.readdir(itemsDir, { withFileTypes: true });
  const manifests: TrashManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = getTrashItemManifestPath(rootPath, entry.name);
    try {
      const text = await fs.readFile(manifestPath, 'utf-8');
      const parsed = JSON.parse(text) as TrashManifest;
      manifests.push(parsed);
    } catch {
      // ignore unreadable manifests
    }
  }

  let filtered = manifests;
  if (entityType) filtered = filtered.filter((m) => m.entityType === entityType);
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter((m) => (m.titleSnapshot || '').toLowerCase().includes(needle));
  }

  filtered.sort((a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''));

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const slice = filtered.slice(start, start + perPage);

  return {
    items: slice.map((m) => ({
      trashId: m.trashId,
      entityType: m.entityType,
      entityId: m.entityId,
      titleSnapshot: m.titleSnapshot,
      deletedAt: m.deletedAt,
      purgeAfter: m.purgeAfter,
      originalRelativePath: m.originalRelativePath,
      attachmentsMoved: m.attachmentsMoved,
    })),
    total,
    page,
    perPage,
    hasMore: start + perPage < total,
  };
}

export async function purgeTrashItem(options: { rootPath: string; trashId: string }): Promise<boolean> {
  const { rootPath, trashId } = options;
  const itemDir = getTrashItemDir(rootPath, trashId);
  if (!(await pathExists(itemDir))) return false;
  await fs.rm(itemDir, { recursive: true, force: true });
  return true;
}

function computeRestoreTarget(originalRelativePath: string, request: TrashRestoreRequest): string {
  if (request.strategy !== 'rename' || !request.newSlug) return originalRelativePath;

  // Heuristic rename: replace the last slug segment before optional extension.
  // - .../<slug>.md -> .../<newSlug>.md
  // - .../<slug>/... -> .../<newSlug>/... is handled by callers that pass a directory path
  const parts = originalRelativePath.split('/');
  const last = parts[parts.length - 1];
  if (last.endsWith('.md')) {
    parts[parts.length - 1] = `${request.newSlug}.md`;
    return parts.join('/');
  }

  // If last segment is a directory name
  parts[parts.length - 1] = request.newSlug;
  return parts.join('/');
}

export async function restoreTrashItem(options: {
  rootPath: string;
  trashId: string;
  request: TrashRestoreRequest;
}): Promise<{ result?: TrashRestoreResult; conflict?: RestoreConflict; notFound?: true }> {
  const { rootPath, trashId, request } = options;
  const manifestPath = getTrashItemManifestPath(rootPath, trashId);
  if (!(await pathExists(manifestPath))) return { notFound: true };

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8')) as TrashManifest;

  const itemDir = getTrashItemDir(rootPath, trashId);
  const srcRoot = path.join(itemDir, 'root');

  const targetRel = computeRestoreTarget(manifest.originalRelativePath, request);
  const targetAbs = path.join(rootPath, ...targetRel.split('/'));

  if (await pathExists(targetAbs)) {
    if (request.strategy !== 'overwrite') {
      return {
        conflict: {
          code: 'RESTORE_CONFLICT',
          message: 'Restore target already exists',
          conflicts: [{ kind: 'entityPath', path: targetRel }],
        },
      };
    }

    // overwrite: remove target first
    await fs.rm(targetAbs, { recursive: true, force: true });
  }

  // Move content back
  const srcAbs = path.join(srcRoot, ...manifest.originalRelativePath.split('/'));
  await movePath(srcAbs, targetAbs);

  // Restore attachments (best-effort)
  const settings = await loadWorkspaceSettings(rootPath);
  const attachmentBasePath = settings.attachmentPath;
  const attachKind =
    manifest.entityType === 'inboxItem'
      ? 'inbox'
      : (manifest.entityType as 'project' | 'prompt' | 'inbox');

  const srcAttachDir = path.join(itemDir, 'attachments', attachKind, manifest.entityId);
  if (attachmentBasePath && (await pathExists(srcAttachDir))) {
    const destAttachDir = path.join(attachmentBasePath, attachKind, manifest.entityId);
    if (await pathExists(destAttachDir)) {
      if (request.strategy !== 'overwrite') {
        return {
          conflict: {
            code: 'RESTORE_CONFLICT',
            message: 'Attachment restore target already exists',
            conflicts: [{ kind: 'attachmentPath', path: toPosixRelative(destAttachDir) }],
          },
        };
      }
      await fs.rm(destAttachDir, { recursive: true, force: true });
    }
    await movePath(srcAttachDir, destAttachDir);
  }

  // Purge trash item folder after restore
  await fs.rm(itemDir, { recursive: true, force: true });

  return {
    result: {
      restored: true,
      entityType: manifest.entityType,
      entityId: manifest.entityId,
      restoredRelativePath: targetRel,
    },
  };
}
