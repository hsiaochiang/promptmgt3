import { describe, it, expect } from 'vitest';
import { ProjectFrontmatterSchema } from '@pah/contracts';

describe('Contract Tests - Example', () => {
  it('should validate a basic contract', () => {
    const result = ProjectFrontmatterSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      slug: 'test-project',
      title: 'Test Project',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    
    expect(result.success).toBe(true);
  });
});
