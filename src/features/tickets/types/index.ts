import type { components } from "@/types/api";

/** ドメイン型は生成型（openapi.yaml由来）から導出する。手書きしない。 */
export type Ticket = components["schemas"]["Ticket"];
export type TicketStatus = components["schemas"]["TicketStatus"];
export type TicketPriority = components["schemas"]["TicketPriority"];
export type CreateTicketInput = components["schemas"]["CreateTicketInput"];
export type UpdateTicketInput = components["schemas"]["UpdateTicketInput"];
export type TicketListResponse = components["schemas"]["TicketListResponse"];
