/**
 * Mock Data for Visual Prototype Comparison
 * 用於視覺原型比對的範例資料
 */

import type { PromptEntity, InboxItemEntity, TrashItem, WorkspaceSettings } from '@pah/contracts';

export const MOCK_PROMPTS: PromptEntity[] = [
  {
    id: 'pr1',
    slug: 'customer-sentiment-analysis',
    projectId: 'proj-ai-cs',
    title: '客服情緒分析',
    body: `# 角色設定
你是一位資深的客戶服務專家，擅長情緒分析。

# 任務
分析以下客戶對話的情緒極性，並給出 1-5 分的評分。

# 輸出格式
- 分數: <score>
- 原因: <reason>`,
    status: 'ready',
    tags: ['Analysis', 'Customer Service', 'Sentiment'],
    priority: 'high',
    sourceLink: 'https://chatgpt.com/share/xxxx-xxxx',
    notes: '測試結果：對於諷刺語氣的辨識度在 GPT-4 上表現最好。',
    archived: false,
    attachments: [],
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T15:30:00Z',
  },
  {
    id: 'pr2',
    slug: 'auto-reply-refund',
    projectId: 'proj-ai-cs',
    title: '自動回覆生成 - 退貨',
    body: `# 任務
根據公司的退貨政策，生成一封委婉但堅定的拒絕退貨信件。

# 限制
語氣必須保持禮貌。

# 範例輸出
親愛的客戶您好，

感謝您的來信。我們理解您的需求...`,
    status: 'draft',
    tags: ['Generation', 'Customer Service'],
    priority: 'high',
    sourceLink: '',
    notes: '還需要調整語氣，目前太過生硬。',
    archived: false,
    attachments: [],
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T16:20:00Z',
  },
  {
    id: 'pr3',
    slug: 'instagram-post-gen',
    projectId: 'proj-marketing-q1',
    title: 'Instagram 貼文生成',
    body: `# 平台
Instagram

# 風格
輕鬆、活潑、多用 emoji。

# 範例
🌟 新品上市！這個夏天最 chill 的單品終於來了 ✨
快來看看 👀`,
    status: 'ready',
    tags: ['Social Media', 'Marketing', 'Instagram'],
    priority: 'high',
    sourceLink: '',
    notes: '',
    archived: false,
    attachments: [],
    createdAt: '2023-12-30T14:00:00Z',
    updatedAt: '2023-12-30T18:45:00Z',
  },
  {
    id: 'pr4',
    slug: 'email-campaign-template',
    projectId: 'proj-marketing-q1',
    title: 'EDM 行銷模板',
    body: `# 目標受眾
25-40 歲專業人士

# 語氣
專業但友善

# 結構
- 主旨行
- 開場
- 價值主張
- CTA`,
    status: 'needs_review',
    tags: ['Email', 'Marketing', 'Template'],
    priority: 'high',
    sourceLink: '',
    notes: '需要 A/B 測試不同主旨行',
    archived: false,
    attachments: [],
    createdAt: '2024-01-03T08:00:00Z',
    updatedAt: '2024-01-03T11:15:00Z',
  },
  {
    id: 'pr5',
    slug: 'legacy-summary-prompt',
    projectId: 'proj-legacy',
    title: '舊版摘要提示詞',
    body: '這是舊的摘要提示詞，僅供參考。',
    status: 'deprecated',
    tags: ['Legacy'],
    priority: 'low',
    sourceLink: '',
    notes: '',
    archived: false,
    attachments: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'pr6',
    slug: 'code-review-assistant',
    projectId: 'proj-internal',
    title: 'Code Review 助手',
    body: `# 角色
你是一位資深的程式碼審查專家。

# 任務
檢查以下程式碼並提供建議：
1. 程式碼品質
2. 安全性問題
3. 效能優化機會`,
    status: 'ready',
    tags: ['Code Review', 'Development', 'Internal'],
    priority: 'high',
    sourceLink: '',
    notes: '',
    archived: false,
    attachments: [],
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-04T14:20:00Z',
  },
  {
    id: 'pr7',
    slug: 'meeting-notes-formatter',
    projectId: 'proj-internal',
    title: '會議記錄格式化',
    body: `# 輸入
會議語音轉文字稿

# 輸出格式
## 會議摘要
## 決議事項
## 行動項目
## 下次會議時間`,
    status: 'draft',
    tags: ['Productivity', 'Meeting', 'Internal'],
    priority: 'low',
    sourceLink: '',
    notes: '考慮整合 Whisper API',
    archived: false,
    attachments: [],
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-05T10:30:00Z',
  },
  {
    id: 'pr8',
    slug: 'product-description-gen',
    projectId: 'proj-marketing-q1',
    title: '商品描述生成器',
    body: `# 輸入參數
- 商品名稱
- 主要特色
- 目標族群

# 輸出要求
- 吸引人的標題
- 100 字精簡描述
- 3 個關鍵賣點`,
    status: 'needs_review',
    tags: ['E-commerce', 'Marketing', 'Product'],
    priority: 'high',
    sourceLink: '',
    notes: '',
    archived: false,
    attachments: [],
    createdAt: '2024-01-02T13:00:00Z',
    updatedAt: '2024-01-02T17:00:00Z',
  },
];

