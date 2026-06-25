# 設計ガイド

このドキュメントは、本プロジェクトの **設計判断の「なぜ」** を解説する育成用の教材。コードを読む前・読みながら参照すると意図が分かる。

- **誰向け**：フロントエンドエンジニア / 新規参画メンバー / 設計レビュー担当（[要件定義書](../要件定義書.md) 2章）。
- **役割分担**：構成・命名は [architecture.md](./architecture.md)、進め方は [roadmap.md](./roadmap.md)、**設計の根拠はこの文書**。
- **読む順**：上から順（全体像 → 各層 → データの流れ → フック → フォーム → テスト）。用語に詰まったら下の「用語ミニ辞典」へ。
- **まず動かす**：[README](../README.md) のセットアップで API とフロントを起動し、`/tickets` を開いてから読むと「どの画面の話か」が掴める。

> ねらいは「動くこと」より **設計意図が読み取れること**。各章は **1行の結論** から始める。
>
> **この文書の読み方**：各設計判断は **「なぜ（理由）／やらないと（痛み）／本実装（代わりにこうした）」** の3点で捉えると頭に残る。表だけ拾わず、**「なぜ」を追ってほしい**。

## 用語ミニ辞典

初出の用語を1行で（詳しくは各章）。

| 用語 | 1行の意味 |
|------|----------|
| **SSR** | サーバで HTML を生成して返すこと。初期表示が速く SEO に有利 |
| **RSC**（React Server Components） | サーバで実行され HTML を返す React。`await` で直接データ取得でき、ブラウザに送る JS を増やさない |
| **バンドル** | ブラウザに送る JS のまとまり。増えるほど読み込み・初期表示が遅くなる |
| **ウォーターフォール** | データ取得が直列につながり、待ち時間が積み上がること |
| **`"use client"`** | そのコンポーネントを**ブラウザで動かす**宣言。状態・イベント・ブラウザ API が使える |
| **Server Action**（`"use server"`） | サーバで実行される関数。フォーム送信やボタンから呼び、API 更新に使う |
| **revalidate** | キャッシュを無効化する仕組み。Server Action から `revalidatePath` を呼ぶと、完了時に**現在表示中の RSC が最新データで再取得・再描画**される |
| **Container / Presentational** | データ取得担当（Container）と、見た目担当（Presentational）を分ける考え方 |
| **prop drilling** | データを深い子へ渡すために、途中のコンポーネントに props を素通しさせること（増えると破綻する） |
| **co-location** | データが必要な場所の近くで取得すること（最上位へ巻き上げない） |
| **composition（slot）** | 中身を `children` として外から差し込む合成。枠は中身を知らずに済む |
| **dedup** | 同じデータ取得が複数走っても 1 回にまとめること |
| **MSW** | API をモックするライブラリ。テストで本物のサーバ無しに応答を返す |
| **Gherkin** | Given（前提）/ When（操作）/ Then（結果）でテストを書く記法 |

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
            └─ hooks/          … クライアント UI 状態
