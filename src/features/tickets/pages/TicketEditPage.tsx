import { notFound } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { getTicket } from "../api/ticketApi";
import { updateTicketFormAction } from "../actions/ticketActions";
import { TicketForm } from "../components/organisms/TicketForm";

type TicketEditPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * チケット編集ページ（Container = async Server Component）。
 * 既存値を取得して TicketForm に渡し、id を bind した Server Action で更新する。
 */
export default async function TicketEditPage({ params }: TicketEditPageProps) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) {
    notFound();
  }
  const action = updateTicketFormAction.bind(null, id);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Link href={`/tickets/${id}`} underline="hover">
        ← 詳細へ戻る
      </Link>
      <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3 }}>
        チケット編集
      </Typography>
      <TicketForm action={action} defaultValues={ticket} submitLabel="更新" />
    </Container>
  );
}
