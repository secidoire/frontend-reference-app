import { http, HttpResponse } from "msw";
import type {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
} from "@/features/tickets/types";
import { db } from "../db";

const PRIORITY_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const STATUS_ORDER: Record<string, number> = { TODO: 0, IN_PROGRESS: 1, REVIEW: 2, DONE: 3 };

function compare(a: Ticket, b: Ticket, key: string): number {
  switch (key) {
    case "priority":
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case "updatedAt":
      return a.updatedAt.localeCompare(b.updatedAt);
    default:
      return a.createdAt.localeCompare(b.createdAt);
  }
}

export const ticketHandlers = [
  // GET /api/tickets — filter / sort / paging
  http.get("*/api/tickets", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams;
    let result = [...db.tickets];

    const status = q.get("status");
    const priority = q.get("priority");
    const assigneeId = q.get("assigneeId");
    const search = q.get("search");
    if (status) result = result.filter((t) => t.status === status);
    if (priority) result = result.filter((t) => t.priority === priority);
    if (assigneeId) result = result.filter((t) => t.assigneeId === assigneeId);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(s));
    }

    const sort = q.get("sort") ?? "createdAt";
    const dir = q.get("order") === "asc" ? 1 : -1;
    result.sort((a, b) => dir * compare(a, b, sort));

    const page = Math.max(1, Number(q.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.get("pageSize") ?? 20)));
    const total = result.length;
    const data = result.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json({ data, total, page, pageSize });
  }),

  // POST /api/tickets
  http.post("*/api/tickets", async ({ request }) => {
    const input = (await request.json()) as CreateTicketInput;
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status ?? "TODO",
      priority: input.priority,
      assigneeId: input.assigneeId,
      createdAt: now,
      updatedAt: now,
    };
    db.tickets.push(ticket);
    return HttpResponse.json(ticket, { status: 201 });
  }),

  // GET /api/tickets/:id
  http.get("*/api/tickets/:id", ({ params }) => {
    const ticket = db.tickets.find((t) => t.id === params.id);
    if (!ticket) {
      return HttpResponse.json({ message: "Ticket not found" }, { status: 404 });
    }
    return HttpResponse.json(ticket);
  }),

  // PATCH /api/tickets/:id
  http.patch("*/api/tickets/:id", async ({ params, request }) => {
    const ticket = db.tickets.find((t) => t.id === params.id);
    if (!ticket) {
      return HttpResponse.json({ message: "Ticket not found" }, { status: 404 });
    }
    const input = (await request.json()) as UpdateTicketInput;
    Object.assign(ticket, input, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(ticket);
  }),

  // DELETE /api/tickets/:id
  http.delete("*/api/tickets/:id", ({ params }) => {
    const index = db.tickets.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: "Ticket not found" }, { status: 404 });
    }
    db.tickets.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
