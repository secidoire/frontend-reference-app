import { describe, it, expect } from "vitest";
import { parseTicketQuery, serializeTicketQuery } from "./ticketQuery";

describe("parseTicketQuery", () => {
  it("有効な値を取り込む", () => {
    expect(
      parseTicketQuery({ status: "TODO", priority: "HIGH", sort: "priority", order: "asc", page: "2", pageSize: "10" }),
    ).toEqual({ status: "TODO", priority: "HIGH", sort: "priority", order: "asc", page: 2, pageSize: 10 });
  });

  it("不正値・空は無視する", () => {
    expect(parseTicketQuery({ status: "WRONG", page: "0", sort: "title" })).toEqual({});
  });

  it("配列パラメータは先頭を採用する", () => {
    expect(parseTicketQuery({ status: ["DONE", "TODO"] })).toEqual({ status: "DONE" });
  });

  it("search を取り込む", () => {
    expect(parseTicketQuery({ search: "ログイン" })).toEqual({ search: "ログイン" });
  });
});

describe("serializeTicketQuery", () => {
  it("既定値は省略する", () => {
    expect(serializeTicketQuery({ page: 1, pageSize: 20 })).toBe("");
  });

  it("sort 指定時は order を補う", () => {
    expect(serializeTicketQuery({ sort: "createdAt" })).toBe("sort=createdAt&order=desc");
  });

  it("フィルタ・ページを直列化する", () => {
    const qs = serializeTicketQuery({ status: "TODO", page: 3 });
    expect(qs).toContain("status=TODO");
    expect(qs).toContain("page=3");
  });

  it("全フィールドを直列化する（priority/search/order/pageSize）", () => {
    const qs = serializeTicketQuery({
      status: "TODO",
      priority: "HIGH",
      search: "abc",
      sort: "priority",
      order: "asc",
      page: 2,
      pageSize: 50,
    });
    expect(qs).toContain("priority=HIGH");
    expect(qs).toContain("search=abc");
    expect(qs).toContain("order=asc");
    expect(qs).toContain("pageSize=50");
    expect(qs).toContain("page=2");
  });
});
