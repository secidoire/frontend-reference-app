import { screen, within } from "storybook/test";

/**
 * Storybook play 関数の共通ヘルパー（ドメイン非依存）。
 *
 * 目的は **「canvas か screen か」問題をヘルパーに閉じ込める**こと。
 * MUI の Dialog / Menu / Tooltip などは React portal で `document.body` 直下へ出るため
 * `within(canvasElement)` の外に居る。だから素朴に canvas を引くと「要素が無い」で詰まる。
 *
 * - 通常の in-canvas 要素 … 各 Story 側で `within(canvasElement)` を使う。
 * - portal で出る Dialog の中身 … この `dialog()` で `role="dialog"` にスコープして引く。
 *   （`screen` 全体を引くより、ダイアログ内に限定できるので誤マッチしにくい）
 */
export function dialog(): ReturnType<typeof within> {
  return within(screen.getByRole("dialog"));
}

/** ダイアログが閉じている（DOM から消えている）ことの問い合わせに使う。 */
export function queryDialog(): HTMLElement | null {
  return screen.queryByRole("dialog");
}
