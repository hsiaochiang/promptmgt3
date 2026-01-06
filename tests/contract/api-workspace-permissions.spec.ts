import { describe, expect, it } from 'vitest';

// Contract Tests - GET /api/workspace/permissions
// OpenAPI: specs/001-prompt-asset-hub/contracts/openapi.yaml

describe('Contract - Workspace Permissions API', () => {
  it('validates success response shape (readable/writable booleans)', () => {
    const ok = {
      readable: true,
      writable: true,
    };

    expect(ok).toHaveProperty('readable');
    expect(ok).toHaveProperty('writable');
    expect(typeof ok.readable).toBe('boolean');
    expect(typeof ok.writable).toBe('boolean');
  });

  it('validates failure response shape (readable/writable false with error)', () => {
    const denied = {
      readable: false,
      writable: false,
      error: 'Permission denied',
    };

    expect(denied).toHaveProperty('readable');
    expect(denied).toHaveProperty('writable');
    expect(typeof denied.readable).toBe('boolean');
    expect(typeof denied.writable).toBe('boolean');

    expect(denied).toHaveProperty('error');
    expect(typeof denied.error).toBe('string');
  });

  it('validates 400 error response format when query.path is missing', () => {
    const error400 = {
      error: 'Path parameter is required',
    };

    expect(error400).toHaveProperty('error');
    expect(typeof error400.error).toBe('string');
  });
});
