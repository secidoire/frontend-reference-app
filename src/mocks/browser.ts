import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * ブラウザ環境（Storybook）用。
 * 利用前に `npx msw init public --save` で public/mockServiceWorker.js を生成する（Step 8）。
 */
export const worker = setupWorker(...handlers);
