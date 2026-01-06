import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'node:crypto';
import { scanWorkspace } from '../apps/server/src/indexing/index.ts';

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pah-debug-'));
const root = path.join(tmp, 'small');
const projectsDir = path.join(root, 'projects');
await fs.mkdir(projectsDir, { recursive: true });

const projectId = crypto.randomUUID();
const projectSlug = 'test-project-1';
const projectDir = path.join(projectsDir, projectSlug);
await fs.mkdir(projectDir, { recursive: true });

const now = new Date().toISOString();
const projectContent = `---
id: ${projectId}
slug: ${projectSlug}
title: Test Project
createdAt: "${now}"
updatedAt: "${now}"
status: in-progress
---

# Body
`;

await fs.writeFile(path.join(projectDir, 'project.md'), projectContent, 'utf-8');

const result = await scanWorkspace(root);
console.log({
  root,
  projects: result.projects.length,
  prompts: result.prompts.length,
  errors: result.errors.slice(0, 5),
});
