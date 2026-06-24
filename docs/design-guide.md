# 設計ガイド（責務分離の解説）

このドキュメントは、本プロジェクトが**リファレンスとして示したい設計意図＝「なぜこう分けるのか」**を言語化したもの。
構成・命名規則は [architecture.md](./architecture.md) に、進め方は [roadmap.md](./roadmap.md) にある。ここは **設計判断の根拠** を担当する。

> 本プロジェクトの目的は「動くこと」ではなく、**コンポーネント責務の分離・API抽象化・テスト戦略の例をチームへ共有する**こと（[要件定義書](../要件定義書.md) 2章）。
> 以下は、その目的に対して各設計判断が**どの原則をどう実現しているか**の解説。

## 1. 要件の設計原則 → 本実装での実現

要件14章の設計原則と、本実装での実現方法・実証箇所の対応。

| 設計原則（要件14章） | 本実装での実現 | 実証ファイル |
|--------------------|---------------|------------|
| Feature First | `features/{tickets,comments,analytics,users}` に機能単位で凝集 | [src/features/](../src/features/) |
| Presentation と Data Fetching の分離 | 取得は Server Component（`pages/`）、表示は Presentational（`components/`） | [TicketListPage](../src/features/tickets/pages/TicketListPage.tsx) / [TicketTable](../src/features/tickets/components/organisms/TicketTable.tsx) |
| Container / Presentational | `pages/` = Container、`components/` = Presentational | 〃 |
| Hooks で状態管理を集約 | クライアントUI状態を Custom Hook に寄せる | [useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts) / [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts) |
| Components は可能な限り Pure | データ取得・副作用を持ち込まず props で受ける | [components/](../src/features/tickets/components/) |
| 型を API と同期 | OpenAPI から型生成し導出 | [openapi.yaml](./openapi.yaml) → [api.ts](../src/types/api.ts) → [types](../src/features/tickets/types/index.ts) |

## 2. レイヤごとの責務

「各レイヤは何をしてよく / してはいけないか」を固定する。これが守られていれば責務は分離されている。

| レイヤ | 責務 | してはいけない |
|-------|------|--------------|
| `app/*/page.tsx` | ルーティングの薄皮（feature の page を import して返すだけ） | ロジック・表示を持つ |
| `features/*/pages/` | **Container**（async Server Component）。データ取得・合成 | 表示ロジックの詳細、クライアント状態 |
| `features/*/components/` | **Presentational**。props を受けて描画 | データ取得（fetch を持ち込まない） |
| `features/*/api/` | サーバ側 fetch（**読み取り**） | 画面都合の整形 |
| `features/*/actions/` | Server Actions（**書き込み** + `revalidatePath`） | 表示状態の保持 |
| `features/*/hooks/` | **クライアントUI状態**（URL同期・フォーム状態など） | サーバデータの取得 |
| `services/` | API クライアント基盤（openapi-fetch） | ドメイン知識 |
| `lib/` | 副作用のない純粋関数 | I/O |
| `types/` | 生成型 + 導出 | 手書きの API 型 |

## 3. コンポーネントのレベル別責務（Atomic Design）

原則は「**上位ほど文脈・対話を持ってよく、下位ほど Pure**」。レベルが上がるほど合成と対話を担い、下がるほど単一の見た目に徹する。

| レベル | 責務（何をする） | 持ってよい | 持ってはいけない | 例 |
|-------|----------------|-----------|----------------|----|
| **atoms** | 最小のUI部品。単一の値/見た目を表現 | props、見た目へのマッピング | 状態・副作用・ドメインロジック・他部品の合成 | StatusChip / PriorityChip / LinkBehavior(共有) |
| **molecules** | atoms を数個まとめた小さな意味単位 | 簡単なレイアウト合成 | データ取得・状態管理 | CommentItem / PlotlyChart |
| **organisms** | 独立して意味を持つUIブロック（画面の主要部品）。対話を担いうる | `"use client"`、イベントハンドラ（状態ロジックはフックへ委譲） | **データ取得**（props で受ける）、ロジックの抱え込み | TicketTable / TicketForm / CommentList / StatusChart |
| **templates** | 画面の骨格・レイアウト。organisms/molecules を配置し画面構成を定義 | レイアウト・配置 | データ取得・ドメインロジック | TicketDetailTemplate |
| **pages**（= Container） | `features/*/pages`。**実データと結線**（取得して template/organisms へ流す） | データ取得（RSC）・合成 | 表示の詳細・クライアント状態 | TicketListPage / TicketDetailPage |

