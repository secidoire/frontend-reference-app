import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { listTickets } from "../api/ticketApi";
import { parseTicketQuery, type RawSearchParams } from "../lib/ticketQuery";
import { TicketTable } from "../components/organisms/TicketTable";
import { TicketCreateDialog } from "../components/organisms/TicketCreateDialog";

type TicketListPageProps = {
  searchParams: Promise<RawSearchParams>;
};

/**
 * チケット一覧ページ（Container = async Server Component）。
 * URL の searchParams を ListTicketsQuery に変換し、api層を await して取得。
 * 表示・状態操作は Presentational の TicketTable（"use client"）に委譲する。
 */
export default async function TicketListPage({ searchParams }: TicketListPageProps) {
  const query = parseTicketQuery(await searchParams);
  const { data, total } = await listTickets(query);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" component="h1">
          Tickets
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button href="/analytics" variant="outlined">
            分析
          </Button>
          <TicketCreateDialog />
        </Stack>
      </Stack>
      <TicketTable rows={data} rowCount={total} query={query} />
    </Container>
  );
}
