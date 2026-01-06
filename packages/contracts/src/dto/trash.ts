import { z } from 'zod';

export const TrashEntityTypeSchema = z.enum([
  'project',
  'prompt',
  'inboxItem',
  'snippet',
  'unknown',
]);

export type TrashEntityType = z.infer<typeof TrashEntityTypeSchema>;

export const TrashItemSchema = z.object({
  trashId: z.string(),
  entityType: TrashEntityTypeSchema,
  entityId: z.string(),
  titleSnapshot: z.string(),
  deletedAt: z.string().datetime(),
  purgeAfter: z.string().datetime(),
  originalRelativePath: z.string(),
  attachmentsMoved: z.boolean(),
});

export type TrashItem = z.infer<typeof TrashItemSchema>;

export const TrashListResponseSchema = z.object({
  items: z.array(TrashItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  hasMore: z.boolean(),
});

export type TrashListResponse = z.infer<typeof TrashListResponseSchema>;

export const TrashRestoreRequestSchema = z.object({
  strategy: z.enum(['overwrite', 'rename']),
  newSlug: z.string().optional(),
});

export type TrashRestoreRequest = z.infer<typeof TrashRestoreRequestSchema>;

export const TrashRestoreResultSchema = z.object({
  restored: z.boolean(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  restoredRelativePath: z.string().optional(),
});

export type TrashRestoreResult = z.infer<typeof TrashRestoreResultSchema>;

export const RestoreConflictSchema = z.object({
  code: z.string(),
  message: z.string(),
  conflicts: z
    .array(
      z.object({
        kind: z.enum(['entityPath', 'attachmentPath']),
        path: z.string(),
      }),
    )
    .default([]),
});

export type RestoreConflict = z.infer<typeof RestoreConflictSchema>;
