import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function TicketsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Typography variant="h4" component="h1">
          Tickets
        </Typography>
        <Typography color="text.secondary">
          Frontend reference app — Step 2 (MUI + テーマ) 完了。
        </Typography>
        <Button variant="contained">Primary Button</Button>
      </Stack>
    </Container>
  );
}