ポイント:
- **データ取得は Server Component で行う**。基本は pages（Container）だが、**深い階層で必要なら其処の Server Component が自分で取りに行ってよい（co-location）**。「pages だけが fetch」と厳格化すると props を巻き上げて破綻する（→ 8章「API はどこから呼ぶ？」）。`"use client"` な atoms/molecules/organisms は fetch できないため **props か Server Action** を使い、葉に保つ。
- **`"use client"` 境界**：純粋表示の atoms/molecules/templates は Server Component のまま（例: StatusChip, TicketDetailTemplate）。対話やブラウザAPIが要る所だけ client（例: TicketTable, TicketForm, PlotlyChart）。
- organisms は client になりうるが、**状態ロジックはフックに寄せて Pure に近づける**（5章 Custom Hooks）。
- 同じレベルでも **ドメイン固有か非依存か**で置き場所が変わる（feature 内 vs `src/components/`）。配置ルールは [architecture.md](./architecture.md)。

## 4. Container / Presentational の例

`/tickets` の一覧は、取得と表示が明確に分かれている。

```text
app/tickets/page.tsx              ← 薄皮（force-dynamic だけ）
  └─ TicketListPage   (Container / async Server Component)
        ├─ await listTickets(query)        ← データ取得はここだけ
        └─ <TicketTable rows={...} query={...} />   ← 表示は委譲
              └─ TicketTable   (Presentational / "use client")
                    ├─ 列定義 + MRT 配線（表示）
                    └─ useTicketTableState(query)    ← UI状態ロジックはフックへ
```

- **Container（[TicketListPage](../src/features/tickets/pages/TicketListPage.tsx)）** は「取得して渡す」だけ。`await` で書け、ローディング状態の管理も不要（RSC）。
- **Presentational（[TicketTable](../src/features/tickets/components/organisms/TicketTable.tsx)）** は与えられた `rows` を描画するだけ。サーバを知らない。

## 5. Custom Hooks の設計方針 ★

本プロジェクトは **Server Components + Server Actions** を採用したため、要件が当初想定した「データ取得フック（`useTicketList` 等）」は作らない。
代わりに、Custom Hook は **「クライアントUI状態の集約」と「テスト容易性」** のために設計する。

### 例: `useTicketTableState`

一覧テーブルの「表示状態 ⇄ URL searchParams」変換を [useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts) に切り出した。

**Before（フック無し）** — TicketTable が URL 同期ロジックを内包
- UI とロジックが密結合 → テストは**実ブラウザ（Storybook）頼み**
- ソート/ページング/フィルタの変換を確認するのに毎回ブラウザ起動

**After（フックに分離）** — 同じロジックが3つの利点を生む

| 利点 | 効く要件目的 |
|------|------------|
| TicketTable が「列定義 + 配線」に専念し Pure に近づく | 責務の分離 / Components Pure |
| `next/navigation` をモックすれば **ブラウザ無しで Vitest 単体テスト可** | テスト戦略 / Vitest を実行しやすく |
| ロジックがフックに寄り、UI 側 Story は表示確認に集中できる | Storybook 運用 / Interaction Test を書きやすく |

ブラウザ不要の単体テスト（[useTicketTableState.test.ts](../src/features/tickets/hooks/useTicketTableState.test.ts)）:

