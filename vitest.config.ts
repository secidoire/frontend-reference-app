import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import storybookTest from "@storybook/addon-vitest/vitest-plugin";

// storybookTest は Promise<Plugin[]> を返すため、async config 関数内で await する
// （configDir 既定 = .storybook）。top-level await は config バンドルで不可。
export default defineConfig(async () => {
  const storybookPlugins = await storybookTest();

  return {
    test: {
      // 両プロジェクト合算のカバレッジ。下限 90%。
      coverage: {
        provider: "v8" as const,
        include: ["src/**"],
        exclude: [
          "src/**/*.stories.*",
          "src/**/*.test.*",
          "src/test/**",
          "src/mocks/**",
          "src/types/**", // 生成 api.ts
          "src/features/*/types/**", // 型のみ
          "src/app/**", // ルーティング薄皮 + RSC ページ
          "src/features/*/pages/**", // RSC コンテナ（e2e/Playwrightで担保）
          "src/theme/**",
        ],
        reporter: ["text-summary", "text"],
        thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
      },
      projects: [
        {
          // ── 単体テスト（jsdom + MSW node）
          plugins: [react()],
          resolve: { tsconfigPaths: true },
          test: {
            name: "unit",
            environment: "jsdom",
            setupFiles: ["./src/test/setup.ts"],
            include: ["src/**/*.{test,spec}.{ts,tsx}"],
          },
        },
        {
          // ── Storybook Interaction Test（実ブラウザ / Playwright）
          plugins: storybookPlugins,
          // 初回のdep最適化によるテスト中リロード（flaky）を防ぐ
          optimizeDeps: { include: ["msw-storybook-addon"] },
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: "chromium" as const }],
            },
            // preview annotations は addon-vitest が自動適用（SB10.3+）
          },
        },
      ],
    },
  };
});
