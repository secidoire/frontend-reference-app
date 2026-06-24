import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import { listTickets } from "../api/ticketApi";

/**
 * チケット一覧ページ（Container = async Server Component）。
 * ここでデータ取得（api層をawait）し、表示は Presentational に渡すのが規約。
 * いまは規約確認のため簡易テーブルを直書き。
 * Step 10 で TicketTable（Material React Table / "use client"）へ置き換える。
 */
export default async function TicketListPage() {
  const { data: tickets, total } = await listTickets({ pageSize: 20 });

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tickets
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {total} 件（Server Component で取得 → 実データ表示）
      </Typography>
      <Paper variant="outlined" sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell>{t.priority}</TableCell>
                <TableCell>{t.assigneeId}</TableCell>
                <TableCell>{t.createdAt.slice(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
