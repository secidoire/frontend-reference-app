import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import { getAnalytics } from "../api/analyticsApi";
import { StatusChart } from "../components/organisms/StatusChart";
import { AssigneeChart } from "../components/organisms/AssigneeChart";
import { MonthlyChart } from "../components/organisms/MonthlyChart";

/** 分析ページ（Container = async Server Component）。集計を取得し各チャートに渡す。 */
export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Link href="/tickets" underline="hover">
        ← チケット一覧へ
      </Link>
      <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3 }}>
        分析
      </Typography>

      <Stack spacing={3}>
        <ChartCard title="ステータス別チケット数">
          <StatusChart byStatus={analytics.byStatus} />
        </ChartCard>
        <ChartCard title="担当者別チケット数">
          <AssigneeChart byAssignee={analytics.byAssignee} />
        </ChartCard>
        <ChartCard title="月次作成数の推移">
          <MonthlyChart monthly={analytics.monthlyCreated} />
        </ChartCard>
      </Stack>
    </Container>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
