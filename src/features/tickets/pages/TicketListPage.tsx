import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { listTickets } from "../api/ticketApi";
import { parseTicketQuery, type RawSearchParams } from "../lib/ticketQuery";
import { TicketTable } from "../components/organisms/TicketTable";

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
      <Typography variant="h4" component="h1" gutterBottom>
        Tickets
      </Typography>
      <TicketTable rows={data} rowCount={total} query={query} />
    </Container>
  );
}
