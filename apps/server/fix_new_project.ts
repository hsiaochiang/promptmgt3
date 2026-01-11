
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

async function main() {
    const rootPath = 'd:\\program\\promptmgt3\\apps\\server\\data\\projects';
    const slug = 'new-project';
    const filePath = path.join(rootPath, slug, 'project.md');

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: body } = matter(content);

        if (data.status === 'planning') {
            console.log(`Fixing status for ${slug}...`);
            const newData = { ...data, status: 'planned' };
            const newContent = matter.stringify(body, newData);
            await fs.writeFile(filePath, newContent, 'utf-8');
        }
    } catch (e) {
        console.log('New Project not found or error', e);
    }
}

main().catch(console.error);
