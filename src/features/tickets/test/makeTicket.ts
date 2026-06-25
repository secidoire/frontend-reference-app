import type { Ticket } from "../types";

/**
 * テスト/Story 用の Ticket ファクトリ。
 *
 * ねらいは **フィクスチャの単一の源**。各 Story で `const t: Ticket = {...}` を
 * 手書きすると、型が増減するたびに全箇所が壊れて修正が散る。ここに既定値を集約し、
 * テストは「差分（overrides）」だけを書く（`makeTicket({ status: "DONE" })`）。
 *
 * 既定値は意味のある1件（作成済み・進行中）に固定。日付は固定文字列で
 * スナップショットや表示が安定するようにする（実行時刻に依存させない）。
 */
export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "t1",
    title: "既存チケット",
    description: "説明",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "u2",
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
    ...overrides,
  };
}
