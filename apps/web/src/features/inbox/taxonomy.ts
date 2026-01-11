
export const PROJECT_TYPES = [
    { value: 'PRESALES', label: '售前/提案' },
    { value: 'DELIVERY', label: '交付/導入' },
    { value: 'INTERNAL_PRODUCT', label: '內部產品' },
    { value: 'AUTOMATION', label: '自動化' },
    { value: 'TEST_QA', label: '測試/QA' },
    { value: 'TRAINING', label: '教育訓練' },
    { value: 'RESEARCH', label: '研究/探索' },
    { value: 'OTHER', label: '其他' },
];

export const PROJECT_STATUSES = [
    { value: 'ACTIVE', label: '進行中' },
    { value: 'PAUSED', label: '暫停' },
    { value: 'ARCHIVED', label: '已封存' },
];

export const CATEGORIES = [
    { value: '#Cat/PROMPT_DRAFT', label: '提示詞撰寫' },
    { value: '#Cat/PROMPT_REVIEW', label: '提示詞審閱' },
    { value: '#Cat/PROMPT_TEST', label: '提示詞測試' },
    { value: '#Cat/PROMPT_REFACTOR', label: '提示詞重構' },
    { value: '#Cat/KNOWLEDGE_PACK', label: '知識庫整理' },
    { value: '#Cat/OUTPUT_DRAFT', label: '產出物生成' },
    { value: '#Cat/INTEGRATION', label: '工具整合' },
    { value: '#Cat/RETROSPECTIVE', label: '回顧/決策' },
];

export const TAG_GROUPS = {
    Stage: [
        { value: '#Stage/IDEA', label: '構想' },
        { value: '#Stage/DRAFT', label: '草稿' },
        { value: '#Stage/RUN', label: '已執行' },
        { value: '#Stage/EVAL', label: '評估中' },
        { value: '#Stage/ITERATE', label: '迭代中' },
        { value: '#Stage/FINAL', label: '定稿' },
        { value: '#Stage/DEPRECATED', label: '淘汰' },
    ],
    Platform: [
        { value: '#Plat/CHATGPT', label: 'ChatGPT' },
        { value: '#Plat/GEMINI', label: 'Gemini' },
        { value: '#Plat/CLAUDE', label: 'Claude' },
        { value: '#Plat/COPILOT', label: 'Copilot' },
        { value: '#Plat/CODEX', label: 'Codex' },
        { value: '#Plat/N8N', label: 'n8n' },
        { value: '#Plat/POWER_PLATFORM', label: 'Power Platform' },
    ],
    Output: [
        { value: '#Out/MD', label: 'Markdown' },
        { value: '#Out/PPTX', label: 'PPT' },
        { value: '#Out/PDF', label: 'PDF' },
        { value: '#Out/MERMAID', label: 'Mermaid' },
        { value: '#Out/JSON', label: 'JSON' },
        { value: '#Out/XLSX', label: 'Excel' },
        { value: '#Out/CODE', label: 'Code' },
        { value: '#Out/SCRIPT', label: '逐字稿' },
    ],
    Audience: [
        { value: '#Aud/CLIENT', label: '客戶' },
        { value: '#Aud/MANAGER', label: '主管' },
        { value: '#Aud/INTERNAL', label: '內部' },
        { value: '#Aud/TRAINING', label: '學員' },
    ],
    Common: [
        { value: '#reusable', label: '可重用' },
        { value: '#need_confirm', label: '待確認' },
        { value: '#decision', label: '關鍵決策' },
        { value: '#blocked', label: '卡關' },
        { value: '#good_result', label: '效果佳' },
        { value: '#need_rework', label: '需重作' },
        { value: '#sensitive', label: '敏感' },
    ],
};

export const ALL_TAGS = Object.values(TAG_GROUPS).flat();
