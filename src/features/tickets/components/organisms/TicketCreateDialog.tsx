"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { FormDialog } from "@/components/molecules/FormDialog";
import { TicketForm } from "./TicketForm";
import { createTicketInlineAction } from "../../actions/ticketActions";

/**
 * チケット新規作成ダイアログ（ドメインの「中身」）。
 *
 * - open 状態はここが保持（呼び出し側＝一覧には漏らさない）。
 * - 汎用の {@link FormDialog}（枠）に {@link TicketForm}（中身）を composition で載せる。
 * - 作成は createTicketInlineAction（遷移せず ok を返す）。成功で onSuccess → ダイアログを閉じる。
 *   一覧は revalidatePath により自動更新される。
 */
export function TicketCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        新規作成
      </Button>
      <FormDialog open={open} title="新規チケット" onClose={() => setOpen(false)}>
        <TicketForm
          action={createTicketInlineAction}
          submitLabel="作成"
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>
    </>
  );
}
