import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SearchRequestSchema, 
  type SearchRequest, 
  type SearchResponse,
  type SearchResultItem,
} from '@pah/contracts';
import { scanWorkspace } from '../indexing/index.js';

/**
 * In-memory search implementation (MVP)
 * For 5,000 items, this should meet the <1s p95 requirement
 * Upgrade path: SQLite + FTS5 for larger datasets
 */
export async function registerSearchRoutes(server: FastifyInstance, rootPath: string) {
  // POST /api/search - Search across all entities
  server.post<{
    Body: SearchRequest;
  }>('/api/search', async (request, reply) => {
    try {
      // Parse and validate search request
      const searchParams = SearchRequestSchema.parse(request.body);
      
      // Scan workspace to get all entities
      const scanResult = await scanWorkspace(rootPath);
      
      // Combine all entities into searchable items
      const allItems: SearchResultItem[] = [];
      
      // Add projects
      for (const project of scanResult.projects) {
        // Apply viewScope filter
        if (searchParams.viewScope === 'archived' && !project.archived) continue;
        if (searchParams.viewScope === 'active' && project.archived) continue;
        
        // Apply filters
        if (searchParams.filters?.archived !== undefined && project.archived !== searchParams.filters.archived) continue;
        if (searchParams.filters?.entityType && !searchParams.filters.entityType.includes('project')) continue;
        if (searchParams.filters?.tags && searchParams.filters.tags.length > 0) {
          const hasTag = searchParams.filters.tags.some(tag => project.tags.includes(tag));
          if (!hasTag) continue;
        }
        if (searchParams.filters?.status && searchParams.filters.status.length > 0) {
          if (!searchParams.filters.status.includes(project.status)) continue;
        }
        
        // Calculate relevance
        const relevance = calculateRelevance(searchParams.query, project.title, project.tags, project.body || '');
        
        // Add to results if matches query or no query provided
        if (!searchParams.query || relevance > 0) {
          allItems.push({
            type: 'project',
            id: project.id,
            title: project.title,
            snippet: project.summary || extractSnippet(project.body || '', searchParams.query),
            tags: project.tags,
            path: `/projects/${project.slug}`,
            status: project.status,
            updatedAt: project.updatedAt,
            relevance,
          });
        }
      }
      
      // Add prompts
      for (const prompt of scanResult.prompts) {
        // Apply viewScope filter
        if (searchParams.viewScope === 'archived' && !prompt.archived) continue;
        if (searchParams.viewScope === 'active' && prompt.archived) continue;
        
        // Apply filters
        if (searchParams.filters?.archived !== undefined && prompt.archived !== searchParams.filters.archived) continue;
        if (searchParams.filters?.entityType && !searchParams.filters.entityType.includes('prompt')) continue;
        if (searchParams.filters?.tags && searchParams.filters.tags.length > 0) {
          const hasTag = searchParams.filters.tags.some(tag => prompt.tags.includes(tag));
          if (!hasTag) continue;
        }
        if (searchParams.filters?.status && searchParams.filters.status.length > 0) {
          if (!searchParams.filters.status.includes(prompt.status)) continue;
        }
        if (searchParams.filters?.priority && searchParams.filters.priority.length > 0) {
          if (!searchParams.filters.priority.includes(prompt.priority)) continue;
        }
        
        // Calculate relevance
        const relevance = calculateRelevance(searchParams.query, prompt.title, prompt.tags, prompt.body);
        
        // Add to results if matches query or no query provided
        if (!searchParams.query || relevance > 0) {
          // Find project for path
          const project = scanResult.projects.find(p => p.id === prompt.projectId);
          const projectSlug = project?.slug || 'unknown';
          
          allItems.push({
            type: 'prompt',
            id: prompt.id,
            title: prompt.title,
            snippet: extractSnippet(prompt.body, searchParams.query),
            tags: prompt.tags,
            path: `/projects/${projectSlug}/prompts/${prompt.slug}`,
            status: prompt.status,
            priority: prompt.priority,
            updatedAt: prompt.updatedAt,
            relevance,
          });
        }
      }
      
      // Add inbox items
      for (const item of scanResult.inbox) {
        // Apply filters
        if (searchParams.filters?.entityType && !searchParams.filters.entityType.includes('inbox')) continue;
        if (searchParams.filters?.tags && searchParams.filters.tags.length > 0) {
          const hasTag = searchParams.filters.tags.some(tag => item.suggestedTags.includes(tag));
          if (!hasTag) continue;
        }
        
        // Calculate relevance
        const relevance = calculateRelevance(searchParams.query, item.title, item.suggestedTags, item.rawContent);
        
        // Add to results if matches query or no query provided
        if (!searchParams.query || relevance > 0) {
          allItems.push({
            type: 'inbox',
            id: item.id,
            title: item.title,
            snippet: extractSnippet(item.rawContent, searchParams.query),
            tags: item.suggestedTags,
            path: `/inbox/${item.id}`,
            updatedAt: item.importedAt,
            relevance,
          });
        }
      }
      
      // Sort results
      const sortField = searchParams.sort?.field || 'relevance';
      const sortOrder = searchParams.sort?.order || 'desc';
      
      allItems.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortField) {
          case 'relevance':
            aVal = a.relevance || 0;
            bVal = b.relevance || 0;
            break;
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'updatedAt':
          case 'createdAt':
            aVal = new Date(a.updatedAt).getTime();
            bVal = new Date(b.updatedAt).getTime();
            break;
          default:
            aVal = a.updatedAt;
            bVal = b.updatedAt;
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
      
      // Paginate
      const page = searchParams.page || 1;
      const perPage = searchParams.perPage || 20;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedItems = allItems.slice(startIndex, endIndex);
      
      const response: SearchResponse = {
        items: paginatedItems,
        total: allItems.length,
        page,
        perPage,
        hasMore: endIndex < allItems.length,
      };
      
      return response;
    } catch (error) {
      reply.code(500).send({
        error: 'Search failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

/**
 * Calculate relevance score for search results
 * Simple implementation: keyword matching with weights
 */
function calculateRelevance(
  query: string,
  title: string,
  tags: string[],
  body: string
): number {
  if (!query) return 1; // No query = all items have equal relevance
  
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const bodyLower = body.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase());
  
  let score = 0;
  
  // Title match (highest weight)
  if (titleLower.includes(queryLower)) {
    score += 10;
  } else {
    // Partial word matches in title
    const queryWords = queryLower.split(/\s+/);
    for (const word of queryWords) {
      if (titleLower.includes(word)) {
        score += 5;
      }
    }
  }
  
  // Tag match (medium weight)
  for (const tag of tagsLower) {
    if (tag.includes(queryLower)) {
      score += 3;
    }
  }
  
  // Body match (lower weight)
  if (bodyLower.includes(queryLower)) {
    score += 1;
  }
  
  return score;
}

/**
 * Extract a snippet from body text around the search query
 */
function extractSnippet(body: string, query: string, maxLength: number = 150): string {
  if (!query || !body) {
    return body.slice(0, maxLength) + (body.length > maxLength ? '...' : '');
  }
  
  const queryLower = query.toLowerCase();
  const bodyLower = body.toLowerCase();
  const index = bodyLower.indexOf(queryLower);
  
  if (index === -1) {
    return body.slice(0, maxLength) + (body.length > maxLength ? '...' : '');
  }
  
  // Extract context around the match
  const start = Math.max(0, index - 50);
  const end = Math.min(body.length, index + query.length + 100);
  
  let snippet = body.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < body.length) snippet = snippet + '...';
  
  return snippet;
}
