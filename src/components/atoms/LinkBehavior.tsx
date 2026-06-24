"use client";

import * as React from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";

/**
 * MUI の Link / Button(href) を Next.js の Link で動かすためのアダプタ。
 * テーマの defaultProps に設定することで、Server Component からも
 * `component={NextLink}`（関数prop）を渡さずにクライアント遷移できる。
 */
export const LinkBehavior = React.forwardRef<
  HTMLAnchorElement,
  Omit<NextLinkProps, "href"> & { href?: NextLinkProps["href"] }
>(function LinkBehavior(props, ref) {
  const { href, ...other } = props;
  return <NextLink ref={ref} href={href ?? ""} {...other} />;
});
