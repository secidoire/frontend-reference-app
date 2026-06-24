import { apiClient } from "@/services/apiClient";
import type { Analytics } from "../types";

/** 集計データを取得（サーバ側fetch・読み取り）。 */
export async function getAnalytics(): Promise<Analytics> {
  const { data, error } = await apiClient.GET("/api/analytics");
  if (error || !data) {
    throw new Error("Failed to fetch analytics");
  }
  return data;
}
