import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import {
  ProjectFrontmatterSchema,
  PromptFrontmatterSchema,
  InboxItemFrontmatterSchema,
  type ProjectEntity,
  type PromptEntity,
  type InboxItemEntity,
} from '@pah/contracts';
import {
  getProjectsDir,
  getProjectFilePath,
  getProjectPromptsDir,
  getPromptFilePath,
  getInboxDir,
  getInboxItemFilePath,
  isSystemPath,
  isCachePath,
} from '../fs-layout/index.js';

export interface ScanResult {
  projects: ProjectEntity[];
  prompts: PromptEntity[];
  inbox: InboxItemEntity[];
  errors: ScanError[];
}

export interface ScanError {
  path: string;
  error: string;
  timestamp: string;
}

/**
 * Scan the entire workspace and rebuild data structures
 * This implements INV-002: File scanning must be able to rebuild UI data
 */
export async function scanWorkspace(rootPath: string): Promise<ScanResult> {
  const result: ScanResult = {
    projects: [],
    prompts: [],
    inbox: [],
    errors: [],
  };

  try {
    // Scan projects
    await scanProjects(rootPath, result);
    
    // Scan inbox
    await scanInbox(rootPath, result);
  } catch (error) {
    result.errors.push({
      path: rootPath,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return result;
}

/**
 * Scan all projects and their prompts
 */
async function scanProjects(rootPath: string, result: ScanResult): Promise<void> {
  const projectsDir = getProjectsDir(rootPath);

  try {
    await fs.access(projectsDir);
  } catch {
    // Projects directory doesn't exist yet
    return;
  }

  const entries = await fs.readdir(projectsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const projectSlug = entry.name;
    const projectFilePath = getProjectFilePath(rootPath, projectSlug);

    try {
      // Parse project
      const project = await parseProjectFile(projectFilePath);
      if (project) {
        result.projects.push(project);

        // Scan prompts for this project
        await scanProjectPrompts(rootPath, projectSlug, result);
      }
    } catch (error) {
      result.errors.push({
        path: projectFilePath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

/**
 * Scan prompts for a specific project
 */
async function scanProjectPrompts(
  rootPath: string,
  projectSlug: string,
  result: ScanResult
): Promise<void> {
  const promptsDir = getProjectPromptsDir(rootPath, projectSlug);

  try {
    await fs.access(promptsDir);
  } catch {
    // Prompts directory doesn't exist yet
    return;
  }

  const entries = await fs.readdir(promptsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const promptSlug = entry.name.replace(/\.md$/, '');
    const promptFilePath = getPromptFilePath(rootPath, projectSlug, promptSlug);

    try {
      const prompt = await parsePromptFile(promptFilePath);
      if (prompt) {
        result.prompts.push(prompt);
      }
    } catch (error) {
      result.errors.push({
        path: promptFilePath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

/**
 * Scan inbox items
 */
async function scanInbox(rootPath: string, result: ScanResult): Promise<void> {
  const inboxDir = getInboxDir(rootPath);

  try {
    await fs.access(inboxDir);
  } catch {
    // Inbox directory doesn't exist yet
    return;
  }

  const entries = await fs.readdir(inboxDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const inboxId = entry.name.replace(/\.md$/, '');
    const inboxFilePath = getInboxItemFilePath(rootPath, inboxId);

    try {
      const inboxItem = await parseInboxItemFile(inboxFilePath);
      if (inboxItem) {
        result.inbox.push(inboxItem);
      }
    } catch (error) {
      result.errors.push({
        path: inboxFilePath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

/**
 * Parse a project file (frontmatter + markdown body)
 */
export async function parseProjectFile(filePath: string): Promise<ProjectEntity | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Validate frontmatter against schema
    const validatedData = ProjectFrontmatterSchema.parse(data);

    return {
      ...validatedData,
      body: content.trim(),
    };
  } catch (error) {
    throw new Error(`Failed to parse project file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse a prompt file (frontmatter + markdown body)
 */
export async function parsePromptFile(filePath: string): Promise<PromptEntity | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Validate frontmatter against schema
    const validatedData = PromptFrontmatterSchema.parse(data);

    return {
      ...validatedData,
      body: content.trim(),
    };
  } catch (error) {
    throw new Error(`Failed to parse prompt file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse an inbox item file (frontmatter + content)
 */
export async function parseInboxItemFile(filePath: string): Promise<InboxItemEntity | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Validate frontmatter against schema
    const validatedData = InboxItemFrontmatterSchema.parse(data);

    return {
      ...validatedData,
      rawContent: content.trim(),
    };
  } catch (error) {
    throw new Error(`Failed to parse inbox item file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Write a project file (frontmatter + markdown body)
 */
export async function writeProjectFile(
  filePath: string,
  project: ProjectEntity
): Promise<void> {
  const { body, attachments, ...frontmatter } = project;
  
  const fileContent = matter.stringify(body, frontmatter);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  await fs.writeFile(filePath, fileContent, 'utf-8');
}

/**
 * Write a prompt file (frontmatter + markdown body)
 */
export async function writePromptFile(
  filePath: string,
  prompt: PromptEntity
): Promise<void> {
  const { body, attachments, ...frontmatter } = prompt;
  
  const fileContent = matter.stringify(body, frontmatter);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  await fs.writeFile(filePath, fileContent, 'utf-8');
}

/**
 * Write an inbox item file (frontmatter + content)
 */
export async function writeInboxItemFile(
  filePath: string,
  inboxItem: InboxItemEntity
): Promise<void> {
  const { rawContent, cleanedContent, ...frontmatter } = inboxItem;
  
  const fileContent = matter.stringify(rawContent, frontmatter);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  await fs.writeFile(filePath, fileContent, 'utf-8');
}
