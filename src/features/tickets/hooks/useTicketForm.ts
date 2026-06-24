"use client";

import { useActionState } from "react";
import type { FormState } from "../actions/formState";

/**
 * チケットフォームの状態管理を集約する Custom Hook。
 * useActionState をラップし、UI（TicketForm）からは送信状態・エラーだけを見えるようにする。
 *
 * ねらい: フォームの「状態管理」と「マークアップ」の責務を分離し、
 * TicketForm を表示に専念させる（Hooksで状態管理を集約 / Components を Pure に保つ）。
 */
export function useTicketForm(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  return { error: state.error, formAction, isPending };
}
