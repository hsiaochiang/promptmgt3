import { z } from 'zod';

/**
 * Search request with filters, sorting, and view scope
 */
export const SearchRequestSchema = z.object({
  query: z.string().default(''),
  filters: z.object({
    tags: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional(),
    archived: z.boolean().optional(),
    entityType: z.array(z.enum(['project', 'prompt', 'inbox'])).optional(),
  }).optional(),
  sort: z.object({
    field: z.enum(['updatedAt', 'createdAt', 'title', 'relevance']).default('relevance'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }).optional(),
  viewScope: z.enum(['all', 'active', 'archived']).default('active'),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(100).default(20),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

/**
 * Search result item
 */
export const SearchResultItemSchema = z.object({
  type: z.enum(['project', 'prompt', 'inbox']),
  id: z.string().uuid(),
  title: z.string(),
  snippet: z.string().optional(),
  tags: z.array(z.string()),
  path: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
  updatedAt: z.string().datetime(),
  relevance: z.number().optional(),
});

export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

/**
 * Search response
 */
export const SearchResponseSchema = z.object({
  items: z.array(SearchResultItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  hasMore: z.boolean(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
