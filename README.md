# Frontend Reference App

チケット管理システムを題材にした **フロントエンド設計リファレンス実装**。
実運用ではなく、以下の設計・開発プラクティスをチームへ共有するためのサンプル。

- Feature Directory Architecture / Atomic Design
- Next.js App Router（Server Components + Server Actions）
- OpenAPI を単一の正とした型生成（openapi-typescript / openapi-fetch）
- Material UI / Material React Table / Plotly
- Vitest（unit）+ Storybook Interaction Test（実ブラウザ）
- MSW によるモック、Express の独立バックエンド

詳細は [`docs/`](./docs/) を参照（[要件定義書](./要件定義書.md) / [architecture](./docs/architecture.md) / [roadmap](./docs/roadmap.md)）。

## セットアップ / 起動

フロント（Next.js）と API（Express）は別プロセス。

```bash
# 1) APIサーバ（:4000）
cd server && npm install && npm run dev

# 2) フロント（:3000）— 別ターミナル
npm install && npm run dev   # http://localhost:3000 → /tickets
```

## 主要スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run dev` | フロント開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |
| `npm run gen:api` | `docs/openapi.yaml` → `src/types/api.ts` 再生成 |
| `npm run test` | Vitest（watch） |
| `npm run test:run` | Vitest（unit + storybook、1回） |
| `npm run test:storybook` | Storybook Interaction Test（実ブラウザ） |
| `npm run storybook` | Storybook 起動（:6006） |

## 画面

| URL | 内容 |
|-----|------|
| `/tickets` | 一覧（フィルタ/ソート/ページング、URL駆動・サーバ側） |
| `/tickets/[id]` | 詳細 + コメント |
| `/tickets/new` | 作成 |
| `/tickets/[id]/edit` | 編集 |
| `/analytics` | 分析（ステータス別 / 担当者別 / 月次推移） |

## ディレクトリ概要

```text
src/
  app/        Next.js App Router（ルーティング薄皮）
  features/   tickets / comments / analytics / users（api・actions・hooks・components・pages）
  components/ ドメイン非依存の共有UI
  services/   APIクライアント基盤（openapi-fetch）
  lib/        純粋関数ユーティリティ
  types/      生成型 api.ts + 共有型
  mocks/      MSW（handlers / fixtures）
server/       Express（インメモリ REST API）
docs/         設計ドキュメント + openapi.yaml
```

設計判断の根拠は [docs/architecture.md](./docs/architecture.md) に集約している。
