"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useTicketForm } from "../../hooks/useTicketForm";
import type { FormState } from "../../actions/formState";
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

export type TicketFormDefaults = Partial<
  Pick<Ticket, "title" | "description" | "status" | "priority" | "assigneeId">
>;

type TicketFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: TicketFormDefaults;
  submitLabel: string;
  /** 成功時に呼ばれる（ダイアログを閉じる等）。フォーム自身は設置文脈を知らない。 */
  onSuccess?: () => void;
};

/**
 * チケットのフォーム（Presentational / organism, "use client"）。
 * Server Action を `action` prop で受け取り、useActionState で送信状態とエラーを扱う。
 * 作成・編集の双方で再利用する（defaultValues の有無で切り替え）。
 */
export function TicketForm({ action, defaultValues, submitLabel, onSuccess }: TicketFormProps) {
  const { error, formAction, isPending } = useTicketForm(action, onSuccess);
  const d = defaultValues ?? {};

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
