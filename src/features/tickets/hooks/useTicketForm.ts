"use client";

import { useActionState, useEffect } from "react";
import type { TicketActionResult } from "../actions/actionResult";

/**
 * チケットフォームの状態管理を集約する Custom Hook。
 * フォームの中で送信・状態を**カプセル化**し、外へは「結果（result）」だけを通知する。
 *
 * `onResult` … 送信完了ごとに API 実行結果を親へ渡す（ダイアログの開閉などは親が決める）。
 * 戻り値の `error` … 失敗時のメッセージ（フォーム内の表示用）。
 *
 * ねらい: フォームは設置文脈（ページ/ダイアログ）を知らないまま、
 * 「結果を返す」ことだけ約束する（WinForms のダイアログ結果のようなイメージ）。
 */
export function useTicketForm(
  action: (prev: TicketActionResult | null, formData: FormData) => Promise<TicketActionResult>,
  onResult?: (result: TicketActionResult) => void,
) {
  const [result, formAction, isPending] = useActionState<TicketActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (result) onResult?.(result);
  }, [result, onResult]);

  const error = result && !result.ok ? result.error : undefined;
  return { error, formAction, isPending, result };
}
