/**
 * T080 [P] [US4] Contract test：InboxItem 讀寫 endpoints
 */

import { describe, it, expect } from 'vitest';
import { InboxItemFrontmatterSchema } from '@pah/contracts';

describe('Contract - InboxItem API', () => {
  it('accepts valid inbox item creation payload', () => {
    const payload = {
      title: 'Imported note',
      sourcePlatform: 'twitter',
      sourceLink: 'https://twitter.com/example',
      rawContent: 'Original content',
      suggestedTags: ['imported'],
    };

    const result = InboxItemFrontmatterSchema.partial().safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('validates inbox item response shape', () => {
    const response = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      title: 'Inbox Item',
      sourcePlatform: 'twitter',
      sourceLink: 'https://twitter.com/example',
      importedAt: '2024-01-01T00:00:00.000Z',
      rawContent: 'Content',
      cleanedState: 'unprocessed',
      suggestedTags: [],
      notes: '',
    };

    const result = InboxItemFrontmatterSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});
