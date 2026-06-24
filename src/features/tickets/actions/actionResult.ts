import type { Ticket } from "../types";

/**
 * フォーム送信（= API 実行）の結果を「いい感じの形」で表す判別共用体。
 * フォームはこれを親へ通知し（onResult）、親は ok で分岐する（閉じる / 留まる）。
 * 未送信は `null` で表す（useActionState の初期値）。
 */
export type TicketActionResult =
  | { ok: true; ticket: Ticket }
  | { ok: false; error: string };
