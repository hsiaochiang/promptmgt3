import { z } from 'zod';

/**
 * Snippet entity - reusable text snippets/templates
 */
export const SnippetSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SnippetEntity = z.infer<typeof SnippetSchema>;

/**
 * Snippet creation input
 */
export const SnippetInputSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()).optional(),
});

export type SnippetInput = z.infer<typeof SnippetInputSchema>;

/**
 * Snippet list response
 */
export const SnippetListSchema = z.object({
  items: z.array(SnippetSchema),
  total: z.number().int().nonnegative(),
});

export type SnippetList = z.infer<typeof SnippetListSchema>;
