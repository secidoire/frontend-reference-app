import { Router } from "express";
import { tickets, createTicket, updateTicket, deleteTicket } from "../data/store";
import { commentsRouter } from "./comments";
import type { Ticket } from "../types";

const PRIORITY_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const STATUS_ORDER: Record<string, number> = { TODO: 0, IN_PROGRESS: 1, REVIEW: 2, DONE: 3 };

export const ticketsRouter = Router();

/** クエリ値を単一文字列として取り出す（配列で来た場合は先頭）。 */
function str(value: unknown): string | undefined {
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

// GET /api/tickets — フィルタ / ソート / ページング
ticketsRouter.get("/", (req, res) => {
  const { status, priority, assigneeId, search } = req.query;
  let result = [...tickets];

  const fStatus = str(status);
  const fPriority = str(priority);
  const fAssignee = str(assigneeId);
  const fSearch = str(search);

  if (fStatus) result = result.filter((t) => t.status === fStatus);
  if (fPriority) result = result.filter((t) => t.priority === fPriority);
  if (fAssignee) result = result.filter((t) => t.assigneeId === fAssignee);
  if (fSearch) {
    const q = fSearch.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }

  const sort = str(req.query.sort) ?? "createdAt";
  const order = str(req.query.order) ?? "desc";
  const dir = order === "asc" ? 1 : -1;
  result.sort((a, b) => dir * compare(a, b, sort));

  const page = Math.max(1, Number(str(req.query.page) ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(str(req.query.pageSize) ?? 20)));
  const total = result.length;
  const data = result.slice((page - 1) * pageSize, page * pageSize);

  res.json({ data, total, page, pageSize });
});

function compare(a: Ticket, b: Ticket, key: string): number {
  switch (key) {
    case "priority":
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case "updatedAt":
      return a.updatedAt.localeCompare(b.updatedAt);
    case "createdAt":
    default:
      return a.createdAt.localeCompare(b.createdAt);
  }
}

// POST /api/tickets
ticketsRouter.post("/", (req, res) => {
  const ticket = createTicket(req.body);
  res.status(201).json(ticket);
});

// GET /api/tickets/:id
ticketsRouter.get("/:id", (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

// PATCH /api/tickets/:id
ticketsRouter.patch("/:id", (req, res) => {
  const ticket = updateTicket(req.params.id, req.body);
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

// DELETE /api/tickets/:id
ticketsRouter.delete("/:id", (req, res) => {
  const ok = deleteTicket(req.params.id);
  if (!ok) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }
  res.status(204).end();
});

// /api/tickets/:id/comments
ticketsRouter.use("/:id/comments", commentsRouter);
