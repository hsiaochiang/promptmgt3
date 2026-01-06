import { z } from 'zod';

export const BackupSettingsSchema = z
  .object({
    dailySnapshot: z.boolean().default(false),
    schedule: z.string().optional(),
    remote: z.string().optional(),
  })
  .default({ dailySnapshot: false });

export type BackupSettings = z.infer<typeof BackupSettingsSchema>;

export const WorkspaceSettingsSchema = z.object({
  rootPath: z.string(),
  attachmentPath: z.string(),
  tagsDict: z.record(z.array(z.string())).optional(),
  commonOptions: z.record(z.any()).optional(),
  backup: BackupSettingsSchema.optional(),
  trashRetentionDays: z.number().int().min(1).default(30),
  updatedAt: z.string().datetime().optional(),
});

export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;

export const WorkspaceSettingsUpdateSchema = WorkspaceSettingsSchema.partial();

export type WorkspaceSettingsUpdate = z.infer<typeof WorkspaceSettingsUpdateSchema>;
