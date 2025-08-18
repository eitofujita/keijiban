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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type CommentListProps = {
  postId: string;
};

type CommentData = {
  id: string;
  text: string;
  uid: string; // ← Firestore のフィールドに合わせた
  username: string;
  createdAt?: Timestamp | null;
};

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const { user } = useAuth();

useEffect(() => {
  if (!postId) return;

  const q = query(
    collection(db, "posts", postId, "comments"), // 🔹 サブコレクションに統一
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
    await deleteDoc(doc(db, "posts", postId, "comments", commentId)); // 🔹 サブコレクション削除

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { commentsCount: increment(-1) });
  } catch (err) {
    console.error("コメント削除エラー:", err);
    alert("コメントの削除に失敗しました。");
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
            key={c.id}
            secondaryAction={
              user?.uid === c.uid && ( // ← userId → uid に修正
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(c.id, c.uid)}
                >
                  <DeleteIcon sx={{ color: "#d32f2f" }} />
                </IconButton>
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
              }
            />
          </ListItem>
        ))
      )}
    </List>
  );
}
