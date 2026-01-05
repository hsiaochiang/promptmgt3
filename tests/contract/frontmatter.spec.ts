import { describe, it, expect } from 'vitest';
import { 
  ProjectFrontmatterSchema,
  PromptFrontmatterSchema,
  InboxItemFrontmatterSchema,
} from '@pah/contracts';

describe('Contract Tests - Frontmatter Schemas', () => {
  describe('ProjectFrontmatterSchema', () => {
    it('should validate required fields', () => {
      const validProject = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-project',
        title: 'Test Project',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = ProjectFrontmatterSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const project = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-project',
        title: 'Test Project',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = ProjectFrontmatterSchema.parse(project);
      expect(result.summary).toBe('');
      expect(result.status).toBe('planning');
      expect(result.type).toBe('');
      expect(result.tags).toEqual([]);
      expect(result.archived).toBe(false);
    });

    it('should fail without required id', () => {
      const invalid = {
        slug: 'test-project',
        title: 'Test Project',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = ProjectFrontmatterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid UUID', () => {
      const invalid = {
        id: 'not-a-uuid',
        slug: 'test-project',
        title: 'Test Project',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = ProjectFrontmatterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate slug is non-empty', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: '',
        title: 'Test Project',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = ProjectFrontmatterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('PromptFrontmatterSchema', () => {
    it('should validate required fields including projectId', () => {
      const validPrompt = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-prompt',
        projectId: '223e4567-e89b-12d3-a456-426614174000',
        title: 'Test Prompt',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = PromptFrontmatterSchema.safeParse(validPrompt);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const prompt = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-prompt',
        projectId: '223e4567-e89b-12d3-a456-426614174000',
        title: 'Test Prompt',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = PromptFrontmatterSchema.parse(prompt);
      expect(result.status).toBe('draft');
      expect(result.priority).toBe('P1');
      expect(result.tags).toEqual([]);
      expect(result.archived).toBe(false);
      expect(result.notes).toBe('');
    });

    it('should fail without projectId', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-prompt',
        title: 'Test Prompt',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = PromptFrontmatterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate status enum', () => {
      const validStatuses = ['draft', 'tuning', 'ready', 'disabled'];
      validStatuses.forEach(status => {
        const prompt = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-prompt',
          projectId: '223e4567-e89b-12d3-a456-426614174000',
          title: 'Test Prompt',
          status,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        
        const result = PromptFrontmatterSchema.safeParse(prompt);
        expect(result.success).toBe(true);
      });

      const invalidStatus = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-prompt',
        projectId: '223e4567-e89b-12d3-a456-426614174000',
        title: 'Test Prompt',
        status: 'invalid',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = PromptFrontmatterSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should validate priority enum', () => {
      const validPriorities = ['P0', 'P1', 'P2'];
      validPriorities.forEach(priority => {
        const prompt = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-prompt',
          projectId: '223e4567-e89b-12d3-a456-426614174000',
          title: 'Test Prompt',
          priority,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        
        const result = PromptFrontmatterSchema.safeParse(prompt);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('InboxItemFrontmatterSchema', () => {
    it('should validate required fields', () => {
      const validInbox = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Inbox Item',
        importedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = InboxItemFrontmatterSchema.safeParse(validInbox);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const inbox = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Inbox Item',
        importedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = InboxItemFrontmatterSchema.parse(inbox);
      expect(result.cleanedState).toBe('unprocessed');
      expect(result.suggestedTags).toEqual([]);
      expect(result.notes).toBe('');
    });

    it('should validate cleanedState enum', () => {
      const validStates = ['unprocessed', 'cleaned', 'archived'];
      validStates.forEach(cleanedState => {
        const inbox = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Inbox Item',
          importedAt: '2024-01-01T00:00:00.000Z',
          cleanedState,
        };
        
        const result = InboxItemFrontmatterSchema.safeParse(inbox);
        expect(result.success).toBe(true);
      });
    });

    it('should validate suggestedTarget structure', () => {
      const withTarget = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Inbox Item',
        importedAt: '2024-01-01T00:00:00.000Z',
        suggestedTarget: {
          projectId: '223e4567-e89b-12d3-a456-426614174000',
          promptId: '323e4567-e89b-12d3-a456-426614174000',
          pathHint: '/some/path',
        },
      };
      
      const result = InboxItemFrontmatterSchema.safeParse(withTarget);
      expect(result.success).toBe(true);
    });

    it('should allow partial suggestedTarget', () => {
      const partial = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Inbox Item',
        importedAt: '2024-01-01T00:00:00.000Z',
        suggestedTarget: {
          projectId: '223e4567-e89b-12d3-a456-426614174000',
        },
      };
      
      const result = InboxItemFrontmatterSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });
  });
});
