import { z } from 'zod';

/**
 * File change event payload
 * Triggered when a file is added, modified, deleted, or moved
 */
export const FileChangedPayloadSchema = z.object({
  event: z.literal('file.changed'),
  data: z.object({
    path: z.string(),
    entityType: z.enum(['project', 'prompt', 'inbox', 'workspace']).optional(),
    entityId: z.string().uuid().optional(),
    changeType: z.enum(['add', 'modify', 'delete', 'move']),
    timestamp: z.string().datetime(),
    oldPath: z.string().optional(), // For move operations
  }),
});

export type FileChangedPayload = z.infer<typeof FileChangedPayloadSchema>;

/**
 * Entity updated event payload
 * Higher-level semantic event after file parsing
 */
export const EntityUpdatedPayloadSchema = z.object({
  event: z.literal('entity.updated'),
  data: z.object({
    entityType: z.enum(['project', 'prompt', 'inbox']),
    id: z.string().uuid(),
    updatedAt: z.string().datetime(),
  }),
});

export type EntityUpdatedPayload = z.infer<typeof EntityUpdatedPayloadSchema>;
