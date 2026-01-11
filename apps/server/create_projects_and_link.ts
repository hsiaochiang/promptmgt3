
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Project Definitions
const PROJECTS = [
    { id: 'prompt-mgt-system', name: '提示詞管理系統', type: 'INTERNAL_PRODUCT', status: 'ACTIVE' },
    { id: 'speckit-platform', name: 'Speckit 規格開發', type: 'INTERNAL_PRODUCT', status: 'ACTIVE' },
    { id: 'wos-frontend', name: 'WOS 前端與設計', type: 'INTERNAL_PRODUCT', status: 'ACTIVE' },
    { id: 'fin-inquiry-bot', name: '企業資金詢價機器人', type: 'DELIVERY', status: 'ACTIVE' },
    { id: 'cloud-orange-rfp', name: '雲橘工作說明書', type: 'PRESALES', status: 'ACTIVE' },
    { id: 'gov-rfp-helper', name: '政府機關 RFP 助手', type: 'PRESALES', status: 'ACTIVE' },
    { id: 'file-search-automation', name: '檔案查找與轉換流程', type: 'AUTOMATION', status: 'ACTIVE' },
    { id: 'hackmd-automation', name: 'HackMD 自動化', type: 'AUTOMATION', status: 'ACTIVE' },
    { id: 'code-best-practices', name: '程式開發最佳實踐', type: 'TRAINING', status: 'ACTIVE' },
    { id: 'gen-ai-guidelines', name: 'GenAI 應用指南', type: 'TRAINING', status: 'ACTIVE' },
    { id: 'biz-operations', name: '業務與會議', type: 'OTHER', status: 'ACTIVE' },
    { id: 'personal-notes', name: '個人筆記/雜項', type: 'OTHER', status: 'ACTIVE' },
];

// Mapping Rules (Title Keyword -> Project ID)
const MAPPINGS = [
    { keyword: '提示詞管理系統', projectId: 'prompt-mgt-system' },
    { keyword: '提示詞模板生成', projectId: 'prompt-mgt-system' },
    { keyword: 'Speckit', projectId: 'speckit-platform' },
    { keyword: 'SDD架構師', projectId: 'speckit-platform' },
    { keyword: 'Notion 設計應用分析', projectId: 'wos-frontend' },
    { keyword: 'React Canvas', projectId: 'wos-frontend' },
    { keyword: 'React網站雛形', projectId: 'wos-frontend' },
    { keyword: '前端風格', projectId: 'wos-frontend' },
    { keyword: '前端設計', projectId: 'wos-frontend' },
    { keyword: '企業資金詢價', projectId: 'fin-inquiry-bot' },
    { keyword: '玉山資訊', projectId: 'fin-inquiry-bot' },
    { keyword: '雲橘', projectId: 'cloud-orange-rfp' },
    { keyword: 'RFP', projectId: 'gov-rfp-helper' },
    { keyword: '檔案查找', projectId: 'file-search-automation' },
    { keyword: 'Markdown 轉換', projectId: 'file-search-automation' },
    { keyword: '檔案轉換', projectId: 'file-search-automation' },
    { keyword: '黑白差距', projectId: 'file-search-automation' },
    { keyword: 'HackMD', projectId: 'hackmd-automation' },
    { keyword: 'Git 教學', projectId: 'code-best-practices' },
    { keyword: 'DDD Coding', projectId: 'code-best-practices' },
    { keyword: '系統重構', projectId: 'code-best-practices' },
    { keyword: '資訊單位需求', projectId: 'code-best-practices' },
    { keyword: 'Shadow IT', projectId: 'code-best-practices' },
    { keyword: 'Copilot Chat', projectId: 'gen-ai-guidelines' },
    { keyword: 'Gemini', projectId: 'gen-ai-guidelines' },
    { keyword: '自訂GPT', projectId: 'gen-ai-guidelines' },
    { keyword: '業務拜訪', projectId: 'biz-operations' },
    { keyword: '會議邀請', projectId: 'biz-operations' },
    { keyword: '合約修改', projectId: 'biz-operations' },
    { keyword: '翻譯成中文', projectId: 'personal-notes' },
    { keyword: 'New chat', projectId: 'personal-notes' },
    { keyword: 'tttt', projectId: 'personal-notes' },
    { keyword: 'Inbox Test', projectId: 'personal-notes' },
    { keyword: '茶葉', projectId: 'personal-notes' }, // Extra one found in titles
    { keyword: 'Power Automate', projectId: 'hackmd-automation' }, // Re-mapped based on type
    { keyword: '資料儲存', projectId: 'code-best-practices' },
    { keyword: '聊天分類', projectId: 'prompt-mgt-system' },
    { keyword: 'Excel', projectId: 'personal-notes' }
];

async function main() {
    const rootPath = 'd:\\program\\promptmgt3\\apps\\server\\data';
    const projectsDir = path.join(rootPath, 'projects');
    const inboxDir = path.join(rootPath, 'inbox');

    // 1. Create Projects
    console.log('--- Creating Projects ---');
    for (const proj of PROJECTS) {
        const projDir = path.join(projectsDir, proj.id);
        const projFile = path.join(projDir, 'project.md');

        await fs.mkdir(projDir, { recursive: true });

        // Check if exists
        try {
            await fs.access(projFile);
            console.log(`Project exists: ${proj.id}`);
        } catch {
            const content = `---
id: ${proj.id}
name: ${proj.name}
type: ${proj.type}
status: ${proj.status}
description: Auto-created by Antigravity
createdAt: '${new Date().toISOString()}'
updatedAt: '${new Date().toISOString()}'
---
# ${proj.name}

Auto-created project by Antigravity clustering.
`;
            await fs.writeFile(projFile, content, 'utf-8');
            console.log(`Created project: ${proj.id}`);
        }
    }

    // 2. Link Inbox Items
    console.log('\n--- Linking Inbox Items ---');
    const files = await fs.readdir(inboxDir);
    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(inboxDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Find matching project
        const title = data.title || '';
        let targetProject = PROJECTS.find(p => p.id === 'personal-notes')!; // Default

        for (const m of MAPPINGS) {
            if (title.includes(m.keyword)) {
                const found = PROJECTS.find(p => p.id === m.projectId);
                if (found) {
                    targetProject = found;
                    break;
                }
            }
        }

        // Update Frontmatter
        // We strictly use the Project ID string now, as discussed with user "Assign to Project"
        // BUT current UI/Contracts might expect "Project Type" or require schema change?
        // User said: "You need to create project data to classify prompts into projects"
        // So `project` field should be the Project ID.
        // However, the `InboxItemFrontmatterSchema` in `contracts` defines `project` as string (or object in my fix).
        // Let's use the Project ID string. 

        const newFrontmatter = {
            ...data,
            project: targetProject.id, // Linking to the ID
            // We can also add type if needed, but let's stick to ID
        };

        // Fix existing fields if they were object
        if (typeof newFrontmatter.project === 'object') {
            // already handled by previous fix, but good to be safe
        }

        const newContent = matter.stringify(content, newFrontmatter);
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`Updated ${file} -> ${targetProject.id} (${targetProject.name})`);
    }
}

main().catch(console.error);
