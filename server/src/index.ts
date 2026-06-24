import express from "express";
import cors from "cors";
import { ticketsRouter } from "./routes/tickets";
import { analyticsRouter } from "./routes/analytics";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/tickets", ticketsRouter);
app.use("/api/analytics", analyticsRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[ticket-server] listening on http://localhost:${port}`);
});