```ts
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }), usePathname: () => "/tickets" }));

it("ソート変更で URL を更新する（page=1 にリセット）", () => {
  const { result } = renderHook(() => useTicketTableState({ page: 3 }));
  act(() => result.current.onSortingChange([{ id: "priority", desc: false }]));
  expect(replace).toHaveBeenCalledWith("/tickets?sort=priority&order=asc", { scroll: false });
});
```

### 例: `useTicketForm`

[useTicketForm](../src/features/tickets/hooks/useTicketForm.ts) は `useActionState` をラップし、UI からは **送信状態・エラーだけ**を見せる。
フォームの「状態管理」と「マークアップ」を分離し、[TicketForm](../src/features/tickets/components/organisms/TicketForm.tsx) を表示に専念させる。

> **設計の指針**: 「フックに寄せられるロジックは寄せる」。理由は再利用ではなく **テスト容易性と責務分離**。
> ロジックを Vitest（速い・ブラウザ不要）で、見た目を Storybook（実ブラウザ）で、と住み分けられる。

## 6. テストの二層構成

フック設計の動機はこのテスト住み分けにある。

| 対象 | ツール | 特徴 |
|------|--------|------|
| ロジック（api / actions / hooks / lib） | Vitest（jsdom + MSW、`next/*` モック） | 速い・ブラウザ不要 |
| 見た目・インタラクション（components） | Storybook Interaction Test（実ブラウザ / Playwright） | play 関数を **Gherkin（Given/When/Then）** で記述 |

- カバレッジは**下限90%**（`npm run test:coverage`）。RSC ページ等は性質上テストしづらいため計測対象外。
- ロジックをフックに寄せたことで、テーブルの状態遷移はブラウザ無しで網羅できる。

## 7. 意図的な要件からの逸脱（記録）

| 項目 | 要件 | 本実装 | 理由 |
|------|------|--------|------|
| データ取得 | React Query | Server Components + Server Actions | App Router 本来の流儀を示す。チームが RQ を使わない方針 |
| Custom Hook | `useTicketList` 等の取得フック | 取得は RSC、フックは UI状態・テスト容易性のため | 上記に伴う再解釈（本ドキュメント5章） |

これらは [roadmap.md](./roadmap.md) の進捗ログにも「方針変更」として記録している。

## 8. API はどこから呼ぶ？ / Props 爆発を避ける

「Presentation と Data Fetching を分ける」を **古典的 Container/Presentational のまま**「fetch はページ最上位だけ」と解釈すると、深い子へデータを流すために props が巨大化する（prop drilling）。**RSC ではこの巻き上げが不要**で、これが本質的な解決策になる。

### API 呼び出しの場所

| 種別 | 層 | 呼べる場所 | 縛り |
|------|----|-----------|------|
| 読み取り | `features/*/api/`（openapi-fetch） | **任意の Server Component**（pages に限らない） | server 側で実行 |
| 書き込み | `features/*/actions/`（Server Actions） | client（form / イベント）, server | `"use server"` |

> `api`/`actions` が縛るのは「**server 側で実行**」だけ。「どこから呼ぶか」は縛らない。

### Props 爆発を避ける手段

1. **Co-location（巻き上げない）**
   深い階層でデータが要るなら、その階層の Server Component が自分で取りに行く。
   例：詳細のコメントを `TicketDetailPage` から props で流す代わりに、自分で fetch する Server Component を差し込む。
   ```tsx
   // CommentsSection.tsx（async Server Component）
   export async function CommentsSection({ ticketId }: { ticketId: string }) {
     const comments = await listComments(ticketId); // 自分で取得（巻き上げない）
     return <CommentList comments={comments} />;
   }
   // template 側は <CommentsSection ticketId={ticket.id} /> を置くだけ → comments を props で貫通させない
   ```

2. **重複取得は dedup** … 同じ取得が複数箇所で走っても、fetch メモ化（Next）/ `React.cache()` で1リクエスト1回に集約される。co-location しても無駄打ちにならない。

3. **whole-object を渡す** … スカラーを10個ではなく `ticket` を1個渡す（[TicketDetailTemplate](../src/features/tickets/components/templates/TicketDetailTemplate.tsx) は `ticket` / `comments` の2つだけ）。

