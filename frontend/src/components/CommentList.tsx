import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  getCommentsByPostId,
  updateComment,
  deleteComment,
  type Comment,
} from "../services/comment";

type CommentListProps = {
  postId: string;
};

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useAuth();

  // どのコメントを編集中か
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      try {
        const commentsData = await getCommentsByPostId(postId);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
    // 定期的に更新（ポーリング）
    const interval = setInterval(fetchComments, 3000);
    return () => clearInterval(interval);
  }, [postId]);

  const handleDelete = async (commentId: string, commentUserId: string) => {
    if (!user) {
      alert("ログインしてください。");
      return;
    }
    if (user.uid !== commentUserId) {
      alert("自分のコメントだけ削除できます。");
      return;
    }

    try {
      await deleteComment(commentId, user.uid);
      // コメント一覧を再取得
      const commentsData = await getCommentsByPostId(postId);
      setComments(commentsData);
    } catch (err) {
      console.error("コメント削除エラー:", err);
      alert("コメントの削除に失敗しました。");
    }
  };

  // コメント編集を保存
  const handleUpdate = async (commentId: string) => {
    if (!user) return;

    try {
      await updateComment(commentId, editText, user.uid);
      setEditingId(null); // 編集モード解除
      // コメント一覧を再取得
      const commentsData = await getCommentsByPostId(postId);
      setComments(commentsData);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("コメントの更新に失敗しました。");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <List>
      {comments.length === 0 ? (
        <Typography sx={{ color: "#888", ml: 2 }}>
          コメントはまだありません
        </Typography>
      ) : (
        comments.map((c) => (
          <ListItem
            key={c._id}
            alignItems="flex-start"
            secondaryAction={
              user?.uid === c.userId && editingId !== c._id && (
                <CommentOptions
                  commentId={c._id}
                  currentText={c.text}
                  onDelete={() => handleDelete(c._id, c.userId)}
                  onEdit={() => {
                    setEditingId(c._id);
                    setEditText(c.text);
                  }}
                />
              )
            }
          >
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: "bold", color: "#fff" }}>
                  {c.username || "名無し"}
                </Typography>
              }
              secondary={
                editingId === c._id ? (
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <TextField
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{
                        input: { color: "#fff" },
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUpdate(c._id)}
                    >
                      保存
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setEditingId(null)}
                    >
                      キャンセル
                    </Button>
                  </Box>
                ) : (
                  <Typography sx={{ color: "#ccc" }}>
                    {c.text}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        marginLeft: 8,
                        color: "#888",
                      }}
                    >
                      {formatDate(c.createdAt)}
                    </span>
                  </Typography>
                )
              }
            />
          </ListItem>
        ))
      )}
    </List>
  );
}

/* コメントのオプションメニュー */
function CommentOptions({
  commentId,
  currentText,
  onDelete,
  onEdit,
}: {
  commentId: string;
  currentText: string;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon sx={{ color: "#ccc" }} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            onEdit();
          }}
        >
          編集
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onDelete();
          }}
          sx={{ color: "red" }}
        >
          削除
        </MenuItem>
      </Menu>
    </>
  );
}