export const MOCK_INBOX_ITEMS: InboxItemEntity[] = [
  {
    id: 'in1',
    title: 'ChatGPT 分享連結 - 企劃書生成',
    rawContent: `# 企劃書生成器

請根據以下資訊生成一份完整的企劃書：

## 專案名稱
AI 驅動的客服自動化系統

## 目標
減少 30% 的客服人力成本，同時提升客戶滿意度。

## 預期成果
- 自動回覆常見問題
- 情緒分析與優先級排序
- 無縫轉接人工客服`,
    notes: '這個看起來不錯，可能需要拆成多個提示詞',
    importedAt: '2024-01-06T08:30:00Z',
    cleanedState: 'unprocessed',
    suggestedTags: ['AI', 'Customer Service'],
    sourcePlatform: 'chatgpt',
    sourceLink: 'https://chatgpt.com/share/xxxxx',
  },
  {
    id: 'in2',
    title: '從文件匯入 - 社群媒體排程策略',
    rawContent: `社群媒體發文排程最佳實務：

1. 發文時間：
   - Facebook: 週三 11:00-13:00
   - Instagram: 週四 19:00-21:00
   - LinkedIn: 週二 10:00-12:00

2. 內容類型輪替：
   - 週一：產品介紹
   - 週三：客戶見證
   - 週五：產業資訊

3. Hashtag 策略：
   - 3-5 個相關標籤
   - 避免過度使用熱門標籤`,
    notes: '需要整理成提示詞模板',
    importedAt: '2024-01-06T09:15:00Z',
    cleanedState: 'unprocessed',
    suggestedTags: ['Social Media', 'Marketing'],
    sourcePlatform: 'file',
  },
  {
    id: 'in3',
    title: 'Notion 複製 - UX Writing 指南',
    rawContent: `UX Writing 核心原則：

1. 清晰 (Clear)
   - 使用簡單直白的語言
   - 避免行業術語
   
2. 簡潔 (Concise)
   - 每句話不超過 20 字
   - 移除冗詞贅字
   
3. 一致 (Consistent)
   - 統一用語
   - 統一語氣

範例：
❌ "點擊此處以繼續進行下一步驟"
✅ "繼續"`,
    notes: '可以做成 prompt snippet',
    importedAt: '2024-01-06T10:00:00Z',
    cleanedState: 'unprocessed',
    suggestedTags: ['UX', 'Writing'],
    sourcePlatform: 'notion',
  },
  {
    id: 'in4',
    title: 'Email 轉存 - SEO 文案框架',
    rawContent: `Hi Team,

這是我整理的 SEO 文案撰寫框架：

標題優化：
- 包含主要關鍵字
- 不超過 60 個字元
- 使用數字或問句增加點擊率

內文結構：
- H1: 主標題（唯一）
- H2: 段落標題（3-5 個）
- H3: 小節標題

Meta Description:
- 140-160 字元
- 包含主要關鍵字和 CTA

Best,
Alice`,
    notes: '整理成結構化提示詞',
    importedAt: '2024-01-06T11:20:00Z',
    cleanedState: 'unprocessed',
    suggestedTags: ['SEO', 'Content'],
    sourcePlatform: 'email',
  },
  {
    id: 'in5',
    title: '待處理 - API 文件自動生成',
    rawContent: `根據以下 OpenAPI schema 生成使用者友善的 API 文件：

輸出格式：
# API 端點名稱

## 用途說明
簡短描述這個 API 的功能

## 請求範例
\`\`\`bash
curl -X POST https://api.example.com/v1/endpoint
\`\`\`

## 參數說明
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|

## 回應範例
\`\`\`json
{
  "status": "success"
}
\`\`\``,
    notes: '',
    importedAt: '2024-01-06T12:00:00Z',
    cleanedState: 'unprocessed',
    suggestedTags: ['API', 'Documentation'],
  },
];

