# 設計ガイド

このドキュメントは、本プロジェクトの **設計判断の「なぜ」** を解説する。コードを読む前・読みながら参照すると意図が分かる。

- **誰向け**：フロントエンドエンジニア / 新規参画メンバー / 設計レビュー担当（[要件定義書](../要件定義書.md) 2章）。
- **役割分担**：構成・命名は [architecture.md](./architecture.md)、進め方は [roadmap.md](./roadmap.md)、**設計の根拠はこの文書**。
- **読む順**：上から順（全体像 → 各層 → データの流れ → フック → フォーム → テスト）。用語に詰まったら下の「用語ミニ辞典」へ。

> ねらいは「動くこと」より **設計意図が読み取れること**。各章は **1行の結論** から始める。

## 用語ミニ辞典

初出の用語を1行で（詳しくは各章）。

| 用語 | 1行の意味 |
|------|----------|
| **RSC**（React Server Components） | サーバで実行され HTML を返す React。`await` で直接データ取得でき、ブラウザ用 JS を増やさない |
| **`"use client"`** | そのコンポーネントを**ブラウザで動かす**宣言。状態・イベント・ブラウザAPIが使えるようになる |
| **Server Action**（`"use server"`） | サーバで実行される関数。フォーム送信やボタンから呼び、API 更新に使う |
| **Container / Presentational** | データ取得担当（Container）と、見た目担当（Presentational）を分ける考え方 |
| **co-location** | データが必要な場所の近くで取得すること（最上位へ巻き上げない） |
| **revalidate** | 更新後にキャッシュを無効化し、画面を最新データで再描画させる仕組み |

---

## 1. 全体像 ― 3つの柱

> **結論：機能ごとに分け（Feature First）、読み取りは RSC・更新は Server Actions、UI は Atomic Design で積む。**

```text
ユーザー操作
  └─ app/                      … ルーティングの薄皮
       └─ features/<機能>/
            ├─ pages/          … 取得して合成（RSC = Container）
            ├─ components/     … 見た目（Presentational / Atomic Design）
            ├─ api/            … 読み取り（サーバ fetch）
            ├─ actions/        … 更新（Server Actions）
            └─ hooks/          … クライアントUI状態
```

- **Feature First**：機能（tickets / comments / analytics / users）ごとに凝集させる。
- **読み取り = RSC、更新 = Server Actions**：Next.js App Router の流儀（→ 4章）。
- **Atomic Design**：UI を atoms → molecules → organisms → templates → pages の粒度で積む（→ 3章）。

要件14章の設計原則とコードの対応表は **付録B** にある。

---

## 2. ディレクトリと各層の責務

> **結論：各層は「してよいこと／してはいけないこと」が決まっている。これが守られていれば責務は分かれている。**

| 層 | 責務（してよい） | してはいけない |
|----|----------------|--------------|
| `app/*/page.tsx` | ルーティングの薄皮（feature の page を import して返すだけ） | ロジック・表示を持つ |
| `features/*/pages/` | **Container**（async Server Component）。データ取得・合成 | 表示の詳細、クライアント状態 |
| `features/*/components/` | **Presentational**。props を受けて描画 | データ取得（fetch を持ち込まない） |
| `features/*/api/` | サーバ側 fetch（**読み取り**） | 画面都合の整形 |
| `features/*/actions/` | Server Actions（**更新** + revalidate） | 表示状態の保持 |
| `features/*/hooks/` | **クライアントUI状態**（URL同期・フォーム状態など） | サーバデータの取得 |
| `services/` | API クライアント基盤（openapi-fetch） | ドメイン知識 |
| `lib/` | 副作用のない純粋関数 | I/O |
| `types/` | 生成型 + 導出 | 手書きの API 型 |

---

## 3. コンポーネントの粒度（Atomic Design）

> **結論：上位ほど文脈・対話を持ってよく、下位ほど Pure（props で受けて描くだけ）。**

