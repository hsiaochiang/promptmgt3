/**
 * T082A [US4] Integration / usability test：暫存區文案與保存流程基礎驗收
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { InboxView } from '../../apps/web/src/features/inbox/InboxView.js';

describe('Integration - Inbox Usability', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it('shows clear disclaimer that archiving is handled by external tools', async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(React.createElement(InboxView));
    });

    const tree = renderer!.toJSON() as any;
    const text = JSON.stringify(tree);
    expect(text).toContain('暫存區項目的歸檔功能由外部工具處理');
  });
});
