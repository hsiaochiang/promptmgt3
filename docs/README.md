# WOS PromptMgt 文件導航

> **目的**: 讓你能在 10 秒內找到任何文件。
> **更新**: 2026-01-11

---

## 🚀 新手入門 (START HERE)

### 1. [30 天實驗手冊](./30_DAY_EXPERIMENT.md) ⭐ 最重要
> 追蹤這 30 天的使用狀況，決定要不要繼續。

### 2. [專案初衷](#) (建議閱讀 `/README.md`)
> 為什麼要做這個系統？成功/失敗標準是什麼？

### 3. [如何使用](#) (即將建立 `USAGE.md`)
> 5 分鐘上手指南（目前請參考 `/DEPLOYMENT.md`）

---

## 📚 規範與標準

### [WOS 分類體系](./WOS_TAXONOMY.md)
> **用途**: Tag 使用說明書  
> **何時看**: 不知道該貼什麼標籤時

### [資料保存政策](./persistence-policy.md)
> **用途**: Git、資料夾結構、備份策略  
> **何時看**: 要調整檔案結構或版控時

---

## 🗺️ 專案規劃 (已簡化)

### [專案路線圖](../roadmap.md) (Artifact)
> **內容**: Phase 0-1 (Phase 2-4 已暫停)  
> **狀態**: 目前在 Phase 1.3 (首次歸檔)

### [實作計畫](../implementation_plan.md) (Artifact)
> **內容**: WOS 2.0 Agent 規劃 (已暫停)  
> **狀態**: 參考用

---

## 🔧 交接與技術文件

### [煉油廠交接 (Refinery POC)](../WOS_REFINERY_POC_HANDOVER.md)
> **內容**: 50 筆資料匯入說明  
> **狀態**: POC 完成

### [煉油廠完整文件](../WOS_DATA_REFINERY_HANDOVER.md)
> **內容**: Refinery 技術細節  
> **狀態**: Legacy (參考用)

---

## 📝 工作日誌 (即將建立)

### 實驗日誌 (`EXPERIMENT_LOG.md`)
> 記錄每次決策的假設與驗證結果

### 每週回顧 (`WEEKLY_REVIEW.md`)
> 每週日填寫：用了幾次？有幫助嗎？

---

## 🗂️ 技術規格 (進階)

### [Spec 資料夾](../specs/)
> **內容**: WOS 2.0 Agent 規格、舊版規劃  
> **對象**: 開發者

### [Contracts](../packages/contracts/)
> **內容**: TypeScript 型別定義  
> **對象**: 開發者

---

## 📁 文件分類建議

### 依「使用頻率」分類
| 類別 | 文件 | 更新頻率 |
| :--- | :--- | :--- |
| 🔴 **每日必看** | `30_DAY_EXPERIMENT.md` | 每天 |
| 🟡 **每週參考** | `WOS_TAXONOMY.md` | 需要時 |
| 🟢 **偶爾查詢** | `persistence-policy.md` | 少用 |
| ⚪ **僅供參考** | Refinery 交接文件 | 不用 |

### 依「文件類型」分類
- **指南類**: 30 Day Experiment, USAGE
- **規範類**: WOS_TAXONOMY, persistence-policy
- **規劃類**: roadmap, implementation_plan
- **技術類**: specs/, packages/contracts

---

## 🆘 常見問題

### Q1: 不知道該貼什麼 Tag？
→ 看 [`WOS_TAXONOMY.md`](./WOS_TAXONOMY.md)

### Q2: 忘記為什麼要做這個專案？
→ 看 [`30_DAY_EXPERIMENT.md`](./30_DAY_EXPERIMENT.md) 的「初衷提醒」

### Q3: 想放棄這個專案？
→ 看 [`30_DAY_EXPERIMENT.md`](./30_DAY_EXPERIMENT.md) 的「緊急逃生出口」

### Q4: 想找技術規格？
→ 看 [`specs/wos-2.0-agent.md`](../specs/wos-2.0-agent.md)

---

## 🔄 文件維護

- **這份導航** (`docs/README.md`): 每次新增文件時更新
- **30 Day Experiment**: 每週日晚上填寫
- **WOS_TAXONOMY**: 發現標籤不夠用時更新

---

## 下一步

1. ✅ 閱讀 `30_DAY_EXPERIMENT.md`
2. ⏳ 開始 Day 1 任務 (手動歸檔 10 筆)
3. ⏳ 每週日填寫檢查表