| レベル | 役割 | 持ってよい | 持ってはいけない | 例 |
|-------|------|-----------|----------------|----|
| **atoms** | 最小のUI部品。単一の値/見た目 | props、見た目へのマッピング | 状態・副作用・ドメインロジック・合成 | StatusChip / PriorityChip |
| **molecules** | atoms を数個まとめた小単位 | 簡単なレイアウト合成 | データ取得・状態管理 | CommentItem / PlotlyChart |
| **organisms** | 独立した意味を持つUIブロック。対話を担いうる | `"use client"`・イベント（状態ロジックはフックへ） | **データ取得**、ロジックの抱え込み | TicketTable / TicketForm |
| **templates** | 画面の骨格・レイアウト | 配置・構成 | データ取得・ドメインロジック | TicketDetailTemplate |
| **pages** | `features/*/pages`。**実データと結線**（取得して下位へ流す） | データ取得（RSC）・合成 | 表示の詳細・クライアント状態 | TicketListPage |

覚えておく3点:

1. **データを取りに行ってよいのは Server Component（主に pages）だけ**。atoms〜templates は Presentational（props で受ける）。詳しくは 4章。
2. **`"use client"` は必要な所だけ**：純粋表示（StatusChip, TicketDetailTemplate）は Server Component のまま。対話やブラウザAPIが要る所だけ client（TicketTable, TicketForm, PlotlyChart）。
3. **同じレベルでも「ドメイン固有 / 非依存」で置き場所が変わる**（feature 内 vs `src/components/`）。配置ルールは [architecture.md](./architecture.md)。

---

## 4. データの流れ

> **結論：取得は Server Component で必要な階層で行う。更新は Server Actions。client は props か Action だけ。**

### 4.1 読み取り（Container → Presentational）

`/tickets` の一覧は、取得（Container）と表示（Presentational）が分かれている。

```text
app/tickets/page.tsx              … 薄皮
  └─ TicketListPage   (Container / async Server Component)
        ├─ await listTickets(query)             … データ取得はここ
        └─ <TicketTable rows={...} query={...}/> … 表示は委譲
              └─ TicketTable  (Presentational / "use client")
                    └─ useTicketTableState(query)  … UI状態ロジックはフックへ（5章）
```

- **Container（[TicketListPage](../src/features/tickets/pages/TicketListPage.tsx)）** は「取得して渡す」だけ。`await` で書け、ローディング管理も不要（RSC）。
- **Presentational（[TicketTable](../src/features/tickets/components/organisms/TicketTable.tsx)）** は渡された `rows` を描くだけ。サーバを知らない。

### 4.2 書き込み（Server Actions）

更新は [`features/*/actions/`](../src/features/tickets/actions/ticketActions.ts) の Server Action（`"use server"`）。中で API を叩き、`revalidatePath` で画面を最新化する。client のフォーム / ボタンから呼ぶ。

### 4.3 API はどこから呼ぶ？ / Props 爆発を避ける

「取得は最上位だけ」と厳格化すると、深い子へ渡すために props が巨大化する（prop drilling）。**RSC では巻き上げが不要**で、これが解決策になる。

- `api`（読み取り）は **任意の Server Component から呼べる**（pages 限定ではない）。`actions`（更新）は client/server から呼べる。縛りは「**server 側で実行**」だけ。
- **Props 爆発を避ける手段**：
  1. **co-location**：深い階層で要るデータは、その階層の Server Component が自分で取る（巻き上げない）。
  2. **dedup**：同じ取得が複数走っても fetch メモ化 / `React.cache()` で1回に集約。
  3. **whole-object**：スカラー10個でなく `ticket` を1個渡す。
  4. **composition（slot）**：client に server を `children` で差し込み、props 貫通を避ける（→ 6章で実例）。
  5. **Context は横断的 client 状態だけ**（テーマ等）。サーバデータには使わない。

```tsx
// co-location の例：コメントを親から流さず、専用 Server Component が自分で取る
export async function CommentsSection({ ticketId }: { ticketId: string }) {
  const comments = await listComments(ticketId); // 自分で取得
  return <CommentList comments={comments} />;
}
```

---

## 5. ロジックは Custom Hooks へ

> **結論：UI状態ロジックはフックに寄せる。狙いは再利用ではなく「責務分離」と「ブラウザ無しでテストできる」こと。**

本プロジェクトは RSC + Server Actions なので、データ取得フック（`useTicketList` 等）は作らない。フックは **クライアントUI状態の集約とテスト容易性** のために使う。

