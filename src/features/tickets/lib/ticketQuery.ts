import type { ListTicketsQuery } from "../api/ticketApi";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

/**
 * URL の searchParams を検証付きで ListTicketsQuery に変換する pure 関数。
 * 不正値は無視する（型を生成型に合わせて絞る）。Server Component から使う。
 */
export function parseTicketQuery(sp: RawSearchParams): ListTicketsQuery {
  const q: ListTicketsQuery = {};

  const status = one(sp.status);
  if (status === "TODO" || status === "IN_PROGRESS" || status === "REVIEW" || status === "DONE") {
    q.status = status;
  }

  const priority = one(sp.priority);
  if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
    q.priority = priority;
  }

  const sort = one(sp.sort);
  if (sort === "createdAt" || sort === "updatedAt" || sort === "priority" || sort === "status") {
    q.sort = sort;
  }

  const order = one(sp.order);
  if (order === "asc" || order === "desc") {
    q.order = order;
  }

  const search = one(sp.search);
  if (search) q.search = search;

  const page = Number(one(sp.page));
  if (Number.isInteger(page) && page > 0) q.page = page;

  const pageSize = Number(one(sp.pageSize));
  if (Number.isInteger(pageSize) && pageSize > 0) q.pageSize = pageSize;

  return q;
}

/** ListTicketsQuery を URL クエリ文字列に直す（既定値は省略）。 */
export function serializeTicketQuery(q: ListTicketsQuery): string {
  const p = new URLSearchParams();
  if (q.status) p.set("status", q.status);
  if (q.priority) p.set("priority", q.priority);
  if (q.search) p.set("search", q.search);
  if (q.sort) {
    p.set("sort", q.sort);
    p.set("order", q.order ?? "desc");
  }
  if (q.page && q.page > 1) p.set("page", String(q.page));
  if (q.pageSize && q.pageSize !== 20) p.set("pageSize", String(q.pageSize));
  return p.toString();
}