4. **composition（slot）** … Client Component に Server Component を `children` で差し込めば、client 境界を props で貫通しなくてよい。

5. **横断的な client 状態は Context** … テーマ・トースト等。**サーバデータには使わない**（Context はサーバ取得の代替ではない）。

### まとめ（ルールの精密化）

- **client コンポーネント**（`"use client"` な atoms/molecules/organisms）→ fetch 不可。**props か Server Action**。葉に保つ。
- **server コンポーネント**（pages / server organisms / templates）→ 必要なら **co-location で自分で取得してよい**。
- 「pages だけが取得」ではなく **「取得は Server Component で、必要な階層に co-locate。client は props/actions」** が正。

## 9. IF設計のケーススタディ：作成ダイアログ

モーダル内フォーム（新規作成ダイアログ）は **IF（インターフェース）を崩しやすい**題材。よくある失敗と本実装の設計を対比する。

### よくある失敗
- ダイアログが `open` 状態を内部に抱える → 外から制御・テストできない
- ダイアログが**中身（文言・送信処理）をハードコード** → 再利用できない
- props 肥大（title / fields / onSubmit / onCancel / loading …）
- 成功時の「閉じる＋一覧更新」を繋ぐために、**フォームが dialog や router を直接知る**

### 本実装の設計（3層 + composition）

```text
TicketCreateDialog (ドメイン/client)     ← open 状態を保持。枠と中身を組むだけ
  ├─ FormDialog (汎用枠/molecule)         ← { open, title, onClose, children }。フォームを知らない
  │    └─ {children}                       ← composition で中身を差し込む（props 貫通なし）
  └─ TicketForm (中身/organism)           ← { action, onResult? } を受けるだけ
        └─ useTicketForm(action, onResult) ← 送信完了ごとに実行結果(result)を onResult へ通知
```

崩さないための要点:
1. **FormDialog は枠に徹する** … `{ open, title, onClose, children }` だけ。中身は children（composition）でフォームを知らない・props 貫通しない（8章と同じ考え）。
2. **TicketForm は設置文脈を知らない** … `{ action, onResult? }` を受けるだけ（フォームは状態も送信も**内包**＝presentational化はしない）。
   - ページ（`/tickets/new`）では **redirect するアクション**を渡す → 詳細へ遷移
   - ダイアログでは **結果を返すアクション + `onResult`** を渡す → 親が `result.ok` で閉じる
   - **同じフォームが両文脈で動く**。フォームに `if (dialog) …` は無い。
3. **結果は「いい感じの形」で返す** … アクションは判別共用体 `TicketActionResult`（`{ ok:true; ticket } | { ok:false; error }`）を返し、`useTicketForm` が `onResult(result)` で親へ通知。親は結果を見て分岐（成功＝閉じる、失敗＝留まる）。フォームは router も dialog も import しない。WinForms のダイアログ結果に近いイメージ。
4. **open 状態は TicketCreateDialog が保持** … 呼び出し側（一覧）には漏らさない。

```tsx
// 親（TicketCreateDialog）は結果を受けて分岐するだけ
<TicketForm action={createTicketInlineAction} submitLabel="作成"
  onResult={(result) => { if (result.ok) setOpen(false); }} />
```

### IF の比較

| 観点 | 崩れた IF | 本実装 |
|------|----------|--------|
| 開閉状態 | ダイアログ内部 / 呼び出し側に散在 | ドメイン（TicketCreateDialog）が一元保持 |
| 中身の差し込み | props で title / fields / onSubmit | **children（composition）** |
| 成功時の後続 | フォームが dialog / router を直接操作 | **結果を onResult で返す**（親が分岐／フォームは文脈を知らない） |
| カプセル化 | presentational 化で呼び出し側が状態配線 | フォームが状態・送信を内包し、**結果だけ返す** |
| 再利用 | ダイアログ専用 | FormDialog は任意のフォーム / TicketForm はページ・ダイアログ両用 |