**例：[useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts)**（一覧の「表示状態 ⇄ URL」変換）

| Before（フック無し） | After（フックに分離） |
|--------------------|---------------------|
| TicketTable が URL 同期ロジックを内包し、UI と密結合 | TicketTable は「列定義 + 配線」に専念（Pure に近づく） |
| 確認に毎回ブラウザ（Storybook）が要る | `next/navigation` をモックすれば **ブラウザ無しで Vitest 単体テスト**（速い） |

```ts
// ブラウザ不要の単体テスト（next/navigation をモック）
it("ソート変更で URL を更新する", () => {
  const { result } = renderHook(() => useTicketTableState({ page: 3 }));
  act(() => result.current.onSortingChange([{ id: "priority", desc: false }]));
  expect(replace).toHaveBeenCalledWith("/tickets?sort=priority&order=asc", { scroll: false });
});
```

もう1つの例 [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts) はフォームの送信状態・結果通知を集約する（→ 6章）。

> 指針：**フックに寄せられるロジックは寄せる**。ロジックは Vitest（速い・ブラウザ無し）、見た目は Storybook（実ブラウザ）で、と住み分けられる（→ 7章）。

---

## 6. ケーススタディ：フォームとダイアログ

> **結論：枠（FormDialog）は中身を知らない／フォームは設置文脈を知らない／成功は「結果」で親へ返す。**

モーダル内フォーム（作成・編集ダイアログ）は **IF（インターフェース）を崩しやすい**題材。

### よくある失敗
- ダイアログが `open` 状態を内部に抱える → 外から制御・テストできない
- ダイアログが中身（文言・送信処理）をハードコード → 再利用できない
- props 肥大（title / fields / onSubmit / onCancel / loading …）
- 成功時の「閉じる＋一覧更新」を繋ぐため、**フォームが dialog や router を直接知る**

### 本実装（3層 + composition）

```text
TicketCreateDialog / TicketEditDialog (ドメイン/client)  … open 状態を保持。枠と中身を組む
  ├─ FormDialog (汎用枠/molecule)        … { open, title, onClose, children }。フォームを知らない
  │    └─ {children}                      … composition で中身を差し込む（props 貫通なし）
  └─ TicketForm (中身/organism)          … { ticket?, onResult? } を受ける
        ├─ mode 判定: ticket 有→update / 無→create を自分で選ぶ
        └─ 結果(result) を onResult で親へ通知
```

```tsx
// 作成（ticket 無し → フォームが create を選ぶ）
<TicketForm onResult={(r) => { if (r.ok) setOpen(false); }} />
// 編集（ticket 有り → フォームが update を選ぶ）
<TicketForm ticket={ticket} onResult={(r) => { if (r.ok) setOpen(false); }} />
```

崩さないための要点:

1. **FormDialog は枠に徹する**：中身は `children`（composition）。フォームを知らず、props も貫通しない（4.3 と同じ考え）。
2. **永続化（create/update）はフォームが mode で自己決定**：`ticket` の有無で判定。"ザ・チケットフォーム" は保存方法を自分の責務として持つ（アクションを外から注入しない）。
3. **after-action（閉じる/遷移）は `onResult` で親へ**：これは設置文脈の話で、フォームには判別できない。
4. **結果は「いい感じの形」で返す**：`TicketActionResult`（`{ ok:true; ticket } | { ok:false; error }`）。親は `result.ok` で分岐。

### 判断の基準（なぜ永続化は自分・後処理は親か）

一見ちぐはぐ（片方は自分で決め、片方は親に返す）に見えるが、基準は一本：

> **「自分（mode）で決まることは自分で。設置文脈で決まることは親へ。」**

- create か update か → `ticket` の有無で**フォーム自身が判定できる** → 自己決定。
- 閉じる/遷移/トースト → **同じ作成でも文脈で変わる**（ダイアログ＝閉じる、別画面＝遷移） → フォームには分からないので親へ返す。

### なぜ「結果を返す」とうれしいのか（Why）

フォームに「何をしてほしいか」を**命令で渡す**のでなく、フォームから「何が起きたか」を**結果で受け取る**。主導権が親に残り、フォームは文脈非依存の部品でいられる。

