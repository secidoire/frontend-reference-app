"use client";

import { useActionState, useEffect } from "react";
import type { FormState } from "../actions/formState";

/**
 * チケットフォームの状態管理を集約する Custom Hook。
 * useActionState をラップし、UI（TicketForm）からは送信状態・エラーだけを見えるようにする。
 *
 * `onSuccess` を渡すと、アクションが成功シグナル（state.ok）を返したときに発火する。
 * これにより **フォームはダイアログを知らないまま**、呼び出し側が「閉じる」等を行える。
 *
 * ねらい: フォームの「状態管理」と「マークアップ」「設置文脈（ページ/ダイアログ）」を分離する。
 */
export function useTicketForm(
  action: (prev: FormState, formData: FormData) => Promise<FormState>,
  onSuccess?: () => void,
) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state, onSuccess]);

  return { error: state.error, formAction, isPending };
}
