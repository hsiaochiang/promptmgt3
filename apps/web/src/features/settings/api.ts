import { WorkspaceSettings, WorkspaceSettingsUpdate } from '@pah/contracts';

const API_BASE = '/api/workspace';

export async function getSettings(): Promise<WorkspaceSettings> {
    const response = await fetch(`${API_BASE}/settings`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch settings');
    }
    return response.json();
}

export async function updateSettings(update: WorkspaceSettingsUpdate): Promise<WorkspaceSettings> {
    const response = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update settings');
    }
    return response.json();
}

export async function checkPathPermissions(path: string): Promise<{
    readable: boolean;
    writable: boolean;
    error?: string;
}> {
    const params = new URLSearchParams({ path });
    const response = await fetch(`${API_BASE}/permissions?${params}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to check path permissions');
    }
    return response.json();
}