```

題材はチケット管理。4つの機能（feature）が同じ型紙で積まれている：

| 機能（feature） | 主な画面 | 代表的な部品 |
|----------------|---------|-------------|
| tickets | `/tickets`（一覧）, `/tickets/[id]`（詳細）, 作成/編集ダイアログ | TicketTable / TicketForm |
| comments | 詳細内のコメント | CommentList / CommentItem |
| analytics | `/analytics` | StatusChart / PlotlyChart |
| users | （補助的な型のみ） | — |

### なぜこの3本柱なのか

- **なぜ Feature First？** ねらいは **変更の局所性**。「チケット一覧に列を足す」が `features/tickets/` の中で完結する。最上位を `components/ hooks/ api/` で切る *layer-first* だと、1機能の変更が複数ディレクトリに散り、関連を追えない。
  - やらないと：機能を1つ消すのに、あちこちの共有フォルダから「これ使っている人いる？」を探すことになる。
- **なぜ RSC で取得・Server Actions で更新？** データ取得の定型（loading・エラー・キャッシュ・ウォーターフォール）をフレームワークに任せられ、ブラウザに送る JS も減る。
  - やらないと：`useEffect`+`useState` の手書き取得を画面ごとに書き、毎回同じローディング/競合/二重取得バグを再発明する。
- **なぜ Atomic Design？** 粒度の **共通言語** になる。atoms/molecules/organisms という語彙でチームの認識と、再利用・テストの単位が揃う。「これは organism だからデータ取得はしない」と会話できる。

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
| `features/*/hooks/` | **クライアント UI 状態**（URL 同期・フォーム状態など） | サーバデータの取得 |
| `services/` | API クライアント基盤（openapi-fetch） | ドメイン知識 |
| `lib/` | 副作用のない純粋関数 | I/O |
| `types/` | 生成型 + 導出 | 手書きの API 型 |

> **なぜ線引きを固定するのか**：迷いとレビューコストを消すため。「この処理どこに書く？」を毎回考えずに済み、レビューでも「component に fetch が紛れている」を機械的に弾ける。
>
> **なぜ components は fetch しないのか**：「表示」と「取得」は **変わる理由が違う**（関心の分離）。混ぜると次の痛みが出る。

```tsx
// ❌ Presentational に取得が紛れる：表示を直すだけでもデータ層に触れ、テストにモックが要り、再利用できない
function TicketTable() {
  const [rows, setRows] = useState([]);
  useEffect(() => { fetch("/api/tickets").then(/* ... */); }, []); // ← これがダメ
  return <table>{/* ... */}</table>;
}

