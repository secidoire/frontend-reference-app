import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { formatDate } from "@/lib/date";
import type { Comment } from "../../types";

type CommentItemProps = {
  comment: Comment;
};

/** 1件のコメント表示（Presentational / molecule）。 */
export function CommentItem({ comment }: CommentItemProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
        {comment.authorId.slice(-1).toUpperCase()}
      </Avatar>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
          <Typography variant="subtitle2">{comment.authorId}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(comment.createdAt)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {comment.content}
        </Typography>
      </Stack>
    </Stack>
  );
}
