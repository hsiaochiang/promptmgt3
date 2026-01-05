/**
 * T050 [P] [US2] Contract test：Search DTO + endpoint shape
 * DoD: filters/sort/viewScope 有覆蓋
 */

import { describe, it, expect } from 'vitest';
import {
  SearchRequestSchema,
  SearchResultItemSchema,
  SearchResponseSchema,
} from '../../packages/contracts/src/dto/search.js';
import type {
  SearchRequest,
  SearchResultItem,
  SearchResponse,
} from '../../packages/contracts/src/dto/search.js';

describe('Contract - Search API', () => {
  describe('SearchRequest schema', () => {
    it('should accept valid search request with all fields', () => {
      const validRequest: SearchRequest = {
        query: 'test query',
        filters: {
          tags: ['javascript', 'react'],
          status: ['ready', 'draft'],
          priority: ['P0', 'P1'],
          archived: false,
          entityType: ['project', 'prompt'],
        },
        sort: {
          field: 'updatedAt',
          order: 'desc',
        },
        viewScope: 'active',
        page: 1,
        perPage: 20,
      };

      const result = SearchRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it('should apply defaults for optional fields', () => {
      const minimalRequest = {
        query: '',
      };

      const result = SearchRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('');
        expect(result.data.viewScope).toBe('active');
        expect(result.data.page).toBe(1);
        expect(result.data.perPage).toBe(20);
        expect(result.data.sort?.field).toBe('relevance');
        expect(result.data.sort?.order).toBe('desc');
      }
    });

    it('should accept filters with subset of fields', () => {
      const request = {
        query: 'search',
        filters: {
          tags: ['api'],
          status: ['ready'],
        },
      };

      const result = SearchRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filters?.tags).toEqual(['api']);
        expect(result.data.filters?.status).toEqual(['ready']);
        expect(result.data.filters?.priority).toBeUndefined();
      }
    });

    it('should validate viewScope enum values', () => {
      const validScopes = ['all', 'active', 'archived'] as const;

      validScopes.forEach(scope => {
        const request = { query: '', viewScope: scope };
        const result = SearchRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });

      const invalidScope = { query: '', viewScope: 'invalid' };
      const result = SearchRequestSchema.safeParse(invalidScope);
      expect(result.success).toBe(false);
    });

    it('should validate sort field enum values', () => {
      const validFields = ['updatedAt', 'createdAt', 'title', 'relevance'] as const;

      validFields.forEach(field => {
        const request = {
          query: '',
          sort: { field, order: 'asc' as const },
        };
        const result = SearchRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });

      const invalidField = {
        query: '',
        sort: { field: 'invalid', order: 'asc' },
      };
      const result = SearchRequestSchema.safeParse(invalidField);
      expect(result.success).toBe(false);
    });

    it('should validate sort order enum values', () => {
      const validOrders = ['asc', 'desc'] as const;

      validOrders.forEach(order => {
        const request = {
          query: '',
          sort: { field: 'updatedAt' as const, order },
        };
        const result = SearchRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });

      const invalidOrder = {
        query: '',
        sort: { field: 'updatedAt', order: 'invalid' },
      };
      const result = SearchRequestSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('should enforce page number constraints', () => {
      const validPage = { query: '', page: 1 };
      expect(SearchRequestSchema.safeParse(validPage).success).toBe(true);

      const zeroPag = { query: '', page: 0 };
      expect(SearchRequestSchema.safeParse(zeroPage).success).toBe(false);

      const negativePage = { query: '', page: -1 };
      expect(SearchRequestSchema.safeParse(negativePage).success).toBe(false);
    });

    it('should enforce perPage constraints', () => {
      const validPerPage = { query: '', perPage: 50 };
      expect(SearchRequestSchema.safeParse(validPerPage).success).toBe(true);

      const maxPerPage = { query: '', perPage: 100 };
      expect(SearchRequestSchema.safeParse(maxPerPage).success).toBe(true);

      const tooLarge = { query: '', perPage: 101 };
      expect(SearchRequestSchema.safeParse(tooLarge).success).toBe(false);

      const zeroPerPage = { query: '', perPage: 0 };
      expect(SearchRequestSchema.safeParse(zeroPerPage).success).toBe(false);
    });

    it('should validate entityType filter', () => {
      const validTypes = ['project', 'prompt', 'inbox'] as const;

      validTypes.forEach(type => {
        const request = {
          query: '',
          filters: { entityType: [type] },
        };
        const result = SearchRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });

      const invalidType = {
        query: '',
        filters: { entityType: ['invalid'] },
      };
      const result = SearchRequestSchema.safeParse(invalidType);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchResultItem schema', () => {
    it('should accept valid search result item', () => {
      const validItem: SearchResultItem = {
        type: 'prompt',
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Prompt',
        snippet: 'This is a test snippet...',
        tags: ['api', 'testing'],
        path: 'projects/test-project/prompts/test-prompt.md',
        status: 'ready',
        priority: 'P1',
        updatedAt: '2024-01-01T00:00:00.000Z',
        relevance: 0.95,
      };

      const result = SearchResultItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validItem);
      }
    });

    it('should require mandatory fields', () => {
      const missingType = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(SearchResultItemSchema.safeParse(missingType).success).toBe(false);

      const missingId = {
        type: 'prompt',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(SearchResultItemSchema.safeParse(missingId).success).toBe(false);
    });

    it('should validate type enum', () => {
      const validTypes = ['project', 'prompt', 'inbox'] as const;

      validTypes.forEach(type => {
        const item = {
          type,
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test',
          tags: [],
          path: 'test.md',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        expect(SearchResultItemSchema.safeParse(item).success).toBe(true);
      });

      const invalidType = {
        type: 'invalid',
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(SearchResultItemSchema.safeParse(invalidType).success).toBe(false);
    });

    it('should validate UUID format for id', () => {
      const validUuid = {
        type: 'prompt' as const,
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(SearchResultItemSchema.safeParse(validUuid).success).toBe(true);

      const invalidUuid = {
        type: 'prompt' as const,
        id: 'not-a-uuid',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(SearchResultItemSchema.safeParse(invalidUuid).success).toBe(false);
    });

    it('should validate datetime format for updatedAt', () => {
      const validDate = {
        type: 'prompt' as const,
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(SearchResultItemSchema.safeParse(validDate).success).toBe(true);

      const invalidDate = {
        type: 'prompt' as const,
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: 'not-a-date',
      };
      expect(SearchResultItemSchema.safeParse(invalidDate).success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalItem = {
        type: 'prompt' as const,
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        tags: [],
        path: 'test.md',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const result = SearchResultItemSchema.safeParse(minimalItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.snippet).toBeUndefined();
        expect(result.data.status).toBeUndefined();
        expect(result.data.priority).toBeUndefined();
        expect(result.data.relevance).toBeUndefined();
      }
    });
  });

  describe('SearchResponse schema', () => {
    it('should accept valid search response', () => {
      const validResponse: SearchResponse = {
        items: [
          {
            type: 'prompt',
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Test Prompt',
            tags: ['test'],
            path: 'test.md',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        perPage: 20,
        hasMore: false,
      };

      const result = SearchResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validResponse);
      }
    });

    it('should require all mandatory fields', () => {
      const missingTotal = {
        items: [],
        page: 1,
        perPage: 20,
        hasMore: false,
      };
      expect(SearchResponseSchema.safeParse(missingTotal).success).toBe(false);

      const missingHasMore = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
      };
      expect(SearchResponseSchema.safeParse(missingHasMore).success).toBe(false);
    });

    it('should validate numeric constraints', () => {
      const validResponse = {
        items: [],
        total: 100,
        page: 1,
        perPage: 20,
        hasMore: true,
      };
      expect(SearchResponseSchema.safeParse(validResponse).success).toBe(true);

      const negativeTotal = {
        items: [],
        total: -1,
        page: 1,
        perPage: 20,
        hasMore: false,
      };
      expect(SearchResponseSchema.safeParse(negativeTotal).success).toBe(false);

      const zeroPage = {
        items: [],
        total: 0,
        page: 0,
        perPage: 20,
        hasMore: false,
      };
      expect(SearchResponseSchema.safeParse(zeroPage).success).toBe(false);
    });

    it('should validate items array contains valid SearchResultItems', () => {
      const invalidItem = {
        items: [
          {
            type: 'invalid',
            id: 'not-uuid',
            title: 'Test',
          },
        ],
        total: 1,
        page: 1,
        perPage: 20,
        hasMore: false,
      };
      expect(SearchResponseSchema.safeParse(invalidItem).success).toBe(false);
    });

    it('should accept empty results', () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
        hasMore: false,
      };
      expect(SearchResponseSchema.safeParse(emptyResponse).success).toBe(true);
    });
  });
});
