import { z } from 'zod';

/**
 * Sync status event payload
 * Tracks saving/conflict/error states for entities
 */
export const SyncStatusPayloadSchema = z.object({
  event: z.literal('sync.status'),
  data: z.object({
    status: z.enum(['idle', 'saving', 'conflict', 'error']),
    entityType: z.enum(['project', 'prompt', 'inbox']).optional(),
    id: z.string().uuid().optional(),
    message: z.string().optional(),
    updatedAt: z.string().datetime().optional(),
  }),
});

export type SyncStatusPayload = z.infer<typeof SyncStatusPayloadSchema>;

/**
 * Snapshot created event payload
 */
export const SnapshotCreatedPayloadSchema = z.object({
  event: z.literal('snapshot.created'),
  data: z.object({
    snapshotId: z.string(),
    scope: z.enum(['workspace', 'project', 'prompt']),
    path: z.string(),
    stats: z.object({
      filesCount: z.number().int().nonnegative(),
      attachmentsCount: z.number().int().nonnegative(),
      sizeBytes: z.number().int().nonnegative(),
    }),
  }),
});

export type SnapshotCreatedPayload = z.infer<typeof SnapshotCreatedPayloadSchema>;

/**
 * Snapshot failed event payload
 */
export const SnapshotFailedPayloadSchema = z.object({
  event: z.literal('snapshot.failed'),
  data: z.object({
    snapshotId: z.string(),
    scope: z.enum(['workspace', 'project', 'prompt']),
    error: z.string(),
  }),
});

export type SnapshotFailedPayload = z.infer<typeof SnapshotFailedPayloadSchema>;

/**
 * Union type for all status-related WebSocket events
 */
export const StatusEventSchema = z.discriminatedUnion('event', [
  SyncStatusPayloadSchema,
  SnapshotCreatedPayloadSchema,
  SnapshotFailedPayloadSchema,
]);

export type StatusEvent = z.infer<typeof StatusEventSchema>;
