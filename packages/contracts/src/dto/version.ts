import { z } from 'zod';

/**
 * Version / snapshot event, shared between API and UI
 */
export const VersionEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  scope: z.enum(['workspace', 'project', 'prompt']),
  message: z.string().optional(),
  createdAt: z.string().datetime(),
  snapshotPath: z.string(),
});

// 1. Version Node (Visual representation in History)
export const VersionNodeSchema = z.object({
  id: z.string().uuid(), // Unique ID for this version node
  entityId: z.string(), // The entity it belongs to
  entityType: z.enum(['project', 'prompt']),

  versionType: z.enum(['snapshot', 'manual']), // Auto vs Manual
  name: z.string().optional(), // e.g. "Draft 1"
  description: z.string().optional(),

  timestamp: z.string().datetime(), // When it was created
  snapshotPath: z.string(), // Path to the full data copy

  // Metadata about the state at that time
  titleSnapshot: z.string(),
  fileSize: z.number().int().nonnegative().optional(),
});

export type VersionNode = z.infer<typeof VersionNodeSchema>;

// 2. Response for GET /api/:entityType/:id/history
export const VersionListResponseSchema = z.object({
  items: z.array(VersionNodeSchema),
  total: z.number().int().nonnegative(),
});

export type VersionListResponse = z.infer<typeof VersionListResponseSchema>;

// 3. Request for POST /api/snapshots (Manual creation)
export const CreateSnapshotRequestSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['project', 'prompt']),
  name: z.string().min(1, 'Version name is required'),
  description: z.string().optional(),
});

export type CreateSnapshotRequest = z.infer<typeof CreateSnapshotRequestSchema>;

// 4. Request for POST /api/versions/:id/restore
export const RestoreVersionRequestSchema = z.object({
  targetVersionId: z.string(), // The version node ID to restore FROM
});

export type RestoreVersionRequest = z.infer<typeof RestoreVersionRequestSchema>;

