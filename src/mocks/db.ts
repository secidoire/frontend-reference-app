import type { Ticket } from "@/features/tickets/types";
import type { Comment } from "@/features/comments/types";
import { makeSeedTickets, makeSeedComments } from "./fixtures/seed";

/**
 * モックの可変インメモリDB。ハンドラはここを読み書きする。
 * テストの beforeEach で `resetDb()` を呼べば初期状態に戻る。
 */
export const db = {
  tickets: makeSeedTickets() as Ticket[],
  comments: makeSeedComments() as Comment[],
};

export function resetDb(): void {
  db.tickets = makeSeedTickets();
  db.comments = makeSeedComments();
}
