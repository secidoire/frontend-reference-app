"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { FormDialog } from "@/components/molecules/FormDialog";
import { TicketForm } from "./TicketForm";
import type { Ticket } from "../../types";

type TicketEditDialogProps = {
  ticket: Ticket;
};

/**
 * チケット編集ダイアログ（ドメインの「中身」）。
 *
 * - 作成ダイアログと同じ枠（FormDialog）+ フォーム（TicketForm）を使い回す。
 * - フォームに `ticket` を渡すので、フォーム側が **update を自分で選んで**実行する。
 * - 成功（revalidate 済み）で閉じる。詳細ページは revalidatePath で最新化される。
 */
export function TicketEditDialog({ ticket }: TicketEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        編集
      </Button>
      <FormDialog open={open} title="チケット編集" onClose={() => setOpen(false)}>
        <TicketForm
          ticket={ticket}
          onResult={(result) => {
            if (result.ok) setOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
