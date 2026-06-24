import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@/mocks/server";
import { resetDb } from "@/mocks/db";

// MSW: テスト全体でサーバ側 fetch を intercept する。
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetDb(); // 各テスト後にモックDBを初期状態へ戻す
});
afterAll(() => server.close());
