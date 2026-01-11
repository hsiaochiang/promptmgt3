import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import {
  type ProjectEntity,
  type PromptEntity,
  ProjectFrontmatterSchema,
  PromptFrontmatterSchema,
  type GetProjectsQuery,
  type GetPromptsQuery,
} from '@pah/contracts';
import {
  getProjectFilePath,
  getPromptFilePath,
} from '../fs-layout/index.js';
import {
  writeProjectFile,
  writePromptFile,
  scanWorkspace,
} from '../indexing/index.js';
import { moveEntityToTrash } from '../trash/trashStore.js';
import { normalizeSlug } from '../utils/slug.js';

/**
 * Register project routes
 */
export async function registerProjectRoutes(server: FastifyInstance, rootPath: string) {
  // GET /api/projects - List all projects
  server.get<{
    Querystring: GetProjectsQuery;
  }>('/api/projects', async (request, reply) => {
    try {
      const { archived } = request.query;
      const scanResult = await scanWorkspace(rootPath);

      let projects = scanResult.projects;

      // Default: exclude archived. If archived=true, include only archived.
      if (archived === 'true') {
        projects = projects.filter(p => p.archived);
      } else {
        projects = projects.filter(p => !p.archived);
      }

      return projects;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list projects',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/projects/:id - Get a specific project
  server.get<{
    Params: { id: string };
  }>('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const scanResult = await scanWorkspace(rootPath);
      const project = scanResult.projects.find((p) => p.id === id);

      if (!project) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      return project;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to get project',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /api/projects - Create a new project
  server.post<{
    Body: Partial<ProjectEntity>;
  }>('/api/projects', async (request, reply) => {
    try {
      const { title, summary, status, tags, type } = request.body;

      if (!title) {
        return reply.code(400).send({ error: 'Title is required' });
      }

      // Generate ID and slug
      const id = uuidv4();
      const slug = normalizeSlug(title);
      const now = new Date().toISOString();

      // Create project entity
      const project: ProjectEntity = {
        id,
        slug,
        title,
        summary: summary || '',
        status: status || 'planned',
        type: type || '',
        tags: tags || [],
        archived: false,
        createdAt: now,
        updatedAt: now,
        body: request.body.body || '',
      };

      // Validate against schema
      ProjectFrontmatterSchema.parse(project);

      // Write to file
      const filePath = getProjectFilePath(rootPath, slug);

      // Check if project already exists
      try {
        await fs.access(filePath);
        return reply.code(409).send({ error: 'Project with this slug already exists' });
      } catch {
        // File doesn't exist, we can create it
      }

      await writeProjectFile(filePath, project);

      return reply.code(201).send(project);
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // PUT /api/projects/:id - Update a project
  server.put<{
    Params: { id: string };
    Body: Partial<ProjectEntity>;
  }>('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // Find existing project
      const scanResult = await scanWorkspace(rootPath);
      const existing = scanResult.projects.find((p) => p.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      // Update fields
      const updated: ProjectEntity = {
        ...existing,
        ...request.body,
        id, // ID cannot be changed
        updatedAt: new Date().toISOString(),
      };

      // Validate against schema
      ProjectFrontmatterSchema.parse(updated);

      // Handle slug rename
      let filePath = getProjectFilePath(rootPath, existing.slug);

      if (request.body.slug && request.body.slug !== existing.slug) {
        // Rename directory if slug changed
        const oldDir = path.dirname(getProjectFilePath(rootPath, existing.slug));
        const newDir = path.dirname(getProjectFilePath(rootPath, request.body.slug));

        await fs.rename(oldDir, newDir);
        filePath = getProjectFilePath(rootPath, request.body.slug);
      }

      await writeProjectFile(filePath, updated);

      return updated;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to update project',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // DELETE /api/projects/:id - Delete a project (archive)
  server.delete<{
    Params: { id: string };
  }>('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // Find existing project
      const scanResult = await scanWorkspace(rootPath);
      const existing = scanResult.projects.find((p) => p.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      // Soft delete -> move to trash
      const projectDir = path.dirname(getProjectFilePath(rootPath, existing.slug));
      const originalRelativePath = `projects/${existing.slug}`;

      const item = await moveEntityToTrash({
        rootPath,
        entityType: 'project',
        entityId: existing.id,
        titleSnapshot: existing.title,
        originalAbsPath: projectDir,
        originalRelativePath,
        attachmentsEntityType: 'project',
      });

      return item;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to delete project',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

/**
 * Register prompt routes
 */
export async function registerPromptRoutes(server: FastifyInstance, rootPath: string) {
  // GET /api/prompts - List all prompts
  server.get<{
    Querystring: GetPromptsQuery;
  }>('/api/prompts', async (request, reply) => {
    try {
      const { archived } = request.query;
      const scanResult = await scanWorkspace(rootPath);

      let prompts = scanResult.prompts;

      // Default: exclude archived. If archived=true, include only archived.
      if (archived === 'true') {
        prompts = prompts.filter(p => p.archived);
      } else {
        prompts = prompts.filter(p => !p.archived);
      }

      const { project, status, priority } = request.query;

      if (project) {
        prompts = prompts.filter(p => p.projectId === project);
      }
      if (status) {
        prompts = prompts.filter(p => p.status === status);
      }
      if (priority) {
        prompts = prompts.filter(p => p.priority === priority);
      }

      return prompts;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to list prompts',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // GET /api/prompts/:id - Get a specific prompt
  server.get<{
    Params: { id: string };
  }>('/api/prompts/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const scanResult = await scanWorkspace(rootPath);
      const prompt = scanResult.prompts.find((p) => p.id === id);

      if (!prompt) {
        return reply.code(404).send({ error: 'Prompt not found' });
      }

      return prompt;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to get prompt',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /api/prompts - Create a new prompt
  console.log('>>> WOS DEBUG: Registering POST /api/prompts route');
  server.post<{
    Body: Partial<PromptEntity>;
  }>('/api/prompts', async (request, reply) => {
    try {
      const { title, projectId, body, status, priority, tags, notes } = request.body;

      if (!title || !projectId) {
        return reply.code(400).send({ error: 'Title and projectId are required' });
      }

      // Find project to get slug
      const scanResult = await scanWorkspace(rootPath);
      const project = scanResult.projects.find((p) => p.id === projectId);

      if (!project) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      // Generate ID and slug
      const id = uuidv4();
      const slug = normalizeSlug(title);
      const now = new Date().toISOString();

      // Create prompt entity
      const prompt: PromptEntity = {
        id,
        slug,
        projectId,
        title,
        status: status || 'draft',
        priority: priority || 'medium',
        tags: tags || [],
        notes: notes || '',
        archived: false,
        createdAt: now,
        updatedAt: now,
        body: body || '',
      };

      // Validate against schema
      PromptFrontmatterSchema.parse(prompt);

      // Write to file
      const filePath = getPromptFilePath(rootPath, project.slug, slug);

      // Check if prompt already exists
      try {
        await fs.access(filePath);
        return reply.code(409).send({ error: 'Prompt with this slug already exists' });
      } catch {
        // File doesn't exist, we can create it
      }

      await writePromptFile(filePath, prompt);

      return reply.code(201).send(prompt);
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to create prompt',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // PUT /api/prompts/:id - Update a prompt
  server.put<{
    Params: { id: string };
    Body: Partial<PromptEntity>;
  }>('/api/prompts/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // Find existing prompt
      const scanResult = await scanWorkspace(rootPath);
      const existing = scanResult.prompts.find((p) => p.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Prompt not found' });
      }

      // Find project
      const project = scanResult.projects.find((p) => p.id === existing.projectId);
      if (!project) {
        return reply.code(404).send({ error: 'Parent project not found' });
      }

      // Update fields
      const updated: PromptEntity = {
        ...existing,
        ...request.body,
        id, // ID cannot be changed
        projectId: existing.projectId, // ProjectId cannot be changed
        updatedAt: new Date().toISOString(),
      };

      // Validate against schema
      PromptFrontmatterSchema.parse(updated);

      // Handle slug rename
      let filePath = getPromptFilePath(rootPath, project.slug, existing.slug);

      if (request.body.slug && request.body.slug !== existing.slug) {
        // Rename file if slug changed
        const oldPath = getPromptFilePath(rootPath, project.slug, existing.slug);
        const newPath = getPromptFilePath(rootPath, project.slug, request.body.slug);

        await fs.rename(oldPath, newPath);
        filePath = newPath;
      }

      await writePromptFile(filePath, updated);

      return updated;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to update prompt',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // DELETE /api/prompts/:id - Delete a prompt (archive)
  server.delete<{
    Params: { id: string };
  }>('/api/prompts/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // Find existing prompt
      const scanResult = await scanWorkspace(rootPath);
      const existing = scanResult.prompts.find((p) => p.id === id);

      if (!existing) {
        return reply.code(404).send({ error: 'Prompt not found' });
      }

      // Find project
      const project = scanResult.projects.find((p) => p.id === existing.projectId);
      if (!project) {
        return reply.code(404).send({ error: 'Parent project not found' });
      }

      // Soft delete -> move to trash
      const filePath = getPromptFilePath(rootPath, project.slug, existing.slug);
      const originalRelativePath = `projects/${project.slug}/prompts/${existing.slug}.md`;

      const item = await moveEntityToTrash({
        rootPath,
        entityType: 'prompt',
        entityId: existing.id,
        titleSnapshot: existing.title,
        originalAbsPath: filePath,
        originalRelativePath,
        attachmentsEntityType: 'prompt',
      });

      return item;
    } catch (error) {
      reply.code(500).send({
        error: 'Failed to delete prompt',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
