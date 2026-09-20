# Folks Dating System — 文件索引

這套文件把 `Server/` 與 `DatingApp/` 視為同一個產品系統，先說明使用者看到的功能，再逐步追到前端服務、後端服務、資料儲存與外部供應商。

## 閱讀順序

1. [00.5 — 開始閱讀與啟動前提](00.5-getting-started.md)
2. [01 — 整體概觀與 C4 架構](01-overview.md)
3. [02 — Repository 與模組導覽](02-repository-structure.md)
4. [03 — DatingApp 前端架構](03-datingapp-architecture.md)
5. [04 — 身分驗證與個人資料](04-auth-profile.md)
6. [05 — 阿月與 Agent](05-ai-agent.md)
7. [06 — 配對與關係建立](06-matchmaking.md)
8. [07 — 聊天與風險治理](07-chat-risk.md)
9. [08 — 語音互動](08-voice.md)
10. [09 — 記憶、摘要與圖譜](09-memory-graph.md)
11. [10 — 活動、約會與行事曆](10-calendar-events.md)
12. [11 — 社群、貼文與媒體](11-social-media.md)
13. [12 — API 與資料契約](12-api-data-contracts.md)
14. [13 — 背景工作與可靠性](13-background-reliability.md)
15. [14 — 部署、啟動與環境](14-deployment.md)
16. [15 — 測試與驗證](15-testing.md)
17. [16 — 證據、限制與待釐清事項](16-evidence-and-open-questions.md)

## 文件基準

| Repository | 分支 | 盤點版本 |
|---|---|---|
| `Server/` | `main` | `b6c456f` |
| `DatingApp/` | `main` | `4426ca7` |

本版文件是依目前工作區的原始碼與設定產生。所有描述分成三種：**觀察到**代表可直接在程式碼或設定中找到；**推論**代表由多個觀察連接出的合理解釋；**待確認**代表仍需要啟動服務、查看正式設定或向專案成員確認。文件不包含密鑰、密碼、token 或真實個資。

## 讀者路線

教授或審查者可讀 `01 → 05 → 06 → 07 → 08 → 16`，掌握產品概念、AI、配對、安全與尚未驗證的部分。新組員可讀 `00.5 → 01 → 02 → 03`，再進入自己負責的功能章。後端維護者應從 `12 → 05～13 → 14 → 15` 開始；前端維護者則從 `03 → 04 → 07 → 08 → 10 → 12` 開始。

## 驗證狀態

GitNexus 已以 `--index-only` 更新工作區、Server 與 DatingApp 的索引；本版主要依靜態程式碼查證，沒有把實際啟動服務或線上資料庫檢查誤寫成已完成。正式環境行為、外部供應商可用性與所有端到端流程，請以 [16 — 證據、限制與待釐清事項](16-evidence-and-open-questions.md) 為準。
