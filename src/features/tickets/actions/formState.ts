/**
 * フォーム送信結果の状態（useActionState 用）。"use server" 外に置く。
 * - error: 失敗時のメッセージ
 * - ok: 成功シグナル（ダイアログを閉じる等、呼び出し側が後続処理に使う）
 */
export type FormState = { error?: string; ok?: boolean };
