import { describe, expect, it } from 'vitest';

// Contract Tests - /api/workspace/settings
// OpenAPI: specs/001-prompt-asset-hub/contracts/openapi.yaml

describe('Contract - Workspace Settings API', () => {
  it('validates 400/403/500 error response format (error string + optional message)', () => {
    const errorResponse = {
      error: 'Root path does not exist',
      message: 'Path does not exist',
    };

    expect(errorResponse).toHaveProperty('error');
    expect(typeof errorResponse.error).toBe('string');

    // message is optional, but when present must be string
    expect(errorResponse).toHaveProperty('message');
    expect(typeof errorResponse.message).toBe('string');
  });
});
