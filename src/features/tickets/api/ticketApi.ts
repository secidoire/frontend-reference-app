import { apiClient } from "@/services/apiClient";
import type { paths } from "@/types/api";
import type { Ticket, TicketListResponse } from "../types";

/**
 * tickets の **読み取り** API（サーバ側で実行）。
 * Server Components から await して使う。クライアントには持ち込まない。
 * 戻り値・引数は openapi.yaml 由来の生成型で縛られる。
 */

export type ListTicketsQuery = NonNullable<
  paths["/api/tickets"]["get"]["parameters"]["query"]
>;

export async function listTickets(
  query: ListTicketsQuery = {},
): Promise<TicketListResponse> {
  const { data, error } = await apiClient.GET("/api/tickets", {
    params: { query },
  });
  if (error || !data) {
    throw new Error("Failed to fetch tickets");
  }
  return data;
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const { data, error, response } = await apiClient.GET("/api/tickets/{id}", {
    params: { path: { id } },
  });
  if (response.status === 404) {
    return null;
  }
  if (error || !data) {
    throw new Error("Failed to fetch ticket");
  }
  return data;
}
