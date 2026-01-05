import { describe, it, expect } from 'vitest';
import {
  SearchRequestSchema,
  SearchResultItemSchema,
  SearchResponseSchema,
} from '@pah/contracts';

describe('Contract Tests - Search DTO', () => {
  describe('SearchRequestSchema', () => {
    it('should validate minimal search request with defaults', () => {
      const minimal = {};
      
      const result = SearchRequestSchema.parse(minimal);
      expect(result.query).toBe('');
      expect(result.viewScope).toBe('active');
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
      // sort is optional, so it's undefined when not provided
      expect(result.sort).toBeUndefined();
    });

    it('should validate search with query', () => {
      const request = {
        query: 'test search',
      };
      
      const result = SearchRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate filters', () => {
      const request = {
        query: 'test',
        filters: {
          tags: ['tag1', 'tag2'],
          status: ['draft', 'ready'],
          priority: ['P0', 'P1'],
          archived: false,
          entityType: ['prompt', 'project'] as const,
        },
      };
      
      const result = SearchRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate sort options', () => {
      const sortFields = ['updatedAt', 'createdAt', 'title', 'relevance'] as const;
      const sortOrders = ['asc', 'desc'] as const;
      
      sortFields.forEach(field => {
        sortOrders.forEach(order => {
          const request = {
            sort: { field, order },
          };
          
          const result = SearchRequestSchema.safeParse(request);
          expect(result.success).toBe(true);
        });
      });
    });

    it('should validate viewScope options', () => {
      const viewScopes = ['all', 'active', 'archived'] as const;
      viewScopes.forEach(viewScope => {
        const request = { viewScope };
        
        const result = SearchRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should validate pagination', () => {
      const request = {
        page: 2,
        perPage: 50,
      };
      
      const result = SearchRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid page (zero)', () => {
      const invalid = {
        page: 0,
      };
      
      const result = SearchRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid perPage (exceeds max)', () => {
      const invalid = {
        perPage: 101,
      };
      
      const result = SearchRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid sort field', () => {
      const invalid = {
        sort: {
          field: 'invalidField',
          order: 'asc',
        },
      };
      
      const result = SearchRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid viewScope', () => {
      const invalid = {
        viewScope: 'invalid',
      };
      
      const result = SearchRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchResultItemSchema', () => {
    it('should validate complete search result item', () => {
      const validItem = {
        type: 'prompt' as const,
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Prompt',
        snippet: 'This is a test prompt snippet...',
        tags: ['test', 'example'],
        path: '/projects/test/prompts/test-prompt.md',
        status: 'draft',
        priority: 'P1',
        updatedAt: '2024-01-01T00:00:00.000Z',
        relevance: 0.95,
      };
      
      const result = SearchResultItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should validate all entity types', () => {
      const types = ['project', 'prompt', 'inbox'] as const;
      types.forEach(type => {
        const item = {
          type,
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Item',
          tags: [],
          path: '/test/path',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        
        const result = SearchResultItemSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });

    it('should validate minimal result item without optional fields', () => {
      const minimal = {
        type: 'project' as const,
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Project',
        tags: [],
        path: '/projects/test',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = SearchResultItemSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid type', () => {
      const invalid = {
        type: 'invalid',
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test',
        tags: [],
        path: '/test',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = SearchResultItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail without required fields', () => {
      const missingTitle = {
        type: 'prompt',
        id: '123e4567-e89b-12d3-a456-426614174000',
        tags: [],
        path: '/test',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = SearchResultItemSchema.safeParse(missingTitle);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchResponseSchema', () => {
    it('should validate complete search response', () => {
      const validResponse = {
        items: [
          {
            type: 'prompt' as const,
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Prompt',
            tags: ['test'],
            path: '/test/path',
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
    });

    it('should validate empty results', () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
        hasMore: false,
      };
      
      const result = SearchResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with hasMore true', () => {
      const response = {
        items: [],
        total: 100,
        page: 1,
        perPage: 20,
        hasMore: true,
      };
      
      const result = SearchResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should fail with negative total', () => {
      const invalid = {
        items: [],
        total: -1,
        page: 1,
        perPage: 20,
        hasMore: false,
      };
      
      const result = SearchResponseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail without required fields', () => {
      const incomplete = {
        items: [],
        total: 0,
      };
      
      const result = SearchResponseSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });
});