もしフォームが内部で `onClose()` や `router.push()` をやると：別の場所に置くと誤動作し、挙動を変えるたびにフォーム本体を触り、テストに dialog/router のモックが要る。

`onResult(result)` で結果を返すと：

| うれしさ | なぜ |
|---------|------|
| **再利用** | 同じフォームが作成/編集/将来の別文脈でも無改造。違いは「親が結果をどう扱うか」だけ |
| **凝集** | 「成功後どうするか」は UX 判断＝親の知識。親に集約され、フォームは送信に専念 |
| **将来に強い** | 結果が `{ ok, ticket }` という値なので「作った詳細へ飛ぶ」等の後続に **IF 変更なし**で対応。`onSuccess():void` だと後で詰む |
| **テスト容易** | `useTicketForm` にモック action を渡して `onResult` の引数を見れば検証可（ダイアログ不要） |
| **馴染み** | 「ダイアログは結果を返す部品」「`if (result.ok)`」は WinForms の `DialogResult` と同じ感覚 |

> 補足（トレードオフ）：アクションを外から注入する設計（汎用フォーム向け）もある。本実装は TicketForm をドメイン固有と割り切り「保存は内包・結果は返す」を選んだ。そのぶん **Storybook でモック注入の送信テストはできない**ので、送信ロジックは `useTicketForm` のフックテスト + アクションの単体テスト + E2E で担保している。

実装: [FormDialog](../src/components/molecules/FormDialog.tsx) / [TicketCreateDialog](../src/features/tickets/components/organisms/TicketCreateDialog.tsx) / [TicketEditDialog](../src/features/tickets/components/organisms/TicketEditDialog.tsx) / [TicketForm](../src/features/tickets/components/organisms/TicketForm.tsx) / [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts)

---

## 7. テスト戦略

> **結論：ロジックは Vitest（速い・ブラウザ無し）、見た目は Storybook（実ブラウザ・Gherkin）。下限90%。**

| 対象 | ツール | 特徴 |
|------|--------|------|
| ロジック（api / actions / hooks / lib） | Vitest（jsdom + MSW、`next/*` モック） | 速い・ブラウザ不要 |
| 見た目・インタラクション（components） | Storybook Interaction Test（実ブラウザ / Playwright） | play 関数を **Gherkin（Given/When/Then）** で記述 |

- ロジックをフックに寄せたことで（5章）、状態遷移はブラウザ無しで網羅できる。
- カバレッジは **下限90%**（`npm run test:coverage`）。RSC ページ等はテストしづらいため計測対象外。

---

## 付録A. 要件からの意図的な逸脱

| 項目 | 要件 | 本実装 | 理由 |
|------|------|--------|------|
| データ取得 | React Query | Server Components + Server Actions | App Router 本来の流儀を示す。チームが RQ を使わない方針 |
| Custom Hook | `useTicketList` 等の取得フック | 取得は RSC、フックは UI状態・テスト容易性のため | 上記に伴う再解釈（5章） |

これらは [roadmap.md](./roadmap.md) の進捗ログにも「方針変更」として記録している。

## 付録B. 設計原則 ↔ 実装 対応表

要件14章の設計原則と、本実装での実現箇所。

| 設計原則（要件14章） | 本実装での実現 | 実証ファイル |
|--------------------|---------------|------------|
| Feature First | `features/` に機能単位で凝集 | [src/features/](../src/features/) |
| Presentation と Data Fetching の分離 | 取得は RSC（pages）、表示は Presentational（components） | [TicketListPage](../src/features/tickets/pages/TicketListPage.tsx) / [TicketTable](../src/features/tickets/components/organisms/TicketTable.tsx) |
| Container / Presentational | `pages/` = Container、`components/` = Presentational | 〃 |
| Hooks で状態管理を集約 | クライアントUI状態を Custom Hook に寄せる | [useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts) / [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts) |
| Components は可能な限り Pure | データ取得・副作用を持ち込まず props で受ける | [components/](../src/features/tickets/components/) |
| 型を API と同期 | OpenAPI から型生成し導出 | [openapi.yaml](./openapi.yaml) → [api.ts](../src/types/api.ts) → [types](../src/features/tickets/types/index.ts) |
