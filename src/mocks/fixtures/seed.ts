import type { Ticket } from "@/features/tickets/types";
import type { User } from "@/features/users/types";
import type { Comment } from "@/features/comments/types";

/**
 * モック用のシードデータ。テスト毎に初期状態へ戻せるよう、
 * 配列は毎回 new するファクトリ関数で返す（server側シードとは独立）。
 */

export const seedUsers: User[] = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Carol" },
];

export function makeSeedTickets(): Ticket[] {
  const t = (
    id: string,
    title: string,
    status: Ticket["status"],
    priority: Ticket["priority"],
    assigneeId: string,
    date: string,
  ): Ticket => {
    const at = `${date}T00:00:00.000Z`;
    return { id, title, description: `${title} の説明`, status, priority, assigneeId, createdAt: at, updatedAt: at };
  };
  return [
    t("t1", "ログイン不具合", "TODO", "HIGH", "u1", "2026-01-10"),
    t("t2", "検索が遅い", "IN_PROGRESS", "MEDIUM", "u2", "2026-01-22"),
    t("t3", "README更新", "DONE", "LOW", "u1", "2026-02-05"),
    t("t4", "通知バッジ不具合", "REVIEW", "HIGH", "u3", "2026-02-18"),
    t("t5", "ダークモード", "TODO", "MEDIUM", "u2", "2026-03-03"),
    t("t6", "CSVエクスポート", "IN_PROGRESS", "HIGH", "u1", "2026-03-27"),
  ];
}

export function makeSeedComments(): Comment[] {
  return [
    { id: "c1", ticketId: "t1", authorId: "u2", content: "再現しました", createdAt: "2026-01-11T09:00:00.000Z" },
    { id: "c2", ticketId: "t1", authorId: "u1", content: "ありがとうございます", createdAt: "2026-01-11T10:30:00.000Z" },
  ];
}
