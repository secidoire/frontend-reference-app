import NextLink from "next/link";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import { StatusChip } from "../atoms/StatusChip";
import { PriorityChip } from "../atoms/PriorityChip";
import { formatDate } from "@/lib/date";
import type { Ticket } from "../../types";

type TicketDetailTemplateProps = {
  ticket: Ticket;
};

/** チケット詳細の表示テンプレート（Presentational）。ドメイン画面の構成を担う。 */
export function TicketDetailTemplate({ ticket }: TicketDetailTemplateProps) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Link component={NextLink} href="/tickets" underline="hover">
        ← 一覧へ戻る
      </Link>

      <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
        <StatusChip status={ticket.status} />
        <PriorityChip priority={ticket.priority} />
      </Stack>

      <Typography variant="h4" component="h1" sx={{ mt: 1 }}>
        {ticket.title}
      </Typography>

      <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
        <Stack spacing={2}>
          <Field label="説明">
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{ticket.description}</Typography>
          </Field>
          <Divider />
          <Field label="担当">
            <Typography>{ticket.assigneeId}</Typography>
          </Field>
          <Field label="作成日">
            <Typography>{formatDate(ticket.createdAt)}</Typography>
          </Field>
          <Field label="更新日">
            <Typography>{formatDate(ticket.updatedAt)}</Typography>
          </Field>
        </Stack>
      </Paper>
    </Container>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2}>
      <Typography color="text.secondary" sx={{ width: 80, flexShrink: 0 }}>
        {label}
      </Typography>
      {children}
    </Stack>
  );
}
