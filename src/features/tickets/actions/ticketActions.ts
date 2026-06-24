"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/services/apiClient";
import type { CreateTicketInput, UpdateTicketInput } from "../types";

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
