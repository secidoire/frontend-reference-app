# アーキテクチャ / 設計ルール

本プロジェクトの構成と設計判断を記録するリファレンス。実装時の「どこに置くか」「なぜそう分けるか」の判断基準はここに従う。

## 1. 技術スタック（確定バージョン）

| 分類 | 採用 | バージョン方針 |
|------|------|--------------|
| Framework | Next.js (App Router) | 16.x |
| 言語 | TypeScript | 6.x |
| UI | React | 19.x |
| UIライブラリ | Material UI | 後続ステップで導入 |
| テーブル | Material React Table | 〃 |
| グラフ | Plotly | 〃 |
| データ取得 | React Query (TanStack Query) | 〃 |
| API契約 | OpenAPI (YAML) | 単一の正（source of truth） |
| 型生成 | openapi-typescript | 16.x→7.x |
| APIクライアント | openapi-fetch | 型安全fetch（`services/`） |
| バックエンド | Express | 〃（`server/`に独立） |
| モック | MSW | 〃（`src/mocks/`） |
| テスト | Vitest + Testing Library | 〃 |
| カタログ | Storybook + Interaction Test | 〃 |
| パッケージ管理 | npm | — |

> バージョンは導入時点の最新を採用する。古いものを書かない（要 `npm view <pkg> version` で確認）。

## 2. ディレクトリ構成

```text
frontend-reference-app/
├── docs/
│   ├── openapi.yaml                  # API契約（単一の正）
│   └── *.md                          # 本ドキュメント群
├── src/
│   ├── app/                          # Next.js App Router（ルーティング薄皮のみ）
│   │   ├── layout.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx              # → features/tickets/pages/TicketListPage
│   │   │   ├── new/page.tsx          # → TicketCreatePage
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # → TicketDetailPage
│   │   │       └── edit/page.tsx     # → TicketEditPage
│   │   └── analytics/page.tsx        # → AnalyticsPage
│   │
│   ├── features/                     # Feature First の中核
│   │   ├── tickets/
│   │   │   ├── api/                  # ticketApi.ts（services基盤を利用）
│   │   │   ├── hooks/                # useTicketList, useTicketDetail, useCreateTicket...
│   │   │   ├── types/                # Ticket型
│   │   │   ├── components/
│   │   │   │   ├── atoms/            # StatusChip, PriorityChip（ドメイン固有）
│   │   │   │   ├── molecules/        # TicketSummaryCard
│   │   │   │   ├── organisms/        # TicketTable, TicketForm
│   │   │   │   └── templates/        # TicketDetailTemplate, TicketEditTemplate
│   │   │   └── pages/                # TicketListPage...（Container）
│   │   ├── comments/                 # CommentItem, CommentList
│   │   ├── analytics/                # StatusChart, AssigneeChart...
│   │   └── users/                    # UserBadge
│   │
│   ├── components/                   # 全feature横断の汎用UI（ドメイン非依存）
│   │   ├── atoms/                    # Button, Avatar...
│   │   ├── molecules/                # SearchField, ConfirmDialog...
│   │   ├── organisms/                # AppShell, FormDialog...
│   │   ├── templates/                # PageLayout（ページ骨格）
│   │   └── layouts/                  # Sidebar, Header
│   │
│   ├── services/                     # API通信基盤（openapi-fetch の apiClient, queryClient）
│   ├── lib/                          # 純粋関数ユーティリティ（formatDate, groupBy...）
│   ├── types/                        # 全体共有型 + api.ts（openapi-typescript 生成・編集禁止）
│   └── mocks/                        # MSW（ブラウザ / テスト共用）
│       ├── handlers/
│       ├── fixtures/
│       ├── browser.ts
│       └── server.ts
│
└── server/                           # Express バックエンド（独立）
    └── src/{routes,data}/
```

## 3. 設計ルール（決定事項）

