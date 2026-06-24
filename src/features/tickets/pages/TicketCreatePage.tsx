import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { createTicketFormAction } from "../actions/ticketActions";
import { TicketForm } from "../components/organisms/TicketForm";

/** チケット作成ページ（Container = Server Component）。Server Action を form に渡す。 */
export default function TicketCreatePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Link href="/tickets" underline="hover">
        ← 一覧へ戻る
      </Link>
      <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3 }}>
        新規チケット
      </Typography>
      <TicketForm action={createTicketFormAction} submitLabel="作成" />
    </Container>
  );
}
