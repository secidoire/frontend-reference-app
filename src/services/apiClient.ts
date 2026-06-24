import createClient from "openapi-fetch";
import type { paths } from "@/types/api";

/**
 * 型安全なAPIクライアント（openapi-fetch）。
 *
 * - `paths` は openapi.yaml から生成された型。エンドポイント・パラメータ・
 *   レスポンスが全て型で縛られる。
 * - **サーバ側（Server Components / Server Actions）から利用する。**
 *   ベースURLは API_BASE_URL（例 http://localhost:4000）で注入する。
 */
const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

export const apiClient = createClient<paths>({
  baseUrl,
  // createClient 時に globalThis.fetch をキャプチャさせず、呼び出し毎に解決する。
  // これで MSW（テスト）や Next の計装 fetch を確実に経由する。
  fetch: (request) => fetch(request),
});
