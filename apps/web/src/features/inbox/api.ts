import { InboxItemEntity } from '@pah/contracts';

const API_BASE = 'http://localhost:3001/api/inbox';

export async function fetchInboxItems(): Promise<InboxItemEntity[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch inbox items');
    return res.json();
}

export async function getInboxItem(id: string): Promise<InboxItemEntity> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch inbox item');
    return res.json();
}

export async function updateInboxItem(id: string, updates: Partial<InboxItemEntity>): Promise<InboxItemEntity> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update inbox item');
    return res.json();
}

export async function deleteInboxItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete inbox item');
}