export const MOCK_TRASH_ITEMS: TrashItem[] = [
  {
    trashId: 't1',
    entityType: 'prompt',
    entityId: 'pr_deleted_1',
    titleSnapshot: '已刪除的客戶滿意度調查提示詞',
    originalRelativePath: 'ai-customer-service/customer-satisfaction-survey.md',
    attachmentsMoved: false,
    deletedAt: '2024-01-05T14:30:00Z',
    purgeAfter: '2024-02-04T14:30:00Z',
  },
  {
    trashId: 't2',
    entityType: 'project',
    entityId: 'proj_deleted_1',
    titleSnapshot: '2023 Q4 行銷活動（已廢棄）',
    originalRelativePath: 'marketing-2023q4',
    attachmentsMoved: true,
    deletedAt: '2024-01-04T09:15:00Z',
    purgeAfter: '2024-02-03T09:15:00Z',
  },
  {
    trashId: 't3',
    entityType: 'inboxItem',
    entityId: 'in_deleted_1',
    titleSnapshot: '待處理：舊版 SEO 策略',
    originalRelativePath: '.inbox/in_deleted_1.md',
    attachmentsMoved: false,
    deletedAt: '2024-01-03T16:45:00Z',
    purgeAfter: '2024-02-02T16:45:00Z',
  },
  {
    trashId: 't4',
    entityType: 'prompt',
    entityId: 'pr_deleted_2',
    titleSnapshot: '圖片生成 - Midjourney v5',
    originalRelativePath: 'legacy-kb/midjourney-prompts.md',
    attachmentsMoved: false,
    deletedAt: '2024-01-06T08:00:00Z',
    purgeAfter: '2024-02-05T08:00:00Z',
  },
];

interface VersionEvent {
  id: string;
  type: 'snapshot' | 'version-node';
  scope: 'workspace' | 'project' | 'prompt';
  message?: string;
  createdAt: string;
  snapshotPath: string;
}

export const MOCK_SNAPSHOTS: VersionEvent[] = [
  {
    id: 'snap_20240106_0300',
    type: 'snapshot',
    scope: 'workspace',
    message: '每日自動快照',
    createdAt: '2024-01-06T03:00:00Z',
    snapshotPath: 'd:\\data\\.pah\\snapshots\\2024-01-06_030000_workspace',
  },
  {
    id: 'snap_20240105_0300',
    type: 'snapshot',
    scope: 'workspace',
    message: '每日自動快照',
    createdAt: '2024-01-05T03:00:00Z',
    snapshotPath: 'd:\\data\\.pah\\snapshots\\2024-01-05_030000_workspace',
  },
  {
    id: 'snap_manual_20240104',
    type: 'snapshot',
    scope: 'workspace',
    message: '重大更新前手動備份',
    createdAt: '2024-01-04T15:30:00Z',
    snapshotPath: 'd:\\data\\.pah\\snapshots\\2024-01-04_153000_manual',
  },
];

export const MOCK_ARCHIVED_PROMPTS: PromptEntity[] = [
  {
    id: 'pr99',
    slug: '2023-year-end-summary',
    projectId: 'proj-legacy',
    title: '2023 年度總結提示詞',
    body: '舊版資料,僅供參考。',
    status: 'deprecated',
    tags: ['Archive', 'Legacy'],
    priority: 'low',
    sourceLink: '',
    notes: '',
    archived: true,
    attachments: [],
    createdAt: '2023-12-31T00:00:00Z',
    updatedAt: '2023-12-31T00:00:00Z',
  },
];

export const MOCK_VERSIONS: VersionEvent[] = [
  {
    id: 'ver_pr1_20240102',
    type: 'version-node',
    scope: 'prompt',
    message: '完成情緒分析提示詞初版',
    createdAt: '2024-01-02T15:30:00Z',
    snapshotPath: 'd:\\data\\.pah\\versions\\prompts\\customer-sentiment-analysis\\20240102_153000',
  },
  {
    id: 'ver_pr1_20240103',
    type: 'version-node',
    scope: 'prompt',
    message: '優化諷刺語氣辨識',
    createdAt: '2024-01-03T10:00:00Z',
    snapshotPath: 'd:\\data\\.pah\\versions\\prompts\\customer-sentiment-analysis\\20240103_100000',
  },
  {
    id: 'ver_pr3_20231230',
    type: 'version-node',
    scope: 'prompt',
    message: 'Instagram 貼文模板定稿',
    createdAt: '2023-12-30T18:45:00Z',
    snapshotPath: 'd:\\data\\.pah\\versions\\prompts\\instagram-post-gen\\20231230_184500',
  },
];

export const MOCK_SETTINGS: WorkspaceSettings = {
  rootPath: 'd:\\data\\prompts',
  attachmentPath: 'd:\\data\\attachments',
  tagsDict: {
    platform: ['Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok'],
    deliverable: ['Blog Post', 'Social Media', 'Email', 'Documentation', 'Presentation'],
    audience: ['Developer', 'Marketer', 'Customer', 'Internal Team', 'Executive'],
    common: ['RAG', 'Analysis', 'Generation', 'Translation', 'Summarization'],
  },
  commonOptions: {
    models: [
      'GPT-4o',
      'GPT-4 Turbo',
      'Claude 3.5 Sonnet',
      'Claude 3 Opus',
      'Gemini 1.5 Pro',
      'Gemini 1.5 Flash',
      'Llama 3',
      'Other',
    ],
    sources: [
      'ChatGPT Share Link',
      'Claude Project',
      'Notion',
      'File Import',
      'Email',
      'Manual Entry',
    ],
  },
  backup: {
    dailySnapshot: true,
    schedule: '03:00',
    remote: '',
  },
  trashRetentionDays: 30,
  updatedAt: '2024-01-06T00:00:00Z',
};

