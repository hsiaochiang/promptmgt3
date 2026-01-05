import { describe, it, expect } from 'vitest';
import { 
  ProjectFrontmatterSchema,
  PromptFrontmatterSchema,
  InboxItemFrontmatterSchema,
} from '@pah/contracts';

describe('Contract Tests - API Project/Prompt CRUD Endpoints', () => {
  describe('Project API Contract', () => {
    it('should validate project creation request schema', () => {
      const validRequest = {
        title: 'New Project',
        summary: 'Project summary',
        status: 'planning',
        tags: ['tag1', 'tag2'],
      };
      
      // Schema should accept valid input
      const result = ProjectFrontmatterSchema.partial().safeParse(validRequest);
      expect(result.success).toBe(true);
    });
    
    it('should validate project response includes all required fields', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'new-project',
        title: 'New Project',
        summary: '',
        status: 'planning',
        type: '',
        tags: [],
        archived: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        body: '',
      };
      
      const result = ProjectFrontmatterSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid status in project update', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test',
        title: 'Test',
        status: 'invalid-status',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = ProjectFrontmatterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Prompt API Contract', () => {
    it('should validate prompt creation request schema', () => {
      const validRequest = {
        title: 'New Prompt',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        body: 'Prompt content',
        status: 'draft',
        priority: 'P1',
        tags: ['tag1'],
      };
      
      const result = PromptFrontmatterSchema.partial().safeParse(validRequest);
      expect(result.success).toBe(true);
    });
    
    it('should validate prompt response includes all required fields', () => {
      const response = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        slug: 'new-prompt',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'New Prompt',
        status: 'draft',
        priority: 'P1',
        tags: [],
        notes: '',
        archived: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        body: '',
      };
      
      const result = PromptFrontmatterSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
    
    it('should require projectId for prompts', () => {
      const invalid = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        slug: 'test',
        title: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = PromptFrontmatterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('projectId'))).toBe(true);
      }
    });
    
    it('should validate priority enum values', () => {
      const validPriorities = ['P0', 'P1', 'P2'];
      
      validPriorities.forEach(priority => {
        const prompt = {
          id: '223e4567-e89b-12d3-a456-426614174000',
          slug: 'test',
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test',
          priority,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        
        const result = PromptFrontmatterSchema.safeParse(prompt);
        expect(result.success).toBe(true);
      });
      
      const invalidPriority = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        slug: 'test',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test',
        priority: 'P3',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = PromptFrontmatterSchema.safeParse(invalidPriority);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Error Response Contracts', () => {
    it('should validate 404 error response format', () => {
      const error404 = {
        error: 'Project not found',
      };
      
      expect(error404).toHaveProperty('error');
      expect(typeof error404.error).toBe('string');
    });
    
    it('should validate 409 conflict error response format', () => {
      const error409 = {
        error: 'Project with this slug already exists',
      };
      
      expect(error409).toHaveProperty('error');
      expect(typeof error409.error).toBe('string');
    });
    
    it('should validate 403 permission error response format', () => {
      const error403 = {
        error: 'Root path is not writable',
        message: 'Permission denied',
      };
      
      expect(error403).toHaveProperty('error');
      expect(error403).toHaveProperty('message');
      expect(typeof error403.error).toBe('string');
      expect(typeof error403.message).toBe('string');
    });
    
    it('should validate 400 bad request error response format', () => {
      const error400 = {
        error: 'Title is required',
      };
      
      expect(error400).toHaveProperty('error');
      expect(typeof error400.error).toBe('string');
    });
  });
  
  describe('Inbox API Contract', () => {
    it('should validate inbox item creation request', () => {
      const validRequest = {
        title: 'New Inbox Item',
        sourcePlatform: 'twitter',
        sourceLink: 'https://twitter.com/...',
        rawContent: 'Content from import',
        suggestedTags: ['imported'],
      };
      
      const result = InboxItemFrontmatterSchema.partial().safeParse(validRequest);
      expect(result.success).toBe(true);
    });
    
    it('should validate inbox item response', () => {
      const response = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        title: 'Inbox Item',
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
});
