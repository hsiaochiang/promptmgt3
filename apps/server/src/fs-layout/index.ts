import path from 'path';

/**
 * File system layout constants and helpers
 * Centralizes all path management to avoid scattered strings
 */

export interface WorkspaceConfig {
  rootPath: string;
  attachmentPath: string;
}

/**
 * Get the .pah directory path (system data directory)
 */
export function getPahDir(rootPath: string): string {
  return path.join(rootPath, '.pah');
}

/**
 * Get workspace.json config file path
 */
export function getWorkspaceConfigPath(rootPath: string): string {
  return path.join(getPahDir(rootPath), 'workspace.json');
}

/**
 * Get events directory path (append-only NDJSON logs)
 */
export function getEventsDir(rootPath: string): string {
  return path.join(getPahDir(rootPath), 'events');
}

/**
 * Get monthly event file path
 */
export function getMonthlyEventFilePath(rootPath: string, yearMonth: string): string {
  return path.join(getEventsDir(rootPath), `${yearMonth}.ndjson`);
}

/**
 * Get cache directory path (non-authoritative, can be deleted)
 */
export function getCacheDir(rootPath: string): string {
  return path.join(getPahDir(rootPath), 'cache');
}

/**
 * Get trash directory path
 */
export function getTrashDir(rootPath: string): string {
  return path.join(getPahDir(rootPath), 'trash');
}

/**
 * Get trash items directory path
 */
export function getTrashItemsDir(rootPath: string): string {
  return path.join(getTrashDir(rootPath), 'items');
}

/**
 * Get a specific trash item directory path
 */
export function getTrashItemDir(rootPath: string, trashId: string): string {
  return path.join(getTrashItemsDir(rootPath), trashId);
}

export function getTrashItemManifestPath(rootPath: string, trashId: string): string {
  return path.join(getTrashItemDir(rootPath, trashId), 'manifest.json');
}

/**
 * Get search index cache file path
 */
export function getSearchIndexCachePath(rootPath: string): string {
  return path.join(getCacheDir(rootPath), 'search-index.json');
}

/**
 * Get versions directory path
 */
export function getVersionsDir(rootPath: string): string {
  return path.join(getPahDir(rootPath), 'versions');
}

/**
 * Get version node path for a specific entity
 * Format: .pah/versions/<entityType>/<entityId>/<YYYYMMDD-HHmmss>-<eventType>-<shortId>/
 */
export function getVersionNodePath(
  rootPath: string,
  entityType: string,
  entityId: string,
  timestamp: string,
  eventType: string,
  shortId: string
): string {
  return path.join(
    getVersionsDir(rootPath),
    entityType,
    entityId,
    `${timestamp}-${eventType}-${shortId}`
  );
}

/**
 * Get daily snapshots directory path
 */
export function getSnapshotsDir(rootPath: string): string {
  return path.join(getPahDir(rootPath), 'snapshots', 'daily');
}

/**
 * Get daily snapshot path
 * Format: .pah/snapshots/daily/<YYYY-MM-DD>/
 */
export function getDailySnapshotPath(rootPath: string, date: string): string {
  return path.join(getSnapshotsDir(rootPath), date);
}

/**
 * Get projects directory path
 */
export function getProjectsDir(rootPath: string): string {
  return path.join(rootPath, 'projects');
}

/**
 * Get project directory path
 */
export function getProjectDir(rootPath: string, projectSlug: string): string {
  return path.join(getProjectsDir(rootPath), projectSlug);
}

/**
 * Get project.md file path
 */
export function getProjectFilePath(rootPath: string, projectSlug: string): string {
  return path.join(getProjectDir(rootPath, projectSlug), 'project.md');
}

/**
 * Get prompts directory for a project
 */
export function getProjectPromptsDir(rootPath: string, projectSlug: string): string {
  return path.join(getProjectDir(rootPath, projectSlug), 'prompts');
}

/**
 * Get prompt file path
 */
export function getPromptFilePath(
  rootPath: string,
  projectSlug: string,
  promptSlug: string
): string {
  return path.join(getProjectPromptsDir(rootPath, projectSlug), `${promptSlug}.md`);
}

/**
 * Get inbox directory path
 */
export function getInboxDir(rootPath: string): string {
  return path.join(rootPath, 'inbox');
}

/**
 * Get inbox item file path
 */
export function getInboxItemFilePath(rootPath: string, inboxId: string): string {
  return path.join(getInboxDir(rootPath), `${inboxId}.md`);
}

/**
 * Get snippets directory path
 */
export function getSnippetsDir(rootPath: string): string {
  return path.join(rootPath, 'snippets');
}

/**
 * Get snippet file path
 */
export function getSnippetFilePath(
  rootPath: string,
  category: string,
  snippetId: string
): string {
  return path.join(getSnippetsDir(rootPath), category, `${snippetId}.md`);
}

/**
 * Get attachment path for an entity
 * Format: <attachmentPath>/<entityType>/<entityId>/<filename>
 */
export function getAttachmentPath(
  attachmentBasePath: string,
  entityType: string,
  entityId: string,
  filename: string
): string {
  return path.join(attachmentBasePath, entityType, entityId, filename);
}

/**
 * Check if a path is within the .pah directory
 */
export function isSystemPath(rootPath: string, filePath: string): boolean {
  const pahDir = getPahDir(rootPath);
  return filePath.startsWith(pahDir);
}

/**
 * Check if a path is a cache file (non-authoritative)
 */
export function isCachePath(rootPath: string, filePath: string): boolean {
  const cacheDir = getCacheDir(rootPath);
  return filePath.startsWith(cacheDir);
}
