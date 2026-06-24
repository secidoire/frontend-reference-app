import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Node環境（Vitest）用。サーバ側 fetch を intercept する。 */
export const server = setupServer(...handlers);
