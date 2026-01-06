import type {
  TrashItem,
  TrashListResponse,
  TrashRestoreRequest,
  TrashRestoreResult,
  RestoreConflict,
  TrashEntityType,
} from '@pah/contracts';

const API_BASE = 'http://localhost:3001';

export interface FetchTrashListParams {
  q?: string;
  entityType?: TrashEntityType;
  page?: number;
  perPage?: number;
}

/**
 * Fetch trash list with optional filters
 */
export async function fetchTrashList(params?: FetchTrashListParams): Promise<TrashListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.q) searchParams.set('q', params.q);
  if (params?.entityType) searchParams.set('entityType', params.entityType);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));

  const url = `${API_BASE}/api/trash${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch trash: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Permanently delete (purge) a trash item
 */
export async function purgeTrashItem(trashId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/trash/${trashId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to purge trash item: ${response.statusText}`);
  }
}

export interface RestoreTrashItemResult {
  result?: TrashRestoreResult;
  conflict?: RestoreConflict;
}

/**
 * Restore a trash item to its original location
 * Returns either a success result or a conflict that needs resolution
 */
export async function restoreTrashItem(
  trashId: string,
  request: TrashRestoreRequest
): Promise<RestoreTrashItemResult> {
  const response = await fetch(`${API_BASE}/api/trash/${trashId}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (response.status === 404) {
    throw new Error('Trash item not found');
  }

  if (response.status === 409) {
    // Conflict - return conflict details
    const conflict = await response.json();
    return { conflict };
  }

  if (!response.ok) {
    throw new Error(`Failed to restore trash item: ${response.statusText}`);
  }

  const result = await response.json();
  return { result };
}
