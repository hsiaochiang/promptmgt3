import { z } from 'zod';

/**
 * Project frontmatter schema
 * File: projects/<projectSlug>/project.md
 */
export const ProjectFrontmatterSchema = z.object({
  // Required fields
  id: z.string().uuid().describe('Unique identifier, immutable after creation'),
  slug: z.string().min(1).describe('Path-friendly string, can be renamed'),
  title: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Optional fields with defaults
  summary: z.string().default(''),
  status: z.enum(['planned', 'in_progress', 'paused', 'done']).default('planned'),
  type: z.string().default(''),
  tags: z.array(z.string()).default([]),
  archived: z.boolean().default(false),
  category: z.string().default(''),

  // Optional fields
  description: z.string().optional(),
  relatedFiles: z.array(z.string()).optional(),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

/**
 * Project body (markdown content after frontmatter)
 */
export interface ProjectEntity extends ProjectFrontmatter {
  body: string;
  attachments?: AttachmentRef[];
}

export interface AttachmentRef {
  id: string;
  filename: string;
  storagePath: string;
  mimeType?: string;
}
