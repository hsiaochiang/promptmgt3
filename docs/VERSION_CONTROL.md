# WOS PromptMgt 版本控管策略

> **目的**: 確保程式碼與資料的版本可追溯。
> **適用**: 開發期 + 上線後

---

## 一、程式碼版控 (當前階段)

### 使用工具: Git

### 分支策略 (簡化版)
```
main (穩定版)
  └── dev (開發分支，當前工作分支)
```

**規則**:
- 日常開發都在 `dev` 分支
- 每週或每個小功能完成後，合併回 `main`
- 不需要 feature 分支 (單人開發)

### Commit Message 規範
```
<type>: <summary>

Examples:
- feat: 新增 Tag Cloud UI
- fix: 修正搜尋無法找到中文的問題
- docs: 更新 WOS_TAXONOMY.md
- refactor: 簡化 Roadmap，移除 Phase 2-4
```

**Type 選項**:
- `feat`: 新功能
- `fix`: 修 Bug
- `docs`: 文件更新
- `refactor`: 重構 (不改功能)
- `test`: 測試相關
- `chore`: 雜項 (依賴更新、設定調整)

### 每日/每週 Commit 建議
- **Day 1**: `docs: create 30 Day Experiment framework`
- **Week 1**: `feat: manual tagging for 10 inbox items`
- **Week 2**: `feat: basic search functionality`

---

## 二、資料版控 (上線後)

### 問題: 提示詞文件 (`.md`) 也需要版控嗎？

**答案: 是的，而且已經在做了。**

### 當前狀態
所有 Inbox/Projects/Prompts 的 `.md` 檔案都在 `apps/server/data/` 底下，**已納入 Git 版控**。

### 資料變更流程
```
1. 使用者編輯 Inbox Item (加 Tag)
   ↓
2. Server 寫入 `.md` 檔案
   ↓
3. Git 偵測到檔案變更
   ↓
4. 使用者 Commit (手動或自動)
```

### 建議: 每週 Commit 一次資料變更
```powershell
# 查看變更
git status

# 加入所有資料檔案
git add apps/server/data/

# Commit
git commit -m "data: Week 1 - tagged 10 inbox items"
```

---

## 三、版控最佳實務 (30 天實驗期)

### Week 1 (2026-01-11 ~ 01-17)
- [ ] **Day 1**: Commit 實驗框架文件
- [ ] **Day 7**: Commit 本週手動標籤的資料

### Week 2-4
- [ ] 每週日晚上: Commit 本週資料變更
- [ ] 若有程式碼調整: 隨時 Commit

### Commit 範例
```bash
# 文件類
git add docs/
git commit -m "docs: update 30 Day Experiment Week 1 review"

# 資料類
git add apps/server/data/inbox/
git commit -m "data: tagged 15 items with #Cat and #Stage tags"

# 程式碼類
git add apps/web/
git commit -m "feat: add tag filter in Inbox view"
```

---

## 四、進階: 自動化 Commit (未來考慮)

### Option A: Pre-commit Hook
在每次手動存檔後，自動 commit data/ 變更。

### Option B: 每日自動備份
用 GitHub Actions 或 cron job 每天自動 commit。

**建議**: 30 天實驗期「手動 commit」就好，不要過度自動化。

---

## 五、.gitignore 檢查

確保以下內容**不會被**版控：
```gitignore
# Node
node_modules/
dist/
*.log

# OS
.DS_Store
Thumbs.db

# 測試輸出 (已在 .gitignore)
test_output*.txt
coverage/

# 敏感資訊 (若未來有 API Key)
.env
.env.local
```

**資料檔案 (`.md`) 應該被版控**，所以不要加進 `.gitignore`。

---

## 六、版控檢查清單

### 每天
- [ ] 有改程式碼? → Commit
- [ ] 有改文件? → Commit

### 每週日 (與 30 Day Experiment 一起)
- [ ] 填寫實驗檢查表
- [ ] Commit 本週資料變更
- [ ] Push 到 GitHub (若有遠端 repo)

---

## 附錄: Git 快速指令

### 查看狀態
```bash
git status
git log --oneline -10
```

### 提交變更
```bash
git add .
git commit -m "type: summary"
```

### 查看差異
```bash
git diff
git diff apps/server/data/inbox/
```

### 回退 (小心使用)
```bash
# 回退到上一個 commit (保留變更在 working directory)
git reset --soft HEAD~1

# 完全捨棄變更 (危險!)
git reset --hard HEAD~1
```

---

## 總結

### 當前階段 (30 天實驗)
- ✅ 程式碼: 用 Git，每週 commit
- ✅ 資料: 用 Git，每週 commit
- ❌ 自動化: 暫不需要

### 上線後 (若實驗成功)
- ✅ 考慮每日自動備份
- ✅ 考慮遠端 repo (GitHub private)
- ✅ 考慮 Tag 重要版本 (如 `v1.0-experiment-complete`)
