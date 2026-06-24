import { notFound } from "next/navigation";
import { getTicket } from "../api/ticketApi";
import { listComments } from "@/features/comments/api/commentApi";
import { TicketDetailTemplate } from "../components/templates/TicketDetailTemplate";

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * チケット詳細ページ（Container = async Server Component）。
 * id で取得し、存在しなければ notFound()。チケットとコメントを並行取得する。
 * 表示は Template に委譲する。
 */
export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const [ticket, comments] = await Promise.all([getTicket(id), listComments(id)]);
  if (!ticket) {
    notFound();
  }
  return <TicketDetailTemplate ticket={ticket} comments={comments} />;
}
