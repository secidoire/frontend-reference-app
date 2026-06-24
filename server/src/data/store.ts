import { randomUUID } from "node:crypto";
import type {
  Ticket,
  User,
  Comment,
  CreateTicketInput,
  UpdateTicketInput,
  CreateCommentInput,
} from "../types";

// ───────────────────────────── seed data ─────────────────────────────
// 実運用ではなくリファレンス用のインメモリデータ。プロセス再起動で初期化される。

export const users: User[] = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Carol" },
];

export const tickets: Ticket[] = [
  iso("t1", "ログイン画面のレイアウト崩れ", "狭幅でフォームが崩れる", "TODO", "HIGH", "u1", "2026-01-10"),
  iso("t2", "検索のパフォーマンス改善", "件数が多いと遅い", "IN_PROGRESS", "MEDIUM", "u2", "2026-01-22"),
  iso("t3", "READMEの更新", "セットアップ手順を追記", "DONE", "LOW", "u1", "2026-02-05"),
  iso("t4", "通知バッジの不具合", "既読後も残る", "REVIEW", "HIGH", "u3", "2026-02-18"),
  iso("t5", "ダークモード対応", "テーマ切替を追加", "TODO", "MEDIUM", "u2", "2026-03-03"),
  iso("t6", "CSVエクスポート", "一覧をCSV出力", "IN_PROGRESS", "HIGH", "u1", "2026-03-27"),
  iso("t7", "ログ基盤の整備", "構造化ログを導入", "DONE", "MEDIUM", "u3", "2026-04-12"),
  iso("t8", "アクセシビリティ点検", "コントラスト比の確認", "REVIEW", "LOW", "u2", "2026-05-09"),
  iso("t9", "オンボーディング改善", "初回ガイドを追加", "TODO", "HIGH", "u1", "2026-06-01"),
];

export const comments: Comment[] = [
  { id: "c1", ticketId: "t1", authorId: "u2", content: "再現できました。対応します。", createdAt: "2026-01-11T09:00:00.000Z" },
  { id: "c2", ticketId: "t1", authorId: "u1", content: "ありがとうございます！", createdAt: "2026-01-11T10:30:00.000Z" },
  { id: "c3", ticketId: "t2", authorId: "u3", content: "インデックス追加で改善しそうです。", createdAt: "2026-01-23T14:00:00.000Z" },
];

/** seed用ヘルパ。createdAt/updatedAt を同一の日付（00:00 UTC）で埋める。 */
function iso(
  id: string,
  title: string,
  description: string,
  status: Ticket["status"],
  priority: Ticket["priority"],
  assigneeId: string,
  date: string,
): Ticket {
  const at = `${date}T00:00:00.000Z`;
  return { id, title, description, status, priority, assigneeId, createdAt: at, updatedAt: at };
}

// ───────────────────────────── mutators ─────────────────────────────

export function createTicket(input: CreateTicketInput): Ticket {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status ?? "TODO",
    priority: input.priority,
    assigneeId: input.assigneeId,
    createdAt: now,
    updatedAt: now,
  };
  tickets.push(ticket);
  return ticket;
}

export function updateTicket(id: string, input: UpdateTicketInput): Ticket | undefined {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return undefined;
  Object.assign(ticket, input, { updatedAt: new Date().toISOString() });
  return ticket;
}

export function deleteTicket(id: string): boolean {
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tickets.splice(index, 1);
  return true;
}

export function createComment(ticketId: string, input: CreateCommentInput): Comment {
  const comment: Comment = {
    id: randomUUID(),
    ticketId,
    authorId: input.authorId,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  return comment;
}
