import { http, HttpResponse } from "msw";
import type { Analytics } from "@/features/analytics/types";
import type { TicketStatus } from "@/features/tickets/types";
import { db } from "../db";

const STATUSES: TicketStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const analyticsHandlers = [
  // GET /api/analytics
  http.get("*/api/analytics", () => {
    const byStatus = STATUSES.map((status) => ({
      status,
      count: db.tickets.filter((t) => t.status === status).length,
    }));

    const assigneeCounts = new Map<string, number>();
    for (const t of db.tickets) {
      assigneeCounts.set(t.assigneeId, (assigneeCounts.get(t.assigneeId) ?? 0) + 1);
    }
    const byAssignee = [...assigneeCounts.entries()].map(([assigneeId, count]) => ({
      assigneeId,
      count,
    }));

    const monthlyCounts = new Map<string, number>();
    for (const t of db.tickets) {
      const month = t.createdAt.slice(0, 7);
      monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1);
    }
    const monthlyCreated = [...monthlyCounts.entries()]
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const analytics: Analytics = { byStatus, byAssignee, monthlyCreated };
    return HttpResponse.json(analytics);
  }),
];
