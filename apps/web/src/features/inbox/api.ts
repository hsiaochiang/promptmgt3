import { InboxItemEntity, ProjectEntity } from '@pah/contracts';

const API_BASE_INBOX = 'http://localhost:3001/api/inbox';
const API_BASE_PROJECTS = 'http://localhost:3001/api/projects';

export async function fetchInboxItems(): Promise<InboxItemEntity[]> {
    const res = await fetch(API_BASE_INBOX);
    if (!res.ok) throw new Error('Failed to fetch inbox items');
    return res.json();
}

export async function getInboxItem(id: string): Promise<InboxItemEntity> {
    const res = await fetch(`${API_BASE_INBOX}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch inbox item');
    return res.json();
}

export async function updateInboxItem(id: string, updates: Partial<InboxItemEntity>): Promise<InboxItemEntity> {
    const res = await fetch(`${API_BASE_INBOX}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update inbox item');
    return res.json();
}

export async function deleteInboxItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_INBOX}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete inbox item');
}

export async function fetchProjects(): Promise<ProjectEntity[]> {
    const res = await fetch(API_BASE_PROJECTS);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
}
