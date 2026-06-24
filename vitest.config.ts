import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // tsconfig の paths（@/* → src/*）をネイティブ解決
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // server/ は独自のテスト戦略（対象外）
    exclude: ["server/**", "node_modules/**", ".next/**"],
  },
});
