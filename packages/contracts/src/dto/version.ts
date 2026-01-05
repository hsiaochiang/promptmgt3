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

export type VersionEvent = z.infer<typeof VersionEventSchema>;
