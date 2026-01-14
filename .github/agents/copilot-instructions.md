# promptmgt3 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-04

## Active Technologies
- TypeScript（strict）+ Node.js 20 LTS (001-prompt-asset-hub)
- 檔案系統（`<rootPath>` + `<attachmentPath>` + `<rootPath>/.pah/*`） (001-prompt-asset-hub)
- 檔案系統（`<rootPath>`、`<attachmentPath>`、`<rootPath>/.pah/*`） (001-prompt-asset-hub)
- TypeScript 5.3（Node.js 20 LTS）、React 18 (001-prompt-asset-hub)
- 檔案系統（Markdown + frontmatter + 附件目錄），內部資料置於 `<rootPath>/.pah/`（workspace settings、trash、cache、events） (001-prompt-asset-hub)

- TypeScript 5.x（前後端共用），Node.js 20 LTS + Frontend：React 18、Vite 5、Tailwind 3、CodeMirror 6；Backend：Fastify 4、ws、chokidar、gray-matter、zod、simple-git；Shared：nanoid/uuid、date-fns (001-prompt-asset-hub)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x（前後端共用），Node.js 20 LTS: Follow standard conventions

## Recent Changes
- 001-prompt-asset-hub: Added TypeScript 5.3（Node.js 20 LTS）、React 18
- 001-prompt-asset-hub: Added TypeScript 5.3（Node.js 20 LTS）、React 18
- 001-prompt-asset-hub: Added TypeScript（strict）+ Node.js 20 LTS


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- Added by Copilot: Wilson classification rules summary -->
## Wilson 分類規則（摘要）

以下為從已分類提示詞樣本（初次 52 筆）歸納出的初版規則摘要，供 Copilot Chat / 分類建議使用：

- 規則 #001（HIGH）：標題/內容含「業務、客戶、拜訪、商機、會議」 → biz-operations
- 規則 #002（HIGH）：含 Git、DDD、程式碼、架構、教學 → code-best-practices
- 規則 #003（HIGH）：含前端、UI、UX、React、style、Notion → wos-frontend
- 規則 #004（HIGH）：含 RFP、標案、招標、政府機關 → gov-rfp-helper
- 規則 #005（MEDIUM-HIGH）：含 Gemini/Copilot/GPT 或平台整合 → gen-ai-guidelines
- 規則 #006（MEDIUM）：含檔案轉換、流程自動化、Power Automate → file-search-automation / hackmd-automation
- 規則 #007（MEDIUM）：個人備註 / Web clip / 翻譯 → personal-notes
- 規則 #008（MEDIUM-HIGH）：銀行、資金、詢價 → fin-inquiry-bot

參考完整規則與案例：knowledge-base/patterns/wilson-classification-rules.md