### なぜ「結果を返す」とうれしいのか（Why）

この形の本質は **依存の向きを正す**こと。フォームに「何をしてほしいか」を**命令で注入する**のではなく、フォームから「何が起きたか」を**結果で受け取る**。主導権が呼ぶ側（親）に残り、フォームは純粋な部品でいられる。

もし逆に、フォームが内部で `onClose()` や `router.push()` をやると：

- ❌ **文脈に依存する**：ページに置くと誤動作（閉じるダイアログが無い）。フォームが「自分はダイアログの中にいる」前提を持ってしまう。
- ❌ **変更がフォームに波及**：成功時の挙動（閉じる→トーストに変えたい等）を変えるたびにフォーム本体を触る。
- ❌ **テストが重い**：フォーム単体テストにダイアログ/ルーターのモックが要る。

`onResult(result)` で**結果を値として返す**と、痛みが解ける：

| うれしさ | なぜ |
|---------|------|
| **再利用** | 同じフォームがページ(redirect)/ダイアログ(閉じる)/将来のサイドパネルでも**無改造**。違いは「親が結果をどう扱うか」だけ |
| **凝集** | 「成功したら何をするか」（閉じる/トースト/次ステップ/詳細へ飛ぶ）は UX 判断＝**親の知識**。親に集約され、フォームは「送って結果を返す」に専念 |
| **将来に強い** | 結果が `{ ok:true; ticket }` という**値**なので、後から「作った ticket の詳細へ飛ぶ」「名前をトーストに出す」等、結果データを使う要求に **IF 変更なし**で応えられる。`onSuccess():void` だと「成功した」しか分からず後で詰む |
| **テスト容易** | 「送信したら正しい結果を返すか」をダイアログ無しで検証（action にモック → onResult の引数を見る）。副作用はモックで観測 |
| **馴染み** | 「ダイアログは結果を返す部品」「`if (result.ok)`」は WinForms の `DialogResult` と同じメンタルモデル＝チームに伝わりやすい |

> 一言でいうと **「コールバックで“やること”を渡す」より「結果で“起きたこと”を返す」方が、呼ぶ側が主導権を持ちフォームが文脈非依存になる**。これがこの IF を選ぶ理由。

### 一見矛盾：`action` は注入なのに結果は返す？

> 「`action`（実行）は外から渡してるのに、submit の後処理は返す。Submit も外から渡すのが React の本筋では？」

これは混乱しやすいが、**矛盾していない**。

1. **`action` こそが「Submit を外から渡す」もの**。`action` prop は React 19 の `<form action={fn}>` に渡す送信ハンドラそのもの。つまり「Submit を外から渡す」は**すでにやっている**（React の本筋どおり）。
2. 一貫させている原則は **「消費する“入力”は inject、生産する“出力”は return」**。
   - `action` = フォームが**消費する入力（依存）**。無いと submit できない → inject。
   - 結果 = フォームが**生産する出力**。出力にハンドラを inject すると制御が逆転する。出力は **return** し、親が反応する（入力 IN / 出力 OUT で向きが揃う）。
3. **Server Action の制約**：`action` はサーバ実行。**「ダイアログを閉じる」＝クライアント状態**にはサーバアクションは触れない。だから結果をクライアントへ返すしかなく、`onResult` はその**戻りチャネル**。

> 純クライアントの `onSubmit` なら、親が `onSubmit={async () => { await x(); close(); }}` で全部やる手もあり、これも正当。ただし `<form action>` の progressive enhancement と、pending/エラー表示をフォームに内包する利点を手放す。本実装は **「毎回書く定型（pending/error/送信配線）はフォームに内包、変わるもの（どの action）だけ inject、結果は return」** を選んでいる。

実装: [FormDialog](../src/components/molecules/FormDialog.tsx) / [TicketCreateDialog](../src/features/tickets/components/organisms/TicketCreateDialog.tsx) / [TicketForm](../src/features/tickets/components/organisms/TicketForm.tsx) / [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts)
