import { ticketHandlers } from "./tickets";
import { commentHandlers } from "./comments";
import { analyticsHandlers } from "./analytics";

export const handlers = [
  ...ticketHandlers,
  ...commentHandlers,
  ...analyticsHandlers,
];
