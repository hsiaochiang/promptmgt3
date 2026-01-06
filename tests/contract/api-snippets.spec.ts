/**
 * T071 [P] Contract test: Snippet CRUD endpoints
 */

import { describe, it, expect } from 'vitest';
import { SnippetSchema, SnippetInputSchema, SnippetListSchema } from '@pah/contracts';

describe('Contract - Snippet API', () => {
  it('validates snippet creation payload', () => {
    const payload = {
      title: 'SQL Query Template',
      content: 'SELECT * FROM {table} WHERE {condition}',
      tags: ['sql', 'query'],
    };

    const result = SnippetInputSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('validates snippet response shape', () => {
    const response = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'SQL Query Template',
      content: 'SELECT * FROM {table} WHERE {condition}',
      tags: ['sql', 'query'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = SnippetSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('validates snippet list response', () => {
    const response = {
      items: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'SQL Query Template',
          content: 'SELECT * FROM {table}',
          tags: ['sql'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
    };

    const result = SnippetListSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('rejects snippet with missing title', () => {
    const payload = {
      content: 'Some content',
    };

    const result = SnippetInputSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('requires valid UUID for snippet id', () => {
    const response = {
      id: 'invalid-id',
      title: 'Test',
      content: 'Test content',
      tags: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = SnippetSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});
