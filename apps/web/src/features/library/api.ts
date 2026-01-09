import {
    ProjectEntity,
    PromptEntity
} from '@pah/contracts';

const API_BASE = '/api';

// --- Projects ---

export interface GetProjectsOptions {
    q?: string;
    status?: string;
    archived?: boolean;
}

export async function getProjects(options: GetProjectsOptions = {}): Promise<ProjectEntity[]> {
    const params = new URLSearchParams();
    if (options.q) params.set('q', options.q);
    if (options.status) params.set('status', options.status);
    if (options.archived !== undefined) params.set('archived', String(options.archived));

    const response = await fetch(`${API_BASE}/projects?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    return response.json();
}

export async function getProject(id: string): Promise<ProjectEntity> {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch project');
    }
    return response.json();
}

export async function createProject(data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create project');
    }
    return response.json();
}

export async function updateProject(id: string, data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update project');
    }
    return response.json();
}

export async function deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete project');
    }
}

// --- Prompts ---

export interface GetPromptsOptions {
    q?: string;
    status?: string;
    priority?: string;
    archived?: boolean;
}

export async function getPrompts(options: GetPromptsOptions = {}): Promise<PromptEntity[]> {
    const params = new URLSearchParams();
    if (options.q) params.set('q', options.q);
    if (options.status) params.set('status', options.status);
    if (options.priority) params.set('priority', options.priority);
    if (options.archived !== undefined) params.set('archived', String(options.archived));

    const response = await fetch(`${API_BASE}/prompts?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch prompts');
    }
    return response.json();
}

export async function getPrompt(id: string): Promise<PromptEntity> {
    const response = await fetch(`${API_BASE}/prompts/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch prompt');
    }
    return response.json();
}

export async function createPrompt(data: Partial<PromptEntity>): Promise<PromptEntity> {
    const response = await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create prompt');
    }
    return response.json();
}

export async function updatePrompt(id: string, data: Partial<PromptEntity>): Promise<PromptEntity> {
    const response = await fetch(`${API_BASE}/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update prompt');
    }
    return response.json();
}

export async function deletePrompt(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/prompts/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete prompt');
    }
}