// ✅ 取得は Container（RSC）、表示は props で受けるだけ → どこでも再利用でき、実データ無しでテストできる
function TicketTable({ rows }: { rows: Ticket[] }) {
  return <table>{/* ... */}</table>;
}
```

> **✅ この章のチェック**
> - □ `components/` に fetch / useEffect 取得が無いか
> - □ `actions/` が表示状態（open 等）を持っていないか
> - □ 「これどこに書く？」を表で答えられるか

---

## 3. コンポーネントの粒度（Atomic Design）

> **結論：上位ほど文脈・対話を持ってよく、下位ほど Pure（props で受けて描くだけ）。**

| レベル | 役割 | 持ってよい | 持ってはいけない | 例 |
|-------|------|-----------|----------------|----|
| **atoms** | 最小の UI コンポーネント。単一の値/見た目 | props、見た目へのマッピング | 状態・副作用・ドメインロジック・合成 | StatusChip / PriorityChip |
| **molecules** | atoms を数個まとめた小単位 | 簡単なレイアウト合成 | データ取得・状態管理 | CommentItem / PlotlyChart |
| **organisms** | 独立した意味を持つ UI ブロック。対話を担いうる | `"use client"`・イベント（状態ロジックはフックへ） | **データ取得**、ロジックの抱え込み | TicketTable / TicketForm |
| **templates** | 画面の骨格・レイアウト | 配置・構成 | データ取得・ドメインロジック | TicketDetailTemplate |
| **pages** | `features/*/pages`。**実データと結線**（取得して下位へ流す） | データ取得（RSC）・合成 | 表示の詳細・クライアント状態 | TicketListPage |

覚えておく3点:

1. **データを取りに行ってよいのは Server Component（主に pages）だけ**。atoms〜templates は Presentational（props で受ける）。詳しくは 4章。
2. **`"use client"` は必要な所だけ**：純粋表示（StatusChip, TicketDetailTemplate）は Server Component のまま保てる。対話やブラウザ API が要る所だけクライアント（TicketTable, TicketForm, PlotlyChart）。
3. **同じレベルでも「ドメイン固有 / 非依存」で置き場所が変わる**（feature 内 vs `src/components/`）。配置ルールは [architecture.md](./architecture.md)。

> **なぜ下位を Pure に保つのか**：入力（props）→ 出力（JSX）だけなら、状態の組み合わせを気にせずテストでき、Storybook で 1 個ずつ確認でき、どこに置いても安全に再利用できる。逆に状態や fetch を持たせると、**その部品はその文脈でしか動かなくなる**。
>
> **なぜ `"use client"` を最小にするのか**：クライアント境界から下は丸ごとバンドルに乗る＝サイズ増＋SSR の利点（初期表示・SEO）が減る。だから「対話が要る葉」だけクライアントにし、上は Server Component のまま保つ。

> **✅ この章のチェック**
> - □ atom が状態や合成を持っていないか
> - □ その organism、本当にクライアントである必要があるか（対話があるか）
> - □ ドメイン固有 / 非依存で置き場所（feature 内 / `src/components/`）が合っているか

---

## 4. データの流れ

> **結論：取得は Server Component で必要な階層で行う。更新は Server Actions。クライアントは props か Action だけ。**

### 4.1 読み取り（Container → Presentational）

`/tickets` の一覧は、取得（Container）と表示（Presentational）が分かれている。

```text
app/tickets/page.tsx              … 薄皮
  └─ TicketListPage   (Container / async Server Component)
        ├─ await listTickets(query)             … データ取得はここ
        └─ <TicketTable rows={...} query={...}/> … 表示は委譲
              └─ TicketTable  (Presentational / "use client")
                    └─ useTicketTableState(query)  … UI 状態ロジックはフックへ（5章）
```

- **Container（[TicketListPage](../src/features/tickets/pages/TicketListPage.tsx)）** は「取得して渡す」だけ。`await` で書ける。
- **Presentational（[TicketTable](../src/features/tickets/components/organisms/TicketTable.tsx)）** は渡された `rows` を描くだけ。サーバを知らない。

> **なぜ `isLoading` 分岐が要らないのか**：RSC はサーバ側でデータが揃うまで描画を待てる。画面が出る時点でデータは既にあるので、クライアントのような「読み込み中…」の状態分岐が不要（途中状態が要るときは `loading.tsx` に委譲する）。
>
> **なぜ Container と Presentational を分けるのか**：「データの都合」と「見た目の都合」は **変わる理由が違う**（2章と同じ関心の分離）。分ければ、表示は Storybook（実データ不要）で、取得は別で、それぞれ独立に変更・テストできる。

### 4.2 書き込み（Server Actions）

更新は [`features/*/actions/`](../src/features/tickets/actions/ticketActions.ts) の Server Action（`"use server"`）。中で API を叩き、`revalidatePath` で関係する画面を最新化する。

- **ドメイン API 版**（`createTicketAction(input)`）＝通常の引数を取る土台。
- **フォーム接続版**（`createTicketInlineAction(prev, formData)`）＝ `useActionState` のシグネチャに合わせ、結果を返す（6章）。

### 4.3 API の呼び出し位置と props 爆発の回避

「取得は最上位だけ」と厳格化すると、深い子へ渡すために props が巨大化する（prop drilling）。**RSC では巻き上げが不要**で、これが解決策になる。

- `api`（読み取り）は **任意の Server Component から呼べる**（pages 限定ではない）。`actions`（更新）はクライアント/サーバから呼べる。縛りは「**サーバ側で実行**」だけ。
- **props 爆発を避ける手段**：
  1. **co-location**：深い階層で要るデータは、その階層の Server Component が自分で取る（巻き上げない）。
  2. **dedup**：同一リクエスト内で同じ取得は **自動で 1 回にまとまる**（Next.js の `fetch` は自動。自前関数は `React.cache()` で包む。※本実装は小規模なので未使用）。だから co-location で重複を気にしなくてよい。
  3. **whole-object**：スカラー 10 個でなく `ticket` を 1 個渡す。
  4. **composition（slot）**：クライアントにサーバを `children` で差し込み、props 貫通を避ける。
  5. **Context は横断的なクライアント状態だけ**（テーマ等）。サーバデータには使わない。

```tsx
// co-location + composition の例：
// 親(server)で先にデータを取り、ServerComponent を組み立ててから client に children として渡す。
// client(枠)は中身を知らずに置くだけ → 中身のデータを props で貫通させない。
export async function CommentsSection({ ticketId }: { ticketId: string }) {
  const comments = await listComments(ticketId); // ← その階層が自分で取得
  return <CommentList comments={comments} />;
}
// 使う側：<TabPanel>{<CommentsSection ticketId={id} />}</TabPanel>
```

> **✅ この章のチェック**
> - □ 取得を最上位に巻き上げて props が膨らんでいないか（深い所は co-location）
> - □ クライアントコンポーネントで fetch していないか（props か Action か）
> - □ Context をサーバデータの受け渡しに使っていないか

---

## 5. ロジックは Custom Hooks へ

> **結論：UI 状態ロジックはフックに寄せる。狙いは再利用ではなく「責務分離」と「ブラウザ無しでテストできる」こと。**

本プロジェクトは RSC + Server Actions なので、データ取得フック（`useTicketList` 等）は作らない。フックは **クライアント UI 状態の集約とテスト容易性** のために使う。

**何を寄せ、何を寄せないか**：寄せるのは **状態 + その更新ロジック**（URL 同期・送信状態など）。寄せないのは **純粋な見た目のマッピング**（値→色など。それは atom の仕事）。

**例：[useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts)**（一覧の「表示状態 ⇄ URL」変換）

| Before（フック無し） | After（フックに分離） |
|--------------------|---------------------|
| TicketTable が URL 同期ロジックを内包し、UI と密結合 | TicketTable は「列定義 + 配線」に専念（Pure に近づく） |
| 確認に毎回ブラウザ（Storybook）が要る | `next/navigation` をモックすれば **ブラウザ無しで Vitest 単体テスト**（速い） |

```ts
// ブラウザ不要の単体テスト：useRouter をモックして replace 呼び出しを観測する
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }), usePathname: () => "/tickets" }));

