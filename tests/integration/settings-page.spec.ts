/**
 * T070 [P] Integration：設定頁相關行為（tagsDict/commonOptions/backup schedule semantics）
 *
 * 注意：此處以 DTO/schema 層與物件操作模擬設定頁行為，避免引入實際 UI 依賴。
 */

import { describe, it, expect } from 'vitest';
import { WorkspaceSettingsSchema } from '@pah/contracts';

describe('Integration - Settings Page Semantics', () => {
  it('supports tagsDict rename as merge without duplicates', () => {
    const before = {
      rootPath: 'D:/data/prompts',
      attachmentPath: 'D:/data/attachments',
      tagsDict: {
        platform: ['twitter', 'github'],
        misc: ['legacy'],
      },
    } as const;

    // 模擬使用者將 platform 類別重新命名為 social，並新增一個新標籤
    const renamed = {
      ...before,
      tagsDict: {
        misc: before.tagsDict!.misc,
        social: Array.from(new Set([...before.tagsDict!.platform, 'discord'])),
      },
    };

    const parsed = WorkspaceSettingsSchema.parse(renamed);
    expect(parsed.tagsDict).toBeDefined();
    expect(Object.keys(parsed.tagsDict!)).toEqual(['misc', 'social']);
    expect(parsed.tagsDict!.social).toEqual(['twitter', 'github', 'discord']);
  });

  it('supports commonOptions as arrays with de-duplicated values', () => {
    const withDuplicates = {
      rootPath: 'D:/data/prompts',
      attachmentPath: 'D:/data/attachments',
      commonOptions: {
        models: ['gpt-4o', 'gpt-4o', 'claude-3.5'],
      },
    } as const;

    // 測試端去重後再送進 schema，模擬設定頁將重複值壓平
    const normalized = {
      ...withDuplicates,
      commonOptions: {
        models: Array.from(new Set(withDuplicates.commonOptions.models)),
      },
    };

    const parsed = WorkspaceSettingsSchema.parse(normalized);
    expect(parsed.commonOptions).toBeDefined();
    expect(parsed.commonOptions!.models).toEqual(['gpt-4o', 'claude-3.5']);
  });

  it('accepts valid backup schedule and rejects invalid format', () => {
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
