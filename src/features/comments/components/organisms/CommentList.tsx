import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CommentItem } from "../molecules/CommentItem";
import type { Comment } from "../../types";

type CommentListProps = {
  comments: Comment[];
};

/** コメント一覧（Presentational / organism）。空なら案内を表示。 */
export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        コメントはありません。
      </Typography>
    );
  }
  return (
    <Stack spacing={2}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </Stack>
  );
}
