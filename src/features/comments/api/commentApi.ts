import { apiClient } from "@/services/apiClient";
import type { Comment } from "../types";

/** 指定チケットのコメント一覧を取得（サーバ側fetch・読み取り）。 */
export async function listComments(ticketId: string): Promise<Comment[]> {
  const { data, error } = await apiClient.GET("/api/tickets/{id}/comments", {
    params: { path: { id: ticketId } },
  });
  if (error || !data) {
    throw new Error("Failed to fetch comments");
  }
  return data;
}
