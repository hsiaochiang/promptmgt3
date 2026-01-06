import { describe, it, expect } from 'vitest';
import { WorkspaceSettingsSchema } from '@pah/contracts';

describe('Contract Tests - Workspace Settings DTO', () => {
  it('should apply default trashRetentionDays=30 when missing', () => {
    const input = {
      rootPath: 'D:/data/prompts',
      attachmentPath: 'D:/data/attachments',
    };

    const parsed = WorkspaceSettingsSchema.parse(input);
    expect(parsed.trashRetentionDays).toBe(30);
  });

  it('should reject trashRetentionDays < 1', () => {
    const input = {
      rootPath: 'D:/data/prompts',
      attachmentPath: 'D:/data/attachments',
      trashRetentionDays: 0,
    };

    expect(WorkspaceSettingsSchema.safeParse(input).success).toBe(false);
  });

  it('should accept backup.schedule in HH:mm and reject invalid formats', () => {
    const ok = {
      rootPath: 'D:/data/prompts',
      attachmentPath: 'D:/data/attachments',
      backup: {
        dailySnapshot: true,
        schedule: '03:00',
      },
    };

    expect(WorkspaceSettingsSchema.safeParse(ok).success).toBe(true);

    const bad = {
      rootPath: 'D:/data/prompts',
      attachmentPath: 'D:/data/attachments',
      backup: {
        dailySnapshot: true,
        schedule: '3:0',
      },
    };

    expect(WorkspaceSettingsSchema.safeParse(bad).success).toBe(false);
  });
});
