import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
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

type CommentListProps = {
  postId: string;
};

type CommentData = {
  id: string;
  text: string;
  uid: string;
  username: string;
  createdAt?: Timestamp | null;
};

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const { user } = useAuth();

  // どのコメントを編集中か
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as CommentData)
        )
      );
    });

    return () => unsubscribe();
  }, [postId]);

  const handleDelete = async (commentId: string, commentUid: string) => {
    if (!user) {
      alert("ログインしてください。");
      return;
    }
    if (user.uid !== commentUid) {
      alert("自分のコメントだけ削除できます。");
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId));

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { commentsCount: increment(-1) });
    } catch (err) {
      console.error("コメント削除エラー:", err);
      alert("コメントの削除に失敗しました。");
    }
  };

  // コメント編集を保存
  const handleUpdate = async (commentId: string) => {
    if (!user) return;

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await updateDoc(commentRef, { text: editText });
    setEditingId(null); // 編集モード解除
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
            key={c.id}
            alignItems="flex-start"
            secondaryAction={
              user?.uid === c.uid && editingId !== c.id && (
                <CommentOptions
                  commentId={c.id}
                  currentText={c.text}
                  onDelete={() => handleDelete(c.id, c.uid)}
                  onEdit={() => {
                    setEditingId(c.id);
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
                editingId === c.id ? (
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
                      onClick={() => handleUpdate(c.id)}
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
                    {c.createdAt && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          marginLeft: 8,
                          color: "#888",
                        }}
                      >
                        {c.createdAt.toDate().toLocaleString()}
                      </span>
                    )}
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

/* 🔹 コメントのオプションメニュー */
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
