// フロントと同じ契約（docs/openapi.yaml から生成された型）を server 側でも再利用する。
// 型のみの import なので実行時依存はない。
import type { components } from "../../src/types/api";

export type Ticket = components["schemas"]["Ticket"];
export type TicketStatus = components["schemas"]["TicketStatus"];
export type TicketPriority = components["schemas"]["TicketPriority"];
export type CreateTicketInput = components["schemas"]["CreateTicketInput"];
export type UpdateTicketInput = components["schemas"]["UpdateTicketInput"];
export type TicketListResponse = components["schemas"]["TicketListResponse"];
export type User = components["schemas"]["User"];
export type Comment = components["schemas"]["Comment"];
export type CreateCommentInput = components["schemas"]["CreateCommentInput"];
export type Analytics = components["schemas"]["Analytics"];