| 論点 | ルール | 理由 |
|------|--------|------|
| **App Router の役割** | `app/*/page.tsx` はルーティングの薄皮。実体は `features/*/pages/` に置き、それをimportして返すだけ | ルーティングとドメインロジックの分離。Atomic Designの "Page" と Next.js routing の名前衝突を回避 |
| **コンポーネント境界** | **ドメイン固有**（StatusChip, TicketTable等）→ `features/*/components/`。**ドメイン非依存**（Avatar, Button, AppShell）→ `src/components/` | Feature First を徹底しつつ、横断再利用も両立（ハイブリッド配置） |
| **ダイアログ** | 汎用の「枠」（ConfirmDialog, FormDialog）→ `src/components/`。ドメインの「中身」（文言・onConfirmのロジック）→ feature内で枠を利用 | Container/Presentational と 汎用/ドメイン の二軸を示す |
| **services / lib** | `services/` = API通信基盤（fetchラッパ・queryClient）。`lib/` = 副作用のない純粋関数 | データ取得と純粋ロジックの分離 |
| **Container / Presentational** | `pages/` = Container（hooks呼出・状態管理）。`components/` = Presentational（可能な限りpure） | 設計原則「PresentationとData Fetchingの分離」 |
| **型とAPIの同期** | `docs/openapi.yaml` を正として `src/types/api.ts` を**生成**。featureのドメイン型はそこから導出（`components["schemas"]["Ticket"]`等）。手書きしない | 型をAPIと機械的に同期。仕様変更が型エラーで検知できる |
| **`features/shared/` は不採用** | 横断要素は `src/components/` + `src/lib/` に吸収 | 共有先を一本化 |
| **コンポーネント移動の方針** | 最初はfeature内に置き、複数featureで必要になった「タイミングで」`src/components/` へ昇格 | 早すぎる共通化を避ける |

## 4. Atomic Design 方針

| レイヤ | feature内の例 | 共有(src/components)の例 |
|-------|--------------|------------------------|
| atoms | StatusChip, PriorityChip | Button, Avatar |
| molecules | TicketSummaryCard, CommentItem | SearchField, ConfirmDialog |
| organisms | TicketTable, TicketForm, CommentList | AppShell, FormDialog |
| templates | TicketDetailTemplate（ドメイン画面構成） | PageLayout（骨格） |

## 5. API契約とコード生成（OpenAPI）

`docs/openapi.yaml` を **単一の正（source of truth）** とし、フロント・サーバ・モックの3者を同じ契約に揃える。要件定義書7章のAPI仕様をOpenAPIへ格上げしたもの。

```text
docs/openapi.yaml  ── 単一の正
   ├─→ フロント : openapi-typescript で src/types/api.ts を生成
   │              └─ openapi-fetch の apiClient が paths 型で型安全化
   │                 └─ features/*/api が型安全に呼び出し → hooks が隠蔽
   ├─→ server/  : 同じ契約を Express で実装（突き合わせ可能）
   └─→ MSW      : 生成型で handlers を型付け
```

### 生成ルール
- 生成コマンド：`npm run gen:api`（`openapi-typescript docs/openapi.yaml -o src/types/api.ts`）
- `src/types/api.ts` は **生成物・編集禁止**（手で触らない。契約変更は `openapi.yaml` を直して再生成）
- ドメイン型は生成型から導出する：

```ts
import type { components } from "@/types/api";
export type Ticket = components["schemas"]["Ticket"];
```

### 責務の流れ（要件のCustom Hook方針を維持）
- **生成**：型 + 型安全クライアント（openapi-fetch）まで
- **手書き**：`features/*/hooks/` の React Query フック（`useTicketList` 等）はあえて手書きし、UIからAPIを隠蔽する設計例を示す

## 6. テスト戦略

| 対象 | ツール |
|------|--------|
| Custom Hooks / Utility | Vitest + Testing Library（MSWでAPIモック） |
| atoms / molecules / organisms | Storybook Interaction Test（全Storyに付与） |
