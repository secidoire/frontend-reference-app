import { notFound } from "next/navigation";
import { getTicket } from "../api/ticketApi";
import { TicketDetailTemplate } from "../components/templates/TicketDetailTemplate";

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * チケット詳細ページ（Container = async Server Component）。
 * id で取得し、存在しなければ notFound()。表示は Template に委譲する。
 */
export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) {
    notFound();
  }
  return <TicketDetailTemplate ticket={ticket} />;
}
