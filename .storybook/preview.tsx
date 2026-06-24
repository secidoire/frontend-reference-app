import * as React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { initialize, mswLoader } from "msw-storybook-addon";
import { theme } from "../src/theme";
import { handlers } from "../src/mocks/handlers";

// ブラウザ用 MSW を起動（未定義リクエストは素通し）
initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // 既定で契約準拠ハンドラを適用。story 側で上書き可能
    msw: { handlers },
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
