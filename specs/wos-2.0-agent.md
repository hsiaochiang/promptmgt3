# WOS 2.0 Specification: The Processor (Agent Layer)

> **Core Philosophy**: 從「囤積資訊」進化為「提煉意義」。讓 LLM 成為您的數位圖書館員。

## 1. 願景 (Vision)

WOS 2.0 的目標是引入 **主動式智能 (Active Intelligence)**。
系統不再被動等待使用者整理 Inbox，而是主動分析內容、識別意圖、並建議結構。

## 2. 核心功能 (Core Features)

### 2.1 意義編碼 (Sense-making)
Agent 將對 Inbox 中的每個項目進行分析，產出以下 metadata：
- **L1 Intent (意圖)**: 這則筆記是為了什麼？(e.g., `Learning`, `Building`, `Solving`, `Resting`)
- **L2 Structure (結構)**: 它屬於什麼框架？(e.g., `Concept`, `Snippet`, `Tutorial`, `Reference`)
- **Summary**: 一句話摘要。

### 2.2 歸檔建議 (Promotion Suggestion)
Agent 判斷該項目應去往何處：
- **New Project**: 偵測到全新的主題或專案。
- **Existing Project**: 關聯到既有的專案 (透過向量相似度或是關鍵字)。
- **Prompt**:這是一段可以直接使用的提示詞。

### 2.3 代理人介面 (Agent UI)
- **Inbox Analysis Panel**: 在 Inbox 詳情頁右側顯示 Agent 的分析結果。
- **"Auto-Organize" Button**: 一鍵執行全量分析。

## 3. 架構設計 (Architecture)

```text
[Inbox Item] --(Trigger)--> [AgentService] --(API)--> [LLM Brain]
                                  ^                      |
                                  |-------(Analysis)-----|
                                  |
                                  v
                            [InboxStore] --(Read)--> [UI] --(Approve)--> [Project/Prompt Store]
```

### [Antigravity] The Agent Interface (Conversational UI)
Instead of building a custom GUI, we leverage the **Antigravity AI Assistant** (the current chat interface) as the primary operator.

#### [Workflow] Antigravity Protocol
- **Trigger**: User asks "Organize Inbox" or "Check new items" in the Chat.
- **Process**:
    1.  Antigravity scans `apps/server/data/inbox`.
    2.  Antigravity reads the content and performs "Sense-making" (Intent/Tags) using its internal LLM capabilities.
    3.  Antigravity presents a "Plan" in the chat (e.g., "I found 5 items. Item A looks like a React Tutorial...").
    4.  **Action**: User approves via chat ("Proceed", "Change tag X to Y").
    5.  Antigravity edits the files directly (writing frontmatter, moving files).

#### [MODIFY] [apps/server]
- **Role Shift**: The Server focuses solely on **Ingestion** (receiving data from Chrome Extension).
- it DOES NOT need to implement the LLM Provider/AgentService, as Antigravity *is* the Intelligence.

## Verification Plan

### Manual Verification
1.  **Ingest**: Use Chrome Extension to save a page -> Server saves to `inbox/`.
2.  **Organize**:
    - User: "@Antigravity Organize Inbox"
    - Antigravity: "I see 1 new item: [Title]. Suggested Tags: [#coding]. Move to [Project A]? (y/n)"
3.  **Execute**:
    - User: "y"
    - Antigravity: Updates file headers and moves file.
