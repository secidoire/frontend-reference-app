"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { DialogProps } from "@mui/material/Dialog";

type FormDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
};

/**
 * フォーム等を載せる汎用モーダルの「枠」（ドメイン非依存 / 制御コンポーネント）。
 *
 * IF設計の要点:
 * - **中身は children**（composition）。FormDialog はフォームを一切知らない → props 貫通しない。
 * - **状態を持たない制御コンポーネント**（open / onClose を受けるだけ）→ テスト容易・再利用容易。
 */
export function FormDialog({ open, title, onClose, children, maxWidth = "sm" }: FormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}
        <IconButton onClick={onClose} size="small" aria-label="閉じる">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
