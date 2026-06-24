import { Router } from "express";
import { tickets } from "../data/store";
import type { Analytics, TicketStatus } from "../types";

export const analyticsRouter = Router();

const STATUSES: TicketStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

// GET /api/analytics — ステータス別 / 担当者別 / 月次作成数
analyticsRouter.get("/", (_req, res) => {
  const byStatus = STATUSES.map((status) => ({
    status,
    count: tickets.filter((t) => t.status === status).length,
  }));

  const assigneeCounts = new Map<string, number>();
  for (const t of tickets) {
    assigneeCounts.set(t.assigneeId, (assigneeCounts.get(t.assigneeId) ?? 0) + 1);
  }
  const byAssignee = [...assigneeCounts.entries()].map(([assigneeId, count]) => ({
    assigneeId,
    count,
  }));

  const monthlyCounts = new Map<string, number>();
  for (const t of tickets) {
    const month = t.createdAt.slice(0, 7); // "YYYY-MM"
    monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1);
  }
  const monthlyCreated = [...monthlyCounts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const analytics: Analytics = { byStatus, byAssignee, monthlyCreated };
  res.json(analytics);
});
