"use client";

import { createTheme } from "@mui/material/styles";
import { LinkBehavior } from "@/components/atoms/LinkBehavior";

/**
 * アプリ全体のMUIテーマ。
 * `"use client"` を付けることで、Server Component（layout.tsx）から
 * Client Component の ThemeProvider へ安全に渡せるモジュール境界にしている。
 */
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#7c3aed",
    },
    background: {
      default: "#f7f8fa",
    },
  },
  typography: {
    fontFamily: [
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Next.js Link 統合：Link / Button(href) をクライアント遷移にする
    MuiLink: { defaultProps: { component: LinkBehavior } },
    MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } },
  },
});

export default theme;