it("ソート変更で URL を更新する", () => {
  const { result } = renderHook(() => useTicketTableState({ page: 3 }));
  act(() => result.current.onSortingChange([{ id: "priority", desc: false }]));
  expect(replace).toHaveBeenCalledWith("/tickets?sort=priority&order=asc", { scroll: false });
});
```

もう 1 つの例 [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts) はフォームの送信状態・結果通知を集約する（6章で詳説）。

> 指針：**フックに寄せられるロジックは寄せる**。ロジックは Vitest（速い・ブラウザ無し）、見た目は Storybook（実ブラウザ）で、と住み分けられる（7章）。

### 5.1 ブラウザ API は薄いラッパ越しに（テスト容易性 & SSR 安全）

> **結論：`window` / `localStorage` / `navigator` などのブラウザ API はロジックから直叩きせず、薄いラッパ（フック or 関数）越しに使う。狙いは「Vitest で差し替え可能にする」ことと「SSR 安全性を1か所に閉じ込める」こと。**

5章本体は「状態ロジックをフックへ寄せてテスト可能にする」話だった。その延長で、**フック/ロジックがブラウザ API に触れる場合**も同じ理由でラッパを1枚挟む。

- **なぜ？** グローバル（`window` 等）を直接読むと、Vitest（jsdom）では実体をモンキーパッチするしかなく、テストが壊れやすい。ラッパ越しなら**差し替え（モック）が一点で済む**。加えて、サーバでは `window` が `undefined` なので、**SSR 安全ガード（`typeof window === "undefined"`）をラッパ内に閉じ込められる**（second benefit）。
- **やらないと：** `localStorage.getItem(...)` がコンポーネント/フックに散らばり、テストごとにグローバルを書き換え、SSR で実行されて落ちる箇所が点在する。
- **本実装（既にやっている）：** 履歴・URL 操作は素の `window.history` ではなく **`next/navigation`（`useRouter`/`usePathname`）** を使い、テストは `vi.mock("next/navigation")` で差し替えている（[useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts)）。`window` 依存の Plotly は `dynamic(..., { ssr:false })` でクライアントへ隔離している（[PlotlyChart](../src/features/analytics/components/molecules/PlotlyChart.tsx)）。**つまりこの原則は新規コードではなく既存パターンの言語化**。

**ガードレール（「全部ラップ」を避ける）**：抽象化レイヤの作りすぎは過剰設計。線引きは1本：

1. **ラップするのは「Vitest でテストしたいロジック」がブラウザ API に触れるときだけ。** 見た目側は Storybook（実ブラウザ）で本物の API を使えるのでラッパ不要。
2. **フレームワークが既にラッパを提供しているものは再発明しない。** 履歴操作は `next/navigation` を使い、自前 `useLocation` を作らない。
3. **ラッパが要るのは framework が面倒を見ていない素のブラウザ API だけ**（例：`localStorage`, `matchMedia`, `navigator.clipboard`, `Notification`）。

```ts
// ❌ フック内でグローバル直叩き：jsdom でグローバルを書き換えないとテストできず、SSR で落ちる
function useTheme() {
  const saved = localStorage.getItem("theme"); // ← SSR で undefined、テストで monkeypatch 必須
  // ...
}

