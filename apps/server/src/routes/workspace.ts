import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { getWorkspaceConfigPath, getPahDir } from '../fs-layout/index.js';

export interface WorkspaceSettings {
  rootPath: string;
  attachmentPath: string;
  tagsDict?: Record<string, string[]>;
  commonOptions?: Record<string, any>;
  backup?: {
    dailySnapshot: boolean;
    schedule?: string;
    remote?: string;
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
    return JSON.parse(content);
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      rootPath,
      attachmentPath: path.join(rootPath, 'attachments'),
      backup: {
        dailySnapshot: false,
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
}> {
  try {
    // Check if path exists and is accessible
    await fs.access(dirPath, fs.constants.R_OK | fs.constants.W_OK);
    return { readable: true, writable: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Path doesn't exist - try to create it
      try {
        await fs.mkdir(dirPath, { recursive: true });
        return { readable: true, writable: true };
      } catch (createError) {
        return {
          readable: false,
          writable: false,
          error: `Cannot create directory: ${createError instanceof Error ? createError.message : String(createError)}`,
        };
      }
    }

    return {
      readable: false,
      writable: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Register workspace routes
 */
export async function registerWorkspaceRoutes(server: FastifyInstance, rootPath: string) {
  // GET /api/workspace/settings
  server.get('/api/workspace/settings', async (request: FastifyRequest, reply: FastifyReply) => {
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
    Body: Partial<WorkspaceSettings>;
  }>('/api/workspace/settings', async (request, reply) => {
    try {
      const currentSettings = await loadWorkspaceSettings(rootPath);
      const updatedSettings = {
        ...currentSettings,
        ...request.body,
      };

      // Validate paths if they're being updated
      if (request.body.rootPath) {
        const pathCheck = await checkPathPermissions(request.body.rootPath);
        if (!pathCheck.writable) {
          return reply.code(403).send({
            error: 'Root path is not writable',
            message: pathCheck.error || 'Permission denied',
          });
        }
        updatedSettings.rootPath = request.body.rootPath;
      }

      if (request.body.attachmentPath) {
        const pathCheck = await checkPathPermissions(request.body.attachmentPath);
        if (!pathCheck.writable) {
          return reply.code(403).send({
            error: 'Attachment path is not writable',
            message: pathCheck.error || 'Permission denied',
          });
        }
        updatedSettings.attachmentPath = request.body.attachmentPath;
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
    return result;
  });
}
