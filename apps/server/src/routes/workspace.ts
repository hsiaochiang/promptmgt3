import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { getWorkspaceConfigPath, getPahDir } from '../fs-layout/index.js';
import {
  WorkspaceSettingsUpdateSchema,
  type WorkspaceSettingsUpdate,
} from '@pah/contracts';

export interface WorkspaceSettings {
  rootPath: string;
  attachmentPath: string;
  tagsDict?: Record<string, string[]>;
  commonOptions?: Record<string, string[]>;
  backup?: {
    dailySnapshot: boolean;
    schedule?: string;
    remote?: string;
  };
  trashRetentionDays?: number;
  uiPreferences?: {
    activeSection?: string;
    projectSubView?: 'list' | 'board' | 'archive';
    promptSubView?: 'list' | 'board' | 'archive';
    sidebarOpen?: boolean;
  };
  updatedAt: string;
}

/**
 * Load workspace settings from workspace.json
 */
export async function loadWorkspaceSettings(rootPath: string): Promise<WorkspaceSettings> {
  const configPath = getWorkspaceConfigPath(rootPath);

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content) as WorkspaceSettings;
    return {
      ...parsed,
      trashRetentionDays: parsed.trashRetentionDays ?? 30,
    };
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      rootPath,
      attachmentPath: path.join(rootPath, 'attachments'),
      backup: {
        dailySnapshot: false,
      },
      trashRetentionDays: 30,
      uiPreferences: {
        activeSection: 'projects',
        projectSubView: 'list',
        promptSubView: 'list',
        sidebarOpen: true,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Save workspace settings to workspace.json
 */
export async function saveWorkspaceSettings(
  rootPath: string,
  settings: WorkspaceSettings
): Promise<void> {
  const configPath = getWorkspaceConfigPath(rootPath);
  const pahDir = getPahDir(rootPath);

  // Ensure .pah directory exists
  await fs.mkdir(pahDir, { recursive: true });

  // Update timestamp
  settings.updatedAt = new Date().toISOString();

  // Write atomically
  const tempPath = `${configPath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(settings, null, 2), 'utf-8');
  await fs.rename(tempPath, configPath);
}

/**
 * Check if a path is readable and writable
 */
export async function checkPathPermissions(dirPath: string): Promise<{
  readable: boolean;
  writable: boolean;
  error?: string;
  errorCode?: string;
}> {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      return {
        readable: false,
        writable: false,
        error: 'Path is not a directory',
        errorCode: 'ENOTDIR',
      };
    }

    await fs.access(dirPath, fs.constants.R_OK | fs.constants.W_OK);
    return { readable: true, writable: true };
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;

    if (errorCode === 'ENOENT') {
      return {
        readable: false,
        writable: false,
        error: 'Path does not exist',
        errorCode,
      };
    }

    return {
      readable: false,
      writable: false,
      error: error instanceof Error ? error.message : String(error),
      errorCode,
    };
  }
}

/**
 * Register workspace routes
 */
export async function registerWorkspaceRoutes(server: FastifyInstance, rootPath: string) {
  // GET /api/workspace/settings
  server.get('/api/workspace/settings', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const settings = await loadWorkspaceSettings(rootPath);
      return settings;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to load workspace settings',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /api/workspace/settings
  server.post<{
    Body: unknown;
  }>('/api/workspace/settings', async (request, reply) => {
    const result = WorkspaceSettingsUpdateSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: 'Invalid workspace settings',
        message: result.error.message,
      });
    }

    const update = result.data as WorkspaceSettingsUpdate;

    try {
      const currentSettings = await loadWorkspaceSettings(rootPath);

      const updatedSettings: WorkspaceSettings = {
        ...currentSettings,
        ...update,
      };

      if (update.backup) {
        updatedSettings.backup = {
          ...(currentSettings.backup ?? { dailySnapshot: false }),
          ...update.backup,
        };
      }

      if (update.uiPreferences) {
        updatedSettings.uiPreferences = {
          ...(currentSettings.uiPreferences ?? {}),
          ...update.uiPreferences,
        };
      }

      // Validate paths if they're being updated
      if (update.rootPath) {
        const pathCheck = await checkPathPermissions(update.rootPath);
        if (!pathCheck.writable) {
          const statusCode = pathCheck.errorCode === 'ENOENT' || pathCheck.errorCode === 'ENOTDIR' ? 400 : 403;
          return reply.code(statusCode).send({
            error:
              statusCode === 400 ? 'Root path does not exist' : 'Root path is not writable',
            message: pathCheck.error || 'Permission denied',
          });
        }
        updatedSettings.rootPath = update.rootPath;
      }

      if (update.attachmentPath) {
        const pathCheck = await checkPathPermissions(update.attachmentPath);
        if (!pathCheck.writable) {
          const statusCode = pathCheck.errorCode === 'ENOENT' || pathCheck.errorCode === 'ENOTDIR' ? 400 : 403;
          return reply.code(statusCode).send({
            error:
              statusCode === 400
                ? 'Attachment path does not exist'
                : 'Attachment path is not writable',
            message: pathCheck.error || 'Permission denied',
          });
        }
        updatedSettings.attachmentPath = update.attachmentPath;
      }

      await saveWorkspaceSettings(rootPath, updatedSettings);

      return updatedSettings;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to save workspace settings',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/workspace/permissions - Check path permissions
  server.get<{
    Querystring: { path: string };
  }>('/api/workspace/permissions', async (request, reply) => {
    const { path: targetPath } = request.query;

    if (!targetPath) {
      return reply.code(400).send({ error: 'Path parameter is required' });
    }

    const result = await checkPathPermissions(targetPath);
    const { errorCode: _errorCode, ...payload } = result;
    return payload;
  });
}
