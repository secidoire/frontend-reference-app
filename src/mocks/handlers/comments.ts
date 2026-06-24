import { http, HttpResponse } from "msw";
import type { Comment, CreateCommentInput } from "@/features/comments/types";
import { db } from "../db";

export const commentHandlers = [
  // GET /api/tickets/:id/comments
  http.get("*/api/tickets/:id/comments", ({ params }) => {
    const list = db.comments
      .filter((c) => c.ticketId === params.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return HttpResponse.json(list);
  }),

  // POST /api/tickets/:id/comments
  http.post("*/api/tickets/:id/comments", async ({ params, request }) => {
    const ticketId = String(params.id);
    const ticket = db.tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return HttpResponse.json({ message: "Ticket not found" }, { status: 404 });
    }
    const input = (await request.json()) as CreateCommentInput;
    const comment: Comment = {
      id: crypto.randomUUID(),
      ticketId,
      authorId: input.authorId,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    return HttpResponse.json(comment, { status: 201 });
  }),
];
