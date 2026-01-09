import chokidar from 'chokidar';
import path from 'path';
import { getProjectsDir, getInboxDir, isSystemPath, isCachePath } from '../fs-layout/index.js';
import type { FileChangedPayload } from '@pah/contracts';

export type FileChangedHandler = (payload: FileChangedPayload) => void;

/**
 * Start a chokidar watcher on the workspace root and emit contract-shaped
 * file.changed events via the provided handler.
 */
export function startFileWatcher(rootPath: string, onFileChanged: FileChangedHandler): void {
  const watcher = chokidar.watch(rootPath, {
    ignoreInitial: true,
    persistent: true,
    depth: undefined,
    ignored: [
      /(^|[\/\\])\../, // Ignore dotfiles (like .git, .pah, .DS_Store)
      /node_modules/,
      '**/dist/**',
      '**/coverage/**'
    ]
  });

  const projectsDir = getProjectsDir(rootPath);
  const inboxDir = getInboxDir(rootPath);

  const toRelativePath = (fullPath: string): string => {
    return path.relative(rootPath, fullPath).replace(/\\/g, '/');
  };

  const inferEntityType = (fullPath: string): FileChangedPayload['data']['entityType'] => {
    const rel = toRelativePath(fullPath);
    if (rel.startsWith(path.relative(rootPath, projectsDir).replace(/\\/g, '/'))) {
      if (rel.includes('/prompts/')) return 'prompt';
      return 'project';
    }
    if (rel.startsWith(path.relative(rootPath, inboxDir).replace(/\\/g, '/'))) {
      return 'inbox';
    }
    return 'workspace';
  };

  const emit = (fullPath: string, changeType: FileChangedPayload['data']['changeType']) => {
    if (isSystemPath(rootPath, fullPath) || isCachePath(rootPath, fullPath)) {
      return;
    }

    const relPath = toRelativePath(fullPath);

    const payload: FileChangedPayload = {
      event: 'file.changed',
      data: {
        path: relPath,
        entityType: inferEntityType(fullPath),
        changeType,
        timestamp: new Date().toISOString(),
      },
    };

    onFileChanged(payload);
  };

  watcher
    .on('add', (filePath) => emit(filePath, 'add'))
    .on('change', (filePath) => emit(filePath, 'modify'))
    .on('unlink', (filePath) => emit(filePath, 'delete'));
}
