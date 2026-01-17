/**
 * Slug normalization utilities
 * 
 * Rules:
 * - Only ASCII lowercase letters, numbers, and hyphens
 * - Spaces become hyphens
 * - Consecutive hyphens are merged
 * - Leading/trailing hyphens are removed
 * - Non-ASCII characters are removed or transliterated
 */

/**
 * Normalize a string into a valid slug (ASCII kebab-case)
 * 
 * @param input - The string to convert to a slug
 * @returns A normalized slug string
 */
export function normalizeSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Slug input must be a non-empty string');
  }

  let slug = input
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove non-ASCII alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Merge consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    // Fallback for non-ASCII titles (e.g. Chinese) that result in empty slug
    // Use a timestamp-based slug
    return `untitled-${Date.now().toString(36)}`;
  }

  return slug;
}

/**
 * Validate if a string is already a valid slug
 * 
 * @param input - The string to validate
 * @returns true if the string is a valid slug
 */
export function isValidSlug(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // Must contain only lowercase letters, numbers, and hyphens
  // Cannot start or end with hyphen
  // Cannot have consecutive hyphens
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugPattern.test(input);
}
