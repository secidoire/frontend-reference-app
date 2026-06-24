# 進め方 / ロードマップ

本プロジェクトを「どう進めるか」と「いまどこまで進んだか」を管理するドキュメント。

## 進め方のルール（ワークフロー）

ステップ・バイ・ステップで進める。各ステップは次のサイクルで回す。

1. **方針すり合わせ** … 着手前に、選択肢・判断ポイントを提示して合意を取る（開発者の意思を都度反映する）
2. **実装** … 1ステップ = 1つのまとまり。最小から積み上げる
3. **検証** … `npm run build` / `typecheck` / テストで動作確認してから完了とする
4. **報告** … 作成物・検証結果・次の選択肢を提示
5. **次へ** … 区切りが良ければコミット単位とする

### 原則
- **最新を使う** … ライブラリ導入時は `npm view <pkg> version` で最新を確認してから入れる
- **縦切り** … 基盤が揃ったらFeature単位（API→hooks→UI）で1機能ずつ完成させる
- **リファレンス性優先** … 「動けばよい」ではなく、設計意図が読み取れる構成を優先する

---

## ロードマップ

凡例： ✅ 完了 / 🚧 進行中 / ⬜ 未着手

### Phase A — 基盤セットアップ

| #   | ステップ                  | 内容                                                                                                                           | 状態 |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | Next.js + TypeScript 土台 | package.json / tsconfig / next.config / layout / ルーティング薄皮                                                              | ✅    |
| 2   | MUI + テーマ              | Material UI 導入、ThemeProvider、AppRouterCache、基本テーマ                                                                    | ✅    |
| 3   | OpenAPI定義 + 型生成      | `docs/openapi.yaml` 作成、openapi-typescript で `src/types/api.ts` 生成、openapi-fetch で `services/apiClient`、ドメイン型導出 | ✅    |
| 4   | データ層規約（RSC/Actions） | Server Components で読み取り・Server Actions で更新する規約を確立（`api/`=server fetch, `actions/`=mutation+revalidate）。React Query は不採用 | ✅    |
| 5   | server/（Express）        | インメモリデータ + REST API（OpenAPI契約を実装）                                                                               | ✅    |
| 6   | MSW                       | 生成型で handlers / fixtures、browser.ts / server.ts                                                                           | ✅    |
| 7   | Vitest                    | 設定、Testing Library、MSW結合                                                                                                 | ✅    |
| 8   | Storybook                 | 設定、Interaction Test 実行環境                                                                                                | ✅    |

### Phase B — Feature実装（縦切り）

| #   | ステップ     | 画面 / 内容                                                                                         | 利用技術             | 状態 |
| --- | ------------ | --------------------------------------------------------------------------------------------------- | -------------------- | ---- |
| 9   | tickets 基盤 | api層（server fetch）+ actions層（Server Actions）+ atoms（StatusChip / PriorityChip）             | RSC / Server Actions | ⬜    |
| 10  | チケット一覧 | `/tickets`：TicketTable（"use client"）、フィルタ / ソート / ページング                            | Material React Table | ⬜    |
| 11  | チケット詳細 | `/tickets/[id]`：詳細表示                                                                           | —                    | ⬜    |
| 12  | コメント     | 詳細画面へ CommentList / CommentItem を統合                                                         | —                    | ⬜    |
| 13  | チケット作成 | `/tickets/new`：TicketForm                                                                          | —                    | ⬜    |
| 14  | チケット編集 | `/tickets/[id]/edit`：TicketForm 再利用                                                             | —                    | ⬜    |
| 15  | 分析         | `/analytics`：ステータス別 / 担当者別 / 月次推移                                                    | Plotly               | ⬜    |

### Phase C — 仕上げ

| #   | ステップ         | 内容                                          | 状態 |
| --- | ---------------- | --------------------------------------------- | ---- |
| 16  | Interaction Test | atoms / molecules / organisms の全Storyに付与 | ⬜    |
| 17  | Unit Test        | Custom Hooks / Utility を Vitest（MSWモック） | ⬜    |
| 18  | レビュー / 整備  | ドキュメント反映、設計意図のコメント整備      | ⬜    |

---

## 進捗ログ

| 日付       | ステップ | メモ                                                                              |
| ---------- | -------- | --------------------------------------------------------------------------------- |
| 2026-06-24 | #1       | Next.js 16.2.9 / React 19.2.7 / TypeScript 6.0.3 で土台構築。`npm run build` 成功 |
| 2026-06-24 | #2       | MUI v9.1.2 導入。AppRouterCacheProvider(v16) + ThemeProvider + CssBaseline、`src/theme/`、Roboto。TS6で`baseUrl`除去（paths維持） |
| 2026-06-24 | 方針変更 | データ取得を **Server Components + Server Actions** に決定。React Query は不採用（未導入のため削除作業なし）。`features/*/actions/` を新設、`hooks/` はクライアントUI状態のみに縮小 |
| 2026-06-24 | #3       | OpenAPI(`docs/openapi.yaml`) 作成、openapi-typescript で `src/types/api.ts` 生成（`npm run gen:api`）、openapi-fetch の `services/apiClient`、各featureのドメイン型を生成型から導出 |
| 2026-06-24 | 方針変更 | openapi-typescript等のpeerが `^5` のため **TypeScript を 6.0.3 → 5.9.3** へ。TS6での生成・型チェックは動作確認済みだが、エコシステム準拠を優先 |
| 2026-06-24 | 順序変更 | #4(データ層規約) は叩く先が必要なため **#5(Express) を先に実施**。Express 5.2.1 + tsx、`server/` 独立TSパッケージ、生成型を再利用、port 4000。list/get/create/update/delete・comments・analytics を curl で end-to-end 確認 |
| 2026-06-24 | #4       | tickets で縦切り規約確立。`api/ticketApi`(server fetch: list/get) + `actions/ticketActions`("use server": create/update/delete + revalidatePath) + `pages/TicketListPage`(async Server Component)。`app/tickets`は薄皮+`force-dynamic`。next dev + Express で `/tickets` 実データ表示を確認 |
| 2026-06-24 | #6       | MSW 2.14.6。契約準拠のモックバックエンド（handlers: tickets/comments/analytics）+ 可変DB(`resetDb`) + 独立fixtures。`server.ts`(node/Vitest) / `browser.ts`(Storybook)。tsx で filter/sort/paging・CRUD・analytics を実行時検証 |
| 2026-06-24 | #7       | Vitest 4.1.9 + Testing Library + jsdom。`vitest.config`(native tsconfigPaths) + setup(MSW server起動・resetDb)。`lib/date`(純粋関数) と `ticketApi`(MSW結合) のテスト計7件green。**ハマり**: openapi-fetchがcreateClient時にfetchをキャプチャ→MSW未intercept。`fetch:(req)=>fetch(req)`で呼出時解決に修正 |
| 2026-06-24 | #8       | Storybook 10.4.6（nextjs-vite）+ addon-vitest（Playwright/Chromium 実ブラウザ）+ msw-storybook-addon。vitest projects を unit/storybook の2本に。StatusChip atom を先取りし story+play関数3件を実ブラウザでgreen（全10件green）。**ハマり**: top-level await不可→async config、provider はファクトリ(`@vitest/browser-playwright`)、SB10.3+はsetProjectAnnotations不要、dep最適化flaky→optimizeDeps.include |
