import { z } from 'zod';
import type { AttachmentRef } from './project';

/**
 * Prompt frontmatter schema
 * File: projects/<projectSlug>/prompts/<promptSlug>.md
 */
export const PromptFrontmatterSchema = z.object({
  // Required fields
  id: z.string().uuid().describe('Unique identifier, immutable after creation'),
  slug: z.string().min(1).describe('Path-friendly string, can be renamed'),
  projectId: z.string().uuid().describe('Reference to Project.id'),
  title: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  
  // Optional fields with defaults
  status: z.enum(['draft', 'tuning', 'ready', 'disabled']).default('draft'),
  priority: z.enum(['P0', 'P1', 'P2']).default('P1'),
  tags: z.array(z.string()).default([]),
  archived: z.boolean().default(false),
  notes: z.string().default(''),
  
  // Optional fields
  sourceLink: z.string().optional(),
});

export type PromptFrontmatter = z.infer<typeof PromptFrontmatterSchema>;

/**
 * Prompt entity (frontmatter + body)
 */
export interface PromptEntity extends PromptFrontmatter {
  body: string;
  attachments?: AttachmentRef[];
}
