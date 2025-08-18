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
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type CommentListProps = {
  postId: string;
};

type CommentData = {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CommentData))
      );
    });
    return () => unsubscribe();
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

    if (!confirm("このコメントを削除しますか？")) return;

    try {
      // コメント削除
      await deleteDoc(doc(db, "posts", postId, "comments", commentId));

      // コメント数を減らす
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { commentsCount: increment(-1) });
    } catch (err) {
      console.error("コメント削除エラー:", err);
      alert("コメントの削除に失敗しました。");
    }
  };

  return (
    <List>
      {comments.map((c) => (
        <ListItem
          key={c.id}
          secondaryAction={
            user?.uid === c.userId && (
              <IconButton edge="end" onClick={() => handleDelete(c.id, c.userId)}>
                <DeleteIcon sx={{ color: "#d32f2f" }} />
              </IconButton>
            )
          }
        >
          <ListItemText
            primary={
              <Typography sx={{ fontWeight: "bold", color: "#fff" }}>
                {c.username}
              </Typography>
            }
            secondary={
              <Typography sx={{ color: "#ccc" }}>
                {c.text}
                {c.createdAt && (
                  <span
                    style={{ fontSize: "0.7rem", marginLeft: 8, color: "#888" }}
                  >
                    {new Date(c.createdAt.seconds * 1000).toLocaleString()}
                  </span>
                )}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
