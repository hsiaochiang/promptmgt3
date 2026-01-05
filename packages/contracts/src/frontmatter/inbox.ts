import { z } from 'zod';

/**
 * Suggested target for inbox item archival
 * This is a reference type - archival itself is handled by external tools
 */
export const SuggestedTargetSchema = z.object({
  projectId: z.string().uuid().optional(),
  promptId: z.string().uuid().optional(),
  pathHint: z.string().optional(),
}).optional();

export type SuggestedTarget = z.infer<typeof SuggestedTargetSchema>;

/**
 * InboxItem frontmatter schema
 * File: inbox/<inboxId>.md
 */
export const InboxItemFrontmatterSchema = z.object({
  // Required fields
  id: z.string().uuid().describe('Unique identifier'),
  title: z.string().min(1),
  importedAt: z.string().datetime(),
  
  // Optional fields with defaults
  cleanedState: z.enum(['unprocessed', 'cleaned', 'archived']).default('unprocessed'),
  suggestedTags: z.array(z.string()).default([]),
  notes: z.string().default(''),
  
  // Optional fields
  sourcePlatform: z.string().optional(),
  sourceLink: z.string().optional(),
  suggestedTarget: SuggestedTargetSchema,
});

export type InboxItemFrontmatter = z.infer<typeof InboxItemFrontmatterSchema>;

/**
 * InboxItem entity (frontmatter + content)
 */
export interface InboxItemEntity extends InboxItemFrontmatter {
  rawContent: string;
  cleanedContent?: string;
}