// ✅ 薄いラッパに隔離：SSR ガードを1か所に閉じ込め、テストは storage を差し替えるだけ
const storage = {
  get(key: string) {
    if (typeof window === "undefined") return null; // SSR 安全をここに閉じ込める
    return window.localStorage.getItem(key);
  },
};
function useTheme() {
  const saved = storage.get("theme"); // ← テストは storage.get をモックすれば済む
  // ...
}
```

> **▶ 試す**：`npm run test:run` で本章のフックテストが走る（`useTicketTableState.test.ts`）。

> **✅ この章のチェック**
> - □ 状態 + 更新ロジックをフックに寄せ、コンポーネントは表示に専念しているか
> - □ そのフックは `next/*` をモックしてブラウザ無しでテストできるか
> - □ 純粋な見た目マッピングまでフックに入れていないか（それは atom）
> - □ ロジックがブラウザ API を直叩きしていないか（ラッパ越しか／framework のラッパを使えないか）

---

## 6. ケーススタディ：フォームとダイアログ

> **結論：枠（FormDialog）は中身を知らない／フォームは設置文脈を知らない／成功は「結果」で親へ返す。**

モーダル内フォーム（作成・編集ダイアログ）は **IF（インターフェース）を崩しやすい**題材。

### 6.1 よくある失敗
- ダイアログが `open` 状態を内部に抱える → 外から制御・テストできない
- ダイアログが中身（文言・送信処理）をハードコード → 再利用できない
- props 肥大（title / fields / onSubmit / onCancel / loading …）
- 成功時の「閉じる＋一覧更新」を繋ぐため、**フォームが dialog や router を直接知る**

### 6.2 本実装（3層 + composition）

```text
TicketCreateDialog / TicketEditDialog (ドメイン/client)  … open 状態を保持。枠と中身を組む
  ├─ FormDialog (汎用枠/molecule)        … { open, title, onClose, children }。フォームを知らない
  │    └─ {children}                      … composition で中身を差し込む（props 貫通なし）
  └─ TicketForm (中身/organism)          … { ticket?, onResult? } を受ける
        ├─ mode 判定: ticket 有→update / 無→create を自分で選ぶ
        └─ useTicketForm が結果(result)を組み立て、onResult で親へ通知
```

データの流れ（フック → Action → onResult が一直線）：

```tsx
// TicketForm（中身）：mode で Action を選び、結果は onResult で親へ返す
function TicketForm({ ticket, onResult }) {
  const action = ticket ? updateTicketInlineAction.bind(null, ticket.id) : createTicketInlineAction;
  const { formAction, error, isPending } = useTicketForm(action, onResult); // 送信完了で onResult(result)
  return <form action={formAction}>{/* fields */}</form>;
}

