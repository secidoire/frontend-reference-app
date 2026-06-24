"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/services/apiClient";
import type { CreateTicketInput, UpdateTicketInput, TicketPriority, TicketStatus } from "../types";
import type { TicketActionResult } from "./actionResult";

/**
 * tickets の **書き込み** = Server Actions。
 * apiClient で更新し、完了後に revalidatePath で関係するルートを再取得させる。
 * フォームからは action / useActionState 経由で呼ぶ（Step 13 で接続）。
 */

export async function createTicketAction(input: CreateTicketInput) {
  const { data, error } = await apiClient.POST("/api/tickets", { body: input });
  if (error || !data) {
    throw new Error("Failed to create ticket");
  }
  revalidatePath("/tickets");
  return data;
}

export async function updateTicketAction(id: string, input: UpdateTicketInput) {
  const { data, error } = await apiClient.PATCH("/api/tickets/{id}", {
    params: { path: { id } },
    body: input,
  });
  if (error || !data) {
    throw new Error("Failed to update ticket");
  }
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
  return data;
}

export async function deleteTicketAction(id: string) {
  const { error } = await apiClient.DELETE("/api/tickets/{id}", {
    params: { path: { id } },
  });
  if (error) {
    throw new Error("Failed to delete ticket");
  }
  revalidatePath("/tickets");
}

// ───────────────────────── フォーム接続（useActionState） ─────────────────────────

const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];
const STATUSES: TicketStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** フォーム値を検証して CreateTicketInput を組み立てる。 */
function parseTicketForm(formData: FormData): { input: CreateTicketInput } | { error: string } {
  const title = str(formData, "title");
  const description = str(formData, "description");
  const assigneeId = str(formData, "assigneeId");
  const priority = str(formData, "priority") as TicketPriority;
  const status = str(formData, "status") as TicketStatus;

  if (!title) return { error: "タイトルは必須です" };
  if (!assigneeId) return { error: "担当は必須です" };
  if (!PRIORITIES.includes(priority)) return { error: "優先度が不正です" };

  const input: CreateTicketInput = { title, description, assigneeId, priority };
  if (STATUSES.includes(status)) input.status = status;
  return { input };
}

/**
 * 作成フォーム用 Server Action。画面遷移せず **実行結果（作成された ticket）** を返す。
 * 「その後どうするか（閉じる/遷移）」は呼び出し側が result を見て決める。
 */
export async function createTicketInlineAction(
  _prev: TicketActionResult | null,
  formData: FormData,
): Promise<TicketActionResult> {
  const parsed = parseTicketForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  try {
    const ticket = await createTicketAction(parsed.input); // /tickets を revalidate
    return { ok: true, ticket };
  } catch {
    return { ok: false, error: "作成に失敗しました" };
  }
}

/**
 * 編集フォーム用 Server Action。id を bind して使う。
 * 画面遷移せず **実行結果（更新された ticket）** を返す（revalidate 済み）。
 */
export async function updateTicketInlineAction(
  id: string,
  _prev: TicketActionResult | null,
  formData: FormData,
): Promise<TicketActionResult> {
  const parsed = parseTicketForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  try {
    const ticket = await updateTicketAction(id, parsed.input); // /tickets, /tickets/[id] を revalidate
    return { ok: true, ticket };
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
}
