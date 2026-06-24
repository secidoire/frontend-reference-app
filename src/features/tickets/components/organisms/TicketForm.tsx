"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useTicketForm } from "../../hooks/useTicketForm";
import { createTicketInlineAction, updateTicketInlineAction } from "../../actions/ticketActions";
import type { TicketActionResult } from "../../actions/actionResult";
import type { Ticket } from "../../types";

const STATUS_OPTIONS: [Ticket["status"], string][] = [
  ["TODO", "未着手"],
  ["IN_PROGRESS", "進行中"],
  ["REVIEW", "レビュー"],
  ["DONE", "完了"],
];
const PRIORITY_OPTIONS: [Ticket["priority"], string][] = [
  ["LOW", "低"],
  ["MEDIUM", "中"],
  ["HIGH", "高"],
];

type TicketFormProps = {
  /** 渡されれば編集、無ければ作成。フォームはこれで「自分が何をするか」を決める。 */
  ticket?: Ticket;
  /** 送信完了ごとに実行結果を親へ通知（親が閉じる等を決める）。フォームは設置文脈を知らない。 */
  onResult?: (result: TicketActionResult) => void;
};

/**
 * チケットのフォーム（organism, "use client"）。
 *
 * ドメイン固有のフォームなので、**create / update のどちらを実行するかは
 * `ticket` の有無（= mode）から自分で決める**（アクションを外から注入しない）。
 * 一方「その後どうするか（閉じる/遷移）」は設置文脈の話なので親へ（onResult）。
 * → 永続化＝mode で自己決定、after-action＝文脈で親が決定、という責務分割。
 */
export function TicketForm({ ticket, onResult }: TicketFormProps) {
  const action = ticket
    ? updateTicketInlineAction.bind(null, ticket.id)
    : createTicketInlineAction;
  const submitLabel = ticket ? "更新" : "作成";
  const { error, formAction, isPending } = useTicketForm(action, onResult);
  const d: Partial<Ticket> = ticket ?? {};

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField name="title" label="タイトル" required defaultValue={d.title ?? ""} />
        <TextField
          name="description"
          label="説明"
          multiline
          minRows={3}
          defaultValue={d.description ?? ""}
        />
        <TextField name="status" label="ステータス" select defaultValue={d.status ?? "TODO"}>
          {STATUS_OPTIONS.map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField name="priority" label="優先度" select defaultValue={d.priority ?? "MEDIUM"}>
          {PRIORITY_OPTIONS.map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField name="assigneeId" label="担当（ID）" required defaultValue={d.assigneeId ?? ""} />

        <Box>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "送信中…" : submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
