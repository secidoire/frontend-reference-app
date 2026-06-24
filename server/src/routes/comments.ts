import { Router } from "express";
import { comments, tickets, createComment } from "../data/store";

// mergeParams: true で親ルート（/api/tickets/:id）の :id を受け取る。
export const commentsRouter = Router({ mergeParams: true });

// GET /api/tickets/:id/comments
commentsRouter.get<{ id: string }>("/", (req, res) => {
  const ticketId = req.params.id;
  const list = comments
    .filter((c) => c.ticketId === ticketId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  res.json(list);
});

// POST /api/tickets/:id/comments
commentsRouter.post<{ id: string }>("/", (req, res) => {
  const ticketId = req.params.id;
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }
  const comment = createComment(ticketId, req.body);
  res.status(201).json(comment);
});