// 親（ダイアログ）：結果を受けて分岐するだけ
<TicketForm onResult={(r) => { if (r.ok) setOpen(false); }} />            // 作成
<TicketForm ticket={ticket} onResult={(r) => { if (r.ok) setOpen(false); }} /> // 編集
```

崩さないための要点:

1. **FormDialog は枠に徹する**：中身は `children`（composition）。フォームを知らず、props も貫通しない（4.3 と同じ考え）。
2. **永続化（create/update）はフォームが mode で自己決定**：`ticket` の有無で判定。TicketForm は保存方法を自分の責務として持つ（アクションをコンポーネント境界では注入しない）。
3. **after-action（閉じる/遷移）は `onResult` で親へ**：これは設置文脈の話で、フォームには判別できない。
4. **結果は扱いやすい形で返す**：判別可能なユニオン `TicketActionResult`（`{ ok:true; ticket } | { ok:false; error }`）。親は `result.ok` で分岐。

### 6.3 判断の基準（なぜ永続化は自分・後処理は親か）

一見ちぐはぐ（片方は自分で決め、片方は親に返す）に見えるが、基準は一本：

> **「自分（mode）で決まることは自分で。設置文脈で決まることは親へ。」**

- create か update か → `ticket` の有無で**フォーム自身が判定できる** → 自己決定。
- 閉じる/遷移/トースト → **同じ作成でも文脈で変わる**（ダイアログ＝閉じる、別画面＝遷移） → フォームには分からないので親へ返す。

### 6.4 なぜ「結果を返す」とうれしいのか（Why）

フォームに「何をしてほしいか」を**命令で渡す**のでなく、フォームから「何が起きたか」を**結果で受け取る**。主導権が親に残り、フォームは文脈非依存の部品でいられる。

もしフォームが内部で `onClose()` や `router.push()` をやると：別の場所に置くと誤動作し、挙動を変えるたびにフォーム本体を触り、テストに dialog/router のモックが要る。

`onResult(result)` で結果を返すと：

| うれしさ | なぜ |
|---------|------|
| **再利用** | 同じフォームが作成/編集/将来の別文脈でも無改造。違いは「親が結果をどう扱うか」だけ |
| **凝集** | 「成功後どうするか」は UX 判断＝親の知識。親に集約され、フォームは送信に専念 |
| **将来に強い** | 結果が `{ ok, ticket }` という値なので「作った詳細へ飛ぶ」等の後続に **IF 変更なし**で対応。`onSuccess():void` だと後で破綻する |
| **テスト容易** | `useTicketForm` にモック action を渡して `onResult` の引数を見れば検証可（ダイアログ不要） |
| **馴染み** | 「ダイアログは結果を返す部品」「`if (result.ok)`」は WinForms の `DialogResult` と同じ感覚 |

> **補足（トレードオフ）**：アクションをコンポーネントに注入する設計（汎用フォーム向け）もある。本実装は TicketForm をドメイン固有と割り切り「保存は内包・結果は返す」を選んだ。ただし**フック境界では注入可能**（`useTicketForm(action, …)`）なので、送信ロジックは `useTicketForm` のフックテスト + アクションの単体テスト + E2E で担保している。
>
> **補足（progressive enhancement）**：`<form action={formAction}>` は Server Actions のフォームで、基本送信は JS 無効でも動く。一方、結果通知 UI（エラー表示・onResult による開閉）はクライアント前提。

実装: [FormDialog](../src/components/molecules/FormDialog.tsx) / [TicketCreateDialog](../src/features/tickets/components/organisms/TicketCreateDialog.tsx) / [TicketEditDialog](../src/features/tickets/components/organisms/TicketEditDialog.tsx) / [TicketForm](../src/features/tickets/components/organisms/TicketForm.tsx) / [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts)

> **▶ 試す**：`npm run storybook` で TicketCreateDialog / TicketEditDialog の Story を開閉し、Interactions パネルで play を見る。

> **✅ この章のチェック**
> - □ 枠（FormDialog）が中身（フォーム）を知らない（children 受け）か
> - □ フォームが dialog / router を import していないか
> - □ 成功の伝達が「結果（値）」になっているか（`onSuccess():void` で逃げていないか）

---

## 7. テスト戦略

> **結論：ロジックは Vitest（速い・ブラウザ無し）、見た目は Storybook（実ブラウザ・Gherkin）。下限90%。**

| 対象 | ツール | 特徴 |
|------|--------|------|
| ロジック（api / actions / hooks / lib） | Vitest（jsdom + MSW、`next/*` モック） | 速い・ブラウザ不要 |
| 見た目・インタラクション（components） | Storybook Interaction Test（実ブラウザ / Playwright） | play 関数を **Gherkin（Given/When/Then）** で記述 |

- **計測対象**：api / actions / hooks / lib / components。**対象外**：RSC ページ・`app/`。
- カバレッジは **下限90%**（`npm run test:coverage`）。

> **なぜ二層に分けるのか**：ブラウザテスト（Storybook/Playwright）は本物に近く正確だが **遅く・壊れやすい**。そこでロジックはフック（5章）へ逃がし Vitest（ミリ秒・安定）で大量に回し、ブラウザは「見た目と操作」に絞る。**速さと信頼の両取り**のための住み分け。
>
> やらないと：全部を Storybook で検証すると、CI が分単位に膨らみ、些細な UI 変更でロジックのテストまで壊れる。
>
> **なぜ RSC ページを計測対象外にするのか**：RSC はサーバ実行＋ネットワーク前提で、ユニットテストと噛み合わない。ここは E2E / 手動で担保し、カバレッジは「テストすべきロジック」に集中させる（**数字の見栄えより意味**を優先）。

> **▶ 試す**：`npm run test:run`（unit + storybook）／ `npm run test:coverage`（下限90%判定）。

> **✅ この章のチェック**
> - □ そのロジック、ブラウザ無し（Vitest）で書けないか
> - □ Story の play は Given/When/Then で書けているか
> - □ カバレッジ対象（api/actions/hooks/lib/components）を満たすか

---

## 付録A. 要件からの意図的な逸脱

設計には「要件に書かれた手段から、理由をもって外れる」判断もある。記録を残すこと自体が大事（後から「なぜ？」に答えられる）。

| 項目 | 要件 | 本実装 | 理由 | やらないと |
|------|------|--------|------|-----------|
| データ取得 | React Query | Server Components + Server Actions | App Router 本来の流儀を示す。チームが RQ を使わない方針 | 使わない技術が教材に混ざり学習対象がぶれる |
| Custom Hook | `useTicketList` 等の取得フック | 取得は RSC、フックは UI 状態・テスト容易性のため | 上記に伴う再解釈（5章） | フックの存在意義が「取得」だけになり、本来の価値が伝わらない |

これらは [roadmap.md](./roadmap.md) の進捗ログにも「方針変更」として、いつ・なぜ合意したかを記録している。**逸脱は隠さず記録する**のがチーム運用の肝。

## 付録B. 設計原則 ↔ 実装 対応表

左列＝チームの設計原則（出典：[要件定義書](../要件定義書.md) 14章）。

| 設計原則（要件14章） | 本実装での実現 | 実証ファイル |
|--------------------|---------------|------------|
| Feature First | `features/` に機能単位で凝集 | [src/features/](../src/features/) |
| Presentation と Data Fetching の分離 | 取得は RSC（pages）、表示は Presentational（components） | [TicketListPage](../src/features/tickets/pages/TicketListPage.tsx) / [TicketTable](../src/features/tickets/components/organisms/TicketTable.tsx) |
| Container / Presentational | `pages/` = Container、`components/` = Presentational | 〃 |
| Hooks で状態管理を集約 | クライアント UI 状態を Custom Hook に寄せる | [useTicketTableState](../src/features/tickets/hooks/useTicketTableState.ts) / [useTicketForm](../src/features/tickets/hooks/useTicketForm.ts) |
| Components は可能な限り Pure | データ取得・副作用を持ち込まず props で受ける | [components/](../src/features/tickets/components/) |
| 型を API と同期 | OpenAPI から型生成し導出 | [openapi.yaml](./openapi.yaml) → [api.ts](../src/types/api.ts) → [types](../src/features/tickets/types/index.ts) |
