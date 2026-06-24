# アーキテクチャ / 設計ルール

本プロジェクトの構成と設計判断を記録するリファレンス。実装時の「どこに置くか」「なぜそう分けるか」の判断基準はここに従う。

## 1. 技術スタック（確定バージョン）

| 分類 | 採用 | バージョン |
|------|------|-----------|
| Framework | Next.js (App Router) | 16.2 |
| 言語 | TypeScript | 5.9（周辺ツールのpeer `^5` に準拠。TS6は openapi-typescript 等が未対応のため見送り） |
| UI | React | 19.2 |
| UIライブラリ | Material UI | 9.1 |
| テーブル | Material React Table | 3.2（+ @mui/x-date-pickers 9.6） |
| グラフ | Plotly | plotly.js 3.6 / react-plotly.js 4.0 |
| データ取得（読み取り） | React Server Components（async fetch） | Next.js ネイティブ |
| データ更新（書き込み） | Server Actions（`"use server"`）+ `revalidatePath` | 〃 |
| API契約 | OpenAPI (YAML) | 3.1（単一の正） |
| 型生成 | openapi-typescript | 7.13 |
| APIクライアント | openapi-fetch | 0.17（`services/`、**サーバ側**で利用） |
| バックエンド | Express | 5.2（`server/` に独立、tsx 実行） |
| モック | MSW | 2.14（`src/mocks/`） |
| テスト | Vitest + Testing Library | Vitest 4.1（unit + browser の2プロジェクト） |
| カタログ | Storybook + Interaction Test | 10.4（addon-vitest + Playwright/Chromium） |
| パッケージ管理 | npm | — |

> バージョンは導入時点（2026-06）の最新。新規導入時も `npm view <pkg> version` で最新を確認する。

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
│   │   │   ├── api/                  # ticketApi.ts（サーバ側fetch・読み取り。openapi-fetch利用）
│   │   │   ├── actions/              # Server Actions（作成/更新/削除 + revalidate）"use server"
│   │   │   ├── hooks/                # クライアントUI状態のみ（useActionState ラッパ等。データ取得はしない）
│   │   │   ├── types/                # Ticket型
│   │   │   ├── components/
│   │   │   │   ├── atoms/            # StatusChip, PriorityChip（ドメイン固有）
│   │   │   │   ├── molecules/        # TicketSummaryCard
│   │   │   │   ├── organisms/        # TicketTable, TicketForm
│   │   │   │   └── templates/        # TicketDetailTemplate, TicketEditTemplate
│   │   │   └── pages/                # TicketListPage...（async Server Component = Container）
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
│   ├── services/                     # API通信基盤（openapi-fetch の apiClient。サーバ側fetch）
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
| **services / lib** | `services/` = API通信基盤（openapi-fetchクライアント）。`lib/` = 副作用のない純粋関数 | データ取得と純粋ロジックの分離 |
| **データ取得 = Server Components** | 読み取りは `pages/` の async Server Component で `features/*/api` を await。クライアントへ `fetch` を持ち込まない | App Router本来の流儀。クライアントJS削減・型安全 |
| **データ更新 = Server Actions** | 作成/更新/削除は `features/*/actions/` の `"use server"` 関数。完了後 `revalidatePath`/`revalidateTag` で再取得。フォームから `action`/`useActionState` で呼ぶ | mutation後の再検証を宣言的に。クライアント状態管理を不要に |
| **Container / Presentational** | `pages/` = Container（Server Componentでfetch・合成）。`components/` = Presentational（可能な限りpure。対話が要る所だけ `"use client"`） | 「PresentationとData Fetchingの分離」をRSC境界で表現 |
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
   │                 ├─ features/*/api（Server Componentから読み取り）
   │                 └─ features/*/actions（Server Actionsから更新）
   ├─→ server/  : 同じ契約を Express で実装（突き合わせ可能）
   └─→ MSW      : 生成型で handlers を型付け（テストでサーバ側fetchを intercept）
```

### 生成ルール
- 生成コマンド：`npm run gen:api`（`openapi-typescript docs/openapi.yaml -o src/types/api.ts`）
- `src/types/api.ts` は **生成物・編集禁止**（手で触らない。契約変更は `openapi.yaml` を直して再生成）
- ドメイン型は生成型から導出する：

```ts
import type { components } from "@/types/api";
export type Ticket = components["schemas"]["Ticket"];
```

### データフロー（Server Components + Server Actions）

```text
[読み取り]
  app/tickets/page.tsx (薄皮)
    └─ features/tickets/pages/TicketListPage.tsx   ← async Server Component
         └─ await features/tickets/api/ticketApi.list()   ← openapi-fetch（サーバ実行）
              └─ Express (/api/tickets)
         → 取得データを Presentational(components/) に props で渡す

[書き込み]
  features/tickets/components/.../TicketForm ("use client")
    └─ <form action={createTicketAction}>  /  useActionState(createTicketAction)
         └─ features/tickets/actions/createTicket.ts ("use server")
              ├─ await ticketApi.create(...)        ← openapi-fetch（サーバ実行）
              └─ revalidatePath("/tickets")          ← 一覧を再取得
```

### 要件の「Custom Hook方針」の再解釈
要件11章は当初 React Query 前提だったが、本プロジェクトでは **Server Components + Server Actions** を採用する。
- **読み取り**：`useTicketList` 等のフェッチ用フックは作らない。Server Componentで直接 `api/` を await する
- **書き込み**：`useCreateTicket` 等の代わりに `actions/` の Server Action を使う
- **`hooks/`** に残すのは **クライアントUI状態のみ**（フォーム送信状態の `useActionState` ラッパ、テーブルの表示状態など）。「APIをUIから隠蔽する」という意図は api/actions 層が担う

## 6. ローカル起動

フロント（Next.js）と API（Express）は別プロセス。2つ起動する。

```bash
# 1) APIサーバ（port 4000）
cd server && npm install && npm run dev

# 2) フロント（port 3000）— 別ターミナルで
npm install && npm run dev      # http://localhost:3000 → /tickets
```

- Server Components はサーバ側で `API_BASE_URL`（既定 `http://localhost:4000`）へ `fetch` する
- API契約を変えたら `npm run gen:api` で `src/types/api.ts` を再生成する

## 7. テスト戦略

| 対象 | ツール |
|------|--------|
| Custom Hooks / Utility / API層 | Vitest + Testing Library（jsdom、MSW node でAPIモック） |
| atoms / molecules / organisms | Storybook Interaction Test（play関数を全Storyに付与） |

実行は Vitest の2プロジェクト構成（`vitest.config.ts`）。

- `unit` … jsdom + MSW node。`npm run test`（`*.test.ts(x)`）
- `storybook` … addon-vitest が story を **実ブラウザ（Playwright/Chromium）** で実行。`npm run test:storybook`
- `npm run test:run` で両方。Storybook UI からも Interactions パネルで確認可能（`npm run storybook`）
