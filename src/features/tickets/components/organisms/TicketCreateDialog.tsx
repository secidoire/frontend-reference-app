"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { FormDialog } from "@/components/molecules/FormDialog";
import { TicketForm } from "./TicketForm";

/**
 * チケット新規作成ダイアログ（ドメインの「中身」）。
 *
 * - open 状態はここが保持（呼び出し側＝一覧には漏らさない）。
 * - 汎用の {@link FormDialog}（枠）に {@link TicketForm}（中身）を composition で載せる。
 * - フォームは `ticket` 無し＝作成を自分で行い、結果を返す。親は ok で閉じるだけ。
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
          onResult={(result) => {
            // 「閉じる」判断は親が持つ＝フォームは設置文脈を知らない（文脈非依存）。
            // 結果を“受け取って”分岐するから再利用が効く。Why は docs/design-guide.md 6章。
            if (result.ok) setOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
