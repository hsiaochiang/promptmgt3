import { describe, it, expect } from 'vitest';
import { normalizeSlug, isValidSlug } from '../../apps/server/src/utils/slug';

describe('Slug Utility', () => {
  describe('normalizeSlug', () => {
    it('should convert simple string to lowercase kebab-case', () => {
      expect(normalizeSlug('Hello World')).toBe('hello-world');
      expect(normalizeSlug('My Project')).toBe('my-project');
    });

    it('should handle multiple spaces', () => {
      expect(normalizeSlug('Hello    World')).toBe('hello-world');
      expect(normalizeSlug('  Leading spaces')).toBe('leading-spaces');
      expect(normalizeSlug('Trailing spaces  ')).toBe('trailing-spaces');
    });

    it('should replace underscores with hyphens', () => {
      expect(normalizeSlug('hello_world')).toBe('hello-world');
      expect(normalizeSlug('my_project_name')).toBe('my-project-name');
    });

    it('should remove non-ASCII characters', () => {
      expect(normalizeSlug('Hello! World?')).toBe('hello-world');
      expect(normalizeSlug('Test@Project#123')).toBe('testproject123');
      expect(normalizeSlug('Café')).toBe('caf');
      // Pure non-ASCII should throw since it results in empty
      expect(() => normalizeSlug('日本語')).toThrow('Slug normalization resulted in empty string');
    });

    it('should merge consecutive hyphens', () => {
      expect(normalizeSlug('hello--world')).toBe('hello-world');
      expect(normalizeSlug('test---project')).toBe('test-project');
      expect(normalizeSlug('a-_-b')).toBe('a-b');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(normalizeSlug('-hello-world-')).toBe('hello-world');
      expect(normalizeSlug('---test---')).toBe('test');
    });

    it('should handle mixed cases', () => {
      expect(normalizeSlug('MyProject123')).toBe('myproject123');
      expect(normalizeSlug('TEST-Project')).toBe('test-project');
    });

    it('should handle numbers correctly', () => {
      expect(normalizeSlug('Project 123')).toBe('project-123');
      expect(normalizeSlug('v2.0.1')).toBe('v201');
      expect(normalizeSlug('2024-plan')).toBe('2024-plan');
    });

    it('should handle edge cases', () => {
      expect(normalizeSlug('a')).toBe('a');
      expect(normalizeSlug('123')).toBe('123');
      expect(normalizeSlug('a-b-c')).toBe('a-b-c');
    });

    it('should throw on empty or invalid input', () => {
      expect(() => normalizeSlug('')).toThrow('Slug input must be a non-empty string');
      expect(() => normalizeSlug('   ')).toThrow('Slug normalization resulted in empty string');
      expect(() => normalizeSlug('!!!')).toThrow('Slug normalization resulted in empty string');
      expect(() => normalizeSlug(null as any)).toThrow('Slug input must be a non-empty string');
      expect(() => normalizeSlug(undefined as any)).toThrow('Slug input must be a non-empty string');
    });

    it('should handle complex real-world examples', () => {
      expect(normalizeSlug('AI-Powered ChatGPT Integration')).toBe('ai-powered-chatgpt-integration');
      expect(normalizeSlug('2024 Q1 Planning & Goals')).toBe('2024-q1-planning-goals');
      expect(normalizeSlug('user_auth_v2.1')).toBe('user-auth-v21');
      expect(normalizeSlug('Fix: broken API endpoint')).toBe('fix-broken-api-endpoint');
    });

    it('should be idempotent for already-valid slugs', () => {
      const validSlug = 'already-valid-slug';
      expect(normalizeSlug(validSlug)).toBe(validSlug);
      expect(normalizeSlug('test-123')).toBe('test-123');
    });
  });

  describe('isValidSlug', () => {
    it('should return true for valid slugs', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('my-project-123')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
      expect(isValidSlug('123')).toBe(true);
      expect(isValidSlug('test-project-v2')).toBe(true);
    });

    it('should return false for invalid slugs', () => {
      expect(isValidSlug('Hello-World')).toBe(false); // uppercase
      expect(isValidSlug('hello--world')).toBe(false); // consecutive hyphens
      expect(isValidSlug('-hello')).toBe(false); // leading hyphen
      expect(isValidSlug('hello-')).toBe(false); // trailing hyphen
      expect(isValidSlug('hello_world')).toBe(false); // underscore
      expect(isValidSlug('hello world')).toBe(false); // space
      expect(isValidSlug('hello!world')).toBe(false); // special char
      expect(isValidSlug('')).toBe(false); // empty
    });

    it('should return false for null/undefined', () => {
      expect(isValidSlug(null as any)).toBe(false);
      expect(isValidSlug(undefined as any)).toBe(false);
    });
  });
});
