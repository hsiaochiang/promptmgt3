import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { registerProjectRoutes } from '../../apps/server/src/routes/entities';
import { writeProjectFile } from '../../apps/server/src/indexing';
import { ProjectEntity } from '@pah/contracts';

const TEST_ROOT = path.join(process.cwd(), 'temp-test-archive-filter');

describe('Integration: API Archived Filter', () => {
    let server: FastifyInstance;

    beforeEach(async () => {
        // Setup clean test directory
        await fs.mkdir(TEST_ROOT, { recursive: true });

        // Setup server
        server = Fastify();
        await registerProjectRoutes(server as any, TEST_ROOT);
    });

    afterEach(async () => {
        await server.close();
        await fs.rm(TEST_ROOT, { recursive: true, force: true });
    });

    it('should filter projects by archived status', async () => {
        // 1. Create one active project
        const activeProject: ProjectEntity = {
            id: '123e4567-e89b-12d3-a456-426614174001',
            slug: 'active-p',
            title: 'Active Project',
            summary: 'Active',
            status: 'planned',
            type: '',
            tags: [],
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            body: 'Active'
        };
        await writeProjectFile(path.join(TEST_ROOT, 'projects', activeProject.slug, 'project.md'), activeProject);

        // 2. Create one archived project
        const archivedProject: ProjectEntity = {
            id: '123e4567-e89b-12d3-a456-426614174002',
            slug: 'archived-p',
            title: 'Archived Project',
            summary: 'Archived',
            status: 'planned',
            type: '',
            tags: [],
            archived: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            body: 'Archived'
        };
        await writeProjectFile(path.join(TEST_ROOT, 'projects', archivedProject.slug, 'project.md'), archivedProject);

        // 3. Test Default (no param) -> Expect ONLY Active
        const resDefault = await server.inject({
            method: 'GET',
            url: '/api/projects'
        });
        expect(resDefault.statusCode).toBe(200);
        const defaultList = resDefault.json<ProjectEntity[]>();
        console.log('DEBUG: defaultList length:', defaultList.length);
        console.log('DEBUG: defaultList items:', JSON.stringify(defaultList, null, 2));
        expect(defaultList).toHaveLength(1);
        expect(defaultList[0].id).toBe('123e4567-e89b-12d3-a456-426614174001');

        // 4. Test archived=false -> Expect ONLY Active
        const resFalse = await server.inject({
            method: 'GET',
            url: '/api/projects?archived=false'
        });
        const falseList = resFalse.json<ProjectEntity[]>();
        expect(falseList).toHaveLength(1);
        expect(falseList[0].id).toBe('123e4567-e89b-12d3-a456-426614174001');

        // 5. Test archived=true -> Expect ONLY Archived
        const resTrue = await server.inject({
            method: 'GET',
            url: '/api/projects?archived=true'
        });
        const trueList = resTrue.json<ProjectEntity[]>();
        expect(trueList).toHaveLength(1);
        expect(trueList[0].id).toBe('123e4567-e89b-12d3-a456-426614174002');
    });
});
