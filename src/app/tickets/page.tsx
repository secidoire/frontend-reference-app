// ルーティングの薄皮。実体は features/tickets/pages に置く。
// データを毎リクエスト取得するため動的レンダリングにする（ビルド時プリレンダ無効）。
export const dynamic = "force-dynamic";

export { default } from "@/features/tickets/pages/TicketListPage";
